import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddPlaylistItemDto {
  @ApiProperty({ description: 'Target episode UUID' })
  @IsUUID('4')
  episodeId!: string;
}
