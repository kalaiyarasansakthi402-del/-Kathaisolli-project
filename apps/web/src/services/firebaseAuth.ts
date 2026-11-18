import {
  createUserWithEmailAndPassword,
  getIdToken,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
  type UserCredential,
} from 'firebase/auth';
import type { Unsubscribe } from 'firebase/auth';
import { auth } from './firebase';

function requireFirebaseAuth() {
  if (!auth) {
    throw new Error(
      'Firebase Authentication is not configured. Set the VITE_FIREBASE_* web app environment variables.',
    );
  }
  return auth;
}

export async function registerWithFirebaseEmailPassword(
  email: string,
  password: string,
): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(
    requireFirebaseAuth(),
    email,
    password,
  );
  await sendEmailVerification(credential.user);
  return credential;
}

export function loginWithFirebaseEmailPassword(
  email: string,
  password: string,
): Promise<UserCredential> {
  return signInWithEmailAndPassword(requireFirebaseAuth(), email, password);
}

export async function sendFirebaseEmailVerification(
  user?: User,
): Promise<void> {
  const currentUser = user ?? requireFirebaseAuth().currentUser;
  if (!currentUser) {
    throw new Error('A signed-in Firebase user is required for email verification.');
  }
  await sendEmailVerification(currentUser);
}

export function sendFirebasePasswordResetEmail(email: string): Promise<void> {
  return sendPasswordResetEmail(requireFirebaseAuth(), email);
}

export function logoutFirebaseUser(): Promise<void> {
  return signOut(requireFirebaseAuth());
}

export function getCurrentFirebaseUser(): User | null {
  return requireFirebaseAuth().currentUser;
}

export function observeFirebaseUser(
  callback: (user: User | null) => void,
): Unsubscribe {
  return onAuthStateChanged(requireFirebaseAuth(), callback);
}

export function getCurrentFirebaseIdToken(
  forceRefresh = false,
): Promise<string> {
  const user = getCurrentFirebaseUser();
  if (!user) {
    throw new Error('A signed-in Firebase user is required to retrieve an ID token.');
  }
  return getIdToken(user, forceRefresh);
}
