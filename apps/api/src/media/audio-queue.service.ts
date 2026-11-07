import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Queue } from 'bullmq';
import { AUDIO_PROCESSING_QUEUE, AudioProcessingTask } from './media.constants';
import { getRedisConnectionOptions } from './redis-connection';

@Injectable()
export class AudioQueueService implements OnModuleDestroy {
  private readonly logger = new Logger(AudioQueueService.name);
  private readonly queue: Queue<AudioProcessingTask> | null = null;

  constructor(config: ConfigService) {
    try {
      const redisUrl = config.get<string>('REDIS_URL');
      if (redisUrl && (redisUrl.startsWith('redis://') || redisUrl.startsWith('rediss://'))) {
        this.queue = new Queue<AudioProcessingTask>(AUDIO_PROCESSING_QUEUE, {
          connection: getRedisConnectionOptions(config),
          defaultJobOptions: {
            attempts: 5,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: 100,
            removeOnFail: 500,
          },
        });
      } else {
        this.logger.warn('REDIS_URL not configured. Background audio queue is inactive in serverless mode.');
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
