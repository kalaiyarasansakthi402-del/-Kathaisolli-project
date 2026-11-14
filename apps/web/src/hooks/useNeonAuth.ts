import { useState, useEffect, useCallback } from 'react';
import {
  authClient,
  NeonAuthUser,
  NeonAuthSession,
  NeonAuthSessionResult,
  SignUpEmailParams,
  SignInEmailParams,
} from '../lib/neon-auth';

export interface UseNeonAuthReturn {
  user: NeonAuthUser | null;
  session: NeonAuthSession | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signUp: (params: SignUpEmailParams) => Promise<NeonAuthSessionResult>;
  signIn: (params: SignInEmailParams) => Promise<NeonAuthSessionResult>;
  signOut: () => Promise<void>;
  refetchSession: () => Promise<void>;
  clearError: () => void;
}

export function useNeonAuth(): UseNeonAuthReturn {
  const [user, setUser] = useState<NeonAuthUser | null>(null);
  const [session, setSession] = useState<NeonAuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const refetchSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await authClient.getSession();
      if (res.data) {
        setUser(res.data.user);
        setSession(res.data.session);
      } else {
        setUser(null);
        setSession(null);
      }
    } catch (err: any) {
      console.warn('[NeonAuth] Failed to restore session:', err?.message || err);
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetchSession();
  }, [refetchSession]);

  const signUp = useCallback(
    async (params: SignUpEmailParams): Promise<NeonAuthSessionResult> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await authClient.signUp.email(params);
        if (res.error) {
          const msg = res.error.message || 'Signup failed with Neon Auth.';
          setError(msg);
          throw new Error(msg);
        }
        if (!res.data) {
          throw new Error('No user data returned from Neon Auth signup.');
        }
        setUser(res.data.user);
        setSession(res.data.session);
        return res.data;
      } catch (err: any) {
        const msg = err?.message || 'Signup failed.';
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signIn = useCallback(
    async (params: SignInEmailParams): Promise<NeonAuthSessionResult> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await authClient.signIn.email(params);
        if (res.error) {
          const msg = res.error.message || 'Login failed with Neon Auth.';
          setError(msg);
          throw new Error(msg);
        }
        if (!res.data) {
          throw new Error('No session returned from Neon Auth login.');
        }
        setUser(res.data.user);
        setSession(res.data.session);
        return res.data;
      } catch (err: any) {
        const msg = err?.message || 'Login failed.';
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authClient.signOut();
    } finally {
      setUser(null);
      setSession(null);
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    session,
    isLoading,
    error,
    isAuthenticated: Boolean(user && session),
    signUp,
    signIn,
    signOut,
    refetchSession,
    clearError,
  };
}
