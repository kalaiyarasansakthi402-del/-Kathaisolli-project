import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { createApiClient, KathaisolliApiClient } from '@kathaisolli/api-client';
import type { User, AuthSessionResponse } from '@kathaisolli/shared-types';

export interface RegisterParams {
  email: string;
  password: string;
  displayName: string;
  autoLogin?: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<AuthSessionResponse>;
  register: (params: RegisterParams) => Promise<AuthSessionResponse>;
  logout: () => Promise<void>;
  updateProfile: (data: { displayName?: string; avatarUrl?: string }) => Promise<User>;
  refreshProfile: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; resetToken?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  api: KathaisolliApiClient;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'kathaisolli_token';
const USER_KEY = 'kathaisolli_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null;
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize unified API client
  const api = useMemo(() => {
    const rawEnv = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
    let baseURL: string;
    const isLegacyVercelApi = rawEnv && (rawEnv.includes('api-kalai21.vercel.app') || rawEnv.includes('api-three-lyart-42.vercel.app'));
    if (rawEnv && !isLegacyVercelApi) {
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
        ? '/api/v1'
        : 'http://localhost:3000/api/v1';
    }

    return createApiClient({
      baseURL,
      getToken: () => token,
      onUnauthorized: () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
      },
    });
  }, [token]);

  // Load and verify existing session on initial mount
  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      if (!token) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const profile = await api.auth.getProfile();
        if (isMounted) {
          setUser(profile);
          if (localStorage.getItem(TOKEN_KEY)) {
            localStorage.setItem(USER_KEY, JSON.stringify(profile));
          } else {
            sessionStorage.setItem(USER_KEY, JSON.stringify(profile));
          }
        }
      } catch (err) {
        console.warn('[AuthContext] Session verification failed, clearing stale auth:', err);
        if (isMounted) {
          setToken(null);
          setUser(null);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          sessionStorage.removeItem(TOKEN_KEY);
          sessionStorage.removeItem(USER_KEY);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [token, api]);

  // User Login Handler
  const login = useCallback(
    async (email: string, pass: string, rememberMe = true): Promise<AuthSessionResponse> => {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await api.auth.login({ email: normalizedEmail, password: pass });

      if (res.accessToken && res.user) {
        setToken(res.accessToken);
        setUser(res.user);

        if (rememberMe) {
          localStorage.setItem(TOKEN_KEY, res.accessToken);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          sessionStorage.removeItem(TOKEN_KEY);
          sessionStorage.removeItem(USER_KEY);
        } else {
          sessionStorage.setItem(TOKEN_KEY, res.accessToken);
          sessionStorage.setItem(USER_KEY, JSON.stringify(res.user));
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
      }

      return res;
    },
    [api],
  );

  // User Registration Handler
  const register = useCallback(
    async (params: RegisterParams): Promise<AuthSessionResponse> => {
      const normalizedEmail = params.email.trim().toLowerCase();
      const res = await api.auth.register({
        email: normalizedEmail,
        password: params.password,
        displayName: params.displayName.trim(),
      });

      if (params.autoLogin && res.accessToken && res.user) {
        setToken(res.accessToken);
        setUser(res.user);
        localStorage.setItem(TOKEN_KEY, res.accessToken);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      }

      return res;
    },
    [api],
  );

  // User Logout Handler
  const logout = useCallback(async () => {
    try {
      if (token) {
        await api.auth.logout();
      }
    } catch (err) {
      console.warn('[AuthContext] Remote logout failed:', err);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    }
  }, [api, token]);

  // Refresh Profile
  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const profile = await api.auth.getProfile();
      setUser(profile);
      if (localStorage.getItem(TOKEN_KEY)) {
        localStorage.setItem(USER_KEY, JSON.stringify(profile));
      } else {
        sessionStorage.setItem(USER_KEY, JSON.stringify(profile));
      }
    } catch {
      // Ignored
    }
  }, [token, api]);

  // Update Profile
  const updateProfile = useCallback(
    async (data: { displayName?: string; avatarUrl?: string }) => {
      const updated = await api.auth.updateProfile(data);
      setUser(updated);
      if (localStorage.getItem(TOKEN_KEY)) {
        localStorage.setItem(USER_KEY, JSON.stringify(updated));
      } else {
        sessionStorage.setItem(USER_KEY, JSON.stringify(updated));
      }
      return updated;
    },
    [api],
  );

  // Forgot Password
  const forgotPassword = useCallback(
    async (email: string) => {
      return api.auth.forgotPassword(email.trim().toLowerCase());
    },
    [api],
  );

  // Reset Password
  const resetPassword = useCallback(
    async (tokenVal: string, newPassword: string) => {
      return api.auth.resetPassword({ token: tokenVal, newPassword });
    },
    [api],
  );

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
        forgotPassword,
        resetPassword,
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
