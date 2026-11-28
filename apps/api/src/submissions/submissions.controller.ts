import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ApplicationStatus, UserRole } from '@prisma/client';
import type { AuthPrincipal } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalCurrentUser } from '../auth/optional-current-user.decorator';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateStorySubmissionDto } from './dto/create-story-submission.dto';
import { SubmissionsService } from './submissions.service';

@ApiTags('Submissions')
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @ApiOperation({ summary: 'Submit a new audiobook (*.ZIP) for editorial review' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  create(
    @Body() dto: CreateStorySubmissionDto,
    @OptionalCurrentUser() user?: AuthPrincipal | null,
  ) {
    return this.submissionsService.create(dto, user?.id);
  }

  @ApiOperation({ summary: 'List story submissions for admin review' })
  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
  listAll(@Query('status') status?: ApplicationStatus) {
    return this.submissionsService.listAll(status);
  }

  @ApiOperation({ summary: 'Approve or reject a story submission' })
  @Patch(':id/review')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
  review(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: { decision: 'APPROVED' | 'REJECTED'; reviewNote?: string },
    @CurrentUser() reviewer: AuthPrincipal,
  ) {
    return this.submissionsService.review(
      id,
      body.decision,
      reviewer.id,
      body.reviewNote,
    );
  }
}
