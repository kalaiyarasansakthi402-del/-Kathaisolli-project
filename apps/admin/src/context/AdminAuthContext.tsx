import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { createApiClient, KathaisolliApiClient } from '@kathaisolli/api-client';
import type { User, UserRole } from '@kathaisolli/shared-types';

export interface AdminPermissions {
  canAccessDashboard: boolean;
  canManageStories: boolean;
  canManageCategories: boolean;
  canUploadAudio: boolean;
  canManageStorage: boolean;
  canViewReports: boolean;
  canManageStaff: boolean;
  canManageSettings: boolean;
}

interface AdminAuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  sessionExpired: boolean;
  permissions: AdminPermissions;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  login: (email: string, pass: string) => Promise<User>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  clearSessionExpiredNotice: () => void;
  api: KathaisolliApiClient;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const TOKEN_KEY = 'kathaisolli_admin_jwt';
const USER_KEY = 'kathaisolli_admin_user';

function isJwtExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored || isJwtExpired(stored)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return null;
    }
    return stored;
  });

  const [user, setUser] = useState<User | null>(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken || isJwtExpired(storedToken)) return null;
    const cached = localStorage.getItem(USER_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (
          parsed.role === 'SUPER_ADMIN' ||
          parsed.role === 'ADMIN' ||
          parsed.role === 'MODERATOR'
        ) {
          return parsed;
        }
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const handleUnauthorized = useCallback(() => {
    setSessionExpired(true);
    logout();
  }, [logout]);

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
      onUnauthorized: handleUnauthorized,
    });
  }, [token, handleUnauthorized]);

  // Permissions model based on authenticated role
  const permissions = useMemo<AdminPermissions>(() => {
    const role = user?.role;
    if (role === 'SUPER_ADMIN') {
      return {
        canAccessDashboard: true,
        canManageStories: true,
        canManageCategories: true,
        canUploadAudio: true,
        canManageStorage: true,
        canViewReports: true,
        canManageStaff: true,
        canManageSettings: true,
      };
    }
    if (role === 'ADMIN') {
      return {
        canAccessDashboard: true,
        canManageStories: true,
        canManageCategories: true,
        canUploadAudio: true,
        canManageStorage: true,
        canViewReports: true,
        canManageStaff: true,
        canManageSettings: false,
      };
    }
    if (role === 'MODERATOR') {
      // Editor tier
      return {
        canAccessDashboard: true,
        canManageStories: true,
        canManageCategories: true,
        canUploadAudio: true,
        canManageStorage: false,
        canViewReports: true,
        canManageStaff: false,
        canManageSettings: false,
      };
    }
    return {
      canAccessDashboard: false,
      canManageStories: false,
      canManageCategories: false,
      canUploadAudio: false,
      canManageStorage: false,
      canViewReports: false,
      canManageStaff: false,
      canManageSettings: false,
    };
  }, [user?.role]);

  // Session expiry watcher
  useEffect(() => {
    if (!token) return;

    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp) {
          const msUntilExpiry = payload.exp * 1000 - Date.now();
          if (msUntilExpiry <= 0) {
            handleUnauthorized();
            return;
          }
          const timer = setTimeout(() => {
            handleUnauthorized();
          }, msUntilExpiry);
          return () => clearTimeout(timer);
        }
      }
    } catch {
      // Ignore parse failure
    }
  }, [token, handleUnauthorized]);

  const login = async (email: string, pass: string): Promise<User> => {
    setIsLoading(true);
    setSessionExpired(false);
    try {
      const res = await api.auth.login({
        email: email.trim().toLowerCase(),
        password: pass,
      });

      const authenticatedUser = res.user;

      // Strict role check: user must possess an admin/editor role
      const allowedRoles: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'];
      if (!allowedRoles.includes(authenticatedUser.role)) {
        throw new Error(
          'அங்கீகரிக்கப்படாத அணுகல்: இந்த தளத்திற்கு நிர்வாகிகளுக்கான அனுமதி மட்டுமே உள்ளது (Access denied: Admin credentials required).',
        );
      }

      setToken(res.accessToken);
      setUser(authenticatedUser);
      localStorage.setItem(TOKEN_KEY, res.accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(authenticatedUser));
      return authenticatedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const profile = await api.auth.getProfile();
      setUser(profile);
      localStorage.setItem(USER_KEY, JSON.stringify(profile));
    } catch (err) {
      console.warn('[AdminAuth] Profile refresh notice:', err);
    }
  }, [api, token]);

  const clearSessionExpiredNotice = () => setSessionExpired(false);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdmin = user?.role === 'ADMIN' || isSuperAdmin;
  const isEditor = user?.role === 'MODERATOR' || isAdmin;

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        sessionExpired,
        permissions,
        isSuperAdmin,
        isAdmin,
        isEditor,
        login,
        logout,
        refreshProfile,
        clearSessionExpiredNotice,
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
