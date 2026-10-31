import { ContentStatus, ContentType, UserRole } from '@prisma/client';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CatalogService } from './catalog.service';
import { CatalogQueryDto } from './dto/catalog-query.dto';

describe('CatalogService', () => {
  const prisma = {
    series: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    category: { findMany: jest.fn() },
    language: { findMany: jest.fn() },
    season: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
    episode: { create: jest.fn() },
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

  it('only queries published catalog records and returns pagination metadata', async () => {
    prisma.series.findMany.mockResolvedValue([{ id: 'published-series' }]);
    prisma.series.count.mockResolvedValue(1);

    const query: CatalogQueryDto = {
      page: 2,
      pageSize: 10,
      q: 'நிலவு',
      category: 'mystery',
      language: 'ta',
      contentType: ContentType.STORY,
      premium: false,
    };
    const result = await catalog.listSeries(query);

    expect(prisma.series.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: ContentStatus.PUBLISHED,
          contentType: ContentType.STORY,
          premiumFlag: false,
          category: { is: { slug: 'mystery', isActive: true } },
          language: { is: { code: 'ta', isActive: true } },
          OR: expect.arrayContaining([
            { title: { contains: 'நிலவு', mode: 'insensitive' } },
          ]),
        }),
        skip: 10,
        take: 10,
      }),
    );
    expect(result.pagination).toEqual({
      page: 2,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    });
  });

  it('creates new series as drafts rather than making them publicly visible', async () => {
    prisma.series.create.mockResolvedValue({
      id: 'series-id',
      slug: 'nilavin-kural',
      title: 'நிலவின் குரல்',
      status: ContentStatus.DRAFT,
    });

    const result = await catalog.createSeries({
      slug: 'nilavin-kural',
      title: 'நிலவின் குரல்',
      shortDescription: 'ஒரு புதிய கதை.',
      languageId: '00000000-0000-4000-8000-000000000001',
      categoryId: '00000000-0000-4000-8000-000000000002',
    }, {
      id: 'admin-id',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
    });

    expect(prisma.series.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: ContentStatus.DRAFT }),
      }),
    );
    expect(result.status).toBe(ContentStatus.DRAFT);
  });
});
