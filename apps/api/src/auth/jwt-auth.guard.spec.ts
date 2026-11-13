import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from './jwt-auth.guard';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';

const createContext = (authorization?: string) => {
  const request: Record<string, any> = {
    headers: authorization ? { authorization } : {},
  };
  return {
    request,
    context: {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext,
  };
};

describe('JwtAuthGuard & OptionalJwtAuthGuard', () => {
  const secret = 'test-jwt-secret-at-least-32-chars-long';
  let jwtService: JwtService;
  let prisma: { user: { findUnique: jest.Mock } };
  let guard: JwtAuthGuard;
  let optionalGuard: OptionalJwtAuthGuard;

  beforeEach(() => {
    jwtService = new JwtService({ secret });
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
    };
    guard = new JwtAuthGuard(jwtService, prisma as any);
    optionalGuard = new OptionalJwtAuthGuard(jwtService, prisma as any);
  });

  it('rejects requests without a Bearer token', async () => {
    const { context } = createContext();
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects tampered or expired Bearer tokens', async () => {
    const { context } = createContext('Bearer invalid.jwt.token');
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('allows an active user and attaches auth principal to request', async () => {
    const token = await jwtService.signAsync({
      sub: 'user-1',
      email: 'listener@kathaisolli.com',
      role: UserRole.LISTENER,
    });
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'listener@kathaisolli.com',
      role: UserRole.LISTENER,
      disabledAt: null,
      isActive: true,
    });

    const { context, request } = createContext(`Bearer ${token}`);
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({
      id: 'user-1',
      email: 'listener@kathaisolli.com',
      role: UserRole.LISTENER,
    });
  });

  it('rejects deactivated users where isActive is false', async () => {
    const token = await jwtService.signAsync({
      sub: 'user-inactive',
      email: 'inactive@kathaisolli.com',
      role: UserRole.LISTENER,
    });
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-inactive',
      email: 'inactive@kathaisolli.com',
      role: UserRole.LISTENER,
      disabledAt: null,
      isActive: false,
    });

    const { context } = createContext(`Bearer ${token}`);
    await expect(guard.canActivate(context)).rejects.toThrow('This account is unavailable.');
  });

  it('rejects disabled users where disabledAt is set', async () => {
    const token = await jwtService.signAsync({
      sub: 'user-disabled',
      email: 'disabled@kathaisolli.com',
      role: UserRole.LISTENER,
    });
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-disabled',
      email: 'disabled@kathaisolli.com',
      role: UserRole.LISTENER,
      disabledAt: new Date(),
      isActive: true,
    });

    const { context } = createContext(`Bearer ${token}`);
    await expect(guard.canActivate(context)).rejects.toThrow('This account is unavailable.');
  });

  it('proceeds as guest in OptionalJwtAuthGuard when user is deactivated', async () => {
    const token = await jwtService.signAsync({
      sub: 'user-inactive',
      email: 'inactive@kathaisolli.com',
      role: UserRole.LISTENER,
    });
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-inactive',
      email: 'inactive@kathaisolli.com',
      role: UserRole.LISTENER,
      disabledAt: null,
      isActive: false,
    });

    const { context, request } = createContext(`Bearer ${token}`);
    await expect(optionalGuard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toBeUndefined();
  });
});
