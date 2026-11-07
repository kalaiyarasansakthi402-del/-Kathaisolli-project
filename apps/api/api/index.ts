import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';
import { AppModule } from '../src/app.module';

const server = express();
let cachedHandler: ((req: Request, res: Response) => void) | null = null;
let bootstrapPromise: Promise<void> | null = null;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.setGlobalPrefix('api/v1');

  const defaultOrigins = [
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
  cachedHandler = server;
}

export default async function handler(req: Request, res: Response) {
  // Direct fast health response for deployment verification
  if (req.url === '/' || req.url === '/health' || req.url === '/api/health') {
    return res.status(200).json({
      status: 'ok',
      service: 'Kathaisolli API (Vercel Serverless)',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
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
