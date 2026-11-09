import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Leaf,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  X,
  HelpCircle,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminLoginPage: React.FC = () => {
  const { login, sessionExpired, clearSessionExpiredNotice, api } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Reset password modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'உள்நுழைவு தோல்வியடைந்தது. மின்னஞ்சல் மற்றும் கடவுச்சொல்லை சரிபார்க்கவும்.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError('மின்னஞ்சல் முகவரியை உள்ளிடவும்.');
      return;
    }

    setForgotLoading(true);
    setForgotError(null);
    setForgotSuccess(null);

    try {
      const res = await api.auth.forgotPassword(forgotEmail.trim());
      setForgotSuccess(
        res?.message ||
          'கடவுச்சொல் மீட்டெடுப்பு இணைப்பு மின்னஞ்சலுக்கு அனுப்பப்பட்டுள்ளது.',
      );
      if (res?.resetToken) {
        setResetToken(res.resetToken);
      }
    } catch (err: any) {
      setForgotError(
        err?.response?.data?.message ||
          err?.message ||
          'கடவுச்சொல் மீட்டெடுப்பு கோரிக்கையில் பிழை ஏற்பட்டது.',
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken.trim() || !newPassword) {
      setResetError('மீட்டெடுப்பு டோக்கன் மற்றும் புதிய கடவுச்சொல் தேவை.');
      return;
    }
    if (newPassword.length < 8) {
      setResetError('கடவுச்சொல் குறைந்தது 8 எழுத்துக்கள் இருக்க வேண்டும்.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('கடவுச்சொற்கள் பொருந்தவில்லை.');
      return;
    }

    setResetLoading(true);
    setResetError(null);
    setResetSuccess(null);

    try {
      const res = await api.auth.resetPassword({
        token: resetToken.trim(),
        newPassword,
      });
      setResetSuccess(
        res?.message || 'கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது! இப்போது உள்நுழையலாம்.',
      );
      setTimeout(() => {
        setShowResetModal(false);
        setShowForgotModal(false);
      }, 2000);
    } catch (err: any) {
      setResetError(
        err?.response?.data?.message ||
          err?.message ||
          'கடவுச்சொல்லை மாற்றுவதில் பிழை ஏற்பட்டது.',
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7EE] text-[#1F2937] flex items-center justify-center p-4 selection:bg-[#064E3B] selection:text-[#FAF7EE]">
      {/* Background Decorative Botanical Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#064E3B]/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#047857]/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Session Expired Notice */}
        {sessionExpired && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                உங்கள் அமர்வு காலாவதியானது. தொடர மீண்டும் உள்நுழையவும் (Session expired).
              </span>
            </div>
            <button
              onClick={clearSessionExpiredNotice}
              className="text-amber-700 hover:text-amber-900 font-bold ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Login Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E5E7EB] shadow-[0_20px_50px_rgba(6,78,59,0.08)] space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#064E3B] text-emerald-200 border border-[#047857] flex items-center justify-center mx-auto shadow-md">
              <Shield className="w-8 h-8 text-[#A7F3D0]" />
            </div>
            <div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-black font-serif text-[#064E3B] tracking-tight">
                  Kathaisolli
                </span>
                <span className="text-lg font-bold font-tamil text-[#047857]">
                  கதைசொல்லி
                </span>
              </div>
              <p className="text-xs uppercase tracking-widest text-[#047857] font-bold mt-1">
                நிர்வாக மையம் (Admin Portal)
              </p>
            </div>
          </div>

          {/* Role Access Notice */}
          <div className="p-3 rounded-xl bg-[#FAF7EE] border border-emerald-200 text-[11px] text-[#064E3B] flex items-center gap-2">
            <Leaf className="w-4 h-4 text-[#047857] shrink-0" />
            <span>அங்கீகரிக்கப்பட்ட கதைசொல்லி நிர்வாகிகளுக்கு மட்டுமே அனுமதி.</span>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                நிர்வாகி மின்னஞ்சல் (Admin Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kathaisolli.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-700">
                  கடவுச்சொல் (Password)
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-semibold text-[#047857] hover:underline"
                >
                  மறந்துவிட்டதா? (Forgot?)
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>நிர்வாக மையத்தில் உள்நுழைக (Sign In)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-[11px] text-gray-500">
            Kathaisolli Admin Engine • 100% Free Architecture
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-5 border border-gray-200 shadow-2xl relative">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotSuccess(null);
                setForgotError(null);
              }}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#064E3B] flex items-center justify-center mb-3">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                கடவுச்சொல் மீட்டெடுப்பு (Forgot Password)
              </h3>
              <p className="text-xs text-gray-500">
                உங்கள் பதிவுசெய்த நிர்வாகி மின்னஞ்சல் முகவரியை உள்ளிடவும்.
              </p>
            </div>

            {forgotError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <p>{forgotSuccess}</p>
                  <button
                    type="button"
                    onClick={() => setShowResetModal(true)}
                    className="text-emerald-700 underline font-bold mt-1 block"
                  >
                    புதிய கடவுச்சொல்லை அமைக்க இங்கே கிளிக் செய்யவும் →
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">
                  நிர்வாகி மின்னஞ்சல்
                </label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@kathaisolli.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  ரத்து செய் (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {forgotLoading ? 'அனுப்பப்படுகிறது...' : 'மீட்டெடுப்பு கோரிக்கை'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-5 border border-gray-200 shadow-2xl relative">
            <button
              onClick={() => {
                setShowResetModal(false);
                setResetSuccess(null);
                setResetError(null);
              }}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#064E3B] flex items-center justify-center mb-3">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                புதிய கடவுச்சொல் அமைத்தல் (Reset Password)
              </h3>
              <p className="text-xs text-gray-500">
                மீட்டெடுப்பு டோக்கன் மற்றும் புதிய கடவுச்சொல்லை உள்ளிடவும்.
              </p>
            </div>

            {resetError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{resetSuccess}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">
                  மீட்டெடுப்பு டோக்கன் (Reset Token)
                </label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Reset token"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">
                  புதிய கடவுச்சொல் (New Password)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="குறைந்தது 8 எழுத்துக்கள்"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">
                  கடவுச்சொல்லை உறுதிப்படுத்துக (Confirm Password)
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="மறுமுறை கடவுச்சொல்"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  ரத்து செய்
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {resetLoading ? 'மாற்றப்படுகிறது...' : 'கடவுச்சொல் மாற்று'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
