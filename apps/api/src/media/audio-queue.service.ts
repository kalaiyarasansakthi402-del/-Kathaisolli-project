import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Queue } from 'bullmq';
import { AUDIO_PROCESSING_QUEUE, AudioProcessingTask } from './media.constants';
import { getRedisConnectionOptions } from './redis-connection';

@Injectable()
export class AudioQueueService implements OnModuleDestroy {
  private readonly queue: Queue<AudioProcessingTask>;

  constructor(config: ConfigService) {
    this.queue = new Queue<AudioProcessingTask>(AUDIO_PROCESSING_QUEUE, {
      connection: getRedisConnectionOptions(config),
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    });
  }

  async enqueue(uploadJobId: string): Promise<Job<AudioProcessingTask>> {
    return this.queue.add(
      'process-audio',
      { uploadJobId },
      { jobId: uploadJobId },
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }
}
