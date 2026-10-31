import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export type ModerationDecision = 'PUBLISH' | 'REJECT' | 'ARCHIVE';

export class ModerationDecisionDto {
  @ApiProperty({ enum: ['PUBLISH', 'REJECT', 'ARCHIVE'] })
  @IsIn(['PUBLISH', 'REJECT', 'ARCHIVE'])
  decision!: ModerationDecision;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  moderationNote?: string;
}
