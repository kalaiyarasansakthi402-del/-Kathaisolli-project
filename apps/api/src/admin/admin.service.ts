import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import {
  ContentStatus,
  Prisma,
  UserRole,
} from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { CatalogCacheService } from '../catalog/catalog-cache.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { SaveChapterAudioDto } from './dto/save-chapter-audio.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly cache?: CatalogCacheService,
  ) {}

  // ==========================================
  // 1. AUDIT LOGGING HELPER
  // ==========================================
  async logActivity(
    userId: string | null | undefined,
    action: string,
    targetType: string,
    targetId?: string,
    details?: any,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: userId || null,
          action,
          targetType,
          targetId: targetId || null,
          details: details ? (details as Prisma.InputJsonValue) : Prisma.JsonNull,
        },
      });
    } catch (err) {
      // Non-blocking log failure
      console.warn('[Admin AuditLog] Log write notice:', err);
    }
  }

  // ==========================================
  // 2. DASHBOARD & ANALYTICS (REAL DATABASE DATA)
  // ==========================================
  async getDashboardStats() {
    const [
      totalStories,
      totalCategories,
      totalPublishedStories,
      totalDraftStories,
      totalAudioFiles,
      mediaAssetAggregates,
      recentStories,
      recentActivities,
    ] = await Promise.all([
      this.prisma.series.count(),
      this.prisma.category.count(),
      this.prisma.series.count({ where: { status: ContentStatus.PUBLISHED } }),
      this.prisma.series.count({ where: { status: ContentStatus.DRAFT } }),
      this.prisma.episode.count({ where: { mediaAssetId: { not: null } } }),
      this.prisma.mediaAsset.aggregate({
        _sum: { sizeBytes: true },
        _count: { id: true },
      }),
      this.prisma.series.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          language: { select: { id: true, name: true, nativeName: true } },
          seasons: {
            include: {
              _count: { select: { episodes: true } },
              episodes: {
                select: {
                  id: true,
                  durationSec: true,
                  mediaAsset: { select: { sizeBytes: true, isProcessed: true } },
                },
              },
            },
          },
        },
      }),
      this.prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
              role: true,
            },
          },
        },
      }),
    ]);

    const totalStorageBytes = Number(mediaAssetAggregates._sum.sizeBytes ?? 0);

    // Compute monthly upload analytics for past 6 months
    const monthlyUploadAnalytics = await this.getMonthlyUploadTrends(6);

    // Breakdown formatted
    const mb = (totalStorageBytes / (1024 * 1024)).toFixed(1);
    const gb = (totalStorageBytes / (1024 * 1024 * 1024)).toFixed(2);
    const storageUsageFormatted =
      totalStorageBytes > 1024 * 1024 * 1024 ? `${gb} GB` : `${mb} MB`;

    // Count cover images in system
    const coverImageCount = await this.prisma.series.count({
      where: { coverImage: { not: null } },
    });

    return {
      totalStories,
      totalCategories,
      totalAudioFiles,
      totalAudioStorageUsage: totalStorageBytes,
      storageUsageFormatted,
      totalPublishedStories,
      totalDraftStories,
      coverImageCount,
      recentlyUploadedStories: recentStories.map((s) => {
        let totalDuration = 0;
        let totalEpisodes = 0;
        for (const season of s.seasons) {
          totalEpisodes += season._count.episodes;
          for (const ep of season.episodes) {
            totalDuration += ep.durationSec || 0;
          }
        }
        return {
          id: s.id,
          slug: s.slug,
          title: s.title,
          shortDescription: s.shortDescription,
          coverImage: s.coverImage,
          authorName: s.authorName || 'By Anzles Studio',
          narratorName: s.narratorName || 'By Anzles Studio',
          status: s.status,
          categoryName: s.category?.name || 'General',
          languageName: s.language?.nativeName || 'தமிழ்',
          totalEpisodes,
          totalDurationSec: totalDuration,
          publishedAt: s.publishedAt,
          createdAt: s.createdAt,
        };
      }),
      recentAdminActivities: recentActivities.map((a) => ({
        id: a.id,
        action: a.action,
        targetType: a.targetType,
        targetId: a.targetId,
        details: a.details,
        createdAt: a.createdAt,
        actorName: a.user?.displayName || 'System Admin',
        actorEmail: a.user?.email || '',
        actorRole: a.user?.role || 'ADMIN',
      })),
      storageUsageStatistics: {
        totalBytes: totalStorageBytes,
        audioCount: totalAudioFiles,
        imageCount: coverImageCount,
        audioBytes: totalStorageBytes,
        imageBytesApprox: coverImageCount * 450 * 1024,
      },
      monthlyUploadAnalytics,
    };
  }

  private async getMonthlyUploadTrends(monthsCount = 6) {
    const months: Array<{ month: string; stories: number; episodes: number }> = [];
    const now = new Date();

    for (let i = monthsCount - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      const monthLabel = start.toLocaleString('en-US', { month: 'short', year: '2-digit' });

      const [stories, episodes] = await Promise.all([
        this.prisma.series.count({
          where: { createdAt: { gte: start, lte: end } },
        }),
        this.prisma.episode.count({
          where: { createdAt: { gte: start, lte: end } },
        }),
      ]);

      months.push({
        month: monthLabel,
        stories,
        episodes,
      });
    }

    return months;
  }

  // Legacy platform metrics compatibility
  async getMetrics() {
    return this.getDashboardStats();
  }

  // ==========================================
  // 3. STORY MANAGEMENT CRUD
  // ==========================================
  async listStories(query: {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: string;
    status?: string;
    languageId?: string;
  }) {
    const page = Math.max(1, query.page || 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize || 20));

    const where: Prisma.SeriesWhereInput = {};

    if (query.status && query.status !== 'ALL') {
      where.status = query.status as ContentStatus;
    }

    if (query.categoryId && query.categoryId !== 'all') {
      where.OR = [
        { categoryId: query.categoryId },
        { category: { slug: query.categoryId.toLowerCase() } },
      ];
    }

    if (query.languageId && query.languageId !== 'all') {
      where.languageId = query.languageId;
    }

    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { authorName: { contains: term, mode: 'insensitive' } },
        { shortDescription: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.series.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          language: { select: { id: true, name: true, nativeName: true } },
          seasons: {
            include: {
              _count: { select: { episodes: true } },
              episodes: {
                select: {
                  id: true,
                  title: true,
                  episodeNumber: true,
                  durationSec: true,
                  status: true,
                  mediaAsset: {
                    select: {
                      id: true,
                      objectKey: true,
                      sizeBytes: true,
                      durationSec: true,
                      isProcessed: true,
                    },
                  },
                },
                orderBy: { episodeNumber: 'asc' },
              },
            },
            orderBy: { number: 'asc' },
          },
        },
      }),
      this.prisma.series.count({ where }),
    ]);

    const formatted = items.map((story) => {
      let totalEpisodes = 0;
      let totalDurationSec = 0;
      let totalStorageBytes = 0;
      const allChapters: any[] = [];

      for (const season of story.seasons) {
        totalEpisodes += season._count.episodes;
        for (const ep of season.episodes) {
          totalDurationSec += ep.durationSec || 0;
          if (ep.mediaAsset) {
            totalStorageBytes += Number(ep.mediaAsset.sizeBytes || 0);
          }
          allChapters.push({
            id: ep.id,
            bookId: story.id,
            number: ep.episodeNumber,
            title: ep.title,
            durationSec: ep.durationSec || 0,
            fileSizeBytes: ep.mediaAsset ? Number(ep.mediaAsset.sizeBytes) : 0,
            audioUrl: ep.mediaAsset?.objectKey || null,
            status: ep.status,
          });
        }
      }

      return {
        id: story.id,
        slug: story.slug,
        title: story.title,
        shortDescription: story.shortDescription,
        fullDescription: story.fullDescription,
        coverImage: story.coverImage,
        coverImageUrl: story.coverImage,
        authorName: story.authorName || 'குகநாதன்',
        narratorName: story.narratorName || 'By Anzles Studio',
        categoryId: story.categoryId,
        categoryName: story.category?.name || 'General',
        languageId: story.languageId,
        languageName: story.language?.nativeName || 'தமிழ்',
        status: story.status,
        publishedAt: story.publishedAt,
        totalEpisodes,
        totalDurationSec,
        totalStorageBytes,
        chapters: allChapters,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt,
      };
    });

    return {
      items: formatted,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getStory(id: string) {
    const story = await this.prisma.series.findFirst({
      where: {
        OR: [{ id: id }, { slug: id }],
      },
      include: {
        category: true,
        language: true,
        seasons: {
          include: {
            episodes: {
              include: { mediaAsset: true },
              orderBy: { episodeNumber: 'asc' },
            },
          },
          orderBy: { number: 'asc' },
        },
      },
    });

    if (!story) {
      throw new NotFoundException(`Story with ID/Slug "${id}" not found.`);
    }

    const allChapters = story.seasons.flatMap((s) =>
      s.episodes.map((ep) => ({
        id: ep.id,
        bookId: story.id,
        number: ep.episodeNumber,
        title: ep.title,
        description: ep.description || '',
        durationSec: ep.durationSec || 0,
        fileSizeBytes: ep.mediaAsset ? Number(ep.mediaAsset.sizeBytes) : 0,
        audioUrl: ep.mediaAsset?.objectKey || '',
        status: ep.status,
        publishedAt: ep.publishedAt,
        createdAt: ep.createdAt,
        updatedAt: ep.updatedAt,
      })),
    );

    return {
      id: story.id,
      slug: story.slug,
      title: story.title,
      shortDescription: story.shortDescription,
      fullDescription: story.fullDescription,
      coverImage: story.coverImage,
      coverImageUrl: story.coverImage,
      authorName: story.authorName || 'By Anzles Studio',
      narratorName: story.narratorName || 'By Anzles Studio',
      categoryId: story.categoryId,
      categoryName: story.category?.name,
      languageId: story.languageId,
      languageName: story.language?.nativeName,
      status: story.status,
      publishedAt: story.publishedAt,
      chapters: allChapters,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
    };
  }

  async createStory(input: CreateStoryDto, actorId?: string) {
    // 1. Resolve Category
    let category = await this.prisma.category.findFirst({
      where: {
        OR: [{ id: input.categoryId }, { slug: input.categoryId.toLowerCase() }],
      },
    });
    if (!category) {
      category = await this.prisma.category.findFirst({
        where: { slug: 'general' },
      });
      if (!category) {
        category = await this.prisma.category.create({
          data: { name: 'General', slug: 'general', description: 'General Stories' },
        });
      }
    }

    // 2. Resolve Language
    let language = await this.prisma.language.findFirst({
      where: input.languageId
        ? { OR: [{ id: input.languageId }, { code: input.languageId.toLowerCase() }] }
        : { code: 'ta' },
    });
    if (!language) {
      language = await this.prisma.language.findFirst({ where: { code: 'ta' } });
      if (!language) {
        language = await this.prisma.language.create({
          data: { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
        });
      }
    }

    // 3. Generate unique slug
    let baseSlug = (input.title || 'story')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!baseSlug) baseSlug = `story-${Date.now()}`;

    let slug = baseSlug;
    let counter = 1;
    while (await this.prisma.series.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const shortDesc = input.shortDescription || input.fullDescription || input.title;

    // 4. Create Series with default Season 1 in a transaction
    const series = await this.prisma.$transaction(async (tx) => {
      const created = await tx.series.create({
        data: {
          title: input.title,
          slug,
          shortDescription: shortDesc.slice(0, 490),
          fullDescription: input.fullDescription || null,
          coverImage: input.coverImage || null,
          authorName: input.authorName || 'குகநாதன்',
          narratorName: input.narratorName || 'By Anzles Studio',
          categoryId: category.id,
          languageId: language.id,
          status: input.status || ContentStatus.DRAFT,
          publishedAt: input.status === ContentStatus.PUBLISHED ? new Date() : null,
          tags: input.tags || [],
          creatorId: actorId || null,
        },
      });

      await tx.season.create({
        data: {
          seriesId: created.id,
          number: 1,
          title: 'அத்தியாயங்கள் (Chapters)',
        },
      });

      return created;
    });

    await this.logActivity(
      actorId,
      'CREATE_STORY',
      'Series',
      series.id,
      { title: series.title, slug: series.slug, status: series.status },
    );

    await this.cache?.invalidateCatalog();
    return this.getStory(series.id);
  }

  async updateStory(id: string, input: UpdateStoryDto, actorId?: string) {
    const existing = await this.prisma.series.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (!existing) {
      throw new NotFoundException(`Story "${id}" not found.`);
    }

    const data: Prisma.SeriesUpdateInput = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.shortDescription !== undefined)
      data.shortDescription = input.shortDescription.slice(0, 490);
    if (input.fullDescription !== undefined) data.fullDescription = input.fullDescription;
    if (input.coverImage !== undefined) data.coverImage = input.coverImage;
    if (input.authorName !== undefined) data.authorName = input.authorName;
    if (input.narratorName !== undefined) data.narratorName = input.narratorName;
    if (input.tags !== undefined) data.tags = input.tags;

    if (input.categoryId) {
      const cat = await this.prisma.category.findFirst({
        where: {
          OR: [{ id: input.categoryId }, { slug: input.categoryId.toLowerCase() }],
        },
      });
      if (cat) data.category = { connect: { id: cat.id } };
    }

    if (input.languageId) {
      const lang = await this.prisma.language.findFirst({
        where: {
          OR: [{ id: input.languageId }, { code: input.languageId.toLowerCase() }],
        },
      });
      if (lang) data.language = { connect: { id: lang.id } };
    }

    if (input.status) {
      data.status = input.status;
      if (input.status === ContentStatus.PUBLISHED && !existing.publishedAt) {
        data.publishedAt = new Date();
      }
    }

    const updated = await this.prisma.series.update({
      where: { id: existing.id },
      data,
    });

    await this.logActivity(
      actorId,
      'UPDATE_STORY',
      'Series',
      updated.id,
      { title: updated.title, changes: Object.keys(data) },
    );

    await this.cache?.invalidateCatalog();
    return this.getStory(updated.id);
  }

  async deleteStory(id: string, actorId?: string) {
    const story = await this.prisma.series.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true, title: true },
    });
    if (!story) {
      throw new NotFoundException(`Story "${id}" not found.`);
    }

    await this.prisma.series.delete({
      where: { id: story.id },
    });

    await this.logActivity(actorId, 'DELETE_STORY', 'Series', story.id, {
      title: story.title,
    });

    await this.cache?.invalidateCatalog();
    return { success: true, message: `Story "${story.title}" deleted.` };
  }

  async toggleStoryPublish(id: string, actorId?: string) {
    const story = await this.prisma.series.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true, title: true, status: true },
    });
    if (!story) {
      throw new NotFoundException(`Story "${id}" not found.`);
    }

    const nextStatus =
      story.status === ContentStatus.PUBLISHED
        ? ContentStatus.DRAFT
        : ContentStatus.PUBLISHED;

    await this.prisma.$transaction([
      this.prisma.series.update({
        where: { id: story.id },
        data: {
          status: nextStatus,
          publishedAt: nextStatus === ContentStatus.PUBLISHED ? new Date() : null,
          reviewedAt: new Date(),
          reviewedById: actorId || null,
        },
      }),
      this.prisma.episode.updateMany({
        where: { season: { seriesId: story.id } },
        data: {
          status: nextStatus,
          publishedAt: nextStatus === ContentStatus.PUBLISHED ? new Date() : null,
        },
      }),
    ]);

    await this.logActivity(
      actorId,
      nextStatus === ContentStatus.PUBLISHED ? 'PUBLISH_STORY' : 'UNPUBLISH_STORY',
      'Series',
      story.id,
      { title: story.title, status: nextStatus },
    );

    await this.cache?.invalidateCatalog();
    return { success: true, id: story.id, status: nextStatus };
  }

  // ==========================================
  // 4. CHAPTER & AUDIO MANAGEMENT
  // ==========================================
  async createChapter(storyId: string, input: CreateChapterDto, actorId?: string) {
    const story = await this.prisma.series.findFirst({
      where: { OR: [{ id: storyId }, { slug: storyId }] },
      include: { seasons: { orderBy: { number: 'asc' }, take: 1 } },
    });
    if (!story) {
      throw new NotFoundException(`Story "${storyId}" not found.`);
    }

    let season = story.seasons[0];
    if (!season) {
      season = await this.prisma.season.create({
        data: {
          seriesId: story.id,
          number: 1,
          title: 'அத்தியாயங்கள் (Chapters)',
        },
      });
    }

    // Determine next episode number
    const maxEp = await this.prisma.episode.aggregate({
      where: { seasonId: season.id },
      _max: { episodeNumber: true },
    });
    const nextEpNum = input.episodeNumber || (maxEp._max.episodeNumber || 0) + 1;

    const episode = await this.prisma.episode.create({
      data: {
        seasonId: season.id,
        episodeNumber: nextEpNum,
        title: input.title,
        description: input.description || null,
        durationSec: input.durationSec || 0,
        status: input.status || ContentStatus.PUBLISHED,
        publishedAt: input.status === ContentStatus.DRAFT ? null : new Date(),
      },
    });

    await this.logActivity(actorId, 'CREATE_CHAPTER', 'Episode', episode.id, {
      storyId: story.id,
      title: episode.title,
      number: episode.episodeNumber,
    });

    await this.cache?.invalidateCatalog();
    return episode;
  }

  async updateChapter(
    storyId: string,
    chapterId: string,
    input: UpdateChapterDto,
    actorId?: string,
  ) {
    const episode = await this.prisma.episode.findUnique({
      where: { id: chapterId },
      include: { season: true },
    });
    if (!episode) {
      throw new NotFoundException(`Chapter "${chapterId}" not found.`);
    }

    const data: Prisma.EpisodeUpdateInput = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.episodeNumber !== undefined) data.episodeNumber = input.episodeNumber;
    if (input.durationSec !== undefined) data.durationSec = input.durationSec;
    if (input.status !== undefined) {
      data.status = input.status;
      if (input.status === ContentStatus.PUBLISHED && !episode.publishedAt) {
        data.publishedAt = new Date();
      }
    }

    const updated = await this.prisma.episode.update({
      where: { id: chapterId },
      data,
    });

    await this.logActivity(actorId, 'UPDATE_CHAPTER', 'Episode', updated.id, {
      title: updated.title,
    });

    await this.cache?.invalidateCatalog();
    return updated;
  }

  async deleteChapter(storyId: string, chapterId: string, actorId?: string) {
    const episode = await this.prisma.episode.findUnique({
      where: { id: chapterId },
      include: { mediaAsset: true },
    });
    if (!episode) {
      throw new NotFoundException(`Chapter "${chapterId}" not found.`);
    }

    await this.prisma.episode.delete({
      where: { id: chapterId },
    });

    if (episode.mediaAssetId) {
      try {
        await this.prisma.mediaAsset.delete({
          where: { id: episode.mediaAssetId },
        });
      } catch {
        // media asset might be linked elsewhere
      }
    }

    await this.logActivity(actorId, 'DELETE_CHAPTER', 'Episode', chapterId, {
      title: episode.title,
    });

    await this.cache?.invalidateCatalog();
    return { success: true };
  }

  async saveChapterAudio(
    storyId: string,
    chapterId: string,
    input: SaveChapterAudioDto,
    actorId?: string,
  ) {
    const episode = await this.prisma.episode.findUnique({
      where: { id: chapterId },
      include: { mediaAsset: true },
    });
    if (!episode) {
      throw new NotFoundException(`Chapter "${chapterId}" not found.`);
    }

    const objectKey = input.storagePath || input.audioUrl;
    const sizeBytes = BigInt(input.fileSizeBytes || 0);
    const durationSec = input.durationSec || 0;

    let mediaAssetId = episode.mediaAssetId;

    if (mediaAssetId) {
      await this.prisma.mediaAsset.update({
        where: { id: mediaAssetId },
        data: {
          objectKey,
          contentType: 'audio/mpeg',
          sizeBytes,
          durationSec,
          isProcessed: true,
        },
      });
    } else {
      // Check if media asset with this objectKey already exists
      const existingAsset = await this.prisma.mediaAsset.findUnique({
        where: { objectKey },
      });
      if (existingAsset) {
        mediaAssetId = existingAsset.id;
        await this.prisma.mediaAsset.update({
          where: { id: mediaAssetId },
          data: { sizeBytes, durationSec, isProcessed: true },
        });
      } else {
        const created = await this.prisma.mediaAsset.create({
          data: {
            objectKey,
            contentType: 'audio/mpeg',
            sizeBytes,
            durationSec,
            isProcessed: true,
          },
        });
        mediaAssetId = created.id;
      }
    }

    const updated = await this.prisma.episode.update({
      where: { id: chapterId },
      data: {
        mediaAssetId,
        durationSec,
        status: ContentStatus.PUBLISHED,
        publishedAt: episode.publishedAt || new Date(),
      },
      include: { mediaAsset: true },
    });

    await this.logActivity(actorId, 'UPLOAD_AUDIO', 'Episode', chapterId, {
      title: updated.title,
      audioUrl: input.audioUrl,
      durationSec,
      fileSizeBytes: input.fileSizeBytes,
    });

    await this.cache?.invalidateCatalog();
    return {
      success: true,
      chapter: {
        id: updated.id,
        title: updated.title,
        durationSec: updated.durationSec,
        audioUrl: input.audioUrl,
        storagePath: objectKey,
        fileSizeBytes: input.fileSizeBytes,
        status: updated.status,
      },
    };
  }

  async deleteChapterAudio(storyId: string, chapterId: string, actorId?: string) {
    const episode = await this.prisma.episode.findUnique({
      where: { id: chapterId },
    });
    if (!episode) {
      throw new NotFoundException(`Chapter "${chapterId}" not found.`);
    }

    const oldAssetId = episode.mediaAssetId;

    await this.prisma.episode.update({
      where: { id: chapterId },
      data: {
        mediaAssetId: null,
      },
    });

    if (oldAssetId) {
      try {
        await this.prisma.mediaAsset.delete({ where: { id: oldAssetId } });
      } catch {
        // Ignored if referenced elsewhere
      }
    }

    await this.logActivity(actorId, 'DELETE_AUDIO', 'Episode', chapterId, {
      title: episode.title,
    });

    await this.cache?.invalidateCatalog();
    return { success: true };
  }

  // ==========================================
  // 5. CATEGORIES MANAGEMENT CRUD
  // ==========================================
  async listCategories() {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { series: true },
        },
      },
    });

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      tamilName: c.name,
      slug: c.slug,
      description: c.description,
      isActive: c.isActive,
      seriesCount: c._count.series,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  async createCategory(input: CreateCategoryDto, actorId?: string) {
    const existing = await this.prisma.category.findUnique({
      where: { slug: input.slug.toLowerCase().trim() },
    });
    if (existing) {
      throw new ConflictException(`Category slug "${input.slug}" already exists.`);
    }

    const category = await this.prisma.category.create({
      data: {
        name: input.name.trim(),
        slug: input.slug.toLowerCase().trim(),
        description: input.description?.trim(),
        isActive: input.isActive !== undefined ? input.isActive : true,
      },
    });

    await this.logActivity(actorId, 'CREATE_CATEGORY', 'Category', category.id, {
      name: category.name,
      slug: category.slug,
    });

    await this.cache?.invalidateCatalog();
    return category;
  }

  async updateCategory(id: string, input: UpdateCategoryDto, actorId?: string) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Category "${id}" not found.`);
    }

    const data: Prisma.CategoryUpdateInput = {};
    if (input.name !== undefined) data.name = input.name.trim();
    if (input.description !== undefined) data.description = input.description?.trim();
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.slug !== undefined && input.slug !== existing.slug) {
      const conflict = await this.prisma.category.findUnique({
        where: { slug: input.slug.toLowerCase().trim() },
      });
      if (conflict && conflict.id !== id) {
        throw new ConflictException(`Slug "${input.slug}" is already in use.`);
      }
      data.slug = input.slug.toLowerCase().trim();
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data,
    });

    await this.logActivity(actorId, 'UPDATE_CATEGORY', 'Category', updated.id, {
      name: updated.name,
    });

    await this.cache?.invalidateCatalog();
    return updated;
  }

  async deleteCategory(id: string, actorId?: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { series: true } } },
    });
    if (!category) {
      throw new NotFoundException(`Category "${id}" not found.`);
    }

    if (category.slug === 'general') {
      throw new BadRequestException('Cannot delete default General category.');
    }

    if (category._count.series > 0) {
      throw new BadRequestException(
        `Cannot delete category "${category.name}" because it contains ${category._count.series} stories. Please reassign the stories first.`,
      );
    }

    await this.prisma.category.delete({ where: { id } });

    await this.logActivity(actorId, 'DELETE_CATEGORY', 'Category', id, {
      name: category.name,
      slug: category.slug,
    });

    await this.cache?.invalidateCatalog();
    return { success: true };
  }

  // ==========================================
  // 6. AUDIO STORAGE MANAGEMENT
  // ==========================================
  async getStorageOverview() {
    const [assets, audioCount, storiesWithCover] = await Promise.all([
      this.prisma.mediaAsset.aggregate({
        _sum: { sizeBytes: true },
        _count: { id: true },
      }),
      this.prisma.mediaAsset.count({
        where: { contentType: { contains: 'audio' } },
      }),
      this.prisma.series.count({
        where: { coverImage: { not: null } },
      }),
    ]);

    const totalBytes = Number(assets._sum.sizeBytes ?? 0);
    const audioBytes = totalBytes;
    const imageBytes = storiesWithCover * 400 * 1024; // Approx 400KB per cover

    return {
      totalStorageBytes: totalBytes + imageBytes,
      audioFilesCount: audioCount,
      imageFilesCount: storiesWithCover,
      totalFilesCount: audioCount + storiesWithCover,
      audioStorageBytes: audioBytes,
      imageStorageBytes: imageBytes,
      bucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'vaagai-audio-books-36a4e.appspot.com',
      provider: 'Firebase Storage',
    };
  }

  async listStorageFiles(query: {
    page?: number;
    pageSize?: number;
    search?: string;
    type?: string;
  }) {
    const page = Math.max(1, query.page || 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize || 25));

    const where: Prisma.MediaAssetWhereInput = {};
    if (query.search && query.search.trim()) {
      where.objectKey = { contains: query.search.trim(), mode: 'insensitive' };
    }
    if (query.type && query.type !== 'ALL') {
      if (query.type === 'AUDIO') {
        where.contentType = { contains: 'audio' };
      } else if (query.type === 'IMAGE') {
        where.contentType = { contains: 'image' };
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.mediaAsset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          episode: {
            select: {
              id: true,
              title: true,
              episodeNumber: true,
              season: {
                select: {
                  series: { select: { id: true, title: true, slug: true } },
                },
              },
            },
          },
        },
      }),
      this.prisma.mediaAsset.count({ where }),
    ]);

    const files = items.map((asset) => {
      const fileName = asset.objectKey.split('/').pop() || asset.objectKey;
      return {
        id: asset.id,
        name: fileName,
        path: asset.objectKey,
        url: asset.objectKey.startsWith('http')
          ? asset.objectKey
          : `https://firebasestorage.googleapis.com/v0/b/${process.env.VITE_FIREBASE_STORAGE_BUCKET || 'vaagai-audio-books-36a4e.appspot.com'}/o/${encodeURIComponent(asset.objectKey)}?alt=media`,
        contentType: asset.contentType,
        sizeBytes: Number(asset.sizeBytes),
        durationSec: asset.durationSec || 0,
        isProcessed: asset.isProcessed,
        associatedStory: asset.episode?.season?.series?.title || null,
        associatedStoryId: asset.episode?.season?.series?.id || null,
        associatedChapter: asset.episode?.title || null,
        createdAt: asset.createdAt,
      };
    });

    return {
      items: files,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async deleteStorageFile(id: string, actorId?: string) {
    const asset = await this.prisma.mediaAsset.findUnique({
      where: { id },
      include: { episode: true },
    });
    if (!asset) {
      throw new NotFoundException(`Media asset "${id}" not found.`);
    }

    if (asset.episode) {
      await this.prisma.episode.update({
        where: { id: asset.episode.id },
        data: { mediaAssetId: null },
      });
    }

    await this.prisma.mediaAsset.delete({ where: { id } });

    await this.logActivity(actorId, 'DELETE_STORAGE_FILE', 'MediaAsset', id, {
      path: asset.objectKey,
    });

    return { success: true };
  }

  // ==========================================
  // 7. REPORTS & ANALYTICS
  // ==========================================
  async getReports(timeframe = '30d', startDate?: string, endDate?: string) {
    let since: Date;
    const now = new Date();

    if (timeframe === '7d') {
      since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === '90d') {
      since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    } else if (startDate) {
      since = new Date(startDate);
    } else {
      // 30d default
      since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const until = endDate ? new Date(endDate) : now;

    const [
      totalStories,
      publishedStories,
      draftStories,
      totalAudioUploads,
      totalCategories,
      categoryDistribution,
      monthlyTrends,
      recentAuditLogs,
    ] = await Promise.all([
      this.prisma.series.count({
        where: { createdAt: { gte: since, lte: until } },
      }),
      this.prisma.series.count({
        where: {
          status: ContentStatus.PUBLISHED,
          createdAt: { gte: since, lte: until },
        },
      }),
      this.prisma.series.count({
        where: {
          status: ContentStatus.DRAFT,
          createdAt: { gte: since, lte: until },
        },
      }),
      this.prisma.episode.count({
        where: {
          mediaAssetId: { not: null },
          createdAt: { gte: since, lte: until },
        },
      }),
      this.prisma.category.count(),
      this.prisma.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { series: true } },
        },
        orderBy: { series: { _count: 'desc' } },
        take: 10,
      }),
      this.getMonthlyUploadTrends(6),
      this.prisma.auditLog.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { displayName: true, email: true, role: true } } },
      }),
    ]);

    const totalAllTimeStories = await this.prisma.series.count();

    return {
      timeframe,
      dateRange: { start: since.toISOString(), end: until.toISOString() },
      metrics: {
        periodStoriesCreated: totalStories,
        periodPublishedStories: publishedStories,
        periodDraftStories: draftStories,
        periodAudioUploads: totalAudioUploads,
        totalAllTimeStories,
        totalCategories,
      },
      categoryDistribution: categoryDistribution.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        count: c._count.series,
        percentage:
          totalAllTimeStories > 0
            ? Math.round((c._count.series / totalAllTimeStories) * 100)
            : 0,
      })),
      monthlyTrends,
      recentAuditLogs: recentAuditLogs.map((l) => ({
        id: l.id,
        action: l.action,
        targetType: l.targetType,
        targetId: l.targetId,
        details: l.details,
        actor: l.user?.displayName || 'Admin',
        role: l.user?.role || 'ADMIN',
        createdAt: l.createdAt,
      })),
    };
  }

  // ==========================================
  // 8. ADMIN ROLES & STAFF MANAGEMENT
  // ==========================================
  async listStaff() {
    const staff = await this.prisma.user.findMany({
      where: {
        role: {
          in: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR],
        },
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        avatarUrl: true,
        disabledAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return staff.map((s) => ({
      id: s.id,
      email: s.email,
      displayName: s.displayName,
      role: s.role,
      roleName:
        s.role === UserRole.SUPER_ADMIN
          ? 'Super Admin (தலைமை நிர்வாகி)'
          : s.role === UserRole.ADMIN
          ? 'Admin (நிர்வாகி)'
          : 'Editor (உள்ளடக்க ஆசிரியர்)',
      avatarUrl: s.avatarUrl,
      isActive: !s.disabledAt,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }

  async createStaff(input: CreateStaffDto, actorId?: string) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      throw new ConflictException(`An account with email "${input.email}" already exists.`);
    }

    const passwordHash = await argon2.hash(input.password, {
      type: argon2.argon2id,
    });

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        displayName: input.displayName.trim(),
        role: input.role,
        emailVerifiedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true,
      },
    });

    await this.logActivity(actorId, 'CREATE_STAFF', 'User', user.id, {
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    });

    return user;
  }

  async updateStaffRole(id: string, role: UserRole, actorId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User "${id}" not found.`);
    }

    if (user.id === actorId && role !== UserRole.SUPER_ADMIN) {
      throw new BadRequestException('You cannot demote your own Super Admin role.');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, displayName: true, role: true },
    });

    await this.logActivity(actorId, 'UPDATE_STAFF_ROLE', 'User', id, {
      oldRole: user.role,
      newRole: role,
    });

    return updated;
  }

  async deleteStaff(id: string, actorId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User "${id}" not found.`);
    }

    if (user.id === actorId) {
      throw new BadRequestException('You cannot delete your own admin account.');
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      const superAdminCount = await this.prisma.user.count({
        where: { role: UserRole.SUPER_ADMIN },
      });
      if (superAdminCount <= 1) {
        throw new BadRequestException('Cannot delete the last remaining Super Admin.');
      }
    }

    await this.prisma.user.delete({ where: { id } });

    await this.logActivity(actorId, 'DELETE_STAFF', 'User', id, {
      email: user.email,
      displayName: user.displayName,
    });

    return { success: true };
  }

  // ==========================================
  // 8.5. USER MANAGEMENT (ADMIN-CONTROLLED USERS)
  // ==========================================
  private mapManagedUser(user: {
    id: string;
    username: string | null;
    email: string;
    displayName: string;
    role: UserRole;
    isActive: boolean;
    disabledAt: Date | null;
    phoneNumber?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: user.id,
      username: user.username || user.email.split('@')[0],
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      isActive: user.isActive && !user.disabledAt,
      disabledAt: user.disabledAt ? user.disabledAt.toISOString() : null,
      phoneNumber: user.phoneNumber || null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async createUser(dto: CreateUserDto, actorId: string) {
    const normalizedUsername = dto.username.toLowerCase().trim();
    const systemEmail = `${normalizedUsername}@user.kathaisolli.local`;

    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: normalizedUsername },
          { email: systemEmail },
        ],
      },
    });

    if (existing) {
      throw new ConflictException('Username is already taken. Please choose another username.');
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
    });

    let user: any;
    try {
      user = await this.prisma.user.create({
        data: {
          username: normalizedUsername,
          email: systemEmail,
          displayName: dto.username,
          phoneNumber: dto.phoneNumber?.trim() || null,
          passwordHash,
          role: UserRole.LISTENER,
          isActive: true,
          disabledAt: null,
          emailVerifiedAt: new Date(),
        },
      });
    } catch (createErr: any) {
      if (
        createErr?.message?.includes('phone_number') ||
        createErr?.code === 'P2021' ||
        createErr?.code === 'P2002'
      ) {
        if (createErr?.code === 'P2002') throw createErr;
        // Fallback without phoneNumber if column is pending migration
        user = await this.prisma.user.create({
          data: {
            username: normalizedUsername,
            email: systemEmail,
            displayName: dto.username,
            passwordHash,
            role: UserRole.LISTENER,
            isActive: true,
            disabledAt: null,
            emailVerifiedAt: new Date(),
          },
        });
      } else {
        throw createErr;
      }
    }

    await this.logActivity(actorId, 'CREATE_USER', 'User', user.id, {
      username: user.username,
      displayName: user.displayName,
    });

    return this.mapManagedUser(user);
  }

  async listUsers(query?: string, page = 1, limit = 50) {
    const pageNum = Math.max(1, Number(page) || 1);
    const take = Math.min(100, Math.max(1, Number(limit) || 50));
    const skip = (pageNum - 1) * take;

    const where: Prisma.UserWhereInput = {};

    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      where.OR = [
        { username: { contains: q, mode: 'insensitive' } },
        { displayName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      users: users.map((u) => this.mapManagedUser(u)),
      total,
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(total / take),
    };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return this.mapManagedUser(user);
  }

  async updateUser(id: string, dto: UpdateUserDto, actorId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const data: Prisma.UserUpdateInput = {};

    if (dto.username) {
      const normalized = dto.username.toLowerCase().trim();
      if (normalized !== user.username) {
        const existing = await this.prisma.user.findFirst({
          where: {
            username: normalized,
            id: { not: id },
          },
        });
        if (existing) {
          throw new ConflictException('Username is already taken.');
        }
        data.username = normalized;
        if (user.email.endsWith('@user.kathaisolli.local')) {
          data.email = `${normalized}@user.kathaisolli.local`;
        }
      }
    }

    if (dto.displayName !== undefined) {
      data.displayName = dto.displayName.trim();
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
    });

    await this.logActivity(actorId, 'UPDATE_USER', 'User', id, {
      username: updated.username,
      displayName: updated.displayName,
    });

    return this.mapManagedUser(updated);
  }

  async resetUserPassword(id: string, newPassword: string, actorId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const passwordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
    });

    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    await this.prisma.authSession.deleteMany({
      where: { userId: id },
    });

    await this.logActivity(actorId, 'RESET_USER_PASSWORD', 'User', id, {
      username: user.username,
    });

    return { success: true, message: 'Password reset successfully.' };
  }

  async updateUserStatus(id: string, isActive: boolean, actorId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.id === actorId && !isActive) {
      throw new BadRequestException('You cannot deactivate your own account.');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        isActive,
        disabledAt: isActive ? null : new Date(),
      },
    });

    if (!isActive) {
      await this.prisma.authSession.deleteMany({
        where: { userId: id },
      });
    }

    await this.logActivity(actorId, isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER', 'User', id, {
      username: user.username,
      isActive,
    });

    return this.mapManagedUser(updated);
  }

  async deleteUser(id: string, actorId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.id === actorId) {
      throw new BadRequestException('You cannot delete your own account.');
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      const superAdminCount = await this.prisma.user.count({
        where: { role: UserRole.SUPER_ADMIN },
      });
      if (superAdminCount <= 1) {
        throw new BadRequestException('Cannot delete the last remaining Super Admin.');
      }
    }

    await this.prisma.user.delete({ where: { id } });

    await this.logActivity(actorId, 'DELETE_USER', 'User', id, {
      username: user.username,
      email: user.email,
    });

    return { success: true, message: 'User deleted successfully.' };
  }

  // ==========================================
  // 9. SETTINGS & SYSTEM HEALTH
  // ==========================================
  async getSystemHealth() {
    let database = 'ok';
    let dbLatencyMs = 0;
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - start;
    } catch {
      database = 'offline';
    }

    const firebaseBucket =
      process.env.VITE_FIREBASE_STORAGE_BUCKET ||
      'vaagai-audio-books-36a4e.appspot.com';
    const isFirebaseConfigured = Boolean(firebaseBucket);

    return {
      status: database === 'ok' ? 'ok' : 'degraded',
      database: {
        status: database,
        latencyMs: dbLatencyMs,
      },
      storage: {
        provider: 'Firebase Storage',
        bucket: firebaseBucket,
        status: isFirebaseConfigured ? 'healthy' : 'missing_config',
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        uptimeSeconds: Math.floor(process.uptime()),
        environment: process.env.NODE_ENV || 'development',
        memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getHealthStatus() {
    return this.getSystemHealth();
  }
}
