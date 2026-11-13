import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { AccessTokenPayload } from './auth.types';

const roles = new Set<string>(Object.values(UserRole));

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization;
    const parts = authorization?.trim().split(/\s+/) ?? [];
    if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
      throw new UnauthorizedException('A bearer access token is required.');
    }

    let payload: AccessTokenPayload;
    try {
      payload = await this.jwt.verifyAsync<AccessTokenPayload>(parts[1]);
    } catch {
      throw new UnauthorizedException('Invalid or expired access token.');
    }

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string' ||
      !roles.has(payload.role)
    ) {
      throw new UnauthorizedException('Invalid access token.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, disabledAt: true, isActive: true },
    });
    if (!user || user.disabledAt || user.isActive === false) {
      throw new UnauthorizedException('This account is unavailable.');
    }

    request.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    return true;
  }
}
