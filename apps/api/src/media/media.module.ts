import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AudioQueueService } from './audio-queue.service';
import { AudioProcessingService } from './audio-processing.service';
import { FfmpegService } from './ffmpeg.service';
import { OBJECT_STORAGE } from './media.constants';
import { S3ObjectStorageService } from './s3-object-storage.service';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [AuthModule],
  controllers: [UploadController],
  providers: [
    AudioQueueService,
    AudioProcessingService,
    FfmpegService,
    S3ObjectStorageService,
    { provide: OBJECT_STORAGE, useExisting: S3ObjectStorageService },
    UploadService,
  ],
  exports: [AudioQueueService, OBJECT_STORAGE, UploadService],
})
export class MediaModule {}
