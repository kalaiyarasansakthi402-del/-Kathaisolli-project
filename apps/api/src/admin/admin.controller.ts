import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { AdminService } from './admin.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { SaveChapterAudioDto } from './dto/save-chapter-audio.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffRoleDto } from './dto/update-staff-role.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@ApiTags('Administration')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==========================================
  // SYSTEM HEALTH & DASHBOARD
  // ==========================================
  @ApiOperation({ summary: 'Admin system health check' })
  @Get('status')
  getStatus() {
    return this.adminService.getSystemHealth();
  }

  @ApiOperation({ summary: 'Admin system detailed health' })
  @Get('system/health')
  getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  @ApiOperation({ summary: 'Admin dashboard KPI statistics & analytics' })
  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @ApiOperation({ summary: 'Platform KPI overview metrics' })
  @Get('metrics')
  getMetrics() {
    return this.adminService.getDashboardStats();
  }

  // ==========================================
  // STORY MANAGEMENT
  // ==========================================
  @ApiOperation({ summary: 'List and filter stories with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'languageId', required: false, type: String })
  @Get('stories')
  listStories(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('languageId') languageId?: string,
  ) {
    return this.adminService.listStories({
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
      search,
      categoryId,
      status,
      languageId,
    });
  }

  @ApiOperation({ summary: 'Get single story with chapters' })
  @Get('stories/:id')
  getStory(@Param('id') id: string) {
    return this.adminService.getStory(id);
  }

  @ApiOperation({ summary: 'Create a new story' })
  @Post('stories')
  createStory(
    @Body() input: CreateStoryDto,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.adminService.createStory(input, actor.id);
  }

  @ApiOperation({ summary: 'Update an existing story' })
  @Patch('stories/:id')
  updateStory(
    @Param('id') id: string,
    @Body() input: UpdateStoryDto,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.adminService.updateStory(id, input, actor.id);
  }

  @ApiOperation({ summary: 'Delete a story and chapters' })
  @Delete('stories/:id')
  deleteStory(
    @Param('id') id: string,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.adminService.deleteStory(id, actor.id);
  }

  @ApiOperation({ summary: 'Toggle publish status of a story' })
  @Post('stories/:id/publish')
  togglePublishStory(
    @Param('id') id: string,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.adminService.toggleStoryPublish(id, actor.id);
  }

  @ApiOperation({ summary: 'Explicitly revert story to draft' })
  @Post('stories/:id/unpublish')
  unpublishStory(
    @Param('id') id: string,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.adminService.updateStory(id, { status: 'DRAFT' as any }, actor.id);
  }

  // ==========================================
  // CHAPTER & AUDIO MANAGEMENT
  // ==========================================
  @ApiOperation({ summary: 'Create chapter in story' })
  @Post('stories/:id/chapters')
  createChapter(
    @Param('id') id: string,
    @Body() input: CreateChapterDto,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.adminService.createChapter(id, input, actor.id);
  }

  @ApiOperation({ summary: 'Update chapter details' })
  @Patch('stories/:id/chapters/:chapterId')
  updateChapter(
    @Param('id') id: string,
    @Param('chapterId', new ParseUUIDPipe()) chapterId: string,
    @Body() input: UpdateChapterDto,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.adminService.updateChapter(id, chapterId, input, actor.id);
  }

  @ApiOperation({ summary: 'Delete a chapter' })
  @Delete('stories/:id/chapters/:chapterId')
  deleteChapter(
    @Param('id') id: string,
    @Param('chapterId', new ParseUUIDPipe()) chapterId: string,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.adminService.deleteChapter(id, chapterId, actor.id);
  }

  @ApiOperation({ summary: 'Attach or replace chapter MP3 audio' })
  @Post('stories/:id/chapters/:chapterId/audio')
  saveChapterAudio(
    @Param('id') id: string,
    @Param('chapterId', new ParseUUIDPipe()) chapterId: string,
    @Body() input: SaveChapterAudioDto,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.adminService.saveChapterAudio(id, chapterId, input, actor.id);
  }

  @ApiOperation({ summary: 'Delete chapter audio' })
  @Delete('stories/:id/chapters/:chapterId/audio')
  deleteChapterAudio(
    @Param('id') id: string,
    @Param('chapterId', new ParseUUIDPipe()) chapterId: string,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.adminService.deleteChapterAudio(id, chapterId, actor.id);
  }

  // ==========================================
  // CATEGORIES MANAGEMENT
  // ==========================================
  @ApiOperation({ summary: 'List all categories with statistics' })
  @Get('categories')
  listCategories() {
    return this.adminService.listCategories();
  }

  @ApiOperation({ summary: 'Create new category' })
  @Post('categories')
  createCategory(
    @Body() input: CreateCategoryDto,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.adminService.createCategory(input, actor.id);
  }

  @ApiOperation({ summary: 'Update existing category' })
  @Patch('categories/:id')
  updateCategory(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() input: UpdateCategoryDto,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.adminService.updateCategory(id, input, actor.id);
  }

  @ApiOperation({ summary: 'Delete category' })
  @Delete('categories/:id')
  deleteCategory(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.adminService.deleteCategory(id, actor.id);
  }

  // ==========================================
  // AUDIO STORAGE MANAGEMENT
  // ==========================================
  @ApiOperation({ summary: 'Storage overview metrics' })
  @Get('storage/overview')
  getStorageOverview() {
    return this.adminService.getStorageOverview();
  }

  @ApiOperation({ summary: 'List storage files with pagination and filter' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @Get('storage/files')
  listStorageFiles(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('type') type?: string,
  ) {
    return this.adminService.listStorageFiles({
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 25,
      search,
      type,
    });
  }

  @ApiOperation({ summary: 'Delete a storage file asset' })
  @Delete('storage/files/:id')
  deleteStorageFile(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.adminService.deleteStorageFile(id, actor.id);
  }

  // ==========================================
  // REPORTS & ANALYTICS
  // ==========================================
  @ApiOperation({ summary: 'Generate analytics reports by timeframe' })
  @ApiQuery({ name: 'timeframe', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @Get('reports')
  getReports(
    @Query('timeframe') timeframe?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getReports(timeframe, startDate, endDate);
  }

  // ==========================================
  // ADMIN ROLES & STAFF MANAGEMENT
  // ==========================================
  @ApiOperation({ summary: 'List administrative staff members' })
  @Get('staff')
  listStaff() {
    return this.adminService.listStaff();
  }

  @ApiOperation({ summary: 'Create new administrative staff user' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post('staff')
  createStaff(
    @Body() input: CreateStaffDto,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.adminService.createStaff(input, actor.id);
  }

  @ApiOperation({ summary: 'Update staff member role' })
  @Roles(UserRole.SUPER_ADMIN)
  @Patch('staff/:id/role')
  updateStaffRole(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() input: UpdateStaffRoleDto,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.adminService.updateStaffRole(id, input.role, actor.id);
  }

  @ApiOperation({ summary: 'Delete staff member' })
  @Roles(UserRole.SUPER_ADMIN)
  @Delete('staff/:id')
  deleteStaff(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.adminService.deleteStaff(id, actor.id);
  }

  // ==========================================
  // USER MANAGEMENT (ADMIN-CONTROLLED USERS)
  // ==========================================
  @ApiOperation({ summary: 'List all managed platform users' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiQuery({ name: 'query', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get('users')
  listUsers(
    @Query('query') query?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.listUsers(query, page, limit);
  }

  @ApiOperation({ summary: 'Create a new user account' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post('users')
  createUser(
    @Body() input: CreateUserDto,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.adminService.createUser(input, actor.id);
  }

  @ApiOperation({ summary: 'Get managed user details by ID' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('users/:id')
  getUser(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.adminService.getUser(id);
  }

  @ApiOperation({ summary: 'Update user account (username / display name)' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch('users/:id')
  updateUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() input: UpdateUserDto,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.adminService.updateUser(id, input, actor.id);
  }

  @ApiOperation({ summary: 'Reset a user password' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post('users/:id/reset-password')
  resetUserPassword(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() input: ResetUserPasswordDto,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.adminService.resetUserPassword(id, input.newPassword, actor.id);
  }

  @ApiOperation({ summary: 'Activate or deactivate a user account' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch('users/:id/status')
  updateUserStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() input: UpdateUserStatusDto,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.adminService.updateUserStatus(id, input.isActive, actor.id);
  }

  @ApiOperation({ summary: 'Delete a user account' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete('users/:id')
  deleteUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.adminService.deleteUser(id, actor.id);
  }
}
