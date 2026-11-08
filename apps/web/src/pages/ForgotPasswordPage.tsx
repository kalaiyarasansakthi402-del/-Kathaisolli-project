import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Sparkles, Send, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [devResetToken, setDevResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setDevResetToken(null);

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError('தயவுசெய்து உங்கள் மின்னஞ்சல் முகவரியை உள்ளிடவும்.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await forgotPassword(trimmed);
      setSuccess(
        res?.message ||
          'இந்த மின்னஞ்சலில் கணக்கு இருந்தால், கடவுச்சொல் மீட்டெடுப்பு வழிமுறைகள் அனுப்பப்பட்டுள்ளன.'
      );
      if (res?.resetToken) {
        setDevResetToken(res.resetToken);
      }
    } catch (err: any) {
      console.error('[ForgotPassword] Error:', err);
      setError(
        err?.response?.data?.message ||
          'கோரிக்கையை செயலாக்க முடியவில்லை. தயவுசெய்து சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#FAF7EE] dark:bg-[#03261C] transition-colors">
      <div className="w-full max-w-lg bg-white dark:bg-[#04281E] rounded-3xl shadow-2xl border border-[#E8E1CE] dark:border-[#0F4738] p-8 sm:p-10 space-y-6">
        
        {/* Brand & Mascot Icon */}
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
            <span>கடவுச்சொல் மீட்டெடுப்பு (Password Reset)</span>
          </div>

          <h2 className="text-2xl font-black font-serif text-[#064E3B] dark:text-[#FAF7EE]">
            கடவுச்சொல் மறந்துவிட்டதா?
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-sm mx-auto leading-relaxed">
            உங்கள் பதிவுசெய்த மின்னஞ்சல் முகவரியை உள்ளிடவும். புதிய கடவுச்சொல்லை அமைக்கும் இணைப்பை உங்களுக்கு அனுப்புவோம்.
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
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
            <div className="flex items-start gap-3 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600" />
              <span className="flex-1 font-medium">{success}</span>
            </div>

            {devResetToken && (
              <div className="pt-2 border-t border-emerald-200 dark:border-emerald-900/60">
                <Link
                  to={`/reset-password?token=${devResetToken}`}
                  className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#064E3B] hover:bg-[#166534] px-4 py-2 rounded-xl transition-all shadow-sm"
                >
                  <span>உடனடி கடவுச்சொல் மீட்டமைப்பிற்கு செல்க (Open Reset Link)</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              மின்னஞ்சல் முகவரி (Registered Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-[#104434] bg-white dark:bg-[#073224] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-6 rounded-full font-bold text-sm bg-[#064E3B] hover:bg-[#166534] text-white shadow-lg shadow-emerald-950/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>அனுப்பப்படுகிறது...</span>
              </>
            ) : (
              <>
                <span>வழிமுறைகளை அனுப்புக (Send Reset Link)</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

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

export default ForgotPasswordPage;
