import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Injectable()
export class LibraryService {
  constructor(private readonly prisma: PrismaService) {}

  async getFavorites(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        series: {
          select: {
            id: true,
            slug: true,
            title: true,
            shortDescription: true,
            coverImage: true,
            contentType: true,
            authorName: true,
            narratorName: true,
            ageRating: true,
            publishedAt: true,
            language: { select: { code: true, name: true, nativeName: true } },
            category: { select: { slug: true, name: true } },
          },
        },
      },
    });

    return favorites.map((fav) => ({
      favoriteId: fav.id,
      savedAt: fav.createdAt,
      ...fav.series,
    }));
  }

  async addFavorite(userId: string, seriesId: string) {
    const series = await this.prisma.series.findUnique({
      where: { id: seriesId },
      select: { id: true, status: true },
    });
    if (!series || series.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException('Published story not found.');
    }

    return this.prisma.favorite.upsert({
      where: {
        userId_seriesId: { userId, seriesId },
      },
      update: {},
      create: { userId, seriesId },
    });
  }

  async removeFavorite(userId: string, seriesId: string) {
    await this.prisma.favorite.deleteMany({
      where: { userId, seriesId },
    });
    return { success: true };
  }

  async getHistory(userId: string) {
    const progressList = await this.prisma.playbackProgress.findMany({
      where: { userId },
      orderBy: { lastPlayedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        positionSec: true,
        durationSec: true,
        completedFlag: true,
        lastPlayedAt: true,
        episode: {
          select: {
            id: true,
            title: true,
            episodeNumber: true,
            durationSec: true,
            season: {
              select: {
                id: true,
                number: true,
                series: {
                  select: {
                    id: true,
                    slug: true,
                    title: true,
                    coverImage: true,
                    authorName: true,
                    narratorName: true,
                    category: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    return progressList.map((item) => ({
      progressId: item.id,
      positionSec: item.positionSec,
      durationSec: item.durationSec || item.episode.durationSec || 0,
      completed: item.completedFlag,
      lastPlayedAt: item.lastPlayedAt,
      episode: {
        id: item.episode.id,
        title: item.episode.title,
        number: item.episode.episodeNumber,
      },
      series: item.episode.season.series,
    }));
  }

  async updateProgress(userId: string, dto: UpdateProgressDto) {
    const isCompleted =
      dto.completedFlag ||
      (dto.durationSec > 0 && dto.positionSec >= dto.durationSec * 0.95);

    return this.prisma.playbackProgress.upsert({
      where: {
        userId_episodeId: { userId, episodeId: dto.episodeId },
      },
      update: {
        positionSec: dto.positionSec,
        durationSec: dto.durationSec,
        completedFlag: isCompleted,
        lastPlayedAt: new Date(),
      },
      create: {
        userId,
        episodeId: dto.episodeId,
        positionSec: dto.positionSec,
        durationSec: dto.durationSec,
        completedFlag: isCompleted,
        lastPlayedAt: new Date(),
      },
    });
  }

  async getContinueListening(userId: string) {
    const items = await this.prisma.playbackProgress.findMany({
      where: {
        userId,
        completedFlag: false,
        positionSec: { gt: 10 },
      },
      orderBy: { lastPlayedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        positionSec: true,
        durationSec: true,
        lastPlayedAt: true,
        episode: {
          select: {
            id: true,
            title: true,
            episodeNumber: true,
            durationSec: true,
            season: {
              select: {
                id: true,
                number: true,
                series: {
                  select: {
                    id: true,
                    slug: true,
                    title: true,
                    coverImage: true,
                    authorName: true,
                    narratorName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return items.map((item) => ({
      episodeId: item.episode.id,
      episodeTitle: item.episode.title,
      episodeNumber: item.episode.episodeNumber,
      positionSec: item.positionSec,
      durationSec: item.durationSec || item.episode.durationSec || 0,
      progressPercentage:
        item.durationSec > 0
          ? Math.min(100, Math.round((item.positionSec / item.durationSec) * 100))
          : 0,
      lastPlayedAt: item.lastPlayedAt,
      series: item.episode.season.series,
    }));
  }
}
