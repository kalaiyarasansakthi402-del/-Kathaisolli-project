import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Lock,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Headphones,
  BookOpen,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, user, isLoading: authLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to home
  React.useEffect(() => {
    if (user && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedUsername = username.trim().toLowerCase();

    if (!trimmedUsername) {
      setError('Please enter your username.');
      return;
    }

    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }

    if (trimmedUsername.length > 60) {
      setError('Username must not exceed 60 characters.');
      return;
    }

    if (!password) {
      setError('Please create your password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!confirmPassword) {
      setError('Please confirm your password.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        username: trimmedUsername,
        password,
        phoneNumber: phoneNumber.trim() || undefined,
        autoLogin: true,
      });

      setSuccess('Your Kathaisolli account has been created successfully!');
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1200);
    } catch (err: any) {
      console.error('[Register] Error:', err);
      const serverMessage = err?.response?.data?.message || err?.message;

      if (
        err?.response?.status === 409 ||
        (serverMessage &&
          (serverMessage.includes('already taken') ||
            serverMessage.includes('already exists') ||
            serverMessage.includes('duplicate')))
      ) {
        setError('This username is already taken. Please choose another username.');
      } else if (
        err?.response?.status === 503 ||
        (serverMessage &&
          (serverMessage.includes('database') ||
            serverMessage.includes('DATABASE_URL')))
      ) {
        setError('Database service temporarily unavailable. Please try again shortly.');
      } else if (err?.message === 'Network Error' || err?.code === 'ERR_NETWORK') {
        setError('Network error: Unable to reach server. Please check your connection.');
      } else {
        setError(serverMessage || 'Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#FAF7EE] dark:bg-[#03261C] transition-colors">
      <div className="w-full max-w-5xl bg-white dark:bg-[#04281E] rounded-3xl shadow-2xl border border-[#E8E1CE] dark:border-[#0F4738] overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">
        
        {/* LEFT SECTION: Brand Storytelling & Mascot */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#064E3B] via-[#043E2F] to-[#02261C] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#166534]/30">
          {/* Subtle Background Glows */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#D97706]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#A7F3D0]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10 space-y-2">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <span className="text-2xl font-black font-serif tracking-tight text-[#FAF7EE] group-hover:text-[#A7F3D0] transition-colors">
                Kathaisolli
              </span>
              <span className="text-sm font-bold font-tamil text-[#D97706]">
                கதைசொல்லி
              </span>
            </Link>
            <p className="text-xs text-[#A7F3D0]/80 tracking-wide">
              ஒவ்வொரு கதைக்கும் ஒரு குரல் • Every Story Has A Voice
            </p>
          </div>

          {/* Center: Friendly Mascot Visual */}
          <div className="relative z-10 py-6 sm:py-8 flex flex-col items-center text-center">
            <div className="relative mb-5 group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-[#0F5132] to-[#1E7E34] border-4 border-[#A7F3D0]/30 shadow-2xl flex items-center justify-center p-3 transform transition-transform group-hover:scale-105 duration-300">
                <img
                  src="/mascot.png"
                  alt="Kathaisolli Parrot Mascot"
                  className="w-full h-full object-contain filter drop-shadow-md"
                  onError={(e) => {
                    // Fallback to stylized headphones icon if mascot image is missing
                    (e.target as HTMLElement).style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `
                      <div class="flex items-center justify-center text-[#FAF7EE]">
                        <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 2a9 9 0 0 0-9 9v7a3 3 0 0 0 3 3h1a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5a7 7 0 1 1 14 0h-2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h1a3 3 0 0 0 3-3v-7a9 9 0 0 0-9-9z"></path>
                        </svg>
                      </div>
                    `;
                  }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#D97706] text-white p-2 rounded-full shadow-lg border-2 border-[#064E3B]">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            <h3 className="text-lg sm:text-xl font-bold font-serif text-[#FAF7EE] tracking-tight">
              Join Kathaisolli
            </h3>
            <p className="text-xs sm:text-sm text-[#A7F3D0]/80 mt-1 max-w-xs font-tamil">
              Your stories, your world.
            </p>
          </div>

          {/* Bottom Features List */}
          <div className="relative z-10 pt-4 border-t border-emerald-800/40 space-y-2">
            <div className="flex items-center gap-2.5 text-xs text-[#E8F0E2]">
              <Headphones className="w-4 h-4 text-[#D97706]" />
              <span>Unlimited streaming of thousands of audio stories</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#E8F0E2]">
              <BookOpen className="w-4 h-4 text-[#D97706]" />
              <span>Full access to classical & modern Tamil literature</span>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: Sign Up Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            {/* Form Title & Subtitle */}
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-stone-900 dark:text-white tracking-tight">
                Create Your Account
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                Join Kathaisolli – Your stories, your world.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-rose-700 dark:text-rose-400 text-xs sm:text-sm animate-in fade-in duration-200"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div
                role="status"
                className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-3 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm animate-in fade-in duration-200"
              >
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold leading-relaxed">{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field 1: Username */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username."
                    required
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-[#104434] bg-white dark:bg-[#073224] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent transition-all shadow-sm font-medium"
                  />
                </div>
              </div>

              {/* Field 2: Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create your password."
                    required
                    autoComplete="new-password"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-stone-300 dark:border-[#104434] bg-white dark:bg-[#073224] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent transition-all shadow-sm font-medium"
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

              {/* Field 3: Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password."
                    required
                    autoComplete="new-password"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-stone-300 dark:border-[#104434] bg-white dark:bg-[#073224] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent transition-all shadow-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Field 4: Phone Number (Optional) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Phone Number</span>
                  <span className="text-[10px] text-stone-400 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number."
                    autoComplete="tel"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-[#104434] bg-white dark:bg-[#073224] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent transition-all shadow-sm font-medium"
                  />
                </div>
              </div>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 rounded-full font-bold text-sm bg-[#064E3B] hover:bg-[#166534] text-white shadow-lg shadow-emerald-950/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Link to Login Page */}
            <div className="pt-4 border-t border-stone-200 dark:border-[#104434] text-center">
              <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-bold text-[#064E3B] dark:text-[#A7F3D0] hover:underline transition-colors"
                >
                  Login
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
