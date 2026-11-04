import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, user, isLoading } = useAuth();

  // If already authenticated, redirect away from register
  useEffect(() => {
    if (user && !isLoading) {
      navigate('/', { replace: true });
    }
  }, [user, isLoading, navigate]);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 1. Full Name Validation
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setError('முழு பெயரை உள்ளிடவும் (Please enter your full name)');
      return;
    }

    // 2. Email Address Validation
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setError('சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும் (Please enter a valid email address)');
      return;
    }

    // 3. Password Length Security Requirement
    if (password.length < 6) {
      setError('கடவுச்சொல் குறைந்தது 6 எழுத்துக்கள் இருக்க வேண்டும் (Password must be at least 6 characters)');
      return;
    }

    // 4. Confirm Password Match Check
    if (password !== confirmPassword) {
      setError('கடவுச்சொற்கள் பொருந்தவில்லை. மீண்டும் சரிபார்க்கவும் (Passwords do not match)');
      return;
    }

    setLoading(true);

    try {
      // Save Full Name, Email Address, and securely hashed password via existing backend API
      // Note: confirmPassword is not sent to the database
      await register({
        email: trimmedEmail,
        password,
        displayName: trimmedName,
        role: 'LISTENER',
      });

      setSuccess('கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது! (Account created successfully!)');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'பதிவு செய்வதில் பிழை ஏற்பட்டது. மின்னஞ்சல் ஏற்கனவே பயன்பாட்டில் உள்ளதா என சரிபார்க்கவும் (Registration failed. Please check if this email already exists).',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-[#FAF7EE] dark:bg-[#03261C] transition-colors">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-[#083325] p-7 sm:p-10 rounded-[32px] border-2 border-[#E3DCBA] dark:border-[#124835] shadow-2xl relative overflow-hidden">
        {/* Brand Header with App Icon */}
        <div className="text-center space-y-2 relative z-10">
          <div className="mx-auto h-16 w-16 rounded-2xl overflow-hidden shadow-lg border-2 border-[#166534]/30 bg-[#F8F5E9] p-1 flex items-center justify-center">
            <img
              src="/app-icon.png"
              alt="Kathaisolli Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#064E3B] dark:text-[#F8F5E9] font-serif tracking-tight">
            Create Account
          </h2>
          <p className="text-xs font-tamil text-[#166534] dark:text-[#A7F3D0] font-semibold">
            கதைசொல்லி — புதிய வாசகர் கணக்கு
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F0E2] dark:bg-[#033B2B] text-xs text-[#064E3B] dark:text-[#A7F3D0] font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>100% Free Account · Zero Paywalls</span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs relative z-10">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs relative z-10">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span className="font-medium">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* 1. Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#173D2E] dark:text-stone-200 mb-1.5 font-sans">
              Full Name (முழு பெயர்)
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#166534]/60 dark:text-emerald-300/60" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="எ.கா. கதிர்வேலன் (Kathirvelan)"
                className="w-full pl-11 pr-4 py-3 rounded-full border border-[#D5CEBA] dark:border-[#124835] bg-[#F8F5E9]/60 dark:bg-[#033B2B]/60 text-sm text-[#173D2E] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#064E3B] transition-all"
              />
            </div>
          </div>

          {/* 2. Email Address */}
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

          {/* 3. Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#173D2E] dark:text-stone-200 mb-1.5 font-sans">
              Password (கடவுச்சொல்)
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#166534]/60 dark:text-emerald-300/60" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="குறைந்தது 6 எழுத்துக்கள்"
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

          {/* 4. Confirm Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#173D2E] dark:text-stone-200 mb-1.5 font-sans">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#166534]/60 dark:text-emerald-300/60" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="கடவுச்சொல்லை மீண்டும் உள்ளிடவும்"
                className={`w-full pl-11 pr-11 py-3 rounded-full border bg-[#F8F5E9]/60 dark:bg-[#033B2B]/60 text-sm text-[#173D2E] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 transition-all ${
                  confirmPassword && confirmPassword !== password
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-[#D5CEBA] dark:border-[#124835] focus:ring-[#064E3B]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#064E3B] dark:hover:text-[#A7F3D0] p-1 transition-colors"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 pl-3">
                Passwords do not match. (கடவுச்சொற்கள் பொருந்தவில்லை)
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-full bg-[#064E3B] hover:bg-[#166534] text-white font-bold text-sm shadow-xl shadow-emerald-950/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? 'பதிவு செய்யப்படுகிறது...' : 'Create Free Account'}
          </button>
        </form>

        {/* Link to Login */}
        <div className="text-center pt-2 relative z-10 border-t border-[#E3DCBA] dark:border-[#124835]">
          <p className="text-xs text-stone-600 dark:text-stone-300">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-[#064E3B] dark:text-[#A7F3D0] hover:underline ml-1"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
