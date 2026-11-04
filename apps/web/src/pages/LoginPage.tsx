import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles, Phone, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/explore';

  const handleOtpChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const newOtp = [...otp];

    if (cleaned.length > 0) {
      newOtp[index] = cleaned[cleaned.length - 1];
      setOtp(newOtp);
      if (index < 5 && otpInputRefs.current[index + 1]) {
        otpInputRefs.current[index + 1]?.focus();
      }
    } else {
      newOtp[index] = '';
      setOtp(newOtp);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0 && otpInputRefs.current[index - 1]) {
        otpInputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleSendOtp = (e: React.MouseEvent) => {
    e.preventDefault();
    setError(null);
    if (!phoneNumber.trim()) {
      setError('தயவுசெய்து தொலைபேசி எண்ணை உள்ளிடவும் (Please enter phone number)');
      return;
    }
    setOtpSent(true);
    setInfoMessage(`OTP குறியீடு அனுப்பப்பட்டது (OTP sent to ${phoneNumber})`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (loginMethod === 'otp') {
      const code = otp.join('');
      if (code.length < 6) {
        setError('6 இலக்க OTP குறியீட்டை உள்ளிடவும் (Please enter 6-digit OTP)');
        return;
      }
      setLoading(true);
      // Demo listener login on OTP verification
      try {
        await login('listener@kathaisolli.com', 'Listener123!');
        navigate(from, { replace: true });
      } catch (err: any) {
        setError('OTP சரிபார்ப்பில் பிழை ஏற்பட்டது.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email.trim() || !password) {
      setError('மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடவும் (Please enter email and password)');
      return;
    }

    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'மின்னஞ்சல் அல்லது கடவுச்சொல் தவறானது (Invalid email or password)',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-[#F8F5E9] dark:bg-[#033B2B] transition-colors">
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
            Sign in to access your saved library & listening history.
          </p>
        </div>

        {/* Login Method Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#F8F5E9] dark:bg-[#032419] border border-[#E3DCBA] dark:border-[#124835] relative z-10">
          <button
            type="button"
            onClick={() => {
              setLoginMethod('password');
              setError(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              loginMethod === 'password'
                ? 'bg-[#064E3B] text-white shadow-md'
                : 'text-stone-600 dark:text-stone-300 hover:text-[#064E3B]'
            }`}
          >
            Password Login
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod('otp');
              setError(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              loginMethod === 'otp'
                ? 'bg-[#064E3B] text-white shadow-md'
                : 'text-stone-600 dark:text-stone-300 hover:text-[#064E3B]'
            }`}
          >
            Phone / OTP Login
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs relative z-10">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs relative z-10">
            <Sparkles className="h-4 w-4 shrink-0 text-emerald-600" />
            <span className="font-medium">{infoMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {loginMethod === 'password' ? (
            <>
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
                    placeholder="listener@kathaisolli.com"
                    className="w-full pl-11 pr-4 py-3 rounded-full border border-[#D5CEBA] dark:border-[#124835] bg-[#F8F5E9]/60 dark:bg-[#033B2B]/60 text-sm text-[#173D2E] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#064E3B] transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#173D2E] dark:text-stone-200 font-sans">
                    Password (கடவுச்சொல்)
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('கடவுச்சொல் மீட்டெடுப்பு மின்னஞ்சல் அனுப்பப்பட்டுள்ளது (Password reset link sent).');
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
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#173D2E] dark:text-stone-200 mb-1.5 font-sans">
                  Phone Number (தொலைபேசி எண்)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#166534]/60 dark:text-emerald-300/60" />
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-11 pr-4 py-3 rounded-full border border-[#D5CEBA] dark:border-[#124835] bg-[#F8F5E9]/60 dark:bg-[#033B2B]/60 text-sm text-[#173D2E] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#064E3B] transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="px-4 py-2.5 rounded-full bg-[#E8F0E2] dark:bg-[#033B2B] text-[#064E3B] dark:text-[#A7F3D0] border border-[#064E3B]/30 font-bold text-xs hover:bg-[#064E3B] hover:text-white transition-all shrink-0"
                  >
                    {otpSent ? 'Resend' : 'Send OTP'}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div className="p-3.5 rounded-2xl bg-[#E8F0E2]/80 dark:bg-[#033B2B]/80 border border-[#064E3B]/20 space-y-2">
                  <p className="text-[11px] text-[#166534] dark:text-[#A7F3D0] font-medium text-center">
                    6 இலக்க OTP குறியீட்டை உள்ளிடவும் (Enter 6-Digit Code)
                  </p>
                  <div className="flex justify-center gap-2 sm:gap-2.5">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        aria-label={`OTP Digit ${idx + 1}`}
                        className="w-10 h-12 sm:w-11 sm:h-12 text-center text-lg font-bold rounded-xl border border-[#D5CEBA] dark:border-[#124835] bg-white dark:bg-[#083325] text-[#064E3B] dark:text-[#A7F3D0] focus:outline-none focus:ring-2 focus:ring-[#064E3B] shadow-inner"
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-full bg-[#064E3B] hover:bg-[#166534] text-white font-bold text-sm shadow-xl shadow-emerald-950/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? 'சரிபார்க்கிறது...' : loginMethod === 'otp' ? 'Verify & Sign In' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials for Fast Testing */}
        <div className="p-3.5 rounded-2xl bg-[#E8F0E2] dark:bg-[#033B2B] border border-[#064E3B]/15 text-xs text-[#173D2E] dark:text-[#E8F0E2] space-y-1 relative z-10">
          <div className="font-bold text-[#064E3B] dark:text-[#A7F3D0] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fast Test Login (விரைவு சோதனை)</span>
          </div>
          <div className="flex justify-between">
            <span>Email: <code className="font-mono text-[#064E3B] dark:text-[#A7F3D0]">listener@kathaisolli.com</code></span>
          </div>
          <div className="flex justify-between">
            <span>Pass: <code className="font-mono text-[#064E3B] dark:text-[#A7F3D0]">Listener123!</code></span>
          </div>
        </div>

        {/* Register Links */}
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
