import { Injectable, Logger, Inject } from '@nestjs/common';
import { ContentStatus, UploadStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FfmpegService } from './ffmpeg.service';
import { OBJECT_STORAGE, type ObjectStorage } from './media.constants';
import {
  ALL_MEDIA_FORMATS,
  validateMediaMagicBytes,
} from './audio-format';
import { mkdtemp, open, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
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
      workDirectory = await mkdtemp(join(tmpdir(), 'kathaisolli-media-'));
      const sourceExt =
        extname(job.originalName || job.objectKey || '.mp3').toLowerCase() || '.mp3';
      const sourcePath = join(workDirectory, `source${sourceExt}`);
      const hlsDirectory = join(workDirectory, 'hls');
      await this.storage.downloadToFile(job.objectKey, sourcePath);

      // Verify binary file signature (first 32 bytes only, avoids buffering large media)
      const fh = await open(sourcePath, 'r');
      try {
        const headerBuf = Buffer.alloc(32);
        const { bytesRead } = await fh.read(headerBuf, 0, 32, 0);
        if (!validateMediaMagicBytes(headerBuf.subarray(0, bytesRead), sourceExt)) {
          throw new Error(
            `Uploaded file content does not match declared extension ${sourceExt}.`,
          );
        }
      } finally {
        await fh.close();
      }

      const metadata = await this.ffmpeg.inspectMedia(sourcePath);
      const descriptor = ALL_MEDIA_FORMATS[sourceExt];
      const isVideo = descriptor?.kind === 'video' || (metadata.hasVideo && !descriptor);

      const assetId = randomUUID();
      const renditionPrefix = `renditions/${assetId}`;
      const renditionRecords: Array<{
        objectKey: string;
        contentType: string;
        bitrate: number | null;
      }> = [];

      if (isVideo) {
        // Generate browser-compatible H.264/AAC MP4 rendition if non-native or always for uniform streaming
        const compatMp4Path = join(workDirectory, 'playback.mp4');
        await this.ffmpeg.transcodeToCompatibleVideo(sourcePath, compatMp4Path);
        const mp4Key = `${renditionPrefix}/playback.mp4`;
        await this.storage.uploadFile(mp4Key, compatMp4Path, 'video/mp4');
        renditionRecords.push({
          objectKey: mp4Key,
          contentType: 'video/mp4',
          bitrate: 1_500_000,
        });
      }

      if (metadata.hasAudio) {
        // Generate HLS audio stream for adaptive playback
        await this.ffmpeg.createHls(sourcePath, hlsDirectory);
        const files = await readdir(hlsDirectory);
        const playlist = files.find((file) => file === 'playlist.m3u8');
        const segments = files.filter((file) => /^segment_\d{5}\.ts$/u.test(file));
        if (!playlist || segments.length === 0) {
          throw new Error('FFmpeg completed without producing a playlist and segments.');
        }

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

        // For non-browser-native audio (e.g., WMA, AIFF), also produce a direct compatible M4A file
        if (!isVideo && descriptor && !descriptor.browserNativePlayable) {
          const compatAudioPath = join(workDirectory, 'playback.m4a');
          await this.ffmpeg.transcodeToCompatibleAudio(sourcePath, compatAudioPath);
          const m4aKey = `${renditionPrefix}/playback.m4a`;
          await this.storage.uploadFile(m4aKey, compatAudioPath, 'audio/mp4');
          renditionRecords.push({
            objectKey: m4aKey,
            contentType: 'audio/mp4',
            bitrate: 192000,
          });
        }
      }

      if (renditionRecords.length === 0) {
        throw new Error('Media processing produced no playable renditions.');
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
        `Processed upload ${job.id}: ${metadata.audioCodec || metadata.videoCodec}, ${Math.ceil(metadata.durationSeconds)} seconds.`,
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
            error instanceof Error
              ? error.message.slice(0, 500)
              : 'Media processing failed. Verify the source media and configured FFmpeg runtime.',
        },
      });
      this.logger.error(
        `Media processing failed for upload ${job.id}.`,
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
