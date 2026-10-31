import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ContentStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CatalogService } from './catalog.service';

describe('CatalogService publishing workflow', () => {
  const prisma = {
    series: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    episode: {},
    creatorProfile: { findFirst: jest.fn() },
  };
  let catalog: CatalogService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        CatalogService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    catalog = module.get(CatalogService);
  });

  it('lets an approved creator submit their own ready series for review', async () => {
    prisma.series.findUnique.mockResolvedValue({
      id: 'series-id',
      creatorId: 'creator-id',
      status: ContentStatus.DRAFT,
      _count: { seasons: 1 },
    });
    prisma.creatorProfile.findFirst.mockResolvedValue({ id: 'profile-id' });
    prisma.series.updateMany.mockResolvedValue({ count: 1 });

    await expect(
      catalog.submitSeriesForReview('series-id', {
        id: 'creator-id',
        email: 'creator@example.com',
        role: UserRole.CREATOR,
      }),
    ).resolves.toEqual({
      id: 'series-id',
      status: ContentStatus.PENDING_REVIEW,
    });
    expect(prisma.series.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'series-id',
          status: ContentStatus.DRAFT,
          creatorId: 'creator-id',
        },
        data: expect.objectContaining({
          status: ContentStatus.PENDING_REVIEW,
        }),
      }),
    );
  });

  it('prevents a creator from submitting another creator’s series', async () => {
    prisma.series.findUnique.mockResolvedValue({
      id: 'series-id',
      creatorId: 'another-creator',
      status: ContentStatus.DRAFT,
      _count: { seasons: 1 },
    });
    prisma.creatorProfile.findFirst.mockResolvedValue({ id: 'profile-id' });

    await expect(
      catalog.submitSeriesForReview('series-id', {
        id: 'creator-id',
        email: 'creator@example.com',
        role: UserRole.CREATOR,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.series.updateMany).not.toHaveBeenCalled();
  });

  it('does not publish a series without processed reviewable episodes', async () => {
    prisma.series.findUnique.mockResolvedValue({
      id: 'series-id',
      status: ContentStatus.PENDING_REVIEW,
      _count: { seasons: 0 },
    });

    await expect(
      catalog.reviewSeries('series-id', 'PUBLISH', undefined, 'admin-id'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.series.updateMany).not.toHaveBeenCalled();
  });
});
