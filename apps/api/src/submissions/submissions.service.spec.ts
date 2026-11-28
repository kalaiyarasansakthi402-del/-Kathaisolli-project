import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ApplicationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SubmissionsService } from './submissions.service';

describe('SubmissionsService', () => {
  const prisma = {
    storySubmission: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: SubmissionsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        SubmissionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(SubmissionsService);
  });

  it('rejects submission if acknowledgedNote is false', async () => {
    await expect(
      service.create({
        username: 'kalai',
        email: 'kalai@example.com',
        bookTitle: 'Ponniyin Selvan',
        authorName: 'Kalki',
        archiveUrl: 'https://firebasestorage.googleapis.com/test.zip',
        archiveFileName: 'ponniyin.zip',
        acknowledgedNote: false,
      }),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.storySubmission.create).not.toHaveBeenCalled();
  });

  it('rejects non-zip archiveFileName', async () => {
    await expect(
      service.create({
        username: 'kalai',
        email: 'kalai@example.com',
        bookTitle: 'Ponniyin Selvan',
        authorName: 'Kalki',
        archiveUrl: 'https://firebasestorage.googleapis.com/test.rar',
        archiveFileName: 'ponniyin.rar',
        acknowledgedNote: true,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('creates a pending story submission when valid', async () => {
    prisma.storySubmission.create.mockResolvedValue({
      id: 'sub-1',
      bookTitle: 'Ponniyin Selvan',
      authorName: 'Kalki',
      status: ApplicationStatus.PENDING,
      createdAt: new Date(),
    });

    const result = await service.create(
      {
        username: 'kalai',
        email: 'Kalai@Example.com',
        bookTitle: 'Ponniyin Selvan',
        authorName: 'Kalki',
        narratorName: 'Studio',
        archiveUrl: 'https://firebasestorage.googleapis.com/test.zip',
        archiveFileName: 'ponniyin.zip',
        archiveSizeBytes: 1024,
        acknowledgedNote: true,
      },
      'user-1',
    );

    expect(result.success).toBe(true);
    expect(result.submission.status).toBe(ApplicationStatus.PENDING);
    expect(prisma.storySubmission.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          email: 'kalai@example.com',
          status: ApplicationStatus.PENDING,
          acknowledgedNote: true,
        }),
      }),
    );
  });

  it('throws NotFoundException when reviewing a non-existent submission', async () => {
    prisma.storySubmission.findUnique.mockResolvedValue(null);
    await expect(
      service.review('missing-id', 'APPROVED', 'admin-1'),
    ).rejects.toThrow(NotFoundException);
  });
});
