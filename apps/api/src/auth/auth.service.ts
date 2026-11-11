import {
  BadRequestException,
  ServiceUnavailableException,
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
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';

export function formatUserId(id: string): string {
  if (!id) return 'KTH-10001';
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  const num = Math.abs(hash % 90000) + 10000;
  return "KTH-" + String(num);
}

function isDatabaseConnectionError(error: any): boolean {
  if (!error) return false;
  const msg = error.message || String(error);
  const code = error.code;
  return (
    error.name === 'PrismaClientInitializationError' ||
    error.name === 'PrismaClientRustPanicError' ||
    code === 'P1001' ||
    code === 'P1002' ||
    code === 'P1017' ||
    msg.includes("Can't reach database server") ||
    msg.includes('Connection is closed') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('ETIMEDOUT')
  );
}

function handleDbError(error: any): never {
  const code = error?.code || error?.name || 'DB_ERROR';
  const rawMsg = error?.message ? String(error.message).split('\n')[0].slice(0, 150) : 'Unknown database error';
  if (isDatabaseConnectionError(error)) {
    throw new ServiceUnavailableException(
      `Authentication database is temporarily unreachable [${code}: ${rawMsg}]. Please verify the production DATABASE_URL.`,
    );
  }
  throw error;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(input: RegisterDto) {
    const rawUsername = (input.username || '').trim().toLowerCase();
    const rawEmail = (input.email || '').trim().toLowerCase();

    const normalizedUsername =
      rawUsername || (rawEmail.includes('@') ? rawEmail.split('@')[0] : rawEmail);
    if (!normalizedUsername) {
      throw new BadRequestException('Username is required.');
    }

    const systemEmail = rawEmail || `${normalizedUsername}@user.kathaisolli.local`;
    const displayName = (input.displayName || input.username || normalizedUsername).trim();

    let existing;
    try {
      existing = await this.prisma.user.findFirst({
        where: {
          OR: [
            { username: normalizedUsername },
            { email: systemEmail },
            ...(rawEmail ? [{ email: rawEmail }] : []),
          ],
        },
        select: { id: true, username: true, email: true },
      });
    } catch (err) {
      handleDbError(err);
    }

    if (existing) {
      throw new ConflictException(
        'This username is already taken. Please choose another username.',
      );
    }

    const passwordHash = await argon2.hash(input.password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
    });

    let user: any;
    try {
      user = await this.prisma.user.create({
        data: {
          username: normalizedUsername,
          email: systemEmail,
          passwordHash,
          displayName,
          phoneNumber: input.phoneNumber ? input.phoneNumber.trim() : null,
          role: UserRole.LISTENER,
          isActive: true,
          disabledAt: null,
          emailVerifiedAt: new Date(),
        },
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          role: true,
          isActive: true,
        },
      });
    } catch (error: any) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'This username is already taken. Please choose another username.',
        );
      }
      if (error?.message?.includes('phone_number') || error?.code === 'P2021') {
        try {
          user = await this.prisma.user.create({
            data: {
              username: normalizedUsername,
              email: systemEmail,
              passwordHash,
              displayName,
              role: UserRole.LISTENER,
              isActive: true,
              disabledAt: null,
              emailVerifiedAt: new Date(),
            },
            select: {
              id: true,
              username: true,
              email: true,
              displayName: true,
              role: true,
              isActive: true,
            },
          });
        } catch (retryErr: any) {
          if (
            retryErr instanceof Prisma.PrismaClientKnownRequestError &&
            retryErr.code === 'P2002'
          ) {
            throw new ConflictException(
              'This username is already taken. Please choose another username.',
            );
          }
          handleDbError(retryErr);
        }
      } else {
        handleDbError(error);
      }
    }

    const session = await this.createSession({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      isActive: user.isActive,
    });

    return {
      message: 'Your Kathaisolli account has been created successfully!',
      ...session,
    };
  }

  async login(input: LoginDto) {
    const rawIdentifier = (input.username || input.email || '').trim().toLowerCase();
    if (!rawIdentifier || !input.password) {
      throw new UnauthorizedException('Invalid username or password.');
    }

    let user: any;
    try {
      user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { username: rawIdentifier },
            { email: rawIdentifier },
          ],
        },
      });
    } catch (err) {
      handleDbError(err);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid username or password.');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, input.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password.');
    }

    const isInactive = Boolean(user.disabledAt) || user.isActive === false;
    if (isInactive) {
      throw new UnauthorizedException('Your account is inactive. Please contact Admin.');
    }

    return this.createSession({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      isActive: !isInactive,
    });
  }

  async getProfile(userId: string) {
    let user;
    try {
      user = await this.prisma.user.findUnique({
        where: { id: userId, disabledAt: null },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          displayName: true,
          isActive: true,
          avatarUrl: true,
          creatorProfile: {
            select: {
              id: true,
              slug: true,
              bio: true,
            },
          },
          createdAt: true,
        },
      });
    } catch (err) {
      handleDbError(err);
    }
    if (!user) return null;
    return {
      ...user,
      publicId: formatUserId(user.id),
    };
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

  async logout(userId: string) {
    try {
      await this.prisma.authSession.updateMany({
        where: {
          userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    } catch {
      // Graceful fallback if session record does not exist
    }
    return { success: true, message: 'Logged out successfully.' };
  }

  async forgotPassword(input: ForgotPasswordDto) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || user.disabledAt) {
      return {
        success: true,
        message: 'If an account exists with this email, password reset instructions have been sent.',
      };
    }

    const resetToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, type: 'password_reset' },
      { expiresIn: 3600 },
    );

    return {
      success: true,
      message: 'If an account exists with this email, password reset instructions have been sent.',
      ...(process.env.NODE_ENV !== 'production' && { resetToken }),
    };
  }

  async resetPassword(input: ResetPasswordDto) {
    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(input.token);
    } catch {
      throw new BadRequestException('Invalid or expired password reset token.');
    }

    if (payload.type !== 'password_reset' || !payload.sub) {
      throw new BadRequestException('Invalid password reset token.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user || user.disabledAt) {
      throw new NotFoundException('User account is unavailable.');
    }

    const passwordHash = await argon2.hash(input.newPassword, {
      type: argon2.argon2id,
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    try {
      await this.prisma.authSession.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      // Graceful session revocation fallback
    }

    return {
      success: true,
      message: 'Your password has been successfully reset. You can now log in.',
    };
  }

  async refreshToken(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, disabledAt: null },
      select: { id: true, email: true, displayName: true, role: true },
    });
    if (!user) {
      throw new UnauthorizedException('User account is unavailable.');
    }
    return this.createSession(user);
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
      user: {
        ...user,
        publicId: formatUserId(user.id),
      },
    };
  }
}
