import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ContentStatus } from '@prisma/client';
import { OBJECT_STORAGE } from '../media/media.constants';
import { PrismaService } from '../prisma/prisma.service';
import { PlaybackService } from './playback.service';

describe('PlaybackService', () => {
  const prisma = {
    episode: { findUnique: jest.fn() },
    subscriptionEntitlement: { findFirst: jest.fn() },
  };
  const storage = { createReadUrl: jest.fn() };
  let playback: PlaybackService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        PlaybackService,
        { provide: PrismaService, useValue: prisma },
        { provide: OBJECT_STORAGE, useValue: storage },
      ],
    }).compile();
    playback = module.get(PlaybackService);
    storage.createReadUrl.mockResolvedValue('https://private.example/signed');
  });

  it('does not authorize unpublished audio', async () => {
    prisma.episode.findUnique.mockResolvedValue({
      id: 'episode-id',
      status: ContentStatus.PENDING_REVIEW,
      season: { series: { status: ContentStatus.PUBLISHED } },
      mediaAsset: { isProcessed: true, objectKey: 'private/source.mp3' },
    });

    await expect(
      playback.authorize('episode-id', 'listener-id'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(storage.createReadUrl).not.toHaveBeenCalled();
  });

  it('authorizes any published episode freely without requiring any subscription or entitlement', async () => {
    prisma.episode.findUnique.mockResolvedValue({
      id: 'episode-id',
      title: 'Tamil story',
      premiumFlag: false,
      durationSec: 30,
      status: ContentStatus.PUBLISHED,
      season: {
        series: {
          id: 'series-id',
          slug: 'tamil-story',
          status: ContentStatus.PUBLISHED,
          premiumFlag: false,
        },
      },
      mediaAsset: {
        objectKey: 'private/source.mp3',
        isProcessed: true,
        contentType: 'audio/mpeg',
      },
    });

    const result = await playback.authorize('episode-id', 'listener-id');

    expect(storage.createReadUrl).toHaveBeenCalledWith(
      'private/source.mp3',
      60,
    );
    expect(result).toMatchObject({
      episodeId: 'episode-id',
      audioUrl: 'https://private.example/signed',
      expiresIn: 60,
    });
  });

  it('allows guest playback freely without a userId', async () => {
    prisma.episode.findUnique.mockResolvedValue({
      id: 'episode-id-guest',
      title: 'Public Tamil Story',
      premiumFlag: false,
      durationSec: 45,
      status: ContentStatus.PUBLISHED,
      season: {
        series: {
          id: 'series-id',
          slug: 'public-tamil-story',
          status: ContentStatus.PUBLISHED,
          premiumFlag: false,
        },
      },
      mediaAsset: {
        objectKey: 'private/guest.mp3',
        isProcessed: true,
        contentType: 'audio/mpeg',
      },
    });

    const result = await playback.authorize('episode-id-guest');

    expect(storage.createReadUrl).toHaveBeenCalledWith(
      'private/guest.mp3',
      60,
    );
    expect(result).toMatchObject({
      episodeId: 'episode-id-guest',
      audioUrl: 'https://private.example/signed',
      expiresIn: 60,
    });
  });
});
