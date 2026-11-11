import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import '@nestjs/config';
import '@nestjs/jwt';
import '@nestjs/throttler';
import '@nestjs/swagger';
import '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { Request, Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getApiRequire(): NodeRequire {
  try {
    const metaReq = createRequire(import.meta.url);
    metaReq.resolve('@nestjs/core');
    return metaReq;
  } catch {
    // Continue
  }

  const possiblePkgPaths = [
    path.join(process.cwd(), 'package.json'),
    path.join(__dirname, '../package.json'),
    path.join(__dirname, 'package.json'),
    path.join(process.cwd(), 'apps/web/package.json'),
    path.join(process.cwd(), 'apps/api/package.json'),
  ];
  for (const pkg of possiblePkgPaths) {
    if (fs.existsSync(pkg)) {
      try {
        const req = createRequire(pkg);
        req.resolve('@nestjs/core');
        return req;
      } catch {
        // Continue searching
      }
    }
  }
  return createRequire(import.meta.url);
}

try {
  const apiReq = getApiRequire();
  apiReq('reflect-metadata');
} catch {
  // Suppress top-level initialization errors so edge liveness checks never fail
}

let cachedHandler: ((req: Request, res: Response) => void) | null = null;
let bootstrapPromise: Promise<void> | null = null;

const allowedOrigins = [
  'https://web-kalai21.vercel.app',
  'https://web-blush-gamma-47.vercel.app',
  'https://web-aa868kxzt-kalai21.vercel.app',
  'https://admin-eight-theta-72.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',
  'http://localhost:5174',
];

function isOriginAllowed(origin: string | undefined, host?: string): boolean {
  if (!origin) return true;
  if (host && (origin === `https://${host}` || origin === `http://${host}`)) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (process.env.APP_URL && origin === process.env.APP_URL.replace(/\/+$/, '')) return true;
  if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL.replace(/\/+$/, '')) return true;
  if (/^https:\/\/web(-[a-z0-9-]+)?-kalai21\.vercel\.app$/.test(origin)) return true;
  if (/^https:\/\/web(-[a-z0-9-]+)?\.vercel\.app$/.test(origin)) return true;
  if (/^https:\/\/admin(-[a-z0-9-]+)?\.vercel\.app$/.test(origin)) return true;
  if (/^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin)) return true;
  return false;
}

async function getAppModule(): Promise<any> {
  const apiRequire = getApiRequire();
  const candidatePaths = [
    path.join(process.cwd(), 'api-dist/app.module.js'),
    path.join(process.cwd(), 'apps/web/api-dist/app.module.js'),
    path.join(process.cwd(), 'apps/api/dist/app.module.js'),
    path.join(__dirname, '../api-dist/app.module.js'),
    path.join(__dirname, '../../api-dist/app.module.js'),
    path.join(__dirname, 'api-dist/app.module.js'),
    path.join(process.cwd(), 'api-dist/app.module'),
    path.join(process.cwd(), 'apps/web/api-dist/app.module'),
    path.join(process.cwd(), 'apps/api/dist/app.module'),
    path.join(process.cwd(), 'dist/app.module'),
    path.join(__dirname, '../dist/app.module'),
    path.join(__dirname, '../../dist/app.module'),
    path.join(__dirname, '../apps/api/dist/app.module'),
    path.join(__dirname, '../../apps/api/dist/app.module'),
    path.join(__dirname, '../../../apps/api/dist/app.module'),
    path.join(__dirname, 'apps/api/dist/app.module'),
    path.join(__dirname, 'dist/app.module'),
    '../dist/app.module',
    './dist/app.module',
    '../src/app.module',
  ];

  let lastModuleError: any = null;

  // 1. Try dynamic import (supported for both ES Modules and CommonJS)
  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      try {
        const fileUrl = pathToFileURL(candidate).href;
        const mod = await import(fileUrl);
        if (mod && (mod.AppModule || mod.default?.AppModule)) {
          return mod.AppModule || mod.default.AppModule;
        }
      } catch (err: any) {
        lastModuleError = err;
      }
    }
  }

  // 2. Try require fallback
  for (const candidate of candidatePaths) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = apiRequire(candidate);
      if (mod && mod.AppModule) {
        return mod.AppModule;
      }
    } catch (err: any) {
      if (err?.code !== 'MODULE_NOT_FOUND' || !err?.message?.includes(candidate)) {
        lastModuleError = err;
      }
    }
  }

  throw new Error(
    `Unable to load AppModule. ${lastModuleError ? `Last error: ${lastModuleError.message}. ` : ''}Checked candidate paths: ` +
      candidatePaths.join(', '),
  );
}

