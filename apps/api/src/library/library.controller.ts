import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthPrincipal } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { LibraryService } from './library.service';

@ApiTags('Library')
@ApiBearerAuth()
@Controller('library')
@UseGuards(JwtAuthGuard)
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @ApiOperation({ summary: 'List user saved favorite stories' })
  @Get('favorites')
  getFavorites(@CurrentUser() user: AuthPrincipal) {
    return this.libraryService.getFavorites(user.id);
  }

  @ApiOperation({ summary: 'Save story to favorites' })
  @Post('favorites/:seriesId')
  addFavorite(
    @CurrentUser() user: AuthPrincipal,
    @Param('seriesId', new ParseUUIDPipe({ version: '4' })) seriesId: string,
  ) {
    return this.libraryService.addFavorite(user.id, seriesId);
  }

  @ApiOperation({ summary: 'Remove story from favorites' })
  @Delete('favorites/:seriesId')
  removeFavorite(
    @CurrentUser() user: AuthPrincipal,
    @Param('seriesId', new ParseUUIDPipe({ version: '4' })) seriesId: string,
  ) {
    return this.libraryService.removeFavorite(user.id, seriesId);
  }

  @ApiOperation({ summary: 'Get listening history' })
  @Get('history')
  getHistory(@CurrentUser() user: AuthPrincipal) {
    return this.libraryService.getHistory(user.id);
  }

  @ApiOperation({ summary: 'Sync episode playback progress and listening position' })
  @Put('progress')
  updateProgress(
    @CurrentUser() user: AuthPrincipal,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.libraryService.updateProgress(user.id, dto);
  }

  @ApiOperation({ summary: 'Get continue listening items' })
  @Get('continue-listening')
  getContinueListening(@CurrentUser() user: AuthPrincipal) {
    return this.libraryService.getContinueListening(user.id);
  }
}
