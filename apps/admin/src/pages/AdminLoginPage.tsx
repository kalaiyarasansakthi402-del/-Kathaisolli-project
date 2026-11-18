import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  AlertCircle,
  LogIn,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  X,
  Sparkles,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

const REMEMBER_KEY = 'kathaisolli_admin_remembered_email';

export const AdminLoginPage: React.FC = () => {
  const { login, sessionExpired, clearSessionExpiredNotice, api } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(() => {
    return localStorage.getItem(REMEMBER_KEY) || '';
  });
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    return Boolean(localStorage.getItem(REMEMBER_KEY));
  });
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

  const handleImageFallback = (e: React.SyntheticEvent<HTMLImageElement, Event>, fallbackSrc: string) => {
    const el = e.currentTarget;
    if (!el.dataset.fallbackApplied) {
      el.dataset.fallbackApplied = 'true';
      el.src = fallbackSrc;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (rememberMe) {
        localStorage.setItem(REMEMBER_KEY, email.trim());
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

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
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        'கடவுச்சொல் மீட்டெடுப்பு கோரிக்கையில் பிழை ஏற்பட்டது.';
      setForgotError(serverMsg);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken.trim()) {
      setResetError('மீட்டெடுப்பு டோக்கனை உள்ளிடவும்.');
      return;
    }
    if (newPassword.length < 6) {
      setResetError('புதிய கடவுச்சொல் குறைந்தது 6 எழுத்துகள் கொண்டிருக்க வேண்டும்.');
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
    <div className="min-h-screen w-full bg-[#063826] flex items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-emerald-600 selection:text-white">
      {/* Outer Card Container matching botanical green theme */}
      <div className="w-full max-w-5xl bg-gradient-to-br from-[#064E3B] via-[#053d2f] to-[#04281e] rounded-[32px] sm:rounded-[40px] shadow-2xl border border-emerald-700/40 overflow-hidden flex flex-col lg:flex-row min-h-[580px] relative">
        
        {/* LEFT PANEL: Branding & Mascot Illustration */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-between items-center text-center relative overflow-hidden">
          {/* Ambient blur lighting */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Section */}
          <div className="space-y-4 my-auto relative z-10 flex flex-col items-center">
            {/* Mascot Character with fallback */}
            <div className="w-36 h-36 sm:w-44 sm:h-44 relative flex items-center justify-center drop-shadow-2xl mb-2">
              <img
                src="/admin/mascot.png"
                onError={(e) => handleImageFallback(e, '/mascot.png')}
                alt="Kathaisolli Mascot"
                className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
              />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-3xl sm:text-4xl font-black text-white font-serif tracking-tight drop-shadow-md">
                Kathaisolli
              </h1>
              <p className="text-2xl sm:text-2xl font-bold font-tamil text-[#34D399] tracking-wide">
                கதைசொல்லி
              </p>
            </div>

            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-500/50 text-[#A7F3D0] text-xs font-bold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-[#34D399]" />
              <span>Admin Portal</span>
            </div>

            <p className="text-emerald-100/90 text-xs sm:text-sm font-medium max-w-xs leading-relaxed pt-1">
              Manage Books, Audio, Images and App Content
            </p>
          </div>

          {/* Bottom Hill Illustration Art */}
          <div className="w-full max-w-sm mt-4 relative z-10 opacity-90">
            <img
              src="/admin/3.png"
              onError={(e) => handleImageFallback(e, '/3.png')}
              alt="Kathaisolli Library Landscape"
              className="w-full h-28 object-contain rounded-2xl mx-auto drop-shadow-md"
            />
          </div>
        </div>

        {/* RIGHT PANEL: White Admin Login Card */}
        <div className="w-full lg:w-1/2 bg-white p-8 sm:p-12 lg:p-14 flex flex-col justify-center relative">
          <div className="w-full max-w-md mx-auto space-y-6">
            
            {/* Header Shield & Titles */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#047857] flex items-center justify-center mx-auto shadow-sm">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-sans tracking-tight">
                Admin Login
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Sign in to manage Kathaisolli content
              </p>
            </div>

            {/* Session Expired Alert */}
            {sessionExpired && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>உங்கள் அமர்வு காலாவதியானது. மீண்டும் உள்நுழையவும்.</span>
                </div>
                <button onClick={clearSessionExpiredNotice} className="text-amber-800 hover:text-amber-950 p-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Admin Email */}
              <div className="space-y-1">
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Admin Email"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-11 pr-11 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-gray-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#064E3B] focus:ring-[#064E3B] border-gray-300 cursor-pointer"
                  />
                  <span>Remember Me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="font-semibold text-[#047857] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#064E3B] hover:bg-[#047857] active:bg-[#033A2C] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Login to Admin</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center text-[11px] text-gray-400">
              கதைசொல்லி நிர்வாகக் கட்டுப்பாட்டு மையம் • Kathaisolli Admin
            </div>
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
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 p-1"
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
                  ரத்து செய்
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {forgotLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>அனுப்புக</span>
                  )}
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
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">
                புதிய கடவுச்சொல் அமைத்தல்
              </h3>
              <p className="text-xs text-gray-500">
                மின்னஞ்சலில் பெறப்பட்ட டோக்கன் மற்றும் புதிய கடவுச்சொல்லை உள்ளிடவும்.
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

            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">
                  மீட்டெடுப்பு டோக்கன் (Reset Token)
                </label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="e.g. 4f9a..."
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">
                  புதிய கடவுச்சொல்
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">
                  கடவுச்சொல்லை உறுதிப்படுத்துக
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
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
                  className="flex-1 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {resetLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>மாற்று</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
