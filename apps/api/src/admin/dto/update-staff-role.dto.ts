import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateStaffRoleDto {
  @ApiProperty({ enum: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR], example: UserRole.ADMIN })
  @IsEnum(UserRole)
  role!: UserRole;
}
