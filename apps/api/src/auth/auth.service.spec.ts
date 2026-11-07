import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    authSession: {
      updateMany: jest.fn(),
    },
  };
  const jwt = {
    signAsync: jest.fn().mockResolvedValue('signed-access-token'),
    verifyAsync: jest.fn(),
  };
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jwt.signAsync.mockResolvedValue('signed-access-token');
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  describe('register', () => {
    it('creates listener accounts with an Argon2id password hash', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-id',
        email: 'listener@example.com',
        displayName: 'Listener',
        role: UserRole.LISTENER,
      });

      const input: RegisterDto = {
        email: 'listener@example.com',
        password: 'securePassword123',
        displayName: 'Listener',
      };
      const result = await service.register(input);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'listener@example.com' },
        select: { id: true },
      });
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'listener@example.com',
            displayName: 'Listener',
            role: UserRole.LISTENER,
          }),
        }),
      );
      const createArgument = prisma.user.create.mock.calls[0][0];
      expect(createArgument.data.passwordHash).toMatch(/^\$argon2id\$/);
      expect(createArgument.data.passwordHash).not.toBe(input.password);
      expect(result).toMatchObject({
        accessToken: 'signed-access-token',
        tokenType: 'Bearer',
        expiresIn: 900,
        user: {
          id: 'user-id',
          role: UserRole.LISTENER,
        },
      });
    });

    it('rejects duplicate email registration with ConflictException', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-id' });

      const input: RegisterDto = {
        email: 'duplicate@example.com',
        password: 'securePassword123',
        displayName: 'Existing User',
      };

      await expect(service.register(input)).rejects.toThrow(ConflictException);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('logs in successfully with valid credentials and returns JWT session', async () => {
      const passwordHash = await argon2.hash('myCorrectPassword123', {
        type: argon2.argon2id,
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'listener@example.com',
        passwordHash,
        role: UserRole.LISTENER,
        displayName: 'கதை கேட்பவர்',
        disabledAt: null,
      });

      const result = await service.login({
        email: 'listener@example.com',
        password: 'myCorrectPassword123',
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'listener@example.com' },
      });
      expect(result).toEqual({
        accessToken: 'signed-access-token',
        tokenType: 'Bearer',
        expiresIn: 900,
        user: {
          id: 'user-123',
          email: 'listener@example.com',
          displayName: 'கதை கேட்பவர்',
          role: UserRole.LISTENER,
        },
      });
      expect(jwt.signAsync).toHaveBeenCalled();
    });

    it('rejects invalid password without issuing a token', async () => {
      const passwordHash = await argon2.hash('correct-password', {
        type: argon2.argon2id,
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'listener@example.com',
        passwordHash,
        role: UserRole.LISTENER,
        displayName: 'Listener',
        disabledAt: null,
      });

      await expect(
        service.login({
          email: 'listener@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwt.signAsync).not.toHaveBeenCalled();
    });

    it('rejects non-existent email without issuing a token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nonexistent@example.com',
          password: 'anyPassword123',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwt.signAsync).not.toHaveBeenCalled();
    });

    it('rejects login when user is disabled', async () => {
      const passwordHash = await argon2.hash('password123', {
        type: argon2.argon2id,
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-disabled',
        email: 'disabled@example.com',
        passwordHash,
        role: UserRole.LISTENER,
        displayName: 'Disabled User',
        disabledAt: new Date(),
      });

      await expect(
        service.login({
          email: 'disabled@example.com',
          password: 'password123',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwt.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('revokes active auth sessions for the user and returns success', async () => {
      prisma.authSession.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.logout('user-123');

      expect(prisma.authSession.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          revokedAt: null,
        },
        data: {
          revokedAt: expect.any(Date),
        },
      });
      expect(result).toEqual({ success: true, message: 'Logged out successfully.' });
    });
  });

  describe('forgotPassword', () => {
    it('returns success and generates reset token for valid user', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'listener@example.com',
        disabledAt: null,
      });

      const result = await service.forgotPassword({ email: 'listener@example.com' });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'listener@example.com' },
      });
      expect(jwt.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 'user-123', type: 'password_reset' }),
        { expiresIn: 3600 },
      );
      expect(result.success).toBe(true);
    });

    it('returns success even if email does not exist to prevent enumeration', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword({ email: 'unknown@example.com' });

      expect(result.success).toBe(true);
      expect(jwt.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('updates password hash when token is valid', async () => {
      jwt.verifyAsync.mockResolvedValue({ sub: 'user-123', type: 'password_reset' });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        disabledAt: null,
      });
      prisma.user.update.mockResolvedValue({ id: 'user-123' });
      prisma.authSession.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.resetPassword({
        token: 'valid-token',
        newPassword: 'newSecurePassword123',
      });

      expect(jwt.verifyAsync).toHaveBeenCalledWith('valid-token');
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-123' },
          data: expect.objectContaining({
            passwordHash: expect.stringMatching(/^\$argon2id\$/),
          }),
        }),
      );
      expect(result.success).toBe(true);
    });

    it('rejects invalid or expired token with BadRequestException', async () => {
      jwt.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(
        service.resetPassword({
          token: 'expired-token',
          newPassword: 'newSecurePassword123',
        }),
      ).rejects.toThrow();
    });
  });

  describe('refreshToken', () => {
    it('generates a fresh session token for valid user', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'listener@example.com',
        displayName: 'Listener',
        role: UserRole.LISTENER,
      });

      const result = await service.refreshToken('user-123');

      expect(result).toMatchObject({
        accessToken: 'signed-access-token',
        tokenType: 'Bearer',
        user: { id: 'user-123' },
      });
    });
  });
});
