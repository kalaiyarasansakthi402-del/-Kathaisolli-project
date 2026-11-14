/**
 * Kathaisolli - Neon Managed Better Auth Client
 *
 * Implements the official Better Auth / Neon Auth client contract:
 * - authClient.signUp.email({ email, password, name })
 * - authClient.signIn.email({ email, password })
 * - authClient.getSession()
 * - authClient.signOut()
 * - authClient.token()
 *
 * Communicates with the Neon Managed Auth instance configured via
 * VITE_NEON_AUTH_URL or branch auth endpoint.
 */

export interface NeonAuthUser {
  id: string;
  email: string;
  name?: string;
  emailVerified?: boolean;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface NeonAuthSession {
  id: string;
  userId: string;
  token?: string;
  expiresAt: string | Date;
  ipAddress?: string;
  userAgent?: string;
  [key: string]: unknown;
}

export interface NeonAuthSessionResult {
  user: NeonAuthUser;
  session: NeonAuthSession;
}

export interface NeonAuthError {
  message: string;
  status?: number;
  statusText?: string;
}

export interface NeonAuthResponse<T> {
  data: T | null;
  error: NeonAuthError | null;
}

export interface SignUpEmailParams {
  email: string;
  password: string;
  name?: string;
  image?: string;
  callbackURL?: string;
}

export interface SignInEmailParams {
  email: string;
  password: string;
  callbackURL?: string;
  rememberMe?: boolean;
}

const NEON_SESSION_TOKEN_KEY = 'kathaisolli_neon_auth_token';
const NEON_SESSION_DATA_KEY = 'kathaisolli_neon_auth_session';

/**
 * Resolve the Neon Auth Base URL from environment or current origin.
 */
export function getNeonAuthBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_NEON_AUTH_URL as string | undefined)?.trim();
  if (envUrl) {
    // Strip trailing slash
    return envUrl.replace(/\/+$/, '');
  }
  // Default to local/Vercel serverless proxy path
  return '/api/auth';
}

class NeonAuthClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || getNeonAuthBaseUrl();
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Stored token helper
   */
  public getToken(): string | null {
    try {
      return (
        localStorage.getItem(NEON_SESSION_TOKEN_KEY) ||
        sessionStorage.getItem(NEON_SESSION_TOKEN_KEY) ||
        null
      );
    } catch {
      return null;
    }
  }

  private saveSessionToken(token: string, remember: boolean = true) {
    try {
      if (remember) {
        localStorage.setItem(NEON_SESSION_TOKEN_KEY, token);
      } else {
        sessionStorage.setItem(NEON_SESSION_TOKEN_KEY, token);
      }
    } catch {
      // storage unavailable
    }
  }

  private clearSessionCache() {
    try {
      localStorage.removeItem(NEON_SESSION_TOKEN_KEY);
      localStorage.removeItem(NEON_SESSION_DATA_KEY);
      sessionStorage.removeItem(NEON_SESSION_TOKEN_KEY);
      sessionStorage.removeItem(NEON_SESSION_DATA_KEY);
    } catch {
      // storage unavailable
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<NeonAuthResponse<T>> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const token = this.getToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any = null;

      if (contentType.includes('application/json')) {
        data = await response.json().catch(() => null);
      } else {
        const text = await response.text().catch(() => '');
        data = text ? { message: text } : null;
      }

      if (!response.ok) {
        const errorMessage =
          data?.message ||
          data?.error?.message ||
          data?.error ||
          `Request failed with status ${response.status}`;

        return {
          data: null,
          error: {
            message: errorMessage,
            status: response.status,
            statusText: response.statusText,
          },
        };
      }

      // Check if session token was returned in headers or body
      const returnedToken =
        data?.token ||
        data?.session?.token ||
        response.headers.get('set-auth-token') ||
        response.headers.get('x-auth-token');

      if (returnedToken && typeof returnedToken === 'string') {
        this.saveSessionToken(returnedToken);
      }

      return {
        data: data as T,
        error: null,
      };
    } catch (err: any) {
      return {
        data: null,
        error: {
          message: err?.message || 'Network connection failed to reach Neon Auth service.',
          status: 0,
        },
      };
    }
  }

  /**
   * Sign up with Email and Password
   */
  public signUp = {
    email: async (params: SignUpEmailParams): Promise<NeonAuthResponse<NeonAuthSessionResult>> => {
      const res = await this.request<NeonAuthSessionResult>('/sign-up/email', {
        method: 'POST',
        body: JSON.stringify({
          email: params.email.trim().toLowerCase(),
          password: params.password,
          name: params.name || params.email.split('@')[0],
          callbackURL: params.callbackURL,
        }),
      });

      if (res.data?.session?.token) {
        this.saveSessionToken(res.data.session.token);
      }
      return res;
    },
  };

  /**
   * Sign in with Email and Password
   */
  public signIn = {
    email: async (params: SignInEmailParams): Promise<NeonAuthResponse<NeonAuthSessionResult>> => {
      const res = await this.request<NeonAuthSessionResult>('/sign-in/email', {
        method: 'POST',
        body: JSON.stringify({
          email: params.email.trim().toLowerCase(),
          password: params.password,
          callbackURL: params.callbackURL,
        }),
      });

      if (res.data?.session?.token) {
        this.saveSessionToken(res.data.session.token, params.rememberMe ?? true);
      }
      return res;
    },
  };

  /**
   * Retrieve the current session and user
   */
  public async getSession(): Promise<NeonAuthResponse<NeonAuthSessionResult | null>> {
    const res = await this.request<NeonAuthSessionResult>('/get-session', {
      method: 'GET',
    });

    if (res.error && (res.error.status === 401 || res.error.status === 404)) {
      this.clearSessionCache();
      return { data: null, error: null };
    }

    if (res.data && res.data.user) {
      try {
        localStorage.setItem(NEON_SESSION_DATA_KEY, JSON.stringify(res.data));
      } catch {
        // storage unavailable
      }
    }

    return res;
  }

  /**
   * Sign out the active session
   */
  public async signOut(): Promise<NeonAuthResponse<{ success: boolean }>> {
    try {
      await this.request('/sign-out', { method: 'POST' });
    } finally {
      this.clearSessionCache();
    }
    return { data: { success: true }, error: null };
  }
}

/**
 * Singleton client instance
 */
export const authClient = new NeonAuthClient();

/**
 * Factory function conforming to official Better Auth / Neon Auth API
 */
export function createAuthClient(options?: { baseURL?: string }) {
  if (options?.baseURL) {
    return new NeonAuthClient(options.baseURL);
  }
  return authClient;
}
