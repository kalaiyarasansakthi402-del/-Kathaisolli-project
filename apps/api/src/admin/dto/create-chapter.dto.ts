import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateChapterDto {
  @ApiProperty({ example: 'Chapter 1: The Awakening' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ example: 'அத்தியாயம் 1: தொடக்கம்' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  tamilTitle?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  episodeNumber!: number;

  @ApiPropertyOptional({ example: 'முதல் அத்தியாயத்தின் விவரம்...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 360 })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationSec?: number;

  @ApiPropertyOptional({ enum: ContentStatus, default: ContentStatus.PUBLISHED })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}
