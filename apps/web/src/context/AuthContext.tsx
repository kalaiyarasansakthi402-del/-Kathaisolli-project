import React, { createContext, useContext } from 'react';
import { createApiClient, KathaisolliApiClient } from '@kathaisolli/api-client';
import type { User } from '@kathaisolli/shared-types';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  api: KathaisolliApiClient;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const api = React.useMemo(() => {
    const rawEnv = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
    let baseURL: string;
    if (rawEnv) {
      const stripped = rawEnv.replace(/\/+$/, '');
      if (stripped.endsWith('/api/v1')) {
        baseURL = stripped;
      } else if (stripped.endsWith('/api')) {
        baseURL = `${stripped}/v1`;
      } else {
        baseURL = `${stripped}/api/v1`;
      }
    } else {
      baseURL = import.meta.env.PROD
        ? 'https://api-kalai21.vercel.app/api/v1'
        : 'http://localhost:3000/api/v1';
    }

    return createApiClient({
      baseURL,
      getToken: () => null,
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: null,
        token: null,
        isLoading: false,
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

export default AuthContext;
