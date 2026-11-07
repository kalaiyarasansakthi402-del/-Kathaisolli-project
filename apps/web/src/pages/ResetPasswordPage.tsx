import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, KeySquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const tokenFromUrl = searchParams.get('token') || '';
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token.trim()) {
      setError('மீட்டெடுப்பு டோக்கன் தேவை (Reset token is required).');
      return;
    }

    if (password.length < 8) {
      setError('கடவுச்சொல் குறைந்தபட்சம் 8 எழுத்துக்கள் கொண்டிருக்க வேண்டும் (Password must be at least 8 characters).');
      return;
    }

    if (password !== confirmPassword) {
      setError('கடவுச்சொற்கள் பொருந்தவில்லை (Passwords do not match).');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(token.trim(), password);
      setSuccess(res.message);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2500);
    } catch (err: any) {
      setError(err?.message || 'கடவுச்சொல் மாற்றுவதில் பிழை ஏற்பட்டது (Failed to reset password).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-[#FAF7EE] dark:bg-[#03261C] transition-colors">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-[#083325] p-7 sm:p-10 rounded-[32px] border-2 border-[#E3DCBA] dark:border-[#124835] shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-[#E8F0E2] dark:bg-[#064E3B]/40 text-[#064E3B] dark:text-[#A7F3D0] flex items-center justify-center border border-[#064E3B]/20 shadow-sm">
            <KeySquare className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#064E3B] dark:text-[#F8F5E9] font-serif tracking-tight">
            Set New Password
          </h2>
          <p className="text-xs font-tamil text-[#166534] dark:text-[#A7F3D0] font-semibold">
            உங்கள் புதிய கடவுச்சொல்லை உள்ளிடவும்
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-300">
            Please enter your reset token and new password (min. 8 characters).
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-center space-y-3">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300 font-tamil">
              {success}
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Redirecting to login page in a moment...
            </p>
            <Link
              to="/login"
              className="inline-block mt-2 py-2 px-6 rounded-full bg-[#064E3B] text-white text-xs font-bold hover:bg-[#166534] transition-all"
            >
              Sign In Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!tokenFromUrl && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#173D2E] dark:text-stone-200 mb-1.5 font-sans">
                  Reset Token (மீட்டெடுப்பு டோக்கன்)
                </label>
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your reset token here"
                  className="w-full px-4 py-3 rounded-full border border-[#D5CEBA] dark:border-[#124835] bg-[#F8F5E9]/60 dark:bg-[#033B2B]/60 text-sm text-[#173D2E] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#064E3B] transition-all font-mono"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#173D2E] dark:text-stone-200 mb-1.5 font-sans">
                New Password (புதிய கடவுச்சொல்)
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#166534]/60 dark:text-emerald-300/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-11 pr-11 py-3 rounded-full border border-[#D5CEBA] dark:border-[#124835] bg-[#F8F5E9]/60 dark:bg-[#033B2B]/60 text-sm text-[#173D2E] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#064E3B] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#064E3B] dark:hover:text-[#A7F3D0] p-1 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#173D2E] dark:text-stone-200 mb-1.5 font-sans">
                Confirm Password (கடவுச்சொல்லை உறுதிசெய்)
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#166534]/60 dark:text-emerald-300/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your new password"
                  className="w-full pl-11 pr-11 py-3 rounded-full border border-[#D5CEBA] dark:border-[#124835] bg-[#F8F5E9]/60 dark:bg-[#033B2B]/60 text-sm text-[#173D2E] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#064E3B] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-full bg-[#064E3B] hover:bg-[#166534] text-white font-bold text-sm shadow-xl shadow-emerald-950/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? 'மாற்றுகிறது...' : 'Update Password'}
            </button>

            <div className="text-center pt-2 border-t border-[#E3DCBA] dark:border-[#124835]">
              <Link
                to="/login"
                className="text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0] hover:underline"
              >
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
