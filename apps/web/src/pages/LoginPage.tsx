import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, isLoading } = useAuth();

  const registeredEmail = (location.state as any)?.registeredEmail || '';
  const initialSuccessMessage = (location.state as any)?.successMessage || null;

  const [email, setEmail] = useState(registeredEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(initialSuccessMessage);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  // If already authenticated, redirect away from login
  useEffect(() => {
    if (user && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [user, isLoading, navigate, from]);

  // Pre-fill email if passed from RegisterPage
  useEffect(() => {
    if (registeredEmail && !email) {
      setEmail(registeredEmail);
    }
    if (initialSuccessMessage) {
      setSuccess(initialSuccessMessage);
    }
  }, [registeredEmail, initialSuccessMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('மின்னஞ்சல் முகவரியை உள்ளிடவும் (Please enter your email address)');
      return;
    }

    if (!password) {
      setError('கடவுச்சொல்லை உள்ளிடவும் (Please enter your password)');
      return;
    }

    setLoading(true);

    try {
      await login(trimmedEmail, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(
        err?.message ||
          err?.response?.data?.message ||
          'மின்னஞ்சல் அல்லது கடவுச்சொல் தவறானது (Invalid email or password)',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-[#FAF7EE] dark:bg-[#03261C] transition-colors">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-[#083325] p-7 sm:p-10 rounded-[32px] border-2 border-[#E3DCBA] dark:border-[#124835] shadow-2xl relative overflow-hidden">
        {/* Brand header with App Icon */}
        <div className="text-center space-y-2.5 relative z-10">
          <div className="mx-auto h-16 w-16 rounded-2xl overflow-hidden shadow-lg border-2 border-[#166534]/30 bg-[#F8F5E9] p-1 flex items-center justify-center">
            <img
              src="/app-icon.png"
              alt="Kathaisolli Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#064E3B] dark:text-[#F8F5E9] font-serif tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs font-tamil text-[#166534] dark:text-[#A7F3D0] font-semibold">
            கதைசொல்லி — மீண்டும் உங்கள் கதை உலகிற்கு வருக
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-300">
            Sign in with your email and password to continue.
          </p>
        </div>

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs relative z-10">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span className="font-medium">{success}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs relative z-10">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#173D2E] dark:text-stone-200 mb-1.5 font-sans">
              Email Address (மின்னஞ்சல்)
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#166534]/60 dark:text-emerald-300/60" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-full border border-[#D5CEBA] dark:border-[#124835] bg-[#F8F5E9]/60 dark:bg-[#033B2B]/60 text-sm text-[#173D2E] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#064E3B] transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#173D2E] dark:text-stone-200 font-sans">
                Password (கடவுச்சொல்)
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('கடவுச்சொல் மீட்டெடுப்பு மின்னஞ்சல் அனுப்பப்பட்டுள்ளது (Password reset link sent to your email).');
                }}
                className="text-[11px] font-bold text-[#064E3B] dark:text-[#A7F3D0] hover:underline"
              >
                Forgot Password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#166534]/60 dark:text-emerald-300/60" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-11 pr-11 py-3 rounded-full border border-[#D5CEBA] dark:border-[#124835] bg-[#F8F5E9]/60 dark:bg-[#033B2B]/60 text-sm text-[#173D2E] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#064E3B] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#064E3B] dark:hover:text-[#A7F3D0] p-1 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-full bg-[#064E3B] hover:bg-[#166534] text-white font-bold text-sm shadow-xl shadow-emerald-950/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? 'சரிபார்க்கிறது...' : 'Sign In'}
          </button>
        </form>

        {/* Link to Register */}
        <div className="text-center pt-2 relative z-10 border-t border-[#E3DCBA] dark:border-[#124835]">
          <p className="text-xs text-stone-600 dark:text-stone-300">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-[#064E3B] dark:text-[#A7F3D0] hover:underline ml-1"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
