import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import type { AuthPrincipal } from './auth.types';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto, UpdateProfileDto } from './dto/update-profile.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new listener account' })
  @Post('register')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  register(@Body() input: RegisterDto) {
    return this.authService.register(input);
  }

  @ApiOperation({ summary: 'Log in with email and password' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  login(@Body() input: LoginDto) {
    return this.authService.login(input);
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: AuthPrincipal) {
    const profile = await this.authService.getProfile(user.id);
    if (!profile) {
      throw new UnauthorizedException('This account is unavailable.');
    }
    return profile;
  }

  @ApiOperation({ summary: 'Update user display name or avatar' })
  @Patch('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @CurrentUser() user: AuthPrincipal,
    @Body() input: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.id, input);
  }

  @ApiOperation({ summary: 'Change account password' })
  @Post('change-password')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  changePassword(
    @CurrentUser() user: AuthPrincipal,
    @Body() input: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, input);
  }

  @ApiOperation({ summary: 'Log out current user and revoke session' })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: AuthPrincipal) {
    return this.authService.logout(user.id);
  }

  @ApiOperation({ summary: 'Request password reset instructions' })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  forgotPassword(@Body() input: ForgotPasswordDto) {
    return this.authService.forgotPassword(input);
  }

  @ApiOperation({ summary: 'Reset password with token' })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  resetPassword(@Body() input: ResetPasswordDto) {
    return this.authService.resetPassword(input);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  refreshToken(@CurrentUser() user: AuthPrincipal) {
    return this.authService.refreshToken(user.id);
  }

  @ApiOperation({ summary: 'Delete user account' })
  @Delete('account')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  deleteAccount(@CurrentUser() user: AuthPrincipal) {
    return this.authService.deleteAccount(user.id);
  }
}
