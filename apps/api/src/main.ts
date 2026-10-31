import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const secret = config.getOrThrow<string>('JWT_ACCESS_SECRET');
  if (secret.length < 32) {
    throw new Error('JWT_ACCESS_SECRET must be at least 32 characters long.');
  }
  const port = Number(config.get<string>('PORT', '3000'));
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  const allowedOrigins = config
    .get<string>('CORS_ORIGINS', 'http://localhost:3001')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: allowedOrigins, credentials: true });
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
