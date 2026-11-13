import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAuth, type Auth } from 'firebase/auth';

/**
 * Firebase Client Configuration for Kathaisolli
 * Project ID: vaagai-audio-books-36a4e
 * Storage Bucket: gs://vaagai-audio-books-36a4e.appspot.com
 *
 * Configured securely via environment variables (never hardcoded secrets).
 */
const hasViteEnv = typeof import.meta !== 'undefined' && Boolean(import.meta.env);

const firebaseConfig = {
  apiKey: hasViteEnv ? import.meta.env.VITE_FIREBASE_API_KEY : undefined,
  authDomain:
    (hasViteEnv ? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN : undefined) ||
    'vaagai-audio-books-36a4e.firebaseapp.com',
  projectId:
    (hasViteEnv ? import.meta.env.VITE_FIREBASE_PROJECT_ID : undefined) ||
    'vaagai-audio-books-36a4e',
  storageBucket:
    (hasViteEnv ? import.meta.env.VITE_FIREBASE_STORAGE_BUCKET : undefined) ||
    'vaagai-audio-books-36a4e.appspot.com',
  messagingSenderId: hasViteEnv ? import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID : undefined,
  appId: hasViteEnv ? import.meta.env.VITE_FIREBASE_APP_ID : undefined,
};

/**
 * Checks whether Firebase credentials have been configured in the environment.
 */
export const isFirebaseConfigured = (): boolean => {
  const apiKey = hasViteEnv ? import.meta.env.VITE_FIREBASE_API_KEY : undefined;
  return Boolean(
    apiKey &&
      apiKey !== 'your-firebase-api-key' &&
      firebaseConfig.projectId,
  );
};

let app: FirebaseApp | null = null;
let storage: FirebaseStorage | null = null;
let auth: Auth | null = null;

try {
  if (isFirebaseConfigured() || firebaseConfig.projectId) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    try {
      storage = getStorage(
        app,
        `gs://${firebaseConfig.storageBucket.replace(/^gs:\/\//, '')}`,
      );
    } catch (storageErr) {
      console.warn('[Kathaisolli Firebase] Storage init warning:', storageErr);
    }

    if (isFirebaseConfigured()) {
      try {
        auth = getAuth(app);
      } catch (authErr) {
        console.warn('[Kathaisolli Firebase] Auth init warning:', authErr);
      }
    }
  }
} catch (error) {
  console.warn(
    '[Kathaisolli Firebase] Initialization warning. Check environment variables if using Firebase Storage:',
    error,
  );
}

export { app, storage, auth, firebaseConfig };
