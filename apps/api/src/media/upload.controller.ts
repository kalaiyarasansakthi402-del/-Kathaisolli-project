import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
  Get,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthPrincipal } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '@prisma/client';
import { InitiateUploadDto } from './dto/initiate-upload.dto';
import { UploadService } from './upload.service';

@ApiTags('Uploads')
@ApiBearerAuth()
@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {
  constructor(private readonly uploads: UploadService) {}

  @Post('initiate')
  @Roles(UserRole.CREATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  initiate(
    @Body() input: InitiateUploadDto,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.uploads.initiate(input, actor);
  }

  @Post(':id/complete')
  @Roles(UserRole.CREATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  complete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.uploads.complete(id, actor);
  }

  @Get(':id/status')
  @Roles(UserRole.CREATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() actor: AuthPrincipal,
  ) {
    return this.uploads.getStatus(id, actor);
  }
}
