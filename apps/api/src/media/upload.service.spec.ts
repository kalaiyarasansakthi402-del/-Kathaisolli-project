import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ContentStatus, UploadStatus, UserRole } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AudioQueueService } from './audio-queue.service';
import { OBJECT_STORAGE } from './media.constants';
import { UploadService } from './upload.service';

describe('UploadService', () => {
  const prisma = {
    episode: { findUnique: jest.fn() },
    creatorProfile: { findFirst: jest.fn() },
    uploadJob: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
    },
  };
  const storage = {
    ensurePrivateBucket: jest.fn(),
    createUploadForm: jest.fn(),
    deleteObject: jest.fn(),
    headObject: jest.fn(),
  };
  const queue = { enqueue: jest.fn() };
  const configValues: Record<string, string> = {
    MAX_AUDIO_UPLOAD_BYTES: '10000',
    S3_UPLOAD_URL_TTL_SECONDS: '300',
  };
  let uploads: UploadService;

  beforeEach(async () => {
    jest.clearAllMocks();
    storage.ensurePrivateBucket.mockResolvedValue(undefined);
    storage.deleteObject.mockResolvedValue(undefined);
    storage.createUploadForm.mockResolvedValue({
      url: 'http://localhost:9000/private-bucket',
      fields: { key: 'original/object.mp3', policy: 'signed-policy' },
    });
    const module = await Test.createTestingModule({
      providers: [
        UploadService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => configValues[key],
          },
        },
        { provide: AudioQueueService, useValue: queue },
        { provide: OBJECT_STORAGE, useValue: storage },
      ],
    }).compile();
    uploads = module.get(UploadService);
  });

  it('refuses upload authorization to listeners', async () => {
    await expect(
      uploads.initiate(
        {
          episodeId: '00000000-0000-4000-8000-000000000001',
          originalName: 'episode.mp3',
          contentType: 'audio/mpeg',
          sizeBytes: 1000,
        },
        {
          id: 'listener-id',
          email: 'listener@example.com',
          role: UserRole.LISTENER,
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.episode.findUnique).not.toHaveBeenCalled();
  });

  it('issues a short-lived private upload form only for an owned episode', async () => {
    prisma.episode.findUnique.mockResolvedValue({
      id: 'episode-id',
      status: ContentStatus.DRAFT,
      season: { series: { creatorId: 'creator-id' } },
    });
    prisma.creatorProfile.findFirst.mockResolvedValue({ id: 'profile-id' });
    prisma.uploadJob.findMany.mockResolvedValue([]);
    prisma.uploadJob.findFirst.mockResolvedValue(null);
    prisma.uploadJob.create.mockResolvedValue({
      id: 'upload-job-id',
      status: UploadStatus.INITIATED,
      expiresAt: new Date(Date.now() + 300_000),
    });

    const result = await uploads.initiate(
      {
        episodeId: '00000000-0000-4000-8000-000000000001',
        originalName: 'episode.mp3',
        contentType: 'audio/mpeg',
        sizeBytes: 1000,
      },
      {
        id: 'creator-id',
        email: 'creator@example.com',
        role: UserRole.CREATOR,
      },
    );

    expect(storage.createUploadForm).toHaveBeenCalledWith(
      expect.stringMatching(/^original\/[0-9a-f-]+\.mp3$/u),
      'audio/mpeg',
      10000,
      300,
    );
    expect(result.upload.status).toBe(UploadStatus.INITIATED);
    expect(result.form.url).toContain('private-bucket');
    expect(JSON.stringify(result)).not.toContain('secret');
  });

  it('rejects uploads to another creator’s episode', async () => {
    prisma.episode.findUnique.mockResolvedValue({
      id: 'episode-id',
      status: ContentStatus.DRAFT,
      season: { series: { creatorId: 'another-creator' } },
    });
    prisma.creatorProfile.findFirst.mockResolvedValue({ id: 'profile-id' });

    await expect(
      uploads.initiate(
        {
          episodeId: '00000000-0000-4000-8000-000000000001',
          originalName: 'episode.mp3',
          contentType: 'audio/mpeg',
          sizeBytes: 1000,
        },
        {
          id: 'creator-id',
          email: 'creator@example.com',
          role: UserRole.CREATOR,
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(storage.createUploadForm).not.toHaveBeenCalled();
    expect(prisma.uploadJob.create).not.toHaveBeenCalled();
  });

  it('rejects completion after the upload authorization expires and releases the episode', async () => {
    prisma.uploadJob.findUnique.mockResolvedValue({
      id: 'upload-job-id',
      requesterId: 'creator-id',
      episodeId: 'episode-id',
      objectKey: 'original/upload.mp3',
      status: UploadStatus.INITIATED,
      expiresAt: new Date(Date.now() - 1_000),
    });
    prisma.uploadJob.updateMany.mockResolvedValue({ count: 1 });

    await expect(
      uploads.complete('upload-job-id', {
        id: 'creator-id',
        email: 'creator@example.com',
        role: UserRole.CREATOR,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.uploadJob.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: UploadStatus.FAILED,
          activeEpisodeId: null,
        }),
      }),
    );
    expect(storage.deleteObject).toHaveBeenCalledWith('original/upload.mp3');
    expect(storage.headObject).not.toHaveBeenCalled();
  });

  it('deletes and fails an uploaded object whose metadata does not match authorization', async () => {
    prisma.uploadJob.findUnique.mockResolvedValue({
      id: 'upload-job-id',
      requesterId: 'creator-id',
      episodeId: 'episode-id',
      objectKey: 'original/upload.mp3',
      contentType: 'audio/mpeg',
      sizeBytes: BigInt(1000),
      status: UploadStatus.INITIATED,
      expiresAt: new Date(Date.now() + 60_000),
    });
    storage.headObject.mockResolvedValue({
      sizeBytes: 999,
      contentType: 'audio/mpeg',
    });
    prisma.uploadJob.updateMany.mockResolvedValue({ count: 1 });

    await expect(
      uploads.complete('upload-job-id', {
        id: 'creator-id',
        email: 'creator@example.com',
        role: UserRole.CREATOR,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(storage.deleteObject).toHaveBeenCalledWith('original/upload.mp3');
    expect(prisma.uploadJob.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: UploadStatus.FAILED,
          activeEpisodeId: null,
        }),
      }),
    );
  });
});
