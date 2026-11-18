import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { FirebaseAdminService } from './firebase-admin.service';

export interface FirebaseIdentity {
  uid: string;
  email: string | null;
  emailVerified: boolean;
}

export interface FirebaseAuthRequest extends Request {
  firebaseUser?: FirebaseIdentity;
}

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly firebaseAdmin: FirebaseAdminService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FirebaseAuthRequest>();
    const authorization = request.headers.authorization;
    const match =
      typeof authorization === 'string'
        ? /^Bearer\s+(\S+)$/i.exec(authorization)
        : null;

    if (!match) {
      throw new UnauthorizedException('A Firebase Bearer token is required.');
    }

    let decodedToken;
    try {
      decodedToken = await this.firebaseAdmin.verifyIdToken(match[1], true);
    } catch {
      throw new UnauthorizedException('Firebase ID token is invalid or expired.');
    }

    if (!decodedToken.uid) {
      throw new UnauthorizedException('Firebase ID token has no verified UID.');
    }

    const emailVerified = decodedToken.email_verified === true;
    request.firebaseUser = {
      uid: decodedToken.uid,
      email:
        emailVerified && typeof decodedToken.email === 'string'
          ? decodedToken.email
          : null,
      emailVerified,
    };

    return true;
  }
}
