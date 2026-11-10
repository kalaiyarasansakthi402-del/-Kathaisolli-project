import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ required: false, example: 'sakthi' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long.' })
  @MaxLength(60, { message: 'Username must not exceed 60 characters.' })
  username?: string;

  @ApiProperty({ required: false, example: 'listener@example.com' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(320)
  email?: string;

  @ApiProperty({ minLength: 6, maxLength: 128, writeOnly: true })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters.' })
  password!: string;

  @ApiProperty({ required: false, example: 'கதை கேட்பவர்' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @ApiProperty({ required: false, example: '+919876543210' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : undefined,
  )
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phoneNumber?: string;
}
