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
        const secret =
          config.get<string>('JWT_ACCESS_SECRET') ||
          config.get<string>('JWT_SECRET') ||
          process.env.JWT_ACCESS_SECRET ||
          process.env.JWT_SECRET ||
          'kathaisolli-production-jwt-access-secret-fallback-minimum-32-chars-long';
        if (!config.get<string>('JWT_ACCESS_SECRET') && !config.get<string>('JWT_SECRET')) {
          console.warn(
            '[AuthModule] Neither JWT_ACCESS_SECRET nor JWT_SECRET is set in environment; using fallback secret.',
          );
        }
        return {
          secret,
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
