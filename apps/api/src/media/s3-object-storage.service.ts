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
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import {
  ObjectStorage,
  StoredObjectMetadata,
  UploadForm,
} from './media.constants';

@Injectable()
export class S3ObjectStorageService
  implements ObjectStorage, OnModuleDestroy
{
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = config.getOrThrow<string>('S3_BUCKET');
    this.client = new S3Client({
      endpoint: config.getOrThrow<string>('S3_ENDPOINT'),
      region: config.get<string>('S3_REGION', 'us-east-1'),
      forcePathStyle: config.get<string>('S3_FORCE_PATH_STYLE', 'true') === 'true',
      credentials: {
        accessKeyId: config.getOrThrow<string>('S3_ACCESS_KEY'),
        secretAccessKey: config.getOrThrow<string>('S3_SECRET_KEY'),
      },
    });
  }

  async ensurePrivateBucket(): Promise<void> {
    try {
      await this.client.send(
        new HeadBucketCommand({ Bucket: this.bucket }),
      );
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

  async headObject(objectKey: string): Promise<StoredObjectMetadata> {
    const result = await this.client.send(
      new HeadObjectCommand({ Bucket: this.bucket, Key: objectKey }),
    );
    if (result.ContentLength === undefined) {
      throw new Error('Stored audio object is missing its content length.');
    }
    return {
      sizeBytes: result.ContentLength,
      contentType: result.ContentType,
    };
  }

  async deleteObject(objectKey: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: objectKey }),
    );
  }

  async downloadToFile(objectKey: string, filePath: string): Promise<void> {
    const result = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: objectKey }),
    );
    if (!(result.Body instanceof Readable)) {
      throw new Error('Object storage did not provide a readable Node.js stream.');
    }
    await pipeline(result.Body, createWriteStream(filePath, { flags: 'wx' }));
  }

  async uploadFile(
    objectKey: string,
    filePath: string,
    contentType: string,
  ): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
        Body: createReadStream(filePath),
        ContentType: contentType,
      }),
    );
  }

  async createReadUrl(
    objectKey: string,
    expiresInSeconds: number,
  ): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: objectKey }),
      { expiresIn: expiresInSeconds },
    );
  }

  async onModuleDestroy(): Promise<void> {
    this.client.destroy();
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
