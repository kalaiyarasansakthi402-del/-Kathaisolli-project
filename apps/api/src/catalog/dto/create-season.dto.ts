import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateSeasonDto {
  @ApiProperty({ example: 'முதல் பருவம்' })
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  number!: number;
}
