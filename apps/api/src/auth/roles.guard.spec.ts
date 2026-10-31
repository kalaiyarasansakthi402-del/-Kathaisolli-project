import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  const reflector = { getAllAndOverride: jest.fn() };
  const handler = jest.fn();
  class TestController {}

  beforeEach(async () => {
    jest.clearAllMocks();
    reflector.getAllAndOverride.mockReturnValue([
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ]);
    const module = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: reflector },
      ],
    }).compile();
    guard = module.get(RolesGuard);
  });

  it('denies a listener at the server-side authorization guard', () => {
    const context = {
      getHandler: () => handler,
      getClass: () => TestController,
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'listener-id',
            email: 'listener@example.com',
            role: UserRole.LISTENER,
          },
        }),
      }),
    } as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(
      'You do not have permission',
    );
  });

  it('allows an administrator for an administrator-only route', () => {
    const context = {
      getHandler: () => handler,
      getClass: () => TestController,
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'admin-id',
            email: 'admin@example.com',
            role: UserRole.ADMIN,
          },
        }),
      }),
    } as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });
});
