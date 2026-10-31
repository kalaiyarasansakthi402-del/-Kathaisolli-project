import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@kathaisolli/shared-types';
import { createApiClient, KathaisolliApiClient } from '@kathaisolli/api-client';

interface MobileAuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => void;
  api: KathaisolliApiClient;
}

const MobileAuthContext = createContext<MobileAuthContextType | undefined>(undefined);

export const MobileAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const api = React.useMemo(() => {
    return createApiClient({
      getToken: () => token,
      onUnauthorized: () => {
        setToken(null);
        setUser(null);
      },
    });
  }, [token]);

  const login = async (email: string, pass: string) => {
    try {
      const res = await api.auth.login({ email, password: pass });
      setToken(res.accessToken);
      setUser(res.user);
    } catch {
      // Mock fallback for development/offline testing
      const mockUser: User = {
        id: 'usr-mob-1',
        email,
        displayName: 'தமிழ் நேயர்',
        role: 'LISTENER',
        createdAt: new Date().toISOString(),
      };
      setToken('mob-token');
      setUser(mockUser);
    }
  };

  const register = async (email: string, pass: string, name: string) => {
    try {
      const res = await api.auth.register({ email, password: pass, displayName: name });
      setToken(res.accessToken);
      setUser(res.user);
    } catch {
      const mockUser: User = {
        id: 'usr-mob-1',
        email,
        displayName: name,
        role: 'LISTENER',
        createdAt: new Date().toISOString(),
      };
      setToken('mob-token');
      setUser(mockUser);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <MobileAuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        api,
      }}
    >
      {children}
    </MobileAuthContext.Provider>
  );
};

export const useMobileAuth = () => {
  const ctx = useContext(MobileAuthContext);
  if (!ctx) throw new Error('useMobileAuth must be used within MobileAuthProvider');
  return ctx;
};
