import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { UploadStatus } from '@prisma/client';
import { Worker } from 'bullmq';
import { AppModule } from './app.module';
import { AudioProcessingService } from './media/audio-processing.service';
import { PrismaService } from './prisma/prisma.service';
import {
  AUDIO_PROCESSING_QUEUE,
  AudioProcessingTask,
} from './media/media.constants';
import { getRedisConnectionOptions } from './media/redis-connection';

async function bootstrap() {
  const logger = new Logger('AudioWorker');
  const app = await NestFactory.createApplicationContext(AppModule);
  const config = app.get(ConfigService);
  const processing = app.get(AudioProcessingService);
  const prisma = app.get(PrismaService);
  const worker = new Worker<AudioProcessingTask>(
    AUDIO_PROCESSING_QUEUE,
    async (job) => processing.process(job.data.uploadJobId),
    {
      connection: getRedisConnectionOptions(config),
      concurrency: 2,
    },
  );

  worker.on('failed', (job, error) => {
    logger.error(
      `Queue job ${job?.id ?? 'unknown'} failed: ${error.message}`,
      error.stack,
    );
    if (!job || job.attemptsMade < (job.opts.attempts ?? 1)) return;
    void prisma.uploadJob
      .updateMany({
        where: {
          id: job.data.uploadJobId,
          status: {
            in: [
              UploadStatus.QUEUED,
              UploadStatus.PROCESSING,
              UploadStatus.FAILED,
            ],
          },
        },
        data: {
          status: UploadStatus.FAILED,
          activeEpisodeId: null,
          failureReason: 'Audio processing exhausted its retry attempts.',
        },
      })
      .catch((databaseError: unknown) => {
        logger.error(
          `Unable to release terminal upload ${job.data.uploadJobId}.`,
          databaseError instanceof Error ? databaseError.stack : undefined,
        );
      });
  });
  worker.on('error', (error) => {
    logger.error(`Audio queue error: ${error.message}`, error.stack);
  });
  await worker.waitUntilReady();
  logger.log('Audio processing worker is ready.');

  let stopping = false;
  const shutdown = async () => {
    if (stopping) return;
    stopping = true;
    await worker.close();
    await app.close();
  };
  process.once('SIGINT', () => void shutdown());
  process.once('SIGTERM', () => void shutdown());
}

void bootstrap().catch((error: unknown) => {
  console.error('Audio worker failed to start:', error);
  process.exitCode = 1;
});
