import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthPrincipal } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CatalogService } from '../catalog/catalog.service';
import { CreateEpisodeDto } from '../catalog/dto/create-episode.dto';
import { CreateSeasonDto } from '../catalog/dto/create-season.dto';
import { CreateSeriesDto } from '../catalog/dto/create-series.dto';
import { CreatorService } from './creator.service';
import { ApplyCreatorDto } from './dto/creator-application.dto';

@ApiTags('Creator')
@ApiBearerAuth()
@Controller('creator')
@UseGuards(JwtAuthGuard)
export class CreatorController {
  constructor(
    private readonly catalog: CatalogService,
    private readonly creatorService: CreatorService,
  ) {}

  @ApiOperation({ summary: 'Apply to become a verified Creator' })
  @Post('apply')
  apply(
    @CurrentUser() user: AuthPrincipal,
    @Body() dto: ApplyCreatorDto,
  ) {
    return this.creatorService.apply(user.id, dto);
  }

  @ApiOperation({ summary: 'Check creator verification and approval status' })
  @Get('status')
  getStatus(@CurrentUser() user: AuthPrincipal) {
    return this.creatorService.getStatus(user.id);
  }

  @ApiOperation({ summary: 'Get creator listening analytics and performance' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.CREATOR)
  @Get('analytics')
  getAnalytics(@CurrentUser() actor: AuthPrincipal) {
    return this.creatorService.getAnalytics(actor.id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.CREATOR)
  @Get('series')
  listSeries(@CurrentUser() actor: AuthPrincipal) {
    return this.catalog.listCreatorSeries(actor);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.CREATOR)
  @Post('series')
  createSeries(
    @Body() input: CreateSeriesDto,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.catalog.createSeries(input, actor);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.CREATOR)
  @Post('series/:seriesId/seasons')
  createSeason(
    @Param('seriesId', new ParseUUIDPipe()) seriesId: string,
    @Body() input: CreateSeasonDto,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.catalog.createSeason(seriesId, input, actor);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.CREATOR)
  @Post('episodes')
  createEpisode(
    @Body() input: CreateEpisodeDto,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.catalog.createEpisode(input, actor);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.CREATOR)
  @Post('series/:seriesId/submit')
  submitSeries(
    @Param('seriesId', new ParseUUIDPipe()) seriesId: string,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.catalog.submitSeriesForReview(seriesId, actor);
  }
}
