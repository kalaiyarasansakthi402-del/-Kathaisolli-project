import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'listener@example.com' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(320)
  email!: string;
}

export class ForgotPasswordRequestDto {
  @ApiProperty({ example: 'sakthi' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @MinLength(2, { message: 'User Name must be at least 2 characters.' })
  @MaxLength(60)
  username!: string;

  @ApiProperty({ example: 'listener@example.com' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Please enter a valid Mail-ID.' })
  @MaxLength(320)
  email!: string;

  @ApiProperty({ minLength: 6, maxLength: 128, writeOnly: true })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters.' })
  @MaxLength(128)
  password!: string;

  @ApiProperty({ minLength: 6, maxLength: 128, writeOnly: true })
  @IsString()
  @MinLength(6, { message: 'Re-Password must be at least 6 characters.' })
  @MaxLength(128)
  confirmPassword!: string;

  @ApiProperty({ example: 'Forgot my previous password and need account recovery.' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(3, { message: 'Please provide a reason for the password reset request.' })
  @MaxLength(1000)
  reason!: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  acknowledgedNote!: boolean;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token received via link or email' })
  @IsString()
  @MinLength(10)
  token!: string;

  @ApiProperty({ minLength: 8, maxLength: 128, writeOnly: true })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}
