import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AuthorizePlaybackDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  episodeId!: string;
}
