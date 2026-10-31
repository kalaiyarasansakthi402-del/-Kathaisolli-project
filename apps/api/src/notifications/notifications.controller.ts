import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthPrincipal } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({ summary: 'List user notifications' })
  @Get()
  listNotifications(@CurrentUser() user: AuthPrincipal) {
    return this.notificationsService.listNotifications(user.id);
  }

  @ApiOperation({ summary: 'Mark specific notification as read' })
  @Patch(':id/read')
  markAsRead(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: AuthPrincipal,
  ) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @ApiOperation({ summary: 'Mark all notifications as read' })
  @Post('mark-all-read')
  markAllAsRead(@CurrentUser() user: AuthPrincipal) {
    return this.notificationsService.markAllAsRead(user.id);
  }
}
