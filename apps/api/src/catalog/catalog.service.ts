import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { ContentStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CatalogCacheService } from './catalog-cache.service';
import type { AuthPrincipal } from '../auth/auth.types';
import { CatalogQueryDto } from './dto/catalog-query.dto';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { CreateSeasonDto } from './dto/create-season.dto';
import { CreateSeriesDto } from './dto/create-series.dto';

const seriesSelection = {
  id: true,
  slug: true,
  title: true,
  shortDescription: true,
  coverImage: true,
  contentType: true,
  premiumFlag: true,
  featuredFlag: true,
  authorName: true,
  narratorName: true,
  tags: true,
  ageRating: true,
  publishedAt: true,
  language: { select: { code: true, name: true, nativeName: true } },
  category: { select: { slug: true, name: true } },
} satisfies Prisma.SeriesSelect;

const publiclyAccessibleSeries: Prisma.SeriesWhereInput = {
  status: ContentStatus.PUBLISHED,
  seasons: {
    some: {
      episodes: {
        some: {
          status: ContentStatus.PUBLISHED,
          mediaAsset: { is: { isProcessed: true } },
        },
      },
    },
  },
};

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly cache?: CatalogCacheService,
  ) {}

  async listSeries(query: CatalogQueryDto) {
    const where = this.buildPublicSeriesFilter(query);
    const [items, total] = await Promise.all([
      this.prisma.series.findMany({
        where,
        select: seriesSelection,
        orderBy: [{ featuredFlag: 'desc' }, { publishedAt: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.series.count({ where }),
    ]);

    return this.pageResult(items, total, query);
  }

  async getSeries(slug: string) {
    const cacheKey = `catalog:series:${slug.toLowerCase()}`;
    if (this.cache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) return cached;
    }

    const series = await this.prisma.series.findFirst({
      where: { slug, ...publiclyAccessibleSeries },
      select: {
        ...seriesSelection,
        fullDescription: true,
        bannerImage: true,
        seasons: {
          where: {
            episodes: {
              some: {
                status: ContentStatus.PUBLISHED,
                mediaAsset: { is: { isProcessed: true } },
              },
            },
          },
          orderBy: { number: 'asc' },
          select: {
            id: true,
            title: true,
            number: true,
            episodes: {
              where: {
                status: ContentStatus.PUBLISHED,
                mediaAsset: { is: { isProcessed: true } },
              },
              orderBy: { episodeNumber: 'asc' },
              select: {
                id: true,
                title: true,
                description: true,
                episodeNumber: true,
                durationSec: true,
                previewDuration: true,
                premiumFlag: true,
                releaseDate: true,
              },
            },
          },
        },
      },
    });

    if (!series) {
      throw new NotFoundException('Story series not found.');
    }
    if (this.cache) {
      await this.cache.set(cacheKey, series, 300);
    }
    return series;
  }

  async listEpisodes(slug: string) {
    const cacheKey = `catalog:episodes:${slug.toLowerCase()}`;
    if (this.cache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) return cached;
    }

    const series = await this.prisma.series.findFirst({
      where: { slug, ...publiclyAccessibleSeries },
      select: { id: true },
    });
    if (!series) {
      throw new NotFoundException('Story series not found.');
    }

    const episodes = await this.prisma.season.findMany({
      where: {
        seriesId: series.id,
        episodes: {
          some: {
            status: ContentStatus.PUBLISHED,
            mediaAsset: { is: { isProcessed: true } },
          },
        },
      },
      orderBy: { number: 'asc' },
      select: {
        id: true,
        title: true,
        number: true,
        episodes: {
          where: {
            status: ContentStatus.PUBLISHED,
            mediaAsset: { is: { isProcessed: true } },
          },
          orderBy: { episodeNumber: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            episodeNumber: true,
            durationSec: true,
            previewDuration: true,
            premiumFlag: true,
            releaseDate: true,
          },
        },
      },
    });
    if (this.cache) {
      await this.cache.set(cacheKey, episodes, 300);
    }
    return episodes;
  }

  async getHome() {
    const cacheKey = 'catalog:home';
    if (this.cache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) return cached;
    }

    const [featured, latest, categories] = await Promise.all([
      this.prisma.series.findMany({
        where: { ...publiclyAccessibleSeries, featuredFlag: true },
        select: seriesSelection,
        orderBy: { publishedAt: 'desc' },
        take: 8,
      }),
      this.prisma.series.findMany({
        where: publiclyAccessibleSeries,
        select: seriesSelection,
        orderBy: { publishedAt: 'desc' },
        take: 12,
      }),
      this.prisma.category.findMany({
        where: {
          isActive: true,
          series: { some: publiclyAccessibleSeries },
        },
        orderBy: { name: 'asc' },
        select: { slug: true, name: true },
      }),
    ]);
    const homeData = { featured, latest, categories };
    if (this.cache) {
      await this.cache.set(cacheKey, homeData, 180);
    }
    return homeData;
  }

  async listCategories() {
    const cacheKey = 'catalog:categories';
    if (this.cache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) return cached;
    }

    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, slug: true, name: true, description: true },
    });
    if (this.cache) {
      await this.cache.set(cacheKey, categories, 300);
    }
    return categories;
  }

  async listLanguages() {
    const cacheKey = 'catalog:languages';
    if (this.cache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) return cached;
    }

    const languages = await this.prisma.language.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, code: true, name: true, nativeName: true },
    });
    if (this.cache) {
      await this.cache.set(cacheKey, languages, 600);
    }
    return languages;
  }

  async createSeries(input: CreateSeriesDto, actor: AuthPrincipal) {
    if (
      actor.role !== UserRole.ADMIN &&
      actor.role !== UserRole.SUPER_ADMIN &&
      actor.role !== UserRole.CREATOR
    ) {
      throw new ForbiddenException('Creator or administrator access is required.');
    }
    if (actor.role === UserRole.CREATOR) {
      await this.assertApprovedCreator(actor.id);
    }

    try {
      return await this.prisma.series.create({
        data: {
          slug: input.slug,
          title: input.title,
          shortDescription: input.shortDescription,
          fullDescription: input.fullDescription,
          contentType: input.contentType,
          languageId: input.languageId,
          categoryId: input.categoryId,
          creatorId: actor.role === 'CREATOR' ? actor.id : null,
          authorName: input.authorName,
          narratorName: input.narratorName,
          tags: input.tags ?? [],
          ageRating: input.ageRating,
          status: ContentStatus.DRAFT,
        },
        select: { id: true, slug: true, title: true, status: true },
      });
    } catch (error) {
      this.rethrowCatalogWriteError(error);
    }
  }

  async createSeason(
    seriesId: string,
    input: CreateSeasonDto,
    actor: AuthPrincipal,
  ) {
    const series = await this.prisma.series.findUnique({
      where: { id: seriesId },
      select: { id: true, creatorId: true },
    });
    if (!series) {
      throw new NotFoundException('Story series not found.');
    }
    await this.assertSeriesAccess(series.creatorId, actor);

    try {
      return await this.prisma.season.create({
        data: { seriesId, title: input.title, number: input.number },
        select: { id: true, seriesId: true, title: true, number: true },
      });
    } catch (error) {
      this.rethrowCatalogWriteError(error);
    }
  }

  async createEpisode(input: CreateEpisodeDto, actor: AuthPrincipal) {
    const season = await this.prisma.season.findUnique({
      where: { id: input.seasonId },
      select: { id: true, series: { select: { creatorId: true } } },
    });
    if (!season) {
      throw new NotFoundException('Season not found.');
    }
    await this.assertSeriesAccess(season.series.creatorId, actor);

    try {
      return await this.prisma.episode.create({
        data: {
          seasonId: input.seasonId,
          title: input.title,
          description: input.description,
          episodeNumber: input.episodeNumber,
          status: ContentStatus.DRAFT,
        },
        select: {
          id: true,
          seasonId: true,
          title: true,
          episodeNumber: true,
          status: true,
        },
      });
    } catch (error) {
      this.rethrowCatalogWriteError(error);
    }
  }

  async submitSeriesForReview(seriesId: string, actor: AuthPrincipal) {
    const series = await this.prisma.series.findUnique({
      where: { id: seriesId },
      select: {
        id: true,
        creatorId: true,
        status: true,
        _count: {
          select: {
            seasons: {
              where: {
                episodes: {
                  some: {
                    status: {
                      in: [ContentStatus.PENDING_REVIEW, ContentStatus.PUBLISHED],
                    },
                    mediaAsset: { is: { isProcessed: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!series) throw new NotFoundException('Story series not found.');
    await this.assertSeriesAccess(series.creatorId, actor);

    if (
      series.status !== ContentStatus.DRAFT &&
      series.status !== ContentStatus.REJECTED
    ) {
      throw new ConflictException(
        `A series in ${series.status} cannot be submitted for review.`,
      );
    }
    if (series._count.seasons === 0) {
      throw new BadRequestException(
        'Add a season with a processed episode before submitting this series.',
      );
    }

    const updated = await this.prisma.series.updateMany({
      where: {
        id: seriesId,
        status: series.status,
        creatorId: series.creatorId,
      },
      data: {
        status: ContentStatus.PENDING_REVIEW,
        moderationNote: null,
        reviewedAt: null,
        reviewedById: null,
      },
    });
    if (updated.count !== 1) {
      throw new ConflictException('The series changed; reload and try again.');
    }
    return { id: seriesId, status: ContentStatus.PENDING_REVIEW };
  }

  async reviewSeries(
    seriesId: string,
    decision: 'PUBLISH' | 'REJECT' | 'ARCHIVE',
    moderationNote: string | undefined,
    reviewerId: string,
  ) {
    const series = await this.prisma.series.findUnique({
      where: { id: seriesId },
      select: {
        id: true,
        status: true,
        _count: {
          select: {
            seasons: {
              where: {
                episodes: {
                  some: {
                    status: {
                      in: [ContentStatus.PENDING_REVIEW, ContentStatus.PUBLISHED],
                    },
                    mediaAsset: { is: { isProcessed: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!series) throw new NotFoundException('Story series not found.');

    if (decision === 'PUBLISH') {
      if (series.status !== ContentStatus.PENDING_REVIEW) {
        throw new ConflictException('Only a series pending review can be published.');
      }
      if (series._count.seasons === 0) {
        throw new BadRequestException(
          'A series needs a processed episode before it can be published.',
        );
      }
      const update = await this.prisma.series.updateMany({
        where: { id: seriesId, status: ContentStatus.PENDING_REVIEW },
        data: {
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
          reviewedAt: new Date(),
          reviewedById: reviewerId,
          moderationNote: null,
        },
      });
      if (update.count !== 1) {
        throw new ConflictException('The series changed; reload and try again.');
      }
      return this.prisma.series.findUniqueOrThrow({
        where: { id: seriesId },
        select: { id: true, status: true, publishedAt: true },
      });
    }

    if (decision === 'REJECT') {
      if (series.status !== ContentStatus.PENDING_REVIEW) {
        throw new ConflictException('Only a series pending review can be rejected.');
      }
      if (!moderationNote?.trim()) {
        throw new BadRequestException('A moderation note is required for rejection.');
      }
      const update = await this.prisma.series.updateMany({
        where: { id: seriesId, status: ContentStatus.PENDING_REVIEW },
        data: {
          status: ContentStatus.REJECTED,
          moderationNote: moderationNote.trim(),
          reviewedAt: new Date(),
          reviewedById: reviewerId,
          publishedAt: null,
        },
      });
      if (update.count !== 1) {
        throw new ConflictException('The series changed; reload and try again.');
      }
      return this.prisma.series.findUniqueOrThrow({
        where: { id: seriesId },
        select: { id: true, status: true, moderationNote: true },
      });
    }

    if (
      series.status !== ContentStatus.PUBLISHED &&
      series.status !== ContentStatus.REJECTED
    ) {
      throw new ConflictException(
        `A series in ${series.status} cannot be archived.`,
      );
    }
    const update = await this.prisma.series.updateMany({
      where: { id: seriesId, status: series.status },
      data: {
        status: ContentStatus.ARCHIVED,
        moderationNote: moderationNote?.trim() || null,
        reviewedAt: new Date(),
        reviewedById: reviewerId,
      },
    });
    if (update.count !== 1) {
      throw new ConflictException('The series changed; reload and try again.');
    }
    return this.prisma.series.findUniqueOrThrow({
      where: { id: seriesId },
      select: { id: true, status: true, moderationNote: true },
    });
  }

  async reviewEpisode(
    episodeId: string,
    decision: 'PUBLISH' | 'REJECT' | 'ARCHIVE',
    moderationNote: string | undefined,
    reviewerId: string,
  ) {
    const episode = await this.prisma.episode.findUnique({
      where: { id: episodeId },
      select: {
        id: true,
        status: true,
        season: { select: { series: { select: { status: true } } } },
        mediaAsset: { select: { isProcessed: true } },
      },
    });
    if (!episode) throw new NotFoundException('Episode not found.');

    if (decision === 'PUBLISH') {
      if (episode.status !== ContentStatus.PENDING_REVIEW) {
        throw new ConflictException(
          'Only an episode pending review can be published.',
        );
      }
      if (episode.season.series.status !== ContentStatus.PUBLISHED) {
        throw new BadRequestException(
          'Publish the series before publishing its episodes.',
        );
      }
      if (!episode.mediaAsset?.isProcessed) {
        throw new BadRequestException(
          'Episode audio must finish processing before publication.',
        );
      }
      const update = await this.prisma.episode.updateMany({
        where: { id: episodeId, status: ContentStatus.PENDING_REVIEW },
        data: {
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
          reviewedAt: new Date(),
          reviewedById: reviewerId,
          moderationNote: null,
        },
      });
      if (update.count !== 1) {
        throw new ConflictException('The episode changed; reload and try again.');
      }
      return this.prisma.episode.findUniqueOrThrow({
        where: { id: episodeId },
        select: { id: true, status: true, publishedAt: true },
      });
    }

    if (decision === 'REJECT') {
      if (episode.status !== ContentStatus.PENDING_REVIEW) {
        throw new ConflictException(
          'Only an episode pending review can be rejected.',
        );
      }
      if (!moderationNote?.trim()) {
        throw new BadRequestException('A moderation note is required for rejection.');
      }
      const update = await this.prisma.episode.updateMany({
        where: { id: episodeId, status: ContentStatus.PENDING_REVIEW },
        data: {
          status: ContentStatus.REJECTED,
          moderationNote: moderationNote.trim(),
          reviewedAt: new Date(),
          reviewedById: reviewerId,
          publishedAt: null,
        },
      });
      if (update.count !== 1) {
        throw new ConflictException('The episode changed; reload and try again.');
      }
      return this.prisma.episode.findUniqueOrThrow({
        where: { id: episodeId },
        select: { id: true, status: true, moderationNote: true },
      });
    }

    if (
      episode.status !== ContentStatus.PUBLISHED &&
      episode.status !== ContentStatus.REJECTED
    ) {
      throw new ConflictException(
        `An episode in ${episode.status} cannot be archived.`,
      );
    }
    const update = await this.prisma.episode.updateMany({
      where: { id: episodeId, status: episode.status },
      data: {
        status: ContentStatus.ARCHIVED,
        moderationNote: moderationNote?.trim() || null,
        reviewedAt: new Date(),
        reviewedById: reviewerId,
      },
    });
    if (update.count !== 1) {
      throw new ConflictException('The episode changed; reload and try again.');
    }
    return this.prisma.episode.findUniqueOrThrow({
      where: { id: episodeId },
      select: { id: true, status: true, moderationNote: true },
    });
  }

  async listCreatorSeries(actor: AuthPrincipal) {
    await this.assertApprovedCreator(actor.id);
    return this.prisma.series.findMany({
      where: { creatorId: actor.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        moderationNote: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  private async assertApprovedCreator(userId: string): Promise<void> {
    const profile = await this.prisma.creatorProfile.findFirst({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      throw new ForbiddenException('A creator profile is required.');
    }
  }

  private async assertSeriesAccess(
    creatorId: string | null,
    actor: AuthPrincipal,
  ): Promise<void> {
    if (actor.role === UserRole.ADMIN || actor.role === UserRole.SUPER_ADMIN) return;
    if (actor.role !== UserRole.CREATOR) {
      throw new ForbiddenException('Creator access is required.');
    }
    await this.assertApprovedCreator(actor.id);
    if (creatorId !== actor.id) {
      throw new ForbiddenException('You can only manage your own series.');
    }
  }

  private buildPublicSeriesFilter(
    query: CatalogQueryDto,
  ): Prisma.SeriesWhereInput {
    const where: Prisma.SeriesWhereInput = {
      ...publiclyAccessibleSeries,
    };
    if (query.category) {
      where.category = { is: { slug: query.category.toLowerCase(), isActive: true } };
    }
    if (query.language) {
      where.language = { is: { code: query.language, isActive: true } };
    }
    if (query.contentType) {
      where.contentType = query.contentType;
    }
    if (query.premium !== undefined) {
      where.premiumFlag = query.premium;
    }
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { shortDescription: { contains: query.q, mode: 'insensitive' } },
        { fullDescription: { contains: query.q, mode: 'insensitive' } },
        { authorName: { contains: query.q, mode: 'insensitive' } },
        { narratorName: { contains: query.q, mode: 'insensitive' } },
        {
          creator: {
            is: {
              displayName: { contains: query.q, mode: 'insensitive' },
            },
          },
        },
        { tags: { has: query.q } },
        {
          category: {
            is: { name: { contains: query.q, mode: 'insensitive' } },
          },
        },
      ];
    }
    return where;
  }

  private pageResult<T>(
    items: T[],
    total: number,
    query: CatalogQueryDto,
  ) {
    return {
      items,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  private rethrowCatalogWriteError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'A catalog item with the same unique identifier already exists.',
      );
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      throw new BadRequestException(
        'The selected category or language does not exist.',
      );
    }
    throw error;
  }
}
