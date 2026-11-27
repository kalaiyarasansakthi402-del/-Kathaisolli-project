import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdminService } from './admin.service';

describe('AdminService - User Management', () => {
  const prisma = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    authSession: {
      deleteMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({ id: 'log-1' }),
    },
  };

  let service: AdminService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(AdminService);
  });

  describe('createUser', () => {
    it('creates a user with normalized username, local system email, and argon2 hash', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockImplementation((args) =>
        Promise.resolve({
          id: 'user-new-id',
          username: args.data.username,
          email: args.data.email,
          displayName: args.data.displayName,
          role: args.data.role,
          isActive: args.data.isActive,
          disabledAt: null,
          createdAt: new Date('2026-11-10T12:00:00Z'),
          updatedAt: new Date('2026-11-10T12:00:00Z'),
        }),
      );

      const result = await service.createUser(
        { username: 'NewUser1', password: 'SecretPassword123' },
        'admin-actor-id',
      );

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { username: 'newuser1' },
            { email: 'newuser1@user.kathaisolli.local' },
          ],
        },
      });
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            username: 'newuser1',
            email: 'newuser1@user.kathaisolli.local',
            role: UserRole.LISTENER,
            isActive: true,
          }),
        }),
      );
      expect(result.username).toBe('newuser1');
      expect(result.isActive).toBe(true);
    });

    it('rejects duplicate username with ConflictException', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'existing-id' });

      await expect(
        service.createUser(
          { username: 'taken_user', password: 'SecretPassword123' },
          'admin-actor-id',
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('listUsers', () => {
    it('returns paginated users list with normalized metadata', async () => {
      prisma.user.count.mockResolvedValue(1);
      prisma.user.findMany.mockResolvedValue([
        {
          id: 'user-1',
          username: 'kathai_listener',
          email: 'kathai_listener@user.kathaisolli.local',
          displayName: 'Listener',
          role: UserRole.LISTENER,
          isActive: true,
          disabledAt: null,
          createdAt: new Date('2026-11-10T10:00:00Z'),
          updatedAt: new Date('2026-11-10T10:00:00Z'),
        },
      ]);

      const result = await service.listUsers('kathai', 1, 20);
      expect(result.users).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.users[0].username).toBe('kathai_listener');
      expect(result.users[0].isActive).toBe(true);
    });
  });

  describe('resetUserPassword', () => {
    it('updates password hash and purges active sessions', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-target-id',
        username: 'user_target',
      });
      prisma.user.update.mockResolvedValue({});
      prisma.authSession.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.resetUserPassword(
        'user-target-id',
        'NewStrongPassword123',
        'admin-actor-id',
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-target-id' },
        data: expect.objectContaining({
          passwordHash: expect.stringMatching(/^\$argon2id\$/),
        }),
      });
      expect(prisma.authSession.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-target-id' },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('updateUserStatus', () => {
    it('deactivates account and terminates sessions', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-target-id',
        username: 'user_target',
      });
      prisma.user.update.mockResolvedValue({
        id: 'user-target-id',
        username: 'user_target',
        email: 'user_target@user.kathaisolli.local',
        displayName: 'Target User',
        role: UserRole.LISTENER,
        isActive: false,
        disabledAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      prisma.authSession.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.updateUserStatus('user-target-id', false, 'admin-actor-id');

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-target-id' },
          data: expect.objectContaining({
            isActive: false,
            disabledAt: expect.any(Date),
          }),
        }),
      );
      expect(prisma.authSession.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-target-id' },
      });
      expect(result.isActive).toBe(false);
    });
  });
});

describe('AdminService - Story & Media Operations', () => {
  const prisma = {
    series: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    episode: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    mediaAsset: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({ id: 'log-2' }),
    },
  };

  let service: AdminService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(AdminService);
  });

  describe('listStories', () => {
    it('preserves both categoryId and search filters inside where.AND alongside ARCHIVED status', async () => {
      prisma.series.findMany.mockResolvedValue([]);
      prisma.series.count.mockResolvedValue(0);

      await service.listStories({
        categoryId: 'cat-1',
        search: 'ponniyin',
        status: 'ARCHIVED',
        page: 1,
        pageSize: 20,
      });

      expect(prisma.series.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ARCHIVED',
            AND: expect.arrayContaining([
              expect.objectContaining({
                OR: expect.arrayContaining([{ categoryId: 'cat-1' }]),
              }),
              expect.objectContaining({
                OR: expect.arrayContaining([
                  { title: { contains: 'ponniyin', mode: 'insensitive' } },
                ]),
              }),
            ]),
          }),
        }),
      );
    });
  });

  describe('saveChapterAudio', () => {
    it('preserves non-MP3 contentType and originalExtension for FLAC audio', async () => {
      prisma.episode.findUnique.mockResolvedValue({
        id: 'chap-1',
        mediaAssetId: null,
        mediaAsset: null,
      });
      prisma.mediaAsset.findUnique.mockResolvedValue(null);
      prisma.mediaAsset.create.mockResolvedValue({ id: 'asset-flac-1' });
      prisma.episode.update.mockResolvedValue({
        id: 'chap-1',
        title: 'Chapter 1',
        episodeNumber: 1,
        durationSec: 245,
        status: 'PUBLISHED',
        audioUrl: 'https://cdn.example.com/chapter-1.flac',
      });

      const result = await service.saveChapterAudio(
        'story-1',
        'chap-1',
        {
          audioUrl: 'https://cdn.example.com/chapter-1.flac',
          fileName: 'chapter-1.flac',
          contentType: 'audio/flac',
          originalExtension: '.flac',
          mediaType: 'audio',
          durationSec: 245,
          fileSizeBytes: 12345678,
        },
        'admin-1',
      );

      expect(prisma.mediaAsset.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          objectKey: 'kathaisolli/books/story-1/chapters/chap-1.flac',
          contentType: 'audio/flac',
          durationSec: 245,
          isProcessed: true,
        }),
      });
      expect(result.success).toBe(true);
      expect(result.chapter.audioUrl).toBe('https://cdn.example.com/chapter-1.flac');
    });
  });
});
