import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class AuthorizePlaybackDto {
  @ApiProperty({ description: 'Episode UUID or Series UUID / Slug' })
  @IsString()
  @MaxLength(120)
  episodeId!: string;
}
