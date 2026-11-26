import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { S3ObjectStorageService } from './s3-object-storage.service';
import {
  extractManagedObjectKey,
  formatPublicMediaUrl,
  inferAudioContentType,
} from './media-url';

describe('S3ObjectStorageService & media-url helpers', () => {
  let tempDir: string;
  let service: S3ObjectStorageService;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'kathaisolli-storage-test-'));
    const config = new ConfigService({
      STORAGE_DRIVER: 'local',
      LOCAL_STORAGE_DIR: tempDir,
      S3_BUCKET: 'test-bucket',
    });
    service = new S3ObjectStorageService(config);
  });

  afterEach(async () => {
    await service.onModuleDestroy();
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('stores, heads, streams with Range support, and deletes files persistently without Firebase', async () => {
    const payload = Buffer.from('0123456789abcdef', 'utf8');
    const objectKey = 'audio/story-1/ch-1/test.mp3';

    await service.putBuffer(objectKey, payload, 'audio/mpeg');

    const meta = await service.headObject(objectKey);
    expect(meta.sizeBytes).toBe(payload.length);
    expect(meta.contentType).toBe('audio/mpeg');

    const readUrl = await service.createReadUrl(objectKey, 60);
    expect(readUrl).toBe(`/api/v1/media/file?key=${encodeURIComponent(objectKey)}`);
    expect(readUrl).not.toContain('firebasestorage');

    const partial = await service.getObjectStream(objectKey, 'bytes=4-7');
    expect(partial.statusCode).toBe(206);
    expect(partial.contentRange).toBe('bytes 4-7/16');
    expect(partial.contentLength).toBe(4);

    const chunks: Buffer[] = [];
    for await (const chunk of partial.stream) {
      chunks.push(Buffer.from(chunk));
    }
    expect(Buffer.concat(chunks).toString('utf8')).toBe('4567');

    await service.deleteObject(objectKey);
    await expect(service.headObject(objectKey)).rejects.toThrow();
  });

  it('rejects path traversal object keys', async () => {
    await expect(
      service.putBuffer('../etc/passwd', Buffer.from('bad'), 'text/plain'),
    ).rejects.toThrow();
  });

  it('formats and extracts managed media URLs cleanly', () => {
    expect(formatPublicMediaUrl('covers/s1/abc.jpg')).toBe(
      '/api/v1/media/file?key=covers%2Fs1%2Fabc.jpg',
    );
    expect(extractManagedObjectKey('/api/v1/media/file?key=covers%2Fs1%2Fabc.jpg')).toBe(
      'covers/s1/abc.jpg',
    );
    expect(inferAudioContentType('chapter1.ogg')).toBe('audio/ogg');
    expect(inferAudioContentType('chapter1.m4a')).toBe('audio/mp4');
    expect(inferAudioContentType('cover.webp')).toBe('image/webp');
  });
});
