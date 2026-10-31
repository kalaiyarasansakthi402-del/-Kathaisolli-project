import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class UpdateProgressDto {
  @ApiProperty({ description: 'Target episode UUID' })
  @IsUUID('4')
  episodeId!: string;

  @ApiProperty({ description: 'Current playback position in seconds', minimum: 0 })
  @IsInt()
  @Min(0)
  positionSec!: number;

  @ApiProperty({ description: 'Total episode duration in seconds', minimum: 0 })
  @IsInt()
  @Min(0)
  durationSec!: number;

  @ApiProperty({ description: 'Whether the episode listening was completed', required: false })
  @IsOptional()
  @IsBoolean()
  completedFlag?: boolean;
}
