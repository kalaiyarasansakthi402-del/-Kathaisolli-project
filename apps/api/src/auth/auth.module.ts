import { randomBytes } from 'node:crypto';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const configuredSecret =
          config.get<string>('JWT_ACCESS_SECRET') ||
          config.get<string>('JWT_SECRET') ||
          process.env.JWT_ACCESS_SECRET ||
          process.env.JWT_SECRET;
        const isProduction =
          (config.get<string>('NODE_ENV') || process.env.NODE_ENV) === 'production';

        if (!configuredSecret) {
          if (isProduction) {
            throw new Error(
              'JWT_ACCESS_SECRET environment variable must be configured in production (minimum 32 characters).',
            );
          }
          console.warn(
            '[AuthModule] JWT_ACCESS_SECRET not set; using an ephemeral random secret for local development/testing.',
          );
          return {
            secret: randomBytes(32).toString('hex'),
            signOptions: { expiresIn: 900 },
          };
        }

        if (configuredSecret.length < 32) {
          throw new Error('JWT_ACCESS_SECRET must be at least 32 characters long.');
        }

        return {
          secret: configuredSecret,
          signOptions: { expiresIn: 900 },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard],
  exports: [AuthService, JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
