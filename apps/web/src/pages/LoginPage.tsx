import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Headphones,
  BookOpen,
  LayoutGrid,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Resolve safe post-login destination while preserving query params and avoiding auth redirect loops.
 */
function resolvePostLoginPath(state: unknown): string {
  const from = (state as { from?: { pathname?: string; search?: string } } | null)?.from;
  if (!from?.pathname || /^\/(login|signup|register)(\/|$)/i.test(from.pathname)) {
    return '/';
  }
  return `${from.pathname}${from.search || ''}`;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithNeon, user, isLoading: authLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If redirected with state message (e.g. from logout)
  useEffect(() => {
    const stateSuccess = (location.state as any)?.successMessage;
    if (stateSuccess) {
      setSuccess(stateSuccess);
    }
  }, [location.state]);

  // If already authenticated, redirect to home page (or safe original destination)
  useEffect(() => {
    if (user && !authLoading) {
      navigate(resolvePostLoginPath(location.state), { replace: true });
    }
  }, [user, authLoading, navigate, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedUsername = username.trim().toLowerCase();
    if (!trimmedUsername) {
      setError('Please enter your username or email address.');
      return;
    }

    if (trimmedUsername.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedUsername)) {
        setError('Please enter a valid email address.');
        return;
      }
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (trimmedUsername.includes('@') && loginWithNeon && import.meta.env.VITE_NEON_AUTH_URL) {
        try {
          await loginWithNeon({
            email: trimmedUsername,
            password,
            rememberMe,
          });
        } catch {
          // Fallback to standard login
          await login(trimmedUsername, password, rememberMe);
        }
      } else {
        await login(trimmedUsername, password, rememberMe);
      }
      setSuccess('Login successful! Redirecting...');
      navigate(resolvePostLoginPath(location.state), { replace: true });
    } catch (err: any) {
      console.error('[Login] Request failed', {
        code: err?.code,
        status: err?.response?.status,
      });
      const serverMessage = err?.response?.data?.message || err?.message || '';
      const status = err?.response?.status;

      if (serverMessage.includes('inactive') || serverMessage.includes('disabled')) {
        setError('Your account is inactive. Please contact Admin.');
      } else if (err?.code === 'ECONNABORTED' || err?.code === 'ETIMEDOUT') {
        setError('The login request timed out. Please try again shortly.');
      } else if (
        status === 401 ||
        serverMessage.includes('Invalid') ||
        serverMessage.includes('credentials')
      ) {
        setError('Invalid username or password.');
      } else if (
        (typeof status === 'number' && status >= 500) ||
        serverMessage.includes('database') ||
        serverMessage.includes('DATABASE_URL') ||
        serverMessage.includes('serverless execution') ||
        serverMessage.includes('Unable to connect')
      ) {
        setError('Database connection error. If you recently updated Vercel environment variables, please redeploy in Vercel to apply changes.');
      } else if (err?.message === 'Network Error' || err?.code === 'ERR_NETWORK') {
        setError('Network error: Unable to reach server. Please check your connection.');
      } else {
        setError(serverMessage || 'Invalid username or password.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-[#FAF7EE] dark:bg-[#03261C] transition-colors">
      <div className="w-full max-w-4xl bg-white dark:bg-[#04281E] rounded-3xl shadow-2xl border border-[#E8E1CE] dark:border-[#0F4738] overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">
        
        {/* LEFT SECTION: Botanical Green Brand Panel with Clean Mascot (Matching Signup) */}
        <div className="lg:col-span-5 bg-[#064E3B] p-6 sm:p-8 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#166534]/30">
          
          {/* Top Brand Header */}
          <div className="relative z-10 space-y-1">
            <Link to="/" className="inline-flex items-baseline gap-2 group">
              <span className="text-xl sm:text-2xl font-black font-serif tracking-tight text-white group-hover:text-[#A7F3D0] transition-colors">
                Kathaisolli
              </span>
              <span className="text-sm sm:text-base font-bold font-tamil text-[#FDE047]">
                கதைசொல்லி
              </span>
            </Link>
            <p className="text-[10px] sm:text-xs font-semibold font-tamil tracking-normal text-[#A7F3D0]">
              கற்றலின் கேட்டலே நன்று
            </p>
          </div>

          {/* Center: Friendly Mascot with Soundwaves (Clean transparent artwork, NO white box, NO scribble) */}
          <div className="relative z-10 py-6 sm:py-8 flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
              {/* Sound waves left */}
              <svg
                className="w-5 h-12 text-[#FDE047]/90 transform -scale-x-100 flex-shrink-0"
                viewBox="0 0 24 50"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M18 10 C10 18, 10 32, 18 40" />
                <path d="M12 16 C6 21, 6 29, 12 34" strokeWidth="2" />
                <path d="M6 22 C3 24, 3 26, 6 28" strokeWidth="1.5" />
              </svg>

              {/* Clean Transparent Mascot (150-190px on login) */}
              <img
                src="/mascot.png"
                alt="Kathaisolli Mascot"
                className="w-36 h-36 sm:w-44 sm:h-44 object-contain flex-shrink-0 drop-shadow-lg"
              />

              {/* Sound waves right */}
              <svg
                className="w-5 h-12 text-[#FDE047]/90 flex-shrink-0"
                viewBox="0 0 24 50"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M18 10 C10 18, 10 32, 18 40" />
                <path d="M12 16 C6 21, 6 29, 12 34" strokeWidth="2" />
                <path d="M6 22 C3 24, 3 26, 6 28" strokeWidth="1.5" />
              </svg>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-tamil text-white leading-tight">
              மீண்டும் வரவேற்கிறோம்!
            </h2>
            <p className="text-sm sm:text-base font-serif font-bold text-white mt-1">
              Welcome Back to Kathaisolli!
            </p>
          </div>

          {/* Bottom Features List */}
          <div className="relative z-10 pt-4 border-t border-emerald-700/50 space-y-2.5 text-xs text-stone-100">
            <div className="flex items-center gap-2.5">
              <Headphones className="w-4 h-4 text-[#FDE047] flex-shrink-0" />
              <span>Thousands of Tamil Stories</span>
            </div>
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-[#FDE047] flex-shrink-0" />
              <span>Classical & modern Literature</span>
            </div>
            <div className="flex items-center gap-2.5">
              <LayoutGrid className="w-4 h-4 text-[#FDE047] flex-shrink-0" />
              <span>Your Personal Library</span>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: Login Form Card */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-5">
            
            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-stone-900 dark:text-white tracking-tight">
                Welcome to Kathaisolli
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                Your stories, your world.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-rose-700 dark:text-rose-400 text-xs sm:text-sm animate-in fade-in duration-200"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="flex-1 font-medium">{error}</span>
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div
                role="status"
                className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm animate-in fade-in duration-200"
              >
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold">{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field 1: Username / Email */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Username or Email
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username or email"
                    required
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-[#104434] bg-white dark:bg-[#073224] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Field 2: Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-stone-300 dark:border-[#104434] bg-white dark:bg-[#073224] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-stone-700 dark:text-stone-300 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-[#064E3B] focus:ring-[#064E3B] accent-[#064E3B]"
                  />
                  <span className="font-medium">Remember Me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="font-semibold text-[#064E3B] dark:text-[#A7F3D0] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-6 rounded-full bg-[#064E3B] hover:bg-[#166534] text-white font-bold text-sm shadow-md shadow-emerald-950/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Create Account Link */}
            <p className="text-center text-xs sm:text-sm text-stone-600 dark:text-stone-400 pt-2">
              New to Kathaisolli?{' '}
              <Link
                to="/signup"
                className="font-bold text-[#064E3B] dark:text-[#A7F3D0] hover:underline"
              >
                Create your account.
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
