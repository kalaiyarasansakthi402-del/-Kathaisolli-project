import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationStatus, ContentStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics() {
    const [
      totalUsers,
      totalCreators,
      pendingCreatorApplications,
      totalStories,
      totalEpisodes,
      pendingSeriesModeration,
      pendingEpisodeModeration,
      publishedSeries,
      publishedEpisodes,
      totalUploadJobs,
      failedUploadJobs,
      progressAggregates,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: UserRole.CREATOR } }),
      this.prisma.creatorApplication.count({
        where: { status: ApplicationStatus.PENDING },
      }),
      this.prisma.series.count(),
      this.prisma.episode.count(),
      this.prisma.series.count({ where: { status: ContentStatus.PENDING_REVIEW } }),
      this.prisma.episode.count({ where: { status: ContentStatus.PENDING_REVIEW } }),
      this.prisma.series.count({ where: { status: ContentStatus.PUBLISHED } }),
      this.prisma.episode.count({ where: { status: ContentStatus.PUBLISHED } }),
      this.prisma.uploadJob.count(),
      this.prisma.uploadJob.count({ where: { status: 'FAILED' } }),
      this.prisma.playbackProgress.aggregate({
        _sum: { positionSec: true },
        _count: { id: true },
      }),
    ]);

    const totalListeningHours = +(
      (progressAggregates._sum.positionSec ?? 0) / 3600
    ).toFixed(1);

    return {
      totalUsers,
      activeListeners: progressAggregates._count.id,
      totalCreators,
      pendingCreatorApprovals: pendingCreatorApplications,
      totalStories,
      totalEpisodes,
      publishedStories: publishedSeries,
      publishedEpisodes,
      pendingModeration: pendingSeriesModeration + pendingEpisodeModeration,
      totalUploadJobs,
      failedUploadJobs,
      totalListeningHours,
    };
  }

  async listUsers(page = 1, pageSize = 20, search?: string) {
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { displayName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          disabledAt: true,
          emailVerifiedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async setUserStatus(userId: string, disabled: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException('Cannot modify Super Admin status.');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        disabledAt: disabled ? new Date() : null,
      },
      select: {
        id: true,
        email: true,
        disabledAt: true,
      },
    });
  }

  async listCreatorApplications(status = ApplicationStatus.PENDING) {
    return this.prisma.creatorApplication.findMany({
      where: { status },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async reviewCreatorApplication(
    applicationId: string,
    decision: 'APPROVE' | 'REJECT',
    reviewNote: string | undefined,
    reviewerId: string,
  ) {
    const application = await this.prisma.creatorApplication.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      throw new NotFoundException('Creator application not found.');
    }

    if (decision === 'APPROVE') {
      await this.prisma.$transaction([
        this.prisma.creatorApplication.update({
          where: { id: applicationId },
          data: {
            status: ApplicationStatus.APPROVED,
            reviewNote,
            reviewedById: reviewerId,
            reviewedAt: new Date(),
          },
        }),
        this.prisma.user.update({
          where: { id: application.userId },
          data: { role: UserRole.CREATOR },
        }),
        this.prisma.creatorProfile.upsert({
          where: { userId: application.userId },
          update: {
            bio: application.bio,
            approvedAt: new Date(),
          },
          create: {
            userId: application.userId,
            slug: `creator-${application.userId.slice(0, 8)}`,
            bio: application.bio,
            approvedAt: new Date(),
          },
        }),
      ]);

      return { status: 'APPROVED', userId: application.userId };
    } else {
      await this.prisma.creatorApplication.update({
        where: { id: applicationId },
        data: {
          status: ApplicationStatus.REJECTED,
          reviewNote: reviewNote || 'Application did not meet guidelines.',
          reviewedById: reviewerId,
          reviewedAt: new Date(),
        },
      });

      return { status: 'REJECTED', userId: application.userId };
    }
  }

  async listPendingModeration() {
    const [series, episodes] = await Promise.all([
      this.prisma.series.findMany({
        where: { status: ContentStatus.PENDING_REVIEW },
        include: {
          creator: { select: { id: true, displayName: true, email: true } },
          category: { select: { name: true } },
          language: { select: { name: true, nativeName: true } },
        },
        orderBy: { updatedAt: 'asc' },
      }),
      this.prisma.episode.findMany({
        where: { status: ContentStatus.PENDING_REVIEW },
        include: {
          mediaAsset: true,
          season: {
            select: {
              number: true,
              series: { select: { id: true, title: true, slug: true } },
            },
          },
        },
        orderBy: { updatedAt: 'asc' },
      }),
    ]);

    return { series, episodes };
  }

  async publishSeries(seriesId: string, reviewerId: string) {
    const series = await this.prisma.series.findUnique({
      where: { id: seriesId },
      include: {
        seasons: {
          include: {
            episodes: {
              include: { mediaAsset: true },
            },
          },
        },
      },
    });

    if (!series) {
      throw new NotFoundException('Series not found.');
    }

    const hasProcessedAudio = series.seasons.some((s) =>
      s.episodes.some((e) => e.mediaAsset?.isProcessed),
    );
    if (!hasProcessedAudio) {
      throw new BadRequestException(
        'Cannot publish series without at least one processed episode audio file.',
      );
    }

    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.series.update({
        where: { id: seriesId },
        data: {
          status: ContentStatus.PUBLISHED,
          publishedAt: now,
          reviewedAt: now,
          reviewedById: reviewerId,
        },
      }),
      this.prisma.episode.updateMany({
        where: {
          season: { seriesId },
          mediaAsset: { isProcessed: true },
        },
        data: {
          status: ContentStatus.PUBLISHED,
          publishedAt: now,
        },
      }),
    ]);

    return { success: true, publishedAt: now };
  }
}
