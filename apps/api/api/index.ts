import 'reflect-metadata';
import path from 'node:path';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { Request, Response } from 'express';

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

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (/^https:\/\/web(-[a-z0-9-]+)?-kalai21\.vercel\.app$/.test(origin)) return true;
  if (/^https:\/\/web(-[a-z0-9-]+)?\.vercel\.app$/.test(origin)) return true;
  if (/^https:\/\/admin(-[a-z0-9-]+)?\.vercel\.app$/.test(origin)) return true;
  return false;
}

async function getAppModule(): Promise<any> {
  const candidatePaths = [
    '../dist/app.module',
    './dist/app.module',
    path.join(process.cwd(), 'dist/app.module'),
    path.join(process.cwd(), 'apps/api/dist/app.module'),
    '../src/app.module',
  ];

  for (const candidate of candidatePaths) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require(candidate);
      if (mod && mod.AppModule) {
        return mod.AppModule;
      }
    } catch {
      // Try next candidate path
    }
  }

  throw new Error(
    'Unable to load AppModule. Checked candidate paths: ' + candidatePaths.join(', '),
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
  // Normalize incoming URL from x-matched-path if rewritten by Vercel
  const matchedPath = req.headers['x-matched-path'] as string | undefined;
  if (matchedPath) {
    req.url = matchedPath;
  }

  // OWASP security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Handle CORS headers at edge entry
  const origin = req.headers.origin as string | undefined;
  if (origin && isOriginAllowed(origin)) {
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

  // Direct fast health response for deployment verification and health monitoring
  if (
    cleanUrl === '/' ||
    cleanUrl === '/health' ||
    cleanUrl === '/api' ||
    cleanUrl === '/api/health' ||
    cleanUrl === '/api/index' ||
    cleanUrl === '/api/v1' ||
    cleanUrl === '/api/v1/health'
  ) {
    return res.status(200).json({
      status: 'ok',
      service: 'Kathaisolli API (Vercel Serverless)',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'production',
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
      timestamp: new Date().toISOString(),
    });
  }
}
