import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Queue } from 'bullmq';
import { AUDIO_PROCESSING_QUEUE, AudioProcessingTask } from './media.constants';
import { getRedisConnectionOptions } from './redis-connection';

@Injectable()
export class AudioQueueService implements OnModuleDestroy {
  private readonly logger = new Logger(AudioQueueService.name);
  private queue: Queue<AudioProcessingTask> | null = null;

  constructor(private readonly config: ConfigService) {
    try {
      const redisUrl = this.config.get<string>('REDIS_URL');
      const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
      const isLocalhostRedis = redisUrl?.includes('localhost') || redisUrl?.includes('127.0.0.1');

      if (
        redisUrl &&
        (redisUrl.startsWith('redis://') || redisUrl.startsWith('rediss://')) &&
        !(isServerless && isLocalhostRedis)
      ) {
        this.queue = new Queue<AudioProcessingTask>(AUDIO_PROCESSING_QUEUE, {
          connection: getRedisConnectionOptions(this.config),
          defaultJobOptions: {
            attempts: 5,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: 100,
            removeOnFail: 500,
          },
        });

        // Non-fatal error listener to prevent uncaughtException ECONNREFUSED from crashing serverless runtime
        this.queue.on('error', (err) => {
          this.logger.warn(`[AudioQueueService] Redis queue warning (non-fatal): ${err.message}`);
        });
      } else {
        this.logger.warn(
          isServerless && isLocalhostRedis
            ? 'REDIS_URL points to localhost in serverless environment. Background audio queue is inactive.'
            : 'REDIS_URL not configured. Background audio queue is inactive in serverless mode.',
        );
      }
    } catch (err) {
      this.logger.warn('Failed to initialize AudioQueue (non-fatal):', err);
      this.queue = null;
    }
  }

  async enqueue(uploadJobId: string): Promise<Job<AudioProcessingTask> | null> {
    if (!this.queue) {
      this.logger.warn(`Audio queue unavailable. Skipping background enqueue for job: ${uploadJobId}`);
      return null;
    }
    return this.queue.add(
      'process-audio',
      { uploadJobId },
      { jobId: uploadJobId },
    );
  }

  async onModuleDestroy(): Promise<void> {
    if (this.queue) {
      await this.queue.close();
    }
  }
}
