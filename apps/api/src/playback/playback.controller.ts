import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OptionalCurrentUser } from '../auth/optional-current-user.decorator';
import type { AuthPrincipal } from '../auth/auth.types';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { AuthorizePlaybackDto } from './dto/authorize-playback.dto';
import { PlaybackService } from './playback.service';

@ApiTags('Playback')
@ApiBearerAuth()
@Controller('playback')
@UseGuards(OptionalJwtAuthGuard)
export class PlaybackController {
  constructor(private readonly playback: PlaybackService) {}

  @ApiOperation({
    summary: 'Authorize audio playback (100% Free for guests and authenticated listeners)',
  })
  @Post('authorize')
  authorize(
    @Body() input: AuthorizePlaybackDto,
    @OptionalCurrentUser() user: AuthPrincipal | null,
  ) {
    return this.playback.authorize(input.episodeId, user?.id);
  }
}
