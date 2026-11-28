import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export const MAX_SUBMISSION_ZIP_BYTES = 500 * 1024 * 1024; // 500 MB

export class CreateStorySubmissionDto {
  @ApiProperty({ example: 'kalaiyarasan' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2, { message: 'User Name must be at least 2 characters.' })
  @MaxLength(100)
  username!: string;

  @ApiProperty({ example: 'user@example.com' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Please enter a valid Mail-ID.' })
  @MaxLength(320)
  email!: string;

  @ApiProperty({ example: 'Ponniyin Selvan' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2, { message: 'Book Title is required.' })
  @MaxLength(200)
  bookTitle!: string;

  @ApiProperty({ example: 'Kalki Krishnamurthy' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2, { message: 'Author Name is required.' })
  @MaxLength(160)
  authorName!: string;

  @ApiProperty({ required: false, example: 'Anzles Studio' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : undefined))
  @IsOptional()
  @IsString()
  @MaxLength(160)
  narratorName?: string;

  @ApiProperty({ example: 'https://firebasestorage.googleapis.com/...' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsUrl({ require_protocol: true }, { message: 'A valid archive upload URL is required.' })
  @MaxLength(2048)
  archiveUrl!: string;

  @ApiProperty({ example: 'ponniyin-selvan.zip' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Matches(/\.zip$/i, { message: 'Only .zip archive files are accepted.' })
  @MaxLength(255)
  archiveFileName!: string;

  @ApiProperty({ required: false, example: 10485760 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_SUBMISSION_ZIP_BYTES)
  archiveSizeBytes?: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  acknowledgedNote!: boolean;
}