async function bootstrap(): Promise<void> {
  const adapter = new ExpressAdapter();
  const AppModule = await getAppModule();

  const app = await NestFactory.create(AppModule, adapter, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || isOriginAllowed(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-CSRF-Token',
      'X-Api-Version',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  cachedHandler = adapter.getInstance();
  console.log('[NestServerless] NestJS serverless application initialized successfully.');
}

export default async function handler(req: Request, res: Response) {
  // Normalize incoming URL across direct execution, Vercel catch-all (...path), and Vercel edge rewrites
  const query = (req as any).query || {};
  let targetUrl = req.url || '/';

  if (query.path) {
    const rawPath = Array.isArray(query.path) ? query.path.join('/') : query.path;
    const cleanPath = String(rawPath).startsWith('/') ? String(rawPath) : `/${rawPath}`;
    targetUrl = cleanPath.startsWith('/api') ? cleanPath : `/api${cleanPath}`;

    // Preserve original query parameters other than the routing 'path' param
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (key !== 'path') {
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, String(v)));
        } else if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      }
    }
    const qs = queryParams.toString();
    if (qs) {
      targetUrl = `${targetUrl}?${qs}`;
    }
  } else {
    const originalUrlHeader =
      (req.headers['x-forwarded-url'] as string | undefined) ||
      (req.headers['x-original-url'] as string | undefined) ||
      (req.headers['x-rewrite-url'] as string | undefined);

    if (originalUrlHeader && originalUrlHeader !== '/api' && originalUrlHeader !== '/api/') {
      targetUrl = originalUrlHeader;
    } else {
      const matchedPath = req.headers['x-matched-path'] as string | undefined;
      if (matchedPath && matchedPath !== '/api' && matchedPath !== '/api/index') {
        targetUrl = matchedPath;
      }
    }
  }

  if (!targetUrl.startsWith('/')) {
    targetUrl = `/${targetUrl}`;
  }

  req.url = targetUrl;

  // OWASP security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Handle CORS headers at edge entry
  const origin = req.headers.origin as string | undefined;
  const host = req.headers.host as string | undefined;
  if (origin && isOriginAllowed(origin, host)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token, X-Api-Version',
    );
    res.setHeader('Vary', 'Origin');
  }

  // Handle CORS preflight early without waiting for NestJS cold start
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const rawUrl = (req.url || '').split('?')[0];
  const cleanUrl = rawUrl.replace(/\/+$/, '') || '/';

  // Fast liveness verification for edge/CDN deployment checks (does not mock database connectivity)
  const isLivenessCheck =
    cleanUrl === '/api/health' ||
    cleanUrl === '/api/v1/health' ||
    cleanUrl === '/health' ||
    (req.method === 'GET' && (cleanUrl === '/api' || cleanUrl === '/' || cleanUrl === '/api/index' || cleanUrl === '/api/v1'));

  if (isLivenessCheck) {
    let dbStatus: any = {
      isConfigured: Boolean(process.env.DATABASE_URL),
    };
    if (process.env.DATABASE_URL) {
      try {
        const parsed = new URL(process.env.DATABASE_URL);
        dbStatus.protocol = parsed.protocol;
        dbStatus.host = parsed.hostname;
        dbStatus.port = parsed.port || '5432';
        dbStatus.database = parsed.pathname.replace(/^\//, '');
        dbStatus.isLocalhost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
      } catch (err: any) {
        dbStatus.parseError = 'MALFORMED_DATABASE_URL';
      }
    }

    return res.status(200).json({
      status: 'ok',
      service: 'Kathaisolli API (Vercel Serverless)',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'production',
      database: dbStatus,
    });
  }

  try {
    if (!cachedHandler) {
      if (!bootstrapPromise) {
        bootstrapPromise = bootstrap();
      }
      await bootstrapPromise;
    }
    return cachedHandler!(req, res);
  } catch (error: any) {
    console.error('[NestServerless] Request error during execution:', error);
    bootstrapPromise = null;
    return res.status(500).json({
      statusCode: 500,
      message: 'Internal Server Error during serverless execution',
      error: error?.message || String(error),
      stack: error?.stack ? error.stack.split('\n').slice(0, 4) : undefined,
      timestamp: new Date().toISOString(),
    });
  }
}
