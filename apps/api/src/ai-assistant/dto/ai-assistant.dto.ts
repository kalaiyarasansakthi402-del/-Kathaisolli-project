import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class GenerateIdeasDto {
  @ApiProperty({ description: 'Category or genre', example: 'திகில் கதைகள் (Horror)' })
  @IsString()
  @IsNotEmpty()
  genre!: string;

  @ApiPropertyOptional({ description: 'Theme or custom premise', example: 'பழைய செட்டிநாடு மாளிகையில் நடக்கும் மர்மம்' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  theme?: string;

  @ApiPropertyOptional({ description: 'Target audience / tone', example: 'யுவதலைமுறைக்கான சஸ்பென்ஸ்' })
  @IsOptional()
  @IsString()
  tone?: string;
}

export class SuggestTitlesDto {
  @ApiProperty({ description: 'Story synopsis or outline', example: 'கடற்கரை கிராமத்தில் நடக்கும் ஒரு மீனவ இளைஞனின் மர்ம பயணம்' })
  @IsString()
  @IsNotEmpty()
  synopsis!: string;

  @ApiPropertyOptional({ description: 'Target genre', example: 'Mystery' })
  @IsOptional()
  @IsString()
  genre?: string;
}

export class GrammarCheckDto {
  @ApiProperty({ description: 'Tamil text to verify and polish' })
  @IsString()
  @IsNotEmpty()
  text!: string;
}

export class SummarizeDto {
  @ApiProperty({ description: 'Full episode or story transcript/script' })
  @IsString()
  @IsNotEmpty()
  content!: string;
}
