import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePlaylistDto {
  @ApiProperty({ description: 'Playlist title', example: 'எனக்கு பிடித்த சிறுகதைகள்' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title!: string;

  @ApiPropertyOptional({ description: 'Playlist description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether playlist is visible to public', default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
