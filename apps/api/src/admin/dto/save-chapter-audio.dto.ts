import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class SaveChapterAudioDto {
  @ApiProperty({ example: '/api/v1/media/file?key=audio%2Fstory-1%2Fch-1.mp3' })
  @IsString()
  @MaxLength(2048)
  audioUrl!: string;

  @ApiPropertyOptional({ example: 'audio/story-1/ch-1/01.mp3' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  storagePath?: string;

  @ApiPropertyOptional({ example: 'audio/mpeg' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  contentType?: string;

  @ApiPropertyOptional({ example: 360, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationSec?: number;

  @ApiPropertyOptional({ example: 4500000, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  fileSizeBytes?: number;

  @ApiPropertyOptional({ example: '01.mp3' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fileName?: string;
}
