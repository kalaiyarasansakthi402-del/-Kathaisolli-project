import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const { resetPassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('செல்லுபடியாகாத அல்லது காலாவதியான மீட்டெடுப்பு டோக்கன் (Missing or invalid reset token).');
      return;
    }

    if (newPassword.length < 8) {
      setError('புதிய கடவுச்சொல் குறைந்தது 8 எழுத்துக்கள் இருக்க வேண்டும் (Password must be at least 8 characters).');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('கடவுச்சொற்கள் பொருந்தவில்லை (Passwords do not match).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword(token, newPassword);
      setSuccess(res?.message || 'உங்கள் கடவுச்சொல் வெற்றிகரமாக மீட்டமைக்கப்பட்டது!');
      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: {
            successMessage: 'கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது! புதிய கடவுச்சொல்லுடன் உள்நுழையவும்.',
          },
        });
      }, 1500);
    } catch (err: any) {
      console.error('[ResetPassword] Error:', err);
      setError(
        err?.response?.data?.message ||
          'கடவுச்சொல்லை மீட்டமைக்க முடியவில்லை. இணைப்பு காலாவதியாகி இருக்கலாம்.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#FAF7EE] dark:bg-[#03261C] transition-colors">
      <div className="w-full max-w-lg bg-white dark:bg-[#04281E] rounded-3xl shadow-2xl border border-[#E8E1CE] dark:border-[#0F4738] p-8 sm:p-10 space-y-6">
        
        {/* Brand & Mascot */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#064E3B] to-[#043E2F] p-1.5 mx-auto shadow-md border-2 border-[#D97706]/40 flex items-center justify-center">
            <img
              src="/images/mascot.png"
              alt="Kathaisolli Mascot"
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/app-icon.png';
              }}
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F0E2] dark:bg-[#083325] text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0] uppercase tracking-wider">
            <KeyRound className="w-3.5 h-3.5 text-[#D97706]" />
            <span>புதிய கடவுச்சொல் (New Password)</span>
          </div>

          <h2 className="text-2xl font-black font-serif text-[#064E3B] dark:text-[#FAF7EE]">
            புதிய கடவுச்சொல்லை அமைக்கவும்
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-sm mx-auto leading-relaxed">
            உங்கள் கணக்கிற்கான புதிய, பாதுகாப்பான கடவுச்சொல்லை உள்ளிடவும்.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-xs sm:text-sm text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-600" />
            <span className="flex-1 font-medium">{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600" />
            <span className="flex-1 font-medium">
              {success} உள்நுழைவு பக்கத்திற்கு செல்கிறது...
            </span>
          </div>
        )}

        {!token && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-2">
            <p className="font-bold">மீட்டெடுப்பு டோக்கன் காணப்படவில்லை (No Reset Token Found).</p>
            <p>தயவுசெய்து உங்கள் மின்னஞ்சலில் வந்த இணைப்பை சொடுக்கவும் அல்லது புதிய கோரிக்கையை அனுப்பவும்.</p>
            <Link
              to="/forgot-password"
              className="inline-block font-bold text-[#064E3B] dark:text-[#A7F3D0] underline mt-1"
            >
              மீண்டும் கோர (Request Reset Link)
            </Link>
          </div>
        )}

        {/* Form */}
        {token && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                புதிய கடவுச்சொல் (New Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="குறைந்தது 8 எழுத்துக்கள்"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-stone-300 dark:border-[#104434] bg-white dark:bg-[#073224] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                கடவுச்சொல்லை உறுதிப்படுத்துக (Confirm New Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="மீண்டும் கடவுச்சொல்லை உள்ளிடவும்"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-stone-300 dark:border-[#104434] bg-white dark:bg-[#073224] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-full font-bold text-sm bg-[#064E3B] hover:bg-[#166534] text-white shadow-lg shadow-emerald-950/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2 mt-4"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>மாற்றப்படுகிறது...</span>
                </>
              ) : (
                <span>கடவுச்சொல்லை மாற்று (Set New Password)</span>
              )}
            </button>
          </form>
        )}

        {/* Back to Login */}
        <div className="text-center pt-2 border-t border-stone-200 dark:border-[#104434]">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>உள்நுழைவு பக்கத்திற்குத் திரும்பு (Back to Login)</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ResetPasswordPage;
