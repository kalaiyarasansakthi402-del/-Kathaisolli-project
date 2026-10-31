import { UnauthorizedException } from '@nestjs/common';
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
    },
  };
  const jwt = {
    signAsync: jest.fn().mockResolvedValue('signed-access-token'),
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
      password: 'a-long-development-password',
      displayName: 'Listener',
    };
    const result = await service.register(input);

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: UserRole.LISTENER }),
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

  it('rejects invalid credentials without issuing a token', async () => {
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
        password: 'incorrect-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });
});
