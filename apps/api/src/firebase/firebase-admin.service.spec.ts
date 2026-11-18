import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { initializeApp } from 'firebase-admin/app';
import {
  FirebaseAdminService,
  DEFAULT_FIREBASE_PROJECT_ID,
} from './firebase-admin.service';

const mockAuthInstance = {
  verifyIdToken: jest.fn(),
  getUser: jest.fn(),
  getUserByEmail: jest.fn(),
  setCustomUserClaims: jest.fn(),
};

const mockFirestoreInstance = {
  collection: jest.fn(),
  doc: jest.fn(),
};

const mockStorageInstance = {
  bucket: jest.fn(),
};

let mockAppsList: any[] = [];

jest.mock('firebase-admin/app', () => ({
  getApps: jest.fn(() => mockAppsList),
  initializeApp: jest.fn((options) => {
    const app = {
      name: '[DEFAULT]',
      options,
    };
    mockAppsList.push(app);
    return app;
  }),
  cert: jest.fn((serviceAccount) => serviceAccount),
  applicationDefault: jest.fn(() => ({})),
}));

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(() => mockAuthInstance),
}));

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(() => mockFirestoreInstance),
}));

jest.mock('firebase-admin/storage', () => ({
  getStorage: jest.fn(() => mockStorageInstance),
}));

const serviceAccountJson = JSON.stringify({
  project_id: DEFAULT_FIREBASE_PROJECT_ID,
  client_email: 'firebase-adminsdk@example.iam.gserviceaccount.com',
  private_key: 'test-private-key',
});

function createConfigService(values: Record<string, string>): ConfigService {
  return {
    get: jest.fn((key: string) => values[key]),
  } as unknown as ConfigService;
}

describe('FirebaseAdminService', () => {
  let service: FirebaseAdminService;
  let configService: ConfigService;
  const originalEnvironment = {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_SERVICE_ACCOUNT_JSON: process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
    GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  };

  beforeEach(async () => {
    mockAppsList = [];
    delete process.env.FIREBASE_PROJECT_ID;
    delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseAdminService,
        {
          provide: ConfigService,
          useValue: createConfigService({
            FIREBASE_PROJECT_ID: DEFAULT_FIREBASE_PROJECT_ID,
            NODE_ENV: 'development',
          }),
        },
      ],
    }).compile();

    service = module.get<FirebaseAdminService>(FirebaseAdminService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    for (const [key, value] of Object.entries(originalEnvironment)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    jest.clearAllMocks();
  });

  it('is unconfigured when development credentials are missing', () => {
    service.onModuleInit();

    expect(service.isConfigured()).toBe(false);
    expect(() => service.getAuth()).toThrow('Firebase Auth is not configured');
  });

  it('requires credentials and fails startup in production', () => {
    const prodService = new FirebaseAdminService(
      createConfigService({
        FIREBASE_PROJECT_ID: DEFAULT_FIREBASE_PROJECT_ID,
        NODE_ENV: 'production',
      }),
    );

    expect(() => prodService.onModuleInit()).toThrow(
      'Firebase Admin credentials are missing',
    );
    expect(prodService.isConfigured()).toBe(false);
  });

  it('initializes with valid service account credentials in production', () => {
    const prodService = new FirebaseAdminService(
      createConfigService({
        FIREBASE_PROJECT_ID: DEFAULT_FIREBASE_PROJECT_ID,
        FIREBASE_SERVICE_ACCOUNT_JSON: serviceAccountJson,
        NODE_ENV: 'production',
      }),
    );

    prodService.onModuleInit();

    expect(prodService.isConfigured()).toBe(true);
    expect(prodService.getAuth()).toBe(mockAuthInstance);
    expect(prodService.getStorage()).toBe(mockStorageInstance);
    expect(initializeApp).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: DEFAULT_FIREBASE_PROJECT_ID,
        storageBucket: `${DEFAULT_FIREBASE_PROJECT_ID}.appspot.com`,
      }),
    );
  });

  it('decodes valid base64 service account JSON', () => {
    const encodedCredentials = Buffer.from(serviceAccountJson).toString('base64');
    const configuredService = new FirebaseAdminService(
      createConfigService({
        FIREBASE_PROJECT_ID: DEFAULT_FIREBASE_PROJECT_ID,
        FIREBASE_SERVICE_ACCOUNT_JSON: encodedCredentials,
        NODE_ENV: 'development',
      }),
    );

    configuredService.onModuleInit();

    expect(configuredService.isConfigured()).toBe(true);
  });

  it('rejects credentials for a different Firebase project', () => {
    const invalidCredentials = JSON.stringify({
      project_id: 'another-project',
      client_email: 'firebase-adminsdk@example.iam.gserviceaccount.com',
      private_key: 'test-private-key',
    });
    const prodService = new FirebaseAdminService(
      createConfigService({
        FIREBASE_PROJECT_ID: DEFAULT_FIREBASE_PROJECT_ID,
        FIREBASE_SERVICE_ACCOUNT_JSON: invalidCredentials,
        NODE_ENV: 'production',
      }),
    );

    expect(() => prodService.onModuleInit()).toThrow(
      'Firebase Admin initialization failed',
    );
    expect(prodService.isConfigured()).toBe(false);
  });

  it('reuses an existing compatible Firebase Admin app', () => {
    service = new FirebaseAdminService(
      createConfigService({
        FIREBASE_PROJECT_ID: DEFAULT_FIREBASE_PROJECT_ID,
        FIREBASE_SERVICE_ACCOUNT_JSON: serviceAccountJson,
        NODE_ENV: 'development',
      }),
    );
    service.onModuleInit();
    const firstApp = service.getApp();

    const secondService = new FirebaseAdminService(configService);
    secondService.onModuleInit();

    expect(secondService.getApp()).toBe(firstApp);
    expect(initializeApp).toHaveBeenCalledTimes(1);
  });

  it('verifies ID tokens through Firebase Auth', async () => {
    service = new FirebaseAdminService(
      createConfigService({
        FIREBASE_PROJECT_ID: DEFAULT_FIREBASE_PROJECT_ID,
        FIREBASE_SERVICE_ACCOUNT_JSON: serviceAccountJson,
        NODE_ENV: 'development',
      }),
    );
    service.onModuleInit();
    mockAuthInstance.verifyIdToken.mockResolvedValueOnce({
      uid: 'user_123',
      email: 'test@kathaisolli.com',
    });

    const decoded = await service.verifyIdToken('valid_token');

    expect(mockAuthInstance.verifyIdToken).toHaveBeenCalledWith(
      'valid_token',
      false,
    );
    expect(decoded.uid).toBe('user_123');
  });

  it('sets custom claims through Firebase Auth', async () => {
    service = new FirebaseAdminService(
      createConfigService({
        FIREBASE_PROJECT_ID: DEFAULT_FIREBASE_PROJECT_ID,
        FIREBASE_SERVICE_ACCOUNT_JSON: serviceAccountJson,
        NODE_ENV: 'development',
      }),
    );
    service.onModuleInit();
    mockAuthInstance.setCustomUserClaims.mockResolvedValueOnce(undefined);

    await service.setCustomUserClaims('user_123', { role: 'LISTENER' });

    expect(mockAuthInstance.setCustomUserClaims).toHaveBeenCalledWith(
      'user_123',
      { role: 'LISTENER' },
    );
  });
});
