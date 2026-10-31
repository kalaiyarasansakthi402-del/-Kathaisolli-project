import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { OptionalCurrentUser } from '../auth/optional-current-user.decorator';
import type { AuthPrincipal } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { AddPlaylistItemDto } from './dto/add-playlist-item.dto';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { PlaylistsService } from './playlists.service';

@ApiTags('Playlists')
@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List user playlists' })
  @Get()
  listPlaylists(@CurrentUser() user: AuthPrincipal) {
    return this.playlistsService.listPlaylists(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get playlist details and episodes' })
  @Get(':id')
  getPlaylist(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @OptionalCurrentUser() user: AuthPrincipal | null,
  ) {
    return this.playlistsService.getPlaylist(id, user?.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new user playlist' })
  @Post()
  createPlaylist(
    @CurrentUser() user: AuthPrincipal,
    @Body() dto: CreatePlaylistDto,
  ) {
    return this.playlistsService.createPlaylist(user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update playlist metadata' })
  @Patch(':id')
  updatePlaylist(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: AuthPrincipal,
    @Body() dto: Partial<CreatePlaylistDto>,
  ) {
    return this.playlistsService.updatePlaylist(id, user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a user playlist' })
  @Delete(':id')
  deletePlaylist(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: AuthPrincipal,
  ) {
    return this.playlistsService.deletePlaylist(id, user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add an episode to playlist' })
  @Post(':id/items')
  addItem(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: AuthPrincipal,
    @Body() dto: AddPlaylistItemDto,
  ) {
    return this.playlistsService.addItem(id, user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove an episode from playlist' })
  @Delete(':id/items/:itemId')
  removeItem(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('itemId', new ParseUUIDPipe({ version: '4' })) itemId: string,
    @CurrentUser() user: AuthPrincipal,
  ) {
    return this.playlistsService.removeItem(id, user.id, itemId);
  }
}
