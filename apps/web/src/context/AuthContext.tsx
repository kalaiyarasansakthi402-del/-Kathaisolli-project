import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createApiClient, KathaisolliApiClient } from '@kathaisolli/api-client';
import type { User, AuthSessionResponse } from '@kathaisolli/shared-types';
import { auth } from '../services/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';

export interface RegisterParams {
  email: string;
  password: string;
  displayName: string;
  role?: 'LISTENER' | 'CREATOR';
  autoLogin?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (
    paramsOrEmail: RegisterParams | string,
    pass?: string,
    name?: string,
    autoLogin?: boolean,
  ) => Promise<AuthSessionResponse>;
  logout: () => Promise<void>;
  updateProfile: (data: { displayName?: string; avatarUrl?: string }) => Promise<void>;
  refreshProfile: () => Promise<void>;
  api: KathaisolliApiClient;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('kathaisolli_token'));
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('kathaisolli_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const api = React.useMemo(() => {
    const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
    const baseURL = envUrl
      ? (envUrl.endsWith('/api/v1') ? envUrl : `${envUrl.replace(/\/+$/, '')}/api/v1`)
      : (import.meta.env.PROD ? 'https://api-kalai21.vercel.app/api/v1' : 'http://localhost:3000/api/v1');

    return createApiClient({
      baseURL,
      getToken: () => token,
      onUnauthorized: () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('kathaisolli_token');
        localStorage.removeItem('kathaisolli_user');
      },
    });
  }, [token]);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const profile = await api.auth.getProfile();
      setUser(profile);
      localStorage.setItem('kathaisolli_user', JSON.stringify(profile));
    } catch {
      // Ignored
    }
  }, [token, api]);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await api.auth.getProfile();
        setUser(profile);
        localStorage.setItem('kathaisolli_user', JSON.stringify(profile));
      } catch {
        const cached = localStorage.getItem('kathaisolli_user');
        if (!cached) {
          setToken(null);
          setUser(null);
          localStorage.removeItem('kathaisolli_token');
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [token, api]);

  const login = async (email: string, pass: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const res = await api.auth.login({ email: normalizedEmail, password: pass });
      if (!res || !res.accessToken || !res.user) {
        throw new Error('மின்னஞ்சல் அல்லது கடவுச்சொல் தவறானது (Invalid email or password).');
      }
      setToken(res.accessToken);
      setUser(res.user);
      localStorage.setItem('kathaisolli_token', res.accessToken);
      localStorage.setItem('kathaisolli_user', JSON.stringify(res.user));
    } catch (err: any) {
      if (err?.response?.status === 401) {
        throw new Error('மின்னஞ்சல் அல்லது கடவுச்சொல் தவறானது (Invalid email or password).');
      }
      // If backend API returned 405, 500 or network failure, try Firebase Auth fallback
      if (auth && (err?.response?.status === 405 || err?.response?.status === 500 || err?.message === 'Network Error' || !err?.response)) {
        try {
          const userCred = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
          const fbUser = userCred.user;
          const idToken = await fbUser.getIdToken();
          const fallbackUser: User = {
            id: fbUser.uid,
            email: fbUser.email || normalizedEmail,
            displayName: fbUser.displayName || normalizedEmail.split('@')[0],
            role: 'LISTENER',
            createdAt: new Date().toISOString(),
          };
          setToken(idToken);
          setUser(fallbackUser);
          localStorage.setItem('kathaisolli_token', idToken);
          localStorage.setItem('kathaisolli_user', JSON.stringify(fallbackUser));
          return;
        } catch (fbErr: any) {
          if (fbErr?.code === 'auth/wrong-password' || fbErr?.code === 'auth/user-not-found' || fbErr?.code === 'auth/invalid-credential') {
            throw new Error('மின்னஞ்சல் அல்லது கடவுச்சொல் தவறானது (Invalid email or password).');
          }
        }
      }
      if (err?.response) {
        const status = err.response.status;
        const msg = err.response.data?.message;
        const formatted = Array.isArray(msg) ? msg.join(', ') : msg;
        throw new Error(`[HTTP ${status}] ${formatted || err.response.statusText || 'Authentication error'}`);
      }
      if (err?.message === 'Network Error' || !err?.response) {
        throw new Error(
          'சேவையகத்தை இணைக்க முடியவில்லை (Unable to reach authentication server: Network/CORS error or Vercel Deployment Protection redirect). Backend: https://api-kalai21.vercel.app',
        );
      }
      throw err;
    }
  };

  const register = async (
    paramsOrEmail: RegisterParams | string,
    pass?: string,
    name?: string,
    autoLoginParam?: boolean,
  ): Promise<AuthSessionResponse> => {
    const payload: RegisterParams =
      typeof paramsOrEmail === 'string'
        ? {
            email: paramsOrEmail,
            password: pass || '',
            displayName: name || '',
            role: 'LISTENER',
            autoLogin: autoLoginParam ?? false,
          }
        : {
            ...paramsOrEmail,
            autoLogin: paramsOrEmail.autoLogin ?? autoLoginParam ?? false,
          };

    const normalizedEmail = payload.email.trim().toLowerCase();
    const cleanDisplayName = payload.displayName.trim();

    try {
      const res = await api.auth.register({
        email: normalizedEmail,
        password: payload.password,
        displayName: cleanDisplayName,
        role: payload.role || 'LISTENER',
      });

      // Only store session in state if autoLogin was explicitly requested
      if (payload.autoLogin && res?.accessToken && res?.user) {
        setToken(res.accessToken);
        setUser(res.user);
        localStorage.setItem('kathaisolli_token', res.accessToken);
        localStorage.setItem('kathaisolli_user', JSON.stringify(res.user));
      }

      return res;
    } catch (err: any) {
      if (err?.response?.status === 409) {
        throw new Error(
          'இந்த மின்னஞ்சல் முகவரி ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது (An account with this email already exists).',
        );
      }
      // If backend API returned 405, 500 or network failure, try Firebase Auth fallback
      if (auth && (err?.response?.status === 405 || err?.response?.status === 500 || err?.message === 'Network Error' || !err?.response)) {
        try {
          const userCred = await createUserWithEmailAndPassword(auth, normalizedEmail, payload.password);
          const fbUser = userCred.user;
          if (cleanDisplayName) {
            await updateFirebaseProfile(fbUser, { displayName: cleanDisplayName }).catch(() => {});
          }
          const idToken = await fbUser.getIdToken();
          const fallbackUser: User = {
            id: fbUser.uid,
            email: fbUser.email || normalizedEmail,
            displayName: cleanDisplayName || fbUser.displayName || normalizedEmail.split('@')[0],
            role: payload.role || 'LISTENER',
            createdAt: new Date().toISOString(),
          };
          const fallbackSession: AuthSessionResponse = {
            accessToken: idToken,
            tokenType: 'Bearer',
            expiresIn: 3600,
            user: fallbackUser,
          };
          if (payload.autoLogin) {
            setToken(idToken);
            setUser(fallbackUser);
            localStorage.setItem('kathaisolli_token', idToken);
            localStorage.setItem('kathaisolli_user', JSON.stringify(fallbackUser));
          }
          return fallbackSession;
        } catch (fbErr: any) {
          if (fbErr?.code === 'auth/email-already-in-use') {
            throw new Error(
              'இந்த மின்னஞ்சல் முகவரி ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது (An account with this email already exists).',
            );
          }
        }
      }
      if (err?.response) {
        const status = err.response.status;
        const msg = err.response.data?.message;
        const formatted = Array.isArray(msg) ? msg.join(', ') : msg;
        throw new Error(`[HTTP ${status}] ${formatted || err.response.statusText || 'Authentication error'}`);
      }
      if (err?.message === 'Network Error' || !err?.response) {
        throw new Error(
          'சேவையகத்தை இணைக்க முடியவில்லை (Unable to reach authentication server: Network/CORS error or Vercel Deployment Protection redirect). Backend: https://api-kalai21.vercel.app',
        );
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.auth.logout().catch(() => {});
      }
    } catch {
      // Graceful fallback if network is unreachable
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('kathaisolli_token');
      localStorage.removeItem('kathaisolli_user');
      localStorage.removeItem('kathaisolli_favorites');
      localStorage.removeItem('kathaisolli_history');
      localStorage.removeItem('kathaisolli_playlists');
      localStorage.removeItem('kathaisolli_progress');
      sessionStorage.clear();
    }
  };

  const updateProfile = async (data: { displayName?: string; avatarUrl?: string }) => {
    const updated = await api.auth.updateProfile(data);
    setUser(updated);
    localStorage.setItem('kathaisolli_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
        api,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
