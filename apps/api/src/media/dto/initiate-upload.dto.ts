import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class InitiateUploadDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  episodeId!: string;

  @ApiProperty({ example: 'episode-01.mp3' })
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  originalName!: string;

  @ApiProperty({ example: 'audio/mpeg' })
  @IsString()
  @MaxLength(120)
  contentType!: string;

  @ApiProperty({ minimum: 1, maximum: 2147483648 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2147483648)
  sizeBytes!: number;
}
