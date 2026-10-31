import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
  PayloadTooLargeException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContentStatus, Prisma, UploadStatus, UserRole } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import type { AuthPrincipal } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { AudioQueueService } from './audio-queue.service';
import { validateAudioUpload } from './audio-format';
import {
  OBJECT_STORAGE,
  type ObjectStorage,
  type StoredObjectMetadata,
} from './media.constants';
import { InitiateUploadDto } from './dto/initiate-upload.dto';

const activeUploadStatuses = [
  UploadStatus.INITIATED,
  UploadStatus.UPLOADED,
  UploadStatus.QUEUED,
  UploadStatus.PROCESSING,
];

@Injectable()
export class UploadService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(UploadService.name);
  private readonly maxUploadBytes: number;
  private readonly uploadTtlSeconds: number;
  private recoveryTimer?: NodeJS.Timeout;
  private recovering = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly queue: AudioQueueService,
    @Inject(OBJECT_STORAGE) private readonly storage: ObjectStorage,
  ) {
    this.maxUploadBytes = this.readPositiveInteger(
      'MAX_AUDIO_UPLOAD_BYTES',
      500 * 1024 * 1024,
    );
    this.uploadTtlSeconds = this.readPositiveInteger(
      'S3_UPLOAD_URL_TTL_SECONDS',
      300,
    );
    if (this.uploadTtlSeconds > 600) {
      throw new Error('S3_UPLOAD_URL_TTL_SECONDS cannot exceed 600 seconds.');
    }
  }

  onModuleInit(): void {
    void this.requeuePendingJobs();
    this.recoveryTimer = setInterval(
      () => void this.requeuePendingJobs(),
      60_000,
    );
    this.recoveryTimer.unref();
  }

  onModuleDestroy(): void {
    if (this.recoveryTimer) clearInterval(this.recoveryTimer);
  }

  async initiate(input: InitiateUploadDto, actor: AuthPrincipal) {
    if (
      actor.role !== UserRole.ADMIN &&
      actor.role !== UserRole.SUPER_ADMIN &&
      actor.role !== UserRole.CREATOR
    ) {
      throw new ForbiddenException('Creator or administrator access is required.');
    }

    const format = validateAudioUpload(
      input.originalName,
      input.contentType,
      input.sizeBytes,
      this.maxUploadBytes,
    );
    const episode = await this.prisma.episode.findUnique({
      where: { id: input.episodeId },
      select: {
        id: true,
        status: true,
        season: { select: { series: { select: { creatorId: true } } } },
      },
    });
    if (!episode) throw new NotFoundException('Episode not found.');
    await this.assertEpisodeAccess(episode.season.series.creatorId, actor);
    if (
      episode.status !== ContentStatus.DRAFT &&
      episode.status !== ContentStatus.PROCESSING &&
      episode.status !== ContentStatus.REJECTED
    ) {
      throw new ConflictException(
        `Audio cannot be uploaded to an episode in ${episode.status}.`,
      );
    }

    const expiredJobs = await this.prisma.uploadJob.findMany({
      where: {
        episodeId: episode.id,
        status: UploadStatus.INITIATED,
        expiresAt: { lte: new Date() },
      },
      select: { id: true, objectKey: true },
    });
    for (const expiredJob of expiredJobs) {
      const expired = await this.prisma.uploadJob.updateMany({
        where: {
          id: expiredJob.id,
          status: UploadStatus.INITIATED,
          expiresAt: { lte: new Date() },
        },
        data: {
          status: UploadStatus.FAILED,
          activeEpisodeId: null,
          failureReason: 'Upload authorization expired.',
        },
      });
      if (expired.count === 1) {
        try {
          await this.storage.deleteObject(expiredJob.objectKey);
        } catch (error) {
          throw new ServiceUnavailableException(
            `Expired upload cleanup failed: ${this.errorMessage(error)}`,
          );
        }
      }
    }

    const activeJob = await this.prisma.uploadJob.findFirst({
      where: {
        episodeId: episode.id,
        status: { in: activeUploadStatuses },
      },
      select: { id: true },
    });
    if (activeJob) {
      throw new ConflictException('This episode already has an active upload.');
    }

    try {
      await this.storage.ensurePrivateBucket();
    } catch (error) {
      throw new ServiceUnavailableException(
        `Private audio storage is unavailable: ${this.errorMessage(error)}`,
      );
    }

    const uploadId = randomUUID();
    const objectKey = `original/${uploadId}${format.extension}`;
    const form = await this.storage.createUploadForm(
      objectKey,
      format.contentType,
      this.maxUploadBytes,
      this.uploadTtlSeconds,
    );
    const expiresAt = new Date(Date.now() + this.uploadTtlSeconds * 1000);

    let job: { id: string; status: UploadStatus; expiresAt: Date };
    try {
      job = await this.prisma.uploadJob.create({
        data: {
          id: uploadId,
          requesterId: actor.id,
          episodeId: episode.id,
          activeEpisodeId: episode.id,
          objectKey,
          originalName: input.originalName,
          contentType: format.contentType,
          sizeBytes: BigInt(input.sizeBytes),
          status: UploadStatus.INITIATED,
          expiresAt,
        },
        select: { id: true, status: true, expiresAt: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('This episode already has an active upload.');
      }
      throw error;
    }

    return {
      upload: job,
      form,
      maxBytes: this.maxUploadBytes,
      method: 'POST' as const,
      instructions:
        'POST the multipart form fields and audio file to the returned private-storage URL.',
    };
  }

  async complete(uploadId: string, actor: AuthPrincipal) {
    const job = await this.findOwnedJob(uploadId, actor);
    if (job.status !== UploadStatus.INITIATED) {
      return this.safeJob(job);
    }
    if (job.expiresAt <= new Date()) {
      const expired = await this.prisma.uploadJob.updateMany({
        where: { id: job.id, status: UploadStatus.INITIATED },
        data: {
          status: UploadStatus.FAILED,
          activeEpisodeId: null,
          failureReason: 'Upload authorization expired.',
        },
      });
      if (expired.count === 1) {
        try {
          await this.storage.deleteObject(job.objectKey);
        } catch (error) {
          throw new ServiceUnavailableException(
            `Expired upload cleanup failed: ${this.errorMessage(error)}`,
          );
        }
      }
      throw new ConflictException('The upload authorization has expired.');
    }

    let stored: StoredObjectMetadata;
    try {
      stored = await this.storage.headObject(job.objectKey);
    } catch (error) {
      throw new BadRequestException(
        `The uploaded object could not be verified: ${this.errorMessage(error)}`,
      );
    }
    const maxBytes = this.maxUploadBytes;
    if (
      stored.sizeBytes !== Number(job.sizeBytes) ||
      stored.sizeBytes < 1 ||
      stored.sizeBytes > maxBytes ||
      stored.contentType?.toLowerCase() !== job.contentType.toLowerCase()
    ) {
      try {
        await this.storage.deleteObject(job.objectKey);
      } catch (error) {
        throw new ServiceUnavailableException(
          `Uploaded object failed validation and cleanup also failed: ${this.errorMessage(error)}`,
        );
      }
      await this.prisma.uploadJob.updateMany({
        where: { id: job.id, status: UploadStatus.INITIATED },
        data: {
          status: UploadStatus.FAILED,
          activeEpisodeId: null,
          failureReason: 'Uploaded object size or content type did not match authorization.',
        },
      });
      throw new BadRequestException(
        'Uploaded file size or content type did not match the authorized upload.',
      );
    }

    const transitioned = await this.prisma.$transaction(async (transaction) => {
      const update = await transaction.uploadJob.updateMany({
        where: { id: job.id, status: UploadStatus.INITIATED },
        data: {
          status: UploadStatus.QUEUED,
          uploadedAt: new Date(),
          failureReason: null,
        },
      });
      if (update.count !== 1) return false;
      await transaction.episode.update({
        where: { id: job.episodeId },
        data: { status: ContentStatus.PROCESSING },
      });
      return true;
    });

    if (!transitioned) {
      const current = await this.prisma.uploadJob.findUniqueOrThrow({
        where: { id: job.id },
      });
      return this.safeJob(current);
    }

    try {
      await this.queue.enqueue(job.id);
    } catch (error) {
      await this.prisma.uploadJob.updateMany({
        where: { id: job.id, status: UploadStatus.QUEUED },
        data: {
          status: UploadStatus.FAILED,
          activeEpisodeId: null,
          failureReason: 'Audio processing could not be queued.',
        },
      });
      throw new ServiceUnavailableException(
        `Audio processing queue is unavailable: ${this.errorMessage(error)}`,
      );
    }

    return {
      id: job.id,
      status: UploadStatus.QUEUED,
      uploadedAt: new Date(),
    };
  }

  async getStatus(uploadId: string, actor: AuthPrincipal) {
    return this.safeJob(await this.findOwnedJob(uploadId, actor));
  }

  private async findOwnedJob(uploadId: string, actor: AuthPrincipal) {
    const job = await this.prisma.uploadJob.findUnique({
      where: { id: uploadId },
    });
    if (!job) throw new NotFoundException('Upload job not found.');
    if (
      job.requesterId !== actor.id &&
      actor.role !== UserRole.ADMIN &&
      actor.role !== UserRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException('You cannot access this upload job.');
    }
    return job;
  }

  private async requeuePendingJobs(): Promise<void> {
    if (this.recovering) return;
    this.recovering = true;
    try {
      const pending = await this.prisma.uploadJob.findMany({
        where: { status: UploadStatus.QUEUED },
        orderBy: { createdAt: 'asc' },
        take: 100,
        select: { id: true },
      });
      for (const job of pending) {
        await this.queue.enqueue(job.id);
      }
    } catch (error) {
      this.logger.error(
        'Unable to requeue pending audio jobs; the next recovery interval will retry.',
        error instanceof Error ? error.stack : undefined,
      );
    } finally {
      this.recovering = false;
    }
  }

  private async assertEpisodeAccess(
    creatorId: string | null,
    actor: AuthPrincipal,
  ): Promise<void> {
    if (actor.role === UserRole.ADMIN || actor.role === UserRole.SUPER_ADMIN) {
      return;
    }
    if (actor.role !== UserRole.CREATOR) {
      throw new ForbiddenException('Creator access is required.');
    }
    const profile = await this.prisma.creatorProfile.findFirst({
      where: { userId: actor.id, approvedAt: { not: null } },
      select: { id: true },
    });
    if (!profile) {
      throw new ForbiddenException('An approved creator profile is required.');
    }
    if (creatorId !== actor.id) {
      throw new ForbiddenException('You can only upload to your own series.');
    }
  }

  private safeJob(job: {
    id: string;
    episodeId: string;
    status: UploadStatus;
    sizeBytes: bigint;
    contentType: string;
    failureReason: string | null;
    attemptCount: number;
    expiresAt: Date;
    uploadedAt: Date | null;
    processedAt: Date | null;
  }) {
    return {
      id: job.id,
      episodeId: job.episodeId,
      status: job.status,
      sizeBytes: job.sizeBytes.toString(),
      contentType: job.contentType,
      failureReason: job.failureReason,
      attemptCount: job.attemptCount,
      expiresAt: job.expiresAt,
      uploadedAt: job.uploadedAt,
      processedAt: job.processedAt,
    };
  }

  private readPositiveInteger(key: string, fallback: number): number {
    const value = this.config.get<string>(key);
    if (value === undefined) return fallback;
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed) || parsed < 1) {
      throw new Error(`${key} must be a positive safe integer.`);
    }
    return parsed;
  }

  private errorMessage(error: unknown): string {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return `database error ${error.code}`;
    }
    return error instanceof Error
      ? error.message.slice(0, 300)
      : 'unknown error';
  }
}
