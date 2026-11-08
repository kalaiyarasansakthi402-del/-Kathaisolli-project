import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const secret =
    config.get<string>('JWT_ACCESS_SECRET') ||
    config.get<string>('JWT_SECRET') ||
    process.env.JWT_ACCESS_SECRET ||
    process.env.JWT_SECRET ||
    'kathaisolli-production-jwt-access-secret-fallback-minimum-32-chars-long';

  if (secret.length < 32) {
    throw new Error('JWT_ACCESS_SECRET must be at least 32 characters long.');
  }

  const port = Number(config.get<string>('PORT', '3000'));
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

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

  const configuredOrigins = config
    .get<string>('CORS_ORIGINS', '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const allowedSet = new Set([...allowedOrigins, ...configuredOrigins]);

  const isOriginAllowed = (origin: string | undefined): boolean => {
    if (!origin) return true;
    if (allowedSet.has(origin)) return true;
    if (/^https:\/\/web(-[a-z0-9-]+)?-kalai21\.vercel\.app$/.test(origin)) return true;
    if (/^https:\/\/web(-[a-z0-9-]+)?\.vercel\.app$/.test(origin)) return true;
    if (/^https:\/\/admin(-[a-z0-9-]+)?\.vercel\.app$/.test(origin)) return true;
    if (/^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin)) return true;
    if (config.get('NODE_ENV') !== 'production') return true;
    return false;
  };

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

  app.use((_req: any, res: any, next: any) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (config.get<string>('NODE_ENV') !== 'production') {
    const openApiConfig = new DocumentBuilder()
      .setTitle('Kathaisolli API')
      .setDescription('REST API for the Kathaisolli audio storytelling platform.')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, openApiConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  app.enableShutdownHooks();
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
