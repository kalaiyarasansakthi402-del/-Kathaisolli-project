import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  OBJECT_STORAGE,
  type ObjectStorage,
} from '../media/media.constants';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(val?: string | null): boolean {
  return typeof val === 'string' && UUID_REGEX.test(val.trim());
}

@Injectable()
export class PlaybackService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(OBJECT_STORAGE) private readonly storage: ObjectStorage,
  ) {}

  async authorize(episodeId: string, userId?: string) {
    const episodeSelect = {
      id: true,
      title: true,
      premiumFlag: true,
      durationSec: true,
      status: true,
      season: {
        select: {
          series: {
            select: {
              id: true,
              slug: true,
              status: true,
              premiumFlag: true,
            },
          },
        },
      },
      mediaAsset: {
        select: { objectKey: true, isProcessed: true, contentType: true },
      },
    };

    let episode: any = null;

    // 1. Try finding by Episode UUID directly
    if (isUuid(episodeId)) {
      episode = await this.prisma.episode.findUnique({
        where: { id: episodeId },
        select: episodeSelect,
      });
    }

    // 2. Fallback: check if episodeId is a Series ID or Series Slug, and resolve its first published episode
    if (!episode) {
      const seriesWhere = isUuid(episodeId)
        ? { OR: [{ id: episodeId }, { slug: episodeId }] }
        : { slug: episodeId };

      episode = await this.prisma.episode.findFirst({
        where: {
          status: ContentStatus.PUBLISHED,
          season: { series: seriesWhere },
          mediaAsset: { is: { isProcessed: true } },
        },
        orderBy: [{ season: { number: 'asc' } }, { episodeNumber: 'asc' }],
        select: episodeSelect,
      });
    }

    if (
      !episode ||
      episode.status !== ContentStatus.PUBLISHED ||
      episode.season?.series?.status !== ContentStatus.PUBLISHED ||
      !episode.mediaAsset?.isProcessed
    ) {
      throw new NotFoundException('Published episode audio was not found.');
    }

    // Kathaisolli is 100% free: all published audio is authorized without paywalls or subscriptions.

    let audioUrl: string;
    try {
      audioUrl = await this.storage.createReadUrl(
        episode.mediaAsset.objectKey,
        60,
      );
    } catch (error) {
      throw new ServiceUnavailableException(
        `Private audio could not be authorized: ${this.safeError(error)}`,
      );
    }

    return {
      episodeId: episode.id,
      title: episode.title,
      durationSec: episode.durationSec,
      contentType: episode.mediaAsset.contentType,
      audioUrl,
      expiresIn: 60,
    };
  }

  private safeError(error: unknown): string {
    return error instanceof Error ? error.message.slice(0, 200) : 'storage error';
  }
}
