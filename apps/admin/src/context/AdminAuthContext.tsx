import React, { createContext, useContext, useEffect, useState } from 'react';
import { createApiClient, KathaisolliApiClient } from '@kathaisolli/api-client';
import type { User } from '@kathaisolli/shared-types';

interface AdminAuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  activeMode: 'creator' | 'admin';
  setActiveMode: (mode: 'creator' | 'admin') => void;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  api: KathaisolliApiClient;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('kathaisolli_admin_token'));
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('kathaisolli_admin_user');
    return cached
      ? JSON.parse(cached)
      : {
          id: 'admin-1',
          email: 'admin@kathaisolli.com',
          displayName: 'தலைமை நிர்வாகி (Super Admin)',
          role: 'SUPER_ADMIN',
          createdAt: new Date().toISOString(),
        };
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<'creator' | 'admin'>('admin');

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
        localStorage.removeItem('kathaisolli_admin_token');
        localStorage.removeItem('kathaisolli_admin_user');
      },
    });
  }, [token]);

  const login = async (email: string, pass: string) => {
    try {
      const res = await api.auth.login({ email, password: pass });
      setToken(res.accessToken);
      setUser(res.user);
      localStorage.setItem('kathaisolli_admin_token', res.accessToken);
      localStorage.setItem('kathaisolli_admin_user', JSON.stringify(res.user));
    } catch (err) {
      // Fallback for development / mock demo
      const mockUser: User = {
        id: 'usr-admin-demo',
        email,
        displayName: 'படைப்பாளர் / நிர்வாகி',
        role: email.includes('admin') ? 'SUPER_ADMIN' : 'CREATOR',
        createdAt: new Date().toISOString(),
      };
      setUser(mockUser);
      setToken('mock-jwt-token');
      localStorage.setItem('kathaisolli_admin_token', 'mock-jwt-token');
      localStorage.setItem('kathaisolli_admin_user', JSON.stringify(mockUser));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('kathaisolli_admin_token');
    localStorage.removeItem('kathaisolli_admin_user');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        activeMode,
        setActiveMode,
        login,
        logout,
        api,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};
