import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationStatus, ContentStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyCreatorDto } from './dto/creator-application.dto';

@Injectable()
export class CreatorService {
  constructor(private readonly prisma: PrismaService) {}

  async apply(userId: string, dto: ApplyCreatorDto) {
    const existing = await this.prisma.creatorApplication.findFirst({
      where: {
        userId,
        status: ApplicationStatus.PENDING,
      },
    });
    if (existing) {
      throw new ConflictException('You already have a pending creator application.');
    }

    return this.prisma.creatorApplication.create({
      data: {
        userId,
        bio: dto.bio,
        sampleAudioUrl: dto.sampleAudioUrl,
        experience: dto.experience,
        status: ApplicationStatus.PENDING,
      },
    });
  }

  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        creatorProfile: {
          select: {
            id: true,
            slug: true,
            bio: true,
            approvedAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const application = await this.prisma.creatorApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      isCreator: user.role === UserRole.CREATOR,
      creatorProfile: user.creatorProfile,
      latestApplication: application,
    };
  }

  async getAnalytics(creatorId: string) {
    const seriesList = await this.prisma.series.findMany({
      where: { creatorId },
      select: {
        id: true,
        title: true,
        status: true,
        seasons: {
          select: {
            episodes: {
              select: {
                id: true,
                title: true,
                durationSec: true,
                status: true,
                progress: {
                  select: {
                    positionSec: true,
                    completedFlag: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    let totalEpisodes = 0;
    let publishedEpisodes = 0;
    let totalPlays = 0;
    let totalListeningSec = 0;
    let completedPlays = 0;

    for (const s of seriesList) {
      for (const season of s.seasons) {
        for (const ep of season.episodes) {
          totalEpisodes++;
          if (ep.status === ContentStatus.PUBLISHED) {
            publishedEpisodes++;
          }
          for (const prog of ep.progress) {
            totalPlays++;
            totalListeningSec += prog.positionSec;
            if (prog.completedFlag) {
              completedPlays++;
            }
          }
        }
      }
    }

    const listeningHours = +(totalListeningSec / 3600).toFixed(1);
    const completionRate =
      totalPlays > 0 ? Math.round((completedPlays / totalPlays) * 100) : 0;

    return {
      totalStories: seriesList.length,
      totalEpisodes,
      publishedEpisodes,
      totalPlays,
      listeningHours,
      completionRate,
      topSeries: seriesList.slice(0, 5).map((s) => ({
        id: s.id,
        title: s.title,
        status: s.status,
      })),
    };
  }
}
