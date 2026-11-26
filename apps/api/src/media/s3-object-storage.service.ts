import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
} from 'node:fs';
import {
  mkdir,
  readFile,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import {
  ObjectStorage,
  StoredObjectMetadata,
  UploadForm,
} from './media.constants';
import { formatPublicMediaUrl, inferAudioContentType } from './media-url';

export interface MediaStreamResult {
  stream: Readable;
  contentType: string;
  contentLength: number;
  contentRange?: string;
  statusCode: number;
}

@Injectable()
export class S3ObjectStorageService
  implements ObjectStorage, OnModuleDestroy
{
  private readonly logger = new Logger(S3ObjectStorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly s3Enabled: boolean;
  private readonly localRoot: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = config.get<string>('S3_BUCKET', 'kathaisolli-audio');
    const endpoint = config.get<string>('S3_ENDPOINT', '');
    const region = config.get<string>('S3_REGION', 'us-east-1');
    const forcePathStyle =
      config.get<string>('S3_FORCE_PATH_STYLE', 'true') === 'true';
    const accessKeyId = config.get<string>('S3_ACCESS_KEY', '');
    const secretAccessKey = config.get<string>('S3_SECRET_KEY', '');

    const hasRealCredentials =
      Boolean(accessKeyId) &&
      Boolean(secretAccessKey) &&
      accessKeyId !== 'placeholder-access-key' &&
      secretAccessKey !== 'placeholder-secret-key';

    const driver = config.get<string>('STORAGE_DRIVER', '').toLowerCase();
    this.s3Enabled = driver !== 'local' && hasRealCredentials && Boolean(endpoint);

    this.localRoot = resolve(
      config.get<string>('LOCAL_STORAGE_DIR') ||
        resolve(process.cwd(), 'storage'),
    );

    if (!this.s3Enabled) {
      if (!existsSync(this.localRoot)) {
        mkdirSync(this.localRoot, { recursive: true });
      }
      this.logger.log(
        `Using backend-managed persistent local storage at ${this.localRoot} (S3_ENDPOINT/S3_ACCESS_KEY not active).`,
      );
    } else {
      this.logger.log(
        `Using S3-compatible object storage (endpoint=${endpoint}, bucket=${this.bucket}).`,
      );
    }

    this.client = new S3Client({
      endpoint: endpoint || 'http://localhost:9000',
      region,
      forcePathStyle,
      credentials: {
        accessKeyId: accessKeyId || 'placeholder-access-key',
        secretAccessKey: secretAccessKey || 'placeholder-secret-key',
      },
    });
  }

  isS3Enabled(): boolean {
    return this.s3Enabled;
  }

  getStorageInfo(): { provider: string; bucket: string; mode: 's3' | 'local' } {
    if (this.s3Enabled) {
      return {
        provider: 'S3-Compatible Object Storage',
        bucket: this.bucket,
        mode: 's3',
      };
    }
    return {
      provider: 'Backend Persistent Storage',
      bucket: this.localRoot,
      mode: 'local',
    };
  }

  async ensurePrivateBucket(): Promise<void> {
    if (!this.s3Enabled) {
      await mkdir(this.localRoot, { recursive: true });
      return;
    }
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch (headError) {
      try {
        await this.client.send(
          new CreateBucketCommand({ Bucket: this.bucket }),
        );
      } catch (createError) {
        if (
          this.errorName(createError) === 'BucketAlreadyOwnedByYou' ||
          this.errorName(createError) === 'BucketAlreadyExists'
        ) {
          return;
        }
        throw new Error(
          `Unable to access or create the configured private media bucket: ${this.errorMessage(createError, headError)}`,
          { cause: createError },
        );
      }
    }
  }

  async createUploadForm(
    objectKey: string,
    contentType: string,
    maxBytes: number,
    expiresInSeconds: number,
  ): Promise<UploadForm> {
    const form = await createPresignedPost(this.client, {
      Bucket: this.bucket,
      Key: objectKey,
      Expires: expiresInSeconds,
      Fields: { 'Content-Type': contentType },
      Conditions: [
        ['content-length-range', 1, maxBytes],
        ['eq', '$Content-Type', contentType],
      ],
    });
    return { url: form.url, fields: form.fields };
  }

  async putBuffer(
    objectKey: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<void> {
    if (this.s3Enabled) {
      await this.ensurePrivateBucket();
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: objectKey,
          Body: buffer,
          ContentType: contentType,
        }),
      );
      return;
    }

    const targetPath = this.resolveLocalPath(objectKey);
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, buffer);
    await writeFile(
      `${targetPath}.meta.json`,
      JSON.stringify({ contentType, sizeBytes: buffer.length }),
    );
  }

  async headObject(objectKey: string): Promise<StoredObjectMetadata> {
    if (this.s3Enabled) {
      const result = await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: objectKey }),
      );
      if (result.ContentLength === undefined) {
        throw new Error('Stored object is missing its content length.');
      }
      return {
        sizeBytes: result.ContentLength,
        contentType: result.ContentType,
      };
    }

    const targetPath = this.resolveLocalPath(objectKey);
    const info = await stat(targetPath);
    let contentType = inferAudioContentType(objectKey, 'application/octet-stream');
    try {
      const metaRaw = await readFile(`${targetPath}.meta.json`, 'utf8');
      const meta = JSON.parse(metaRaw);
      if (meta?.contentType) contentType = meta.contentType;
    } catch {
      // ignore missing meta
    }
    return {
      sizeBytes: info.size,
      contentType,
    };
  }

  async deleteObject(objectKey: string): Promise<void> {
    if (!objectKey) return;
    if (this.s3Enabled) {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: objectKey }),
      );
      return;
    }

    const targetPath = this.resolveLocalPath(objectKey);
    await rm(targetPath, { force: true });
    await rm(`${targetPath}.meta.json`, { force: true });
  }

  async downloadToFile(objectKey: string, filePath: string): Promise<void> {
    if (this.s3Enabled) {
      const result = await this.client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: objectKey }),
      );
      if (!(result.Body instanceof Readable)) {
        throw new Error(
          'Object storage did not provide a readable Node.js stream.',
        );
      }
      await pipeline(result.Body, createWriteStream(filePath, { flags: 'wx' }));
      return;
    }

    const sourcePath = this.resolveLocalPath(objectKey);
    await pipeline(
      createReadStream(sourcePath),
      createWriteStream(filePath, { flags: 'wx' }),
    );
  }

  async uploadFile(
    objectKey: string,
    filePath: string,
    contentType: string,
  ): Promise<void> {
    if (this.s3Enabled) {
      await this.ensurePrivateBucket();
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: objectKey,
          Body: createReadStream(filePath),
          ContentType: contentType,
        }),
      );
      return;
    }

    const targetPath = this.resolveLocalPath(objectKey);
    await mkdir(dirname(targetPath), { recursive: true });
    await pipeline(
      createReadStream(filePath),
      createWriteStream(targetPath),
    );
    const info = await stat(targetPath);
    await writeFile(
      `${targetPath}.meta.json`,
      JSON.stringify({ contentType, sizeBytes: info.size }),
    );
  }

  async getObjectStream(
    objectKey: string,
    rangeHeader?: string,
  ): Promise<MediaStreamResult> {
    if (this.s3Enabled) {
      const result = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: objectKey,
          Range: rangeHeader,
        }),
      );
      if (!(result.Body instanceof Readable)) {
        throw new Error('Object storage did not provide a readable stream.');
      }
      const isPartial = Boolean(rangeHeader && result.ContentRange);
      return {
        stream: result.Body,
        contentType:
          result.ContentType ||
          inferAudioContentType(objectKey, 'application/octet-stream'),
        contentLength: result.ContentLength ?? 0,
        contentRange: result.ContentRange,
        statusCode: isPartial ? 206 : 200,
      };
    }

    const targetPath = this.resolveLocalPath(objectKey);
    const meta = await this.headObject(objectKey);
    const totalSize = meta.sizeBytes;
    const contentType =
      meta.contentType ||
      inferAudioContentType(objectKey, 'application/octet-stream');

    if (rangeHeader && rangeHeader.startsWith('bytes=')) {
      const [startStr, endStr] = rangeHeader.replace('bytes=', '').split('-');
      const start = startStr ? parseInt(startStr, 10) : 0;
      const end = endStr ? Math.min(parseInt(endStr, 10), totalSize - 1) : totalSize - 1;
      if (
        Number.isFinite(start) &&
        Number.isFinite(end) &&
        start >= 0 &&
        end >= start &&
        start < totalSize
      ) {
        return {
          stream: createReadStream(targetPath, { start, end }),
          contentType,
          contentLength: end - start + 1,
          contentRange: `bytes ${start}-${end}/${totalSize}`,
          statusCode: 206,
        };
      }
    }

    return {
      stream: createReadStream(targetPath),
      contentType,
      contentLength: totalSize,
      statusCode: 200,
    };
  }

  async createReadUrl(
    objectKey: string,
    expiresInSeconds: number,
  ): Promise<string> {
    if (!objectKey) return '';
    if (
      objectKey.startsWith('http://') ||
      objectKey.startsWith('https://') ||
      objectKey.startsWith('/api/') ||
      objectKey.startsWith('/images/') ||
      objectKey.startsWith('/audio/')
    ) {
      return objectKey;
    }

    if (this.s3Enabled) {
      return await getSignedUrl(
        this.client,
        new GetObjectCommand({ Bucket: this.bucket, Key: objectKey }),
        { expiresIn: expiresInSeconds },
      );
    }

    return formatPublicMediaUrl(objectKey);
  }

  async onModuleDestroy(): Promise<void> {
    this.client.destroy();
  }

  private resolveLocalPath(objectKey: string): string {
    const cleanKey = objectKey.replace(/^\/+/, '');
    if (
      !cleanKey ||
      cleanKey.includes('..') ||
      cleanKey.includes('\0') ||
      !/^[a-zA-Z0-9._/-]+$/.test(cleanKey)
    ) {
      throw new Error('Invalid object key.');
    }
    const resolved = resolve(this.localRoot, cleanKey);
    if (!resolved.startsWith(`${this.localRoot}${sep}`)) {
      throw new Error('Object key escapes storage directory.');
    }
    return resolved;
  }

  private errorName(error: unknown): string | undefined {
    return error instanceof Error ? error.name : undefined;
  }

  private errorMessage(primary: unknown, fallback: unknown): string {
    if (primary instanceof Error) return primary.message;
    if (fallback instanceof Error) return fallback.message;
    return 'unknown object storage error';
  }
}
