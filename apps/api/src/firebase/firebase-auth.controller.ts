import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  FirebaseAuthGuard,
  type FirebaseAuthRequest,
} from './firebase-auth.guard';

@Controller('firebase-auth')
export class FirebaseAuthController {
  @Get('test')
  @UseGuards(FirebaseAuthGuard)
  getProtectedTestIdentity(@Req() request: FirebaseAuthRequest) {
    if (!request.firebaseUser) {
      throw new UnauthorizedException('Firebase identity was not established.');
    }
    return {
      authenticated: true,
      ...request.firebaseUser,
    };
  }
}
