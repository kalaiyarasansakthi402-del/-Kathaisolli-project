import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [devResetToken, setDevResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setDevResetToken(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setError('மின்னஞ்சல் முகவரியை உள்ளிடவும் (Please enter your email).');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(trimmed);
      setSuccessMessage(res.message);
      if (res.resetToken) {
        setDevResetToken(res.resetToken);
      }
    } catch (err: any) {
      setError(err?.message || 'கடவுச்சொல் மீட்டெடுப்பில் பிழை ஏற்பட்டது (Failed to request password reset).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-[#FAF7EE] dark:bg-[#03261C] transition-colors">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-[#083325] p-7 sm:p-10 rounded-[32px] border-2 border-[#E3DCBA] dark:border-[#124835] shadow-2xl relative overflow-hidden">
        {/* Brand Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-[#E8F0E2] dark:bg-[#064E3B]/40 text-[#064E3B] dark:text-[#A7F3D0] flex items-center justify-center border border-[#064E3B]/20 shadow-sm">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#064E3B] dark:text-[#F8F5E9] font-serif tracking-tight">
            Forgot Password?
          </h2>
          <p className="text-xs font-tamil text-[#166534] dark:text-[#A7F3D0] font-semibold">
            கடவுச்சொல்லை மீட்டெடுக்க உங்கள் மின்னஞ்சலை உள்ளிடவும்
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-300">
            Enter your registered email address and we will provide instructions to reset your password.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {successMessage ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3 text-emerald-800 dark:text-emerald-300 text-xs">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">கோரிக்கை வெற்றிகரமாக பெறப்பட்டது</p>
                <p>{successMessage}</p>
              </div>
            </div>

            {devResetToken && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                <p className="font-bold">Development Reset Link:</p>
                <Link
                  to={`/reset-password?token=${devResetToken}`}
                  className="block text-emerald-700 dark:text-emerald-300 underline break-all font-mono text-[11px]"
                >
                  Click here to proceed to Password Reset
                </Link>
              </div>
            )}

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0] hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-full bg-[#064E3B] hover:bg-[#166534] text-white font-bold text-sm shadow-xl shadow-emerald-950/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? 'அனுப்புகிறது...' : 'Send Reset Instructions'}
            </button>

            <div className="text-center pt-2 border-t border-[#E3DCBA] dark:border-[#124835]">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0] hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
