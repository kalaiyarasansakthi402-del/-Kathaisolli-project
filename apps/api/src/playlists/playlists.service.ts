import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddPlaylistItemDto } from './dto/add-playlist-item.dto';
import { CreatePlaylistDto } from './dto/create-playlist.dto';

@Injectable()
export class PlaylistsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPlaylists(userId: string) {
    return this.prisma.playlist.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });
  }

  async getPlaylist(id: string, userId?: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { position: 'asc' },
          include: {
            episode: {
              select: {
                id: true,
                title: true,
                episodeNumber: true,
                durationSec: true,
                season: {
                  select: {
                    id: true,
                    title: true,
                    number: true,
                    series: {
                      select: {
                        id: true,
                        title: true,
                        slug: true,
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
        },
      },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found.');
    }

    if (!playlist.isPublic && playlist.userId !== userId) {
      throw new ForbiddenException('Private playlist cannot be accessed.');
    }

    return playlist;
  }

  async createPlaylist(userId: string, dto: CreatePlaylistDto) {
    return this.prisma.playlist.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        isPublic: dto.isPublic ?? false,
      },
    });
  }

  async updatePlaylist(id: string, userId: string, dto: Partial<CreatePlaylistDto>) {
    await this.assertOwnership(id, userId);
    return this.prisma.playlist.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
      },
    });
  }

  async deletePlaylist(id: string, userId: string) {
    await this.assertOwnership(id, userId);
    await this.prisma.playlist.delete({ where: { id } });
    return { success: true };
  }

  async addItem(playlistId: string, userId: string, dto: AddPlaylistItemDto) {
    await this.assertOwnership(playlistId, userId);

    const highestItem = await this.prisma.playlistItem.findFirst({
      where: { playlistId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    const nextPosition = (highestItem?.position ?? -1) + 1;

    return this.prisma.playlistItem.upsert({
      where: {
        playlistId_episodeId: {
          playlistId,
          episodeId: dto.episodeId,
        },
      },
      update: {},
      create: {
        playlistId,
        episodeId: dto.episodeId,
        position: nextPosition,
      },
    });
  }

  async removeItem(playlistId: string, userId: string, itemId: string) {
    await this.assertOwnership(playlistId, userId);
    await this.prisma.playlistItem.deleteMany({
      where: {
        id: itemId,
        playlistId,
      },
    });
    return { success: true };
  }

  private async assertOwnership(playlistId: string, userId: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      select: { userId: true },
    });
    if (!playlist) {
      throw new NotFoundException('Playlist not found.');
    }
    if (playlist.userId !== userId) {
      throw new ForbiddenException('Not authorized to modify this playlist.');
    }
  }
}
