import { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  username?: string | null;
  role: UserRole;
  displayName: string;
  isActive?: boolean;
  publicId?: string;
}

export type AuthPrincipal = Pick<AuthenticatedUser, 'id' | 'email' | 'role'>;

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPrincipal;
    }
  }
}
