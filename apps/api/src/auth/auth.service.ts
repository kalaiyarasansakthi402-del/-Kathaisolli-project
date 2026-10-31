import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { AccessTokenPayload, AuthenticatedUser } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto, UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(input: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    const passwordHash = await argon2.hash(input.password, {
      type: argon2.argon2id,
    });
    let user: AuthenticatedUser;
    try {
      user = await this.prisma.user.create({
        data: {
          email: input.email,
          passwordHash,
          displayName: input.displayName,
          role: UserRole.LISTENER,
        },
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'An account with this email already exists.',
        );
      }
      throw error;
    }

    return this.createSession(user);
  }

  async login(input: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
    });
    if (
      !user ||
      user.disabledAt ||
      !(await argon2.verify(user.passwordHash, input.password))
    ) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.createSession({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    });
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId, disabledAt: null },
      select: {
        id: true,
        email: true,
        role: true,
        displayName: true,
        avatarUrl: true,
        creatorProfile: {
          select: {
            id: true,
            slug: true,
            bio: true,
            approvedAt: true,
          },
        },
        createdAt: true,
      },
    });
  }

  async updateProfile(userId: string, input: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.disabledAt) {
      throw new NotFoundException('User not found.');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.displayName && { displayName: input.displayName }),
        ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
      },
      select: {
        id: true,
        email: true,
        role: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  }

  async changePassword(userId: string, input: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.disabledAt) {
      throw new NotFoundException('User not found.');
    }

    const isValid = await argon2.verify(user.passwordHash, input.currentPassword);
    if (!isValid) {
      throw new BadRequestException('Current password does not match.');
    }

    if (input.newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters.');
    }

    const passwordHash = await argon2.hash(input.newPassword, {
      type: argon2.argon2id,
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { success: true };
  }

  async deleteAccount(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException('Super Admin account cannot be deleted.');
    }

    await this.prisma.user.delete({ where: { id: userId } });
    return { success: true };
  }

  private async createSession(user: AuthenticatedUser) {
    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = await this.jwt.signAsync(payload);
    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 900,
      user,
    };
  }
}
