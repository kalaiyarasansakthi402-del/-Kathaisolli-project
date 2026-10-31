import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';
import { AiAssistantModule } from './ai-assistant/ai-assistant.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CatalogController } from './catalog/catalog.controller';
import { CatalogService } from './catalog/catalog.service';
import { CreatorController } from './creator/creator.controller';
import { CreatorService } from './creator/creator.service';
import { LibraryModule } from './library/library.module';
import { MediaModule } from './media/media.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PlaybackModule } from './playback/playback.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 30 }]),
    PrismaModule,
    AuthModule,
    MediaModule,
    PlaybackModule,
    LibraryModule,
    PlaylistsModule,
    NotificationsModule,
    AiAssistantModule,
  ],
  controllers: [
    AppController,
    AdminController,
    CatalogController,
    CreatorController,
  ],
  providers: [
    CatalogService,
    AdminService,
    CreatorService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
