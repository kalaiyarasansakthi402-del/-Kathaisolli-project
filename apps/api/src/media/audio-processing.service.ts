import { Injectable, Logger } from '@nestjs/common';
import { ContentStatus, UploadStatus } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FfmpegService } from './ffmpeg.service';
import { OBJECT_STORAGE, type ObjectStorage } from './media.constants';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

@Injectable()
export class AudioProcessingService {
  private readonly logger = new Logger(AudioProcessingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ffmpeg: FfmpegService,
    @Inject(OBJECT_STORAGE) private readonly storage: ObjectStorage,
  ) {}

  async process(uploadJobId: string): Promise<void> {
    const job = await this.prisma.uploadJob.findUnique({
      where: { id: uploadJobId },
    });
    if (!job) throw new Error(`Upload job ${uploadJobId} was not found.`);
    if (job.status === UploadStatus.COMPLETED) return;
    if (
      job.status !== UploadStatus.QUEUED &&
      job.status !== UploadStatus.FAILED &&
      job.status !== UploadStatus.PROCESSING
    ) {
      throw new Error(`Upload job cannot process from ${job.status}.`);
    }

    await this.prisma.uploadJob.update({
      where: { id: job.id },
      data: {
        status: UploadStatus.PROCESSING,
        failureReason: null,
        attemptCount: { increment: 1 },
      },
    });

    let workDirectory: string | undefined;
    try {
      workDirectory = await mkdtemp(join(tmpdir(), 'kathaisolli-audio-'));
      const sourcePath = join(workDirectory, 'source.audio');
      const hlsDirectory = join(workDirectory, 'hls');
      await this.storage.downloadToFile(job.objectKey, sourcePath);
      const metadata = await this.ffmpeg.inspect(sourcePath);
      await this.ffmpeg.createHls(sourcePath, hlsDirectory);
      const files = await readdir(hlsDirectory);
      const playlist = files.find((file) => file === 'playlist.m3u8');
      const segments = files.filter((file) => /^segment_\d{5}\.ts$/u.test(file));
      if (!playlist || segments.length === 0) {
        throw new Error('FFmpeg completed without producing a playlist and segments.');
      }

      const assetId = randomUUID();
      const renditionPrefix = `renditions/${assetId}`;
      const renditionRecords: Array<{
        objectKey: string;
        contentType: string;
        bitrate: number | null;
      }> = [];
      for (const file of files) {
        if (file !== playlist && !segments.includes(file)) continue;
        const key = `${renditionPrefix}/${file}`;
        const contentType =
          file === playlist ? 'application/vnd.apple.mpegurl' : 'video/mp2t';
        await this.storage.uploadFile(key, join(hlsDirectory, file), contentType);
        renditionRecords.push({
          objectKey: key,
          contentType,
          bitrate: file === playlist ? 128000 : null,
        });
      }

      await this.prisma.$transaction(async (transaction) => {
        const mediaAsset = await transaction.mediaAsset.create({
          data: {
            id: assetId,
            objectKey: job.objectKey,
            contentType: job.contentType,
            sizeBytes: job.sizeBytes,
            durationSec: Math.ceil(metadata.durationSeconds),
            isProcessed: true,
          },
        });
        await transaction.mediaRendition.createMany({
          data: renditionRecords.map((rendition) => ({
            ...rendition,
            mediaAssetId: mediaAsset.id,
          })),
        });
        await transaction.episode.update({
          where: { id: job.episodeId },
          data: {
            mediaAssetId: mediaAsset.id,
            durationSec: Math.ceil(metadata.durationSeconds),
            status: ContentStatus.PENDING_REVIEW,
            moderationNote: null,
            reviewedAt: null,
            reviewedById: null,
          },
        });
        await transaction.uploadJob.update({
          where: { id: job.id },
          data: {
            mediaAssetId: mediaAsset.id,
            status: UploadStatus.COMPLETED,
            activeEpisodeId: null,
            processedAt: new Date(),
            failureReason: null,
          },
        });
      });

      this.logger.log(
        `Processed upload ${job.id}: ${metadata.codec}, ${Math.ceil(metadata.durationSeconds)} seconds.`,
      );
    } catch (error) {
      await this.prisma.uploadJob.updateMany({
        where: {
          id: job.id,
          status: { in: [UploadStatus.PROCESSING, UploadStatus.FAILED] },
        },
        data: {
          status: UploadStatus.FAILED,
          failureReason:
            'Audio processing failed. Verify the source audio and configured FFmpeg runtime.',
        },
      });
      this.logger.error(
        `Audio processing failed for upload ${job.id}.`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    } finally {
      if (workDirectory) {
        await rm(workDirectory, { recursive: true, force: true });
      }
    }
  }
}
