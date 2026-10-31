import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createApiClient, KathaisolliApiClient } from '@kathaisolli/api-client';
import type { User } from '@kathaisolli/shared-types';

export interface RegisterParams {
  email: string;
  password: string;
  displayName: string;
  role?: 'LISTENER' | 'CREATOR';
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
  ) => Promise<void>;
  logout: () => void;
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
      : (import.meta.env.PROD ? '/api/v1' : 'http://localhost:3000/api/v1');

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
        setToken(null);
        setUser(null);
        localStorage.removeItem('kathaisolli_token');
        localStorage.removeItem('kathaisolli_user');
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [token, api]);

  const login = async (email: string, pass: string) => {
    const res = await api.auth.login({ email, password: pass });
    setToken(res.accessToken);
    setUser(res.user);
    localStorage.setItem('kathaisolli_token', res.accessToken);
    localStorage.setItem('kathaisolli_user', JSON.stringify(res.user));
  };

  const register = async (
    paramsOrEmail: RegisterParams | string,
    pass?: string,
    name?: string,
  ) => {
    const payload = typeof paramsOrEmail === 'string'
      ? { email: paramsOrEmail, password: pass || '', displayName: name || '' }
      : paramsOrEmail;

    const res = await api.auth.register(payload);
    setToken(res.accessToken);
    setUser(res.user);
    localStorage.setItem('kathaisolli_token', res.accessToken);
    localStorage.setItem('kathaisolli_user', JSON.stringify(res.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('kathaisolli_token');
    localStorage.removeItem('kathaisolli_user');
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
