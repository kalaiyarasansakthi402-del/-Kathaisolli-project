import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthPrincipal } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CatalogService } from '../catalog/catalog.service';
import { CreateEpisodeDto } from '../catalog/dto/create-episode.dto';
import { ModerationDecisionDto } from '../catalog/dto/moderation-decision.dto';
import { CreateSeasonDto } from '../catalog/dto/create-season.dto';
import { CreateSeriesDto } from '../catalog/dto/create-series.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AdminService } from './admin.service';

@ApiTags('Administration')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(
    private readonly catalog: CatalogService,
    private readonly adminService: AdminService,
  ) {}

  @ApiOperation({ summary: 'Admin health status check' })
  @Get('status')
  getStatus() {
    return this.adminService.getHealthStatus();
  }

  @ApiOperation({ summary: 'Platform KPI overview metrics' })
  @Get('metrics')
  getMetrics() {
    return this.adminService.getMetrics();
  }

  @ApiOperation({ summary: 'List and search registered users' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @Get('users')
  listUsers(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.listUsers(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
      search,
    );
  }

  @ApiOperation({ summary: 'Suspend or reactivate user account' })
  @Patch('users/:id/status')
  setUserStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('disabled') disabled: boolean,
  ) {
    return this.adminService.setUserStatus(id, disabled);
  }

  @ApiOperation({ summary: 'List pending creator verification applications' })
  @Get('creators/applications')
  listCreatorApplications() {
    return this.adminService.listCreatorApplications();
  }

  @ApiOperation({ summary: 'Approve or reject creator application' })
  @Post('creators/applications/:id/review')
  reviewCreatorApplication(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('decision') decision: 'APPROVE' | 'REJECT',
    @Body('reviewNote') reviewNote: string | undefined,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.adminService.reviewCreatorApplication(
      id,
      decision,
      reviewNote,
      actor.id,
    );
  }

  @ApiOperation({ summary: 'List pending series and episodes for moderation' })
  @Get('moderation/pending')
  listPendingModeration() {
    return this.adminService.listPendingModeration();
  }

  @ApiOperation({ summary: 'Explicitly publish approved series with audio' })
  @Post('series/:seriesId/publish')
  publishSeries(
    @Param('seriesId', new ParseUUIDPipe()) seriesId: string,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.adminService.publishSeries(seriesId, actor.id);
  }

  @Post('series')
  createSeries(
    @Body() input: CreateSeriesDto,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.catalog.createSeries(input, actor);
  }

  @Post('series/:seriesId/seasons')
  createSeason(
    @Param('seriesId', new ParseUUIDPipe()) seriesId: string,
    @Body() input: CreateSeasonDto,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.catalog.createSeason(seriesId, input, actor);
  }

  @Post('episodes')
  createEpisode(
    @Body() input: CreateEpisodeDto,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.catalog.createEpisode(input, actor);
  }

  @Post('series/:seriesId/review')
  reviewSeries(
    @Param('seriesId', new ParseUUIDPipe()) seriesId: string,
    @Body() input: ModerationDecisionDto,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.catalog.reviewSeries(
      seriesId,
      input.decision,
      input.moderationNote,
      actor.id,
    );
  }

  @Post('series/:seriesId/submit')
  submitSeries(
    @Param('seriesId', new ParseUUIDPipe()) seriesId: string,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.catalog.submitSeriesForReview(seriesId, actor);
  }

  @Post('episodes/:episodeId/review')
  reviewEpisode(
    @Param('episodeId', new ParseUUIDPipe()) episodeId: string,
    @Body() input: ModerationDecisionDto,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.catalog.reviewEpisode(
      episodeId,
      input.decision,
      input.moderationNote,
      actor.id,
    );
  }

  @ApiOperation({ summary: 'List all categories with statistics' })
  @Get('categories')
  listCategories() {
    return this.adminService.listCategories();
  }

  @ApiOperation({ summary: 'Create new category' })
  @Post('categories')
  createCategory(@Body() input: CreateCategoryDto) {
    return this.adminService.createCategory(input);
  }

  @ApiOperation({ summary: 'Update existing category' })
  @Patch('categories/:id')
  updateCategory(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() input: UpdateCategoryDto,
  ) {
    return this.adminService.updateCategory(id, input);
  }

  @ApiOperation({ summary: 'Delete category' })
  @Delete('categories/:id')
  deleteCategory(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.adminService.deleteCategory(id);
  }
}
