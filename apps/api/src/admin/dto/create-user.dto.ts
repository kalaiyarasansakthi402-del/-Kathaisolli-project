import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'sakthi' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsString()
  @IsNotEmpty({ message: 'Username is required.' })
  @MinLength(3, { message: 'Username must be at least 3 characters long.' })
  @MaxLength(60, { message: 'Username cannot exceed 60 characters.' })
  @Matches(/^[a-z0-9_.-]+$/, {
    message: 'Username can only contain alphanumeric characters, underscores, dots, or hyphens.',
  })
  username!: string;

  @ApiProperty({ example: 'SecretPassword123' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  @MaxLength(128, { message: 'Password cannot exceed 128 characters.' })
  password!: string;
}
