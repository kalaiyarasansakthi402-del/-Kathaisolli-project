import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { Request, Response } from 'express';

import path from 'node:path';

// Load pre-compiled AppModule from dist to ensure complete decorator metadata preservation,
// avoiding esbuild runtime stripping of parameter types in serverless mode.
let AppModule: any;
try {
  const distPath = typeof __dirname !== 'undefined'
    ? path.resolve(__dirname, '../dist/app.module')
    : path.resolve(process.cwd(), 'dist/app.module');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  AppModule = require(distPath).AppModule;
} catch {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    AppModule = require('../dist/app.module').AppModule;
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    AppModule = require('../src/app.module').AppModule;
  }
}

let cachedHandler: ((req: Request, res: Response) => void) | null = null;
let bootstrapPromise: Promise<void> | null = null;

async function bootstrap() {
  try {
    const adapter = new ExpressAdapter();
    const app = await NestFactory.create(AppModule, adapter, {
      logger:
        process.env.NODE_ENV === 'production'
          ? ['error', 'warn', 'log']
          : ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    app.setGlobalPrefix('api/v1');

    const defaultOrigins = [
      'https://web-aa868kxzt-kalai21.vercel.app',
      'https://web-blush-gamma-47.vercel.app',
      'https://web-git-main-kalai21.vercel.app',
      'https://web-kalai21.vercel.app',
      'https://api-kalai21.vercel.app',
      'https://api-three-lyart-42.vercel.app',
      'https://admin-eight-theta-72.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:5173',
      'http://localhost:5174',
    ];

    app.enableCors({
      origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void,
      ) => {
        if (!origin) return callback(null, true);
        if (
          defaultOrigins.includes(origin) ||
          origin.endsWith('.vercel.app') ||
          /^https:\/\/.*\.vercel\.app$/.test(origin) ||
          process.env.NODE_ENV !== 'production'
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
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
    console.log('[NestServerless] Initialized NestJS serverless handler successfully.');
  } catch (err) {
    console.error('[NestServerless] Initialization fatal error:', err);
    bootstrapPromise = null;
    throw err;
  }
}

export default async function handler(req: Request, res: Response) {
  const url = req.url || '';
  const cleanUrl = url.split('?')[0];

  // Direct fast health response for deployment verification and health monitoring
  if (
    cleanUrl === '/' ||
    cleanUrl === '/health' ||
    cleanUrl === '/api/health' ||
    cleanUrl === '/api/v1/health' ||
    cleanUrl === '/api/v1'
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

  if (!cachedHandler) {
    if (!bootstrapPromise) {
      bootstrapPromise = bootstrap();
    }
    await bootstrapPromise;
  }

  return cachedHandler!(req, res);
}
