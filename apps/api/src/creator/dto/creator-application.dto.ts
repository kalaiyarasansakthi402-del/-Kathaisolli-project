import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ApplyCreatorDto {
  @ApiProperty({ description: 'Creator bio and storytelling background' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  bio!: string;

  @ApiPropertyOptional({ description: 'Sample audio recording URL or demo link' })
  @IsOptional()
  @IsString()
  sampleAudioUrl?: string;

  @ApiPropertyOptional({ description: 'Prior experience in voice acting, narration or writing' })
  @IsOptional()
  @IsString()
  experience?: string;
}
