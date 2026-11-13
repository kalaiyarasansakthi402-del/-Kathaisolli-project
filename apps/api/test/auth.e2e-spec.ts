import {
  Controller,
  Get,
  INestApplication,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { Roles } from '../src/auth/roles.decorator';
import { RolesGuard } from '../src/auth/roles.guard';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';

@Controller('admin-probe')
@UseGuards(JwtAuthGuard, RolesGuard)
class AdminProbeController {
  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getAdminCheck() {
    return { ok: true, scope: 'admin' };
  }
}

describe('Auth & RBAC Integration (e2e)', () => {
  let app: INestApplication;
  const users = new Map<string, any>();
  const sessions = new Map<string, any>();

  const projectUser = (row: any, select?: Record<string, boolean>) => {
    if (!row) return null;
    if (!select) return { ...row };
    const out: Record<string, any> = {};
    for (const [key, enabled] of Object.entries(select)) {
      if (enabled) out[key] = row[key] ?? null;
    }
    return out;
  };

  const mockPrisma = {
    user: {
      findFirst: jest.fn(async ({ where, select }: any) => {
        const list = [...users.values()];
        const found = list.find((u) => {
          if (where?.OR) {
            return where.OR.some((clause: any) =>
              Object.entries(clause).every(([k, v]) => {
                if (v && typeof v === 'object' && 'equals' in v) {
                  return String(u[k] ?? '').toLowerCase() === String((v as any).equals).toLowerCase();
                }
                return u[k] === v;
              }),
            );
          }
          return Object.entries(where || {}).every(([k, v]) => u[k] === v);
        });
        return projectUser(found, select);
      }),
      findUnique: jest.fn(async ({ where, select }: any) => {
        const list = [...users.values()];
        const found = list.find((u) => {
          if (where?.id) return u.id === where.id;
          if (where?.email) return u.email === where.email;
          if (where?.username) return u.username === where.username;
          return false;
        });
        return projectUser(found, select);
      }),
      create: jest.fn(async ({ data, select }: any) => {
        const now = new Date();
        const row = {
          id: data.id || randomUUID(),
          email: data.email,
          username: data.username ?? null,
          phoneNumber: data.phoneNumber ?? null,
          passwordHash: data.passwordHash,
          displayName: data.displayName ?? data.username ?? 'Listener',
          role: data.role || UserRole.LISTENER,
          isActive: data.isActive ?? true,
          disabledAt: data.disabledAt ?? null,
          avatarUrl: data.avatarUrl ?? null,
          createdAt: now,
          updatedAt: now,
        };
        users.set(row.id, row);
        return projectUser(row, select);
      }),
      update: jest.fn(async ({ where, data, select }: any) => {
        const current = users.get(where.id);
        if (!current) throw new Error('User not found');
        const next = { ...current, ...data, updatedAt: new Date() };
        users.set(where.id, next);
        return projectUser(next, select);
      }),
    },
    authSession: {
      create: jest.fn(async ({ data }: any) => {
        const row = {
          id: data.id || randomUUID(),
          userId: data.userId,
          refreshTokenHash: data.refreshTokenHash,
          expiresAt: data.expiresAt,
          revokedAt: null,
          createdAt: new Date(),
        };
        sessions.set(row.id, row);
        return row;
      }),
      findUnique: jest.fn(async ({ where, include }: any) => {
        const row = sessions.get(where.id);
        if (!row) return null;
        if (include?.user) {
          return { ...row, user: users.get(row.userId) ?? null };
        }
        return row;
      }),
      update: jest.fn(async ({ where, data }: any) => {
        const current = sessions.get(where.id);
        if (!current) throw new Error('Session not found');
        const next = { ...current, ...data };
        sessions.set(where.id, next);
        return next;
      }),
      updateMany: jest.fn(async ({ where, data }: any) => {
        let count = 0;
        for (const [id, s] of sessions.entries()) {
          if (where?.userId && s.userId !== where.userId) continue;
          sessions.set(id, { ...s, ...data });
          count += 1;
        }
        return { count };
      }),
    },
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $transaction: jest.fn(async (arg: any) =>
      typeof arg === 'function' ? arg(mockPrisma) : Promise.all(arg),
    ),
  };

  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = 'e2e-jwt-access-secret-minimum-32-chars-long';
    process.env.JWT_REFRESH_SECRET = 'e2e-jwt-refresh-secret-minimum-32-chars-long';

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        PrismaModule,
        AuthModule,
      ],
      controllers: [AdminProbeController],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    users.clear();
    sessions.clear();
    jest.clearAllMocks();
  });

  it('registers a new listener immediately with autoLogin JWT, enforces duplicate username 409, supports /auth/me & /auth/login, and enforces Admin RBAC 403', async () => {
    // 1. Register with username + password + optional phoneNumber
    const regRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        username: 'tamillistener1',
        password: 'Password123',
        phoneNumber: '+91 9876543210',
      })
      .expect(201);

    expect(regRes.body.accessToken).toBeTruthy();
    expect(regRes.body.user.username).toBe('tamillistener1');
    expect(regRes.body.user.role).toBe(UserRole.LISTENER);
    expect(regRes.body.user.passwordHash).toBeUndefined();

    // 2. Duplicate username returns 409 Conflict
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        username: 'tamillistener1',
        password: 'Password123',
      })
      .expect(409);

    // 3. Authenticated listener can access GET /auth/me
    const meRes = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${regRes.body.accessToken}`)
      .expect(200);
    expect(meRes.body.username).toBe('tamillistener1');

    // 4. Listener cannot access ADMIN-only endpoint (403 Forbidden)
    await request(app.getHttpServer())
      .get('/api/v1/admin-probe')
      .set('Authorization', `Bearer ${regRes.body.accessToken}`)
      .expect(403);

    // 4b. Admin user CAN access ADMIN-only endpoint (200 OK)
    const adminSeed = await mockPrisma.user.create({
      data: {
        email: 'admin-e2e@kathaisolli.local',
        username: 'admine2e',
        passwordHash: 'unused-for-bearer-check',
        displayName: 'E2E Admin',
        role: UserRole.ADMIN,
        isActive: true,
      },
    });
    const adminLoginModuleRes = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${regRes.body.accessToken}`)
      .expect(200);
    expect(adminLoginModuleRes.body.id).toBe(regRes.body.user.id);
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ username: 'adminprobeuser', password: 'Password123' })
      .expect(201);
    const adminProbeRecord = [...users.values()].find((u) => u.username === 'adminprobeuser');
    adminProbeRecord.role = UserRole.ADMIN;
    const adminLoginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: 'adminprobeuser', password: 'Password123' })
      .expect(200);
    const adminProbeRes = await request(app.getHttpServer())
      .get('/api/v1/admin-probe')
      .set('Authorization', `Bearer ${adminLoginRes.body.accessToken}`)
      .expect(200);
    expect(adminProbeRes.body).toEqual({ ok: true, scope: 'admin' });
    expect(adminSeed.role).toBe(UserRole.ADMIN);

    // 5. Login with username + password succeeds with hashed password check
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        username: 'tamillistener1',
        password: 'Password123',
      })
      .expect(200);
    expect(loginRes.body.accessToken).toBeTruthy();

    // 6. Wrong password is rejected with 401
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        username: 'tamillistener1',
        password: 'WrongPassword99',
      })
      .expect(401);

    // 7. Deactivated account (isActive = false) is rejected by JwtAuthGuard with 401
    const savedUser = [...users.values()][0];
    savedUser.isActive = false;
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
      .expect(401);
  });

  it('rejects short password (<6 chars) and invalid fields via global ValidationPipe', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        username: 'ab',
        password: '123',
      })
      .expect(400);
  });
});
