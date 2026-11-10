import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ResetUserPasswordDto {
  @ApiProperty({ example: 'NewSecret123' })
  @IsString()
  @IsNotEmpty({ message: 'New password is required.' })
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  @MaxLength(128, { message: 'Password cannot exceed 128 characters.' })
  newPassword!: string;
}
