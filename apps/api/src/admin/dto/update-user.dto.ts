import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'sakthi_new' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long.' })
  @MaxLength(60, { message: 'Username cannot exceed 60 characters.' })
  @Matches(/^[a-z0-9_.-]+$/, {
    message: 'Username can only contain alphanumeric characters, underscores, dots, or hyphens.',
  })
  username?: string;

  @ApiPropertyOptional({ example: 'Sakthi' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MaxLength(120, { message: 'Display name cannot exceed 120 characters.' })
  displayName?: string;
}
