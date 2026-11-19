import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { App, ServiceAccount } from 'firebase-admin/app';
import type { Auth, DecodedIdToken, UserRecord } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';
import type { Storage } from 'firebase-admin/storage';

export const DEFAULT_FIREBASE_PROJECT_ID = 'vaagai-audio-books-36a4e';
const DEFAULT_FIREBASE_STORAGE_BUCKET = 'vaagai-audio-books-36a4e.appspot.com';

function getFirebaseAdminModules(): {
  appPkg: typeof import('firebase-admin/app');
  authPkg: typeof import('firebase-admin/auth');
  firestorePkg: typeof import('firebase-admin/firestore');
  storagePkg: typeof import('firebase-admin/storage');
} | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const appPkg = require('firebase-admin/app');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const authPkg = require('firebase-admin/auth');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const firestorePkg = require('firebase-admin/firestore');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const storagePkg = require('firebase-admin/storage');
    return { appPkg, authPkg, firestorePkg, storagePkg };
  } catch (error: any) {
    return null;
  }
}

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private app: App | null = null;
  private auth: Auth | null = null;
  private firestore: Firestore | null = null;
  private storage: Storage | null = null;
  private configured = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    this.initializeFirebaseAdmin();
  }

  private initializeFirebaseAdmin(): void {
    const modules = getFirebaseAdminModules();
    if (!modules) {
      this.logger.warn(
        '[FirebaseAdminService] Optional firebase-admin modules are not currently available in this serverless runtime environment. Core authentication and Neon database operations remain fully functional.',
      );
      this.clearAppServices();
      return;
    }

    const { appPkg } = modules;
    const projectId =
      this.configService.get<string>('FIREBASE_PROJECT_ID') ||
      process.env.FIREBASE_PROJECT_ID ||
      DEFAULT_FIREBASE_PROJECT_ID;
    const rawServiceAccount =
      this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON') ||
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const credentialsPath =
      this.configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS') ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production' ||
      process.env.NODE_ENV === 'production';

    if (projectId !== DEFAULT_FIREBASE_PROJECT_ID) {
      this.failInitialization(
        `Firebase Admin is configured for an unexpected project. Set FIREBASE_PROJECT_ID to ${DEFAULT_FIREBASE_PROJECT_ID}.`,
        isProduction,
      );
      return;
    }

    const existingApps = appPkg.getApps();
    if (existingApps.length === 0 && !rawServiceAccount?.trim() && !credentialsPath) {
      this.failInitialization(
        'Firebase Admin credentials are missing. Configure FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS.',
        isProduction,
      );
      return;
    }

    try {
      if (existingApps.length > 0) {
        const existingApp = existingApps.find(
          (candidate) =>
            candidate.options.projectId === projectId &&
            candidate.options.storageBucket === DEFAULT_FIREBASE_STORAGE_BUCKET &&
            Boolean(candidate.options.credential),
        );

        if (!existingApp) {
          throw new Error('An existing Firebase Admin app has incompatible configuration.');
        }

        this.setAppServices(existingApp, modules);
        this.logger.log('Reusing the existing Firebase Admin app.');
        return;
      }

      const credential = rawServiceAccount?.trim()
        ? appPkg.cert(this.parseServiceAccount(rawServiceAccount))
        : appPkg.applicationDefault();

      const app = appPkg.initializeApp({
        credential,
        projectId,
        storageBucket: DEFAULT_FIREBASE_STORAGE_BUCKET,
      });

      this.setAppServices(app, modules);
      this.logger.log(`Firebase Admin SDK initialized for project ${projectId}.`);
    } catch {
      this.clearAppServices();
      const message =
        'Firebase Admin initialization failed. Verify the server-side credentials, project ID, and Storage bucket configuration.';
      this.logger.error(message);
      if (isProduction) {
        throw new Error(message);
      }
    }
  }

  private parseServiceAccount(raw: string): ServiceAccount {
    const trimmed = raw.trim();
    let json = trimmed;

    if (!trimmed.startsWith('{')) {
      const base64 = trimmed.replace(/\s+/g, '');
      if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64) || base64.length % 4 === 1) {
        throw new Error('Service account must be JSON or valid base64-encoded JSON.');
      }

      const decoded = Buffer.from(base64, 'base64');
      if (decoded.toString('base64').replace(/=+$/, '') !== base64.replace(/=+$/, '')) {
        throw new Error('Service account must be JSON or valid base64-encoded JSON.');
      }
      json = decoded.toString('utf8');
    }

    const parsed: unknown = JSON.parse(json);
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Service account JSON must be an object.');
    }

    const account = parsed as Record<string, unknown>;
    const projectId = account.project_id;
    const clientEmail = account.client_email;
    const privateKey = account.private_key;
    if (
      typeof projectId !== 'string' ||
      typeof clientEmail !== 'string' ||
      typeof privateKey !== 'string'
    ) {
      throw new Error('Service account JSON is missing required fields.');
    }
    if (projectId !== DEFAULT_FIREBASE_PROJECT_ID) {
      throw new Error('Service account project does not match the configured Firebase project.');
    }

    return { projectId, clientEmail, privateKey };
  }

  private setAppServices(
    app: App,
    modules?: {
      authPkg: typeof import('firebase-admin/auth');
      firestorePkg: typeof import('firebase-admin/firestore');
      storagePkg: typeof import('firebase-admin/storage');
    },
  ): void {
    const mods = modules || getFirebaseAdminModules();
    if (!mods) return;
    this.app = app;
    this.auth = mods.authPkg.getAuth(app);
    this.firestore = mods.firestorePkg.getFirestore(app);
    this.storage = mods.storagePkg.getStorage(app);
    this.configured = true;
  }

  private clearAppServices(): void {
    this.configured = false;
    this.app = null;
    this.auth = null;
    this.firestore = null;
    this.storage = null;
  }

  private failInitialization(message: string, isProduction: boolean): void {
    this.clearAppServices();
    if (isProduction) {
      throw new Error(message);
    }
    this.logger.warn(message);
  }

  public isConfigured(): boolean {
    return this.configured;
  }

  public getApp(): App {
    if (!this.app || !this.configured) {
      throw new Error(
        '[FirebaseAdminService] Firebase Admin App is not configured. Configure server-side Firebase credentials.',
      );
    }
    return this.app;
  }

  public getAuth(): Auth {
    if (!this.auth || !this.configured) {
      throw new Error(
        '[FirebaseAdminService] Firebase Auth is not configured. Configure server-side Firebase credentials.',
      );
    }
    return this.auth;
  }

  public getFirestore(): Firestore {
    if (!this.firestore || !this.configured) {
      throw new Error(
        '[FirebaseAdminService] Cloud Firestore is not configured. Configure server-side Firebase credentials.',
      );
    }
    return this.firestore;
  }

  public getStorage(): Storage {
    if (!this.storage || !this.configured) {
      throw new Error(
        '[FirebaseAdminService] Firebase Storage is not configured. Configure server-side Firebase credentials.',
      );
    }
    return this.storage;
  }

  /**
   * Verifies a Firebase ID token sent in the Authorization header.
   * Throws an error if the token is invalid, expired, or revoked.
   */
  public async verifyIdToken(
    idToken: string,
    checkRevoked = false,
  ): Promise<DecodedIdToken> {
    const auth = this.getAuth();
    return auth.verifyIdToken(idToken, checkRevoked);
  }

  /**
   * Retrieves a Firebase Auth user record by UID.
   */
  public async getUser(uid: string): Promise<UserRecord> {
    const auth = this.getAuth();
    return auth.getUser(uid);
  }

  /**
   * Retrieves a Firebase Auth user record by email address.
   */
  public async getUserByEmail(email: string): Promise<UserRecord | null> {
    const auth = this.getAuth();
    try {
      return await auth.getUserByEmail(email);
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'auth/user-not-found'
      ) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Sets custom claims for RBAC (e.g. role: 'ADMIN', 'CREATOR', 'LISTENER').
   */
  public async setCustomUserClaims(
    uid: string,
    claims: Record<string, unknown>,
  ): Promise<void> {
    const auth = this.getAuth();
    await auth.setCustomUserClaims(uid, claims);
    this.logger.log('Updated Firebase custom user claims.');
  }
}
