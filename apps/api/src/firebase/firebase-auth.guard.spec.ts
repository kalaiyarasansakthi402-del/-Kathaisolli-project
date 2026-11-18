import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { FirebaseAdminService } from './firebase-admin.service';
import {
  FirebaseAuthGuard,
  type FirebaseAuthRequest,
} from './firebase-auth.guard';

jest.mock('./firebase-admin.service', () => ({
  FirebaseAdminService: class FirebaseAdminService {},
}));

const now = Math.floor(Date.now() / 1000);
const verifiedToken: DecodedIdToken = {
  aud: 'vaagai-audio-books-36a4e',
  auth_time: now,
  exp: now + 3600,
  firebase: {
    identities: { email: ['listener@example.com'] },
    sign_in_provider: 'password',
  },
  iat: now,
  iss: 'https://securetoken.google.com/vaagai-audio-books-36a4e',
  sub: 'verified-uid',
  user_id: 'verified-uid',
  uid: 'verified-uid',
  email: 'listener@example.com',
  email_verified: true,
};

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard;
  const firebaseAdmin = {
    verifyIdToken: jest.fn(),
  };
  type TestRequest = Pick<FirebaseAuthRequest, 'headers'> & {
    body?: { uid: string; email: string };
    firebaseUser?: FirebaseAuthRequest['firebaseUser'];
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseAuthGuard,
        { provide: FirebaseAdminService, useValue: firebaseAdmin },
      ],
    }).compile();

    guard = module.get<FirebaseAuthGuard>(FirebaseAuthGuard);
  });

  function createContext(request: TestRequest): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;
  }

  it('rejects a missing Firebase bearer token', async () => {
    await expect(
      guard.canActivate(createContext({ headers: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(firebaseAdmin.verifyIdToken).not.toHaveBeenCalled();
  });

  it('rejects invalid and expired tokens', async () => {
    firebaseAdmin.verifyIdToken.mockRejectedValueOnce(
      new Error('token verification failed'),
    ).mockRejectedValueOnce(new Error('token expired'));

    for (const token of ['invalid-token', 'expired-token']) {
      await expect(
        guard.canActivate(
          createContext({
            headers: { authorization: `Bearer ${token}` },
          }),
        ),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    }

    expect(firebaseAdmin.verifyIdToken).toHaveBeenCalledWith(
      'invalid-token',
      true,
    );
    expect(firebaseAdmin.verifyIdToken).toHaveBeenCalledWith(
      'expired-token',
      true,
    );
  });

  it('uses only the verified UID and email from the ID token', async () => {
    firebaseAdmin.verifyIdToken.mockResolvedValueOnce(verifiedToken);
    const request: TestRequest = {
      headers: { authorization: 'Bearer valid-token' },
      body: { uid: 'attacker-uid', email: 'attacker@example.com' },
    };

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);

    expect(firebaseAdmin.verifyIdToken).toHaveBeenCalledWith(
      'valid-token',
      true,
    );
    expect(request.firebaseUser).toEqual({
      uid: 'verified-uid',
      email: 'listener@example.com',
      emailVerified: true,
    });
  });

  it('does not expose an unverified email claim as a verified email', async () => {
    firebaseAdmin.verifyIdToken.mockResolvedValueOnce({
      ...verifiedToken,
      email_verified: false,
    });
    const request: TestRequest = {
      headers: { authorization: 'Bearer valid-token' },
    };

    await guard.canActivate(createContext(request));

    expect(request.firebaseUser).toEqual({
      uid: 'verified-uid',
      email: null,
      emailVerified: false,
    });
  });
});
