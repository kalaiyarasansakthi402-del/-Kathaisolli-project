import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ContentStatus, UserRole } from '@prisma/client';
import type { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { S3ObjectStorageService } from './s3-object-storage.service';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(
    private readonly storage: S3ObjectStorageService,
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  @Get('file')
  @ApiOperation({ summary: 'Stream stored cover image or authorized audio file' })
  @ApiQuery({ name: 'key', required: true, type: String })
  async serveFile(
    @Query('key') key: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (
      !key ||
      typeof key !== 'string' ||
      key.includes('..') ||
      key.includes('\0') ||
      !/^[a-zA-Z0-9._/-]+$/.test(key)
    ) {
      throw new BadRequestException('Invalid media key.');
    }

    // Protect unpublished/draft audio from public access
    const isAudioKey =
      key.startsWith('audio/') ||
      key.startsWith('original/') ||
      key.startsWith('processed/');

    if (isAudioKey) {
      const asset = await this.prisma.mediaAsset.findUnique({
        where: { objectKey: key },
        select: {
          episode: {
            select: {
              status: true,
              season: { select: { series: { select: { status: true } } } },
            },
          },
        },
      });

      const isPublished =
        asset?.episode?.status === ContentStatus.PUBLISHED &&
        asset?.episode?.season?.series?.status === ContentStatus.PUBLISHED;

      if (!isPublished && !this.hasAdminOrCreatorToken(req)) {
        throw new ForbiddenException(
          'This audio file is not publicly published.',
        );
      }
    }

    try {
      const range = req.headers.range;
      const result = await this.storage.getObjectStream(key, range);

      res.status(result.statusCode);
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Accept-Ranges', 'bytes');
      if (result.contentLength > 0) {
        res.setHeader('Content-Length', String(result.contentLength));
      }
      if (result.contentRange) {
        res.setHeader('Content-Range', result.contentRange);
      }
      res.setHeader(
        'Cache-Control',
        isAudioKey
          ? 'public, max-age=3600'
          : 'public, max-age=86400, stale-while-revalidate=604800',
      );
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

      result.stream.on('error', () => {
        if (!res.headersSent) {
          res.status(404).json({ message: 'Media object not found.' });
        } else {
          res.end();
        }
      });

      result.stream.pipe(res);
    } catch {
      throw new NotFoundException('Media file not found.');
    }
  }

  private hasAdminOrCreatorToken(req: Request): boolean {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
    const token = authHeader.slice(7).trim();
    if (!token) return false;
    try {
      const payload = this.jwt.verify<{ role?: string }>(token);
      return (
        payload.role === UserRole.ADMIN ||
        payload.role === UserRole.SUPER_ADMIN ||
        payload.role === UserRole.MODERATOR ||
        payload.role === UserRole.CREATOR
      );
    } catch {
      return false;
    }
  }
}
