import React, { useState, useEffect } from 'react';
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
  LayoutGrid,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, registerWithNeon, user, isLoading: authLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to home
  useEffect(() => {
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
      setError('Please enter your username or email address.');
      return;
    }

    if (trimmedUsername.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedUsername)) {
        setError('Please enter a valid email address.');
        return;
      }
    } else {
      if (trimmedUsername.length < 3) {
        setError('Username must be at least 3 characters long.');
        return;
      }

      if (trimmedUsername.length > 60) {
        setError('Username must not exceed 60 characters.');
        return;
      }
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

    if (!acceptedTerms) {
      setError('Please accept the Terms & Conditions, User Agreement to create your account.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (trimmedUsername.includes('@') && registerWithNeon && import.meta.env.VITE_NEON_AUTH_URL) {
        try {
          await registerWithNeon({
            email: trimmedUsername,
            password,
            name: trimmedUsername.split('@')[0],
          });
        } catch {
          // Fallback to unified registration
          await register({
            username: trimmedUsername.split('@')[0],
            email: trimmedUsername,
            password,
            phoneNumber: phoneNumber.trim() || undefined,
            acceptedTerms: true,
            autoLogin: true,
          });
        }
      } else {
        await register({
          username: trimmedUsername,
          password,
          phoneNumber: phoneNumber.trim() || undefined,
          email: trimmedUsername.includes('@') ? trimmedUsername : undefined,
          acceptedTerms: true,
          autoLogin: true,
        });
      }

      setSuccess('Your Kathaisolli account has been created successfully!');
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error('[Register] Error:', err);
      const serverMessage = err?.response?.data?.message || err?.message || '';
      const serverErrorDetail = err?.response?.data?.error || '';
      const combinedDetail = `${serverMessage} ${serverErrorDetail}`;
      const status = err?.response?.status;

      if (
        status === 409 ||
        (serverMessage &&
          (serverMessage.includes('already taken') ||
            serverMessage.includes('already exists') ||
            serverMessage.includes('duplicate')))
      ) {
        setError('This username or email is already taken. Please choose another.');
      } else if (
        status === 503 ||
        /database|DATABASE_URL|Unable to connect|P1001|P1002/i.test(combinedDetail)
      ) {
        setError('Database connection error. If you recently updated Vercel environment variables, please redeploy in Vercel to apply changes.');
      } else if (combinedDetail.includes('JWT_ACCESS_SECRET')) {
        setError('Server authentication configuration error: JWT_ACCESS_SECRET is missing in Vercel environment variables.');
      } else if (typeof status === 'number' && status >= 500) {
        setError(
          serverErrorDetail ||
            'Registration service error (HTTP 500). Check Vercel environment variables and deployment logs.',
        );
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
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-[#FAF7EE] dark:bg-[#03261C] transition-colors">
      <div className="w-full max-w-4xl bg-white dark:bg-[#04281E] rounded-3xl shadow-2xl border border-[#E8E1CE] dark:border-[#0F4738] overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">
        
        {/* LEFT SECTION: Botanical Green Brand Panel with Clean Mascot */}
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
              “கற்றலில் கேட்டலே நன்று”
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

              {/* Clean Transparent Mascot (120-160px) */}
              <img
                src="/mascot.png"
                alt="Kathaisolli Mascot"
                className="w-32 h-32 sm:w-36 sm:h-36 object-contain flex-shrink-0 drop-shadow-lg"
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

            <h2 className="text-lg sm:text-xl font-bold font-tamil text-white leading-tight">
              கதைகளின் உலகில் இணைந்திடுங்கள்!
            </h2>
            <p className="text-sm font-serif font-bold text-white mt-1">
              Join Kathaisolli
            </p>
            <p className="text-xs text-[#A7F3D0] mt-0.5">
              Your stories, your world.
            </p>
          </div>

          {/* Bottom Features List */}
          <div className="relative z-10 pt-4 border-t border-emerald-700/50 space-y-2.5 text-xs text-stone-100">
            <div className="flex items-center gap-2.5">
              <Headphones className="w-4 h-4 text-[#FDE047] flex-shrink-0" />
              <span>Unlimited streaming of audiobooks</span>
            </div>
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-[#FDE047] flex-shrink-0" />
              <span>Classical & modern Tamil literature</span>
            </div>
            <div className="flex items-center gap-2.5">
              <LayoutGrid className="w-4 h-4 text-[#FDE047] flex-shrink-0" />
              <span>Build your personal library</span>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: Sign Up Form Card */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-5">
            
            {/* Form Title & Subtitle */}
            <div className="space-y-1">
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

            <form onSubmit={handleSubmit} className="space-y-3.5">
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
                    placeholder="Create your password"
                    required
                    autoComplete="new-password"
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

              {/* Field 3: Confirm Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    autoComplete="new-password"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-stone-300 dark:border-[#104434] bg-white dark:bg-[#073224] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent transition-all shadow-sm"
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
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <span className="text-[11px] text-stone-400 font-medium">(Optional)</span>
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                    autoComplete="tel"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-[#104434] bg-white dark:bg-[#073224] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Mandatory Terms & Conditions, User Agreement Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-700 dark:text-stone-300 select-none">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    required
                    className="mt-0.5 w-4 h-4 rounded border-stone-300 text-[#064E3B] focus:ring-[#064E3B] accent-[#064E3B] shrink-0"
                  />
                  <span className="leading-relaxed">
                    I agree to the{' '}
                    <Link
                      to="/terms"
                      className="font-bold text-[#064E3B] dark:text-[#A7F3D0] hover:underline"
                    >
                      Terms &amp; Conditions
                    </Link>
                    ,{' '}
                    <Link
                      to="/terms"
                      className="font-bold text-[#064E3B] dark:text-[#A7F3D0] hover:underline"
                    >
                      User Agreement
                    </Link>
                    <span className="text-rose-500 ml-0.5">*</span>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !acceptedTerms}
                className="w-full mt-2 py-3 px-6 rounded-full bg-[#064E3B] hover:bg-[#166534] text-white font-bold text-sm shadow-md shadow-emerald-950/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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

            {/* Bottom Login Link */}
            <p className="text-center text-xs sm:text-sm text-stone-600 dark:text-stone-400 pt-2">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-[#064E3B] dark:text-[#A7F3D0] hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
