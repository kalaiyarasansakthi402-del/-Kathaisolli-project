import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateStoryDto {
  @ApiProperty({ example: 'Adutha Vinadi' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ example: 'அடுத்த நிமிடம்' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  tamilTitle?: string;

  @ApiPropertyOptional({ example: 'வாழ்வின் அடுத்த நொடியை மாற்றியமைக்கும் உத்வேகச் சிந்தனைகள்' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @ApiPropertyOptional({ example: 'முழுமையான கதை விளக்கம்...' })
  @IsOptional()
  @IsString()
  fullDescription?: string;

  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  coverImage?: string;

  @ApiPropertyOptional({ example: 'குகநாதன்' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  authorName?: string;

  @ApiPropertyOptional({ example: 'By Anzles Studio' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  narratorName?: string;

  @ApiProperty({ example: 'c1234567-89ab-cdef-0123-456789abcdef' })
  @IsString()
  categoryId!: string;

  @ApiPropertyOptional({ example: 'l1234567-89ab-cdef-0123-456789abcdef' })
  @IsOptional()
  @IsString()
  languageId?: string;

  @ApiPropertyOptional({ enum: ContentStatus, default: ContentStatus.DRAFT })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional({ type: [String], example: ['Motivation', 'Self-Help'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
