import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class SaveChapterAudioDto {
  @ApiProperty({ example: 'https://firebasestorage.googleapis.com/.../01.mp3' })
  @IsString()
  @MaxLength(2048)
  audioUrl!: string;

  @ApiPropertyOptional({ example: 'kathaisolli/books/kb-1/chapters/ch-1.mp3' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  storagePath?: string;

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

  @ApiPropertyOptional({ example: 'audio/mpeg' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  contentType?: string;

  @ApiPropertyOptional({ example: 'audio' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  mediaType?: string;

  @ApiPropertyOptional({ example: '.mp3' })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  originalExtension?: string;

  @ApiPropertyOptional({ example: 'https://firebasestorage.googleapis.com/.../playback.m4a' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  playbackUrl?: string;
}
