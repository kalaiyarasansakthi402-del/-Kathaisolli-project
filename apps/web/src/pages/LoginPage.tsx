import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Headphones,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If redirected with state message (e.g. from registration or logout)
  useEffect(() => {
    const stateSuccess = (location.state as any)?.successMessage;
    if (stateSuccess) {
      setSuccess(stateSuccess);
    }
  }, [location.state]);

  // If already authenticated, redirect away from login
  useEffect(() => {
    if (user && !authLoading) {
      const returnTo = (location.state as any)?.from?.pathname || '/';
      navigate(returnTo, { replace: true });
    }
  }, [user, authLoading, navigate, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('தயவுசெய்து உங்கள் மின்னஞ்சல் முகவரியை உள்ளிடவும் (Please enter email address).');
      return;
    }

    if (!password) {
      setError('தயவுசெய்து கடவுச்சொல்லை உள்ளிடவும் (Please enter password).');
      return;
    }

    setIsSubmitting(true);

    try {
      await login(trimmedEmail, password, rememberMe);
      setSuccess('உள்நுழைவு வெற்றிகரமானது! (Login successful! Redirecting...)');

      const returnTo = (location.state as any)?.from?.pathname || '/';
      setTimeout(() => {
        navigate(returnTo, { replace: true });
      }, 500);
    } catch (err: any) {
      console.error('[Login] Error:', err);
      const serverMessage = err?.response?.data?.message || err?.message;

      if (err?.response?.status === 401 || (serverMessage && serverMessage.includes('Invalid email or password'))) {
        setError('தவறான மின்னஞ்சல் அல்லது கடவுச்சொல். மீண்டும் முயற்சிக்கவும் (Invalid email or password).');
      } else if (err?.message === 'Network Error' || err?.code === 'ERR_NETWORK') {
        setError('சேவையகத்தை தொடர்பு கொள்ள முடியவில்லை. தயவுசெய்து உங்கள் இணைய இணைப்பை சரிபார்க்கவும் (Network error: Unable to reach server).');
      } else {
        setError(serverMessage || 'உள்நுழைவதில் பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#FAF7EE] dark:bg-[#03261C] transition-colors">
      <div className="w-full max-w-4xl bg-white dark:bg-[#04281E] rounded-3xl shadow-2xl border border-[#E8E1CE] dark:border-[#0F4738] overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">
        
        {/* LEFT SECTION: Mascot & Welcome Back */}
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
            <p className="text-xs font-semibold uppercase tracking-widest text-[#A7F3D0]">
              By Anzles · 100% Free Platform
            </p>
          </div>

          {/* Mascot Centerpiece */}
          <div className="my-8 flex flex-col items-center text-center relative z-10">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#F59E0B]/30 to-[#10B981]/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse" />
              <img
                src="/images/mascot.png"
                alt="Kathaisolli Yellow Mascot with Headphones"
                className="w-40 h-40 sm:w-48 sm:h-48 object-contain rounded-2xl relative z-10 shadow-2xl shadow-black/40 border-2 border-[#F59E0B]/50 transform hover:scale-105 transition-transform duration-300 bg-[#FAF7EE]/90 p-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/app-icon.png';
                }}
              />
            </div>

            <h3 className="mt-6 text-xl font-black font-serif text-[#FAF7EE] tracking-wide">
              மீண்டும் நல்வரவு!
            </h3>
            <p className="mt-2 text-xs sm:text-sm font-tamil text-[#A7F3D0] max-w-xs leading-relaxed">
              உங்கள் சேமித்த கதைகள் மற்றும் கேட்ட வரலாற்றைத் தொடர உங்கள் கணக்கில் உள்நுழையவும்.
            </p>
          </div>

          {/* Quick Info */}
          <div className="space-y-2 relative z-10 border-t border-[#166534]/50 pt-5 text-xs text-stone-200">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-[#A7F3D0]" />
              <span>தொடர் ஆடியோ அனுபவம் (Continuous Listening)</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#F59E0B]" />
              <span>சாதனங்கள் முழுவதும் தனிப்பயன் நூலகம்</span>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-6">
            
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F0E2] dark:bg-[#083325] text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0] uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                <span>உள்நுழைவு (Sign In)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-serif text-[#064E3B] dark:text-[#FAF7EE]">
                கதைசொல்லிக்கு உள்நுழைக
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                உங்கள் மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.
              </p>
            </div>

            {/* Error / Success Alerts */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-xs sm:text-sm text-rose-700 dark:text-rose-300 animate-in fade-in">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-600" />
                <span className="flex-1 font-medium">{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600" />
                <span className="flex-1 font-medium">{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  மின்னஞ்சல் முகவரி (Email Address)
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

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    கடவுச்சொல் (Password)
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0] hover:underline"
                  >
                    கடவுச்சொல் மறந்ததா?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="உங்கள் கடவுச்சொல்"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {/* Remember Me Checkbox */}
              <div className="pt-1 flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#064E3B] focus:ring-[#064E3B] border-stone-300 dark:border-[#104434] bg-white dark:bg-[#073224] cursor-pointer"
                  />
                  <span className="text-xs text-stone-600 dark:text-stone-300 font-medium">
                    என்னை நினைவில் கொள் (Remember Me)
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 rounded-full font-bold text-sm bg-[#064E3B] hover:bg-[#166534] text-white shadow-lg shadow-emerald-950/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>சரிபார்க்கப்படுகிறது...</span>
                  </>
                ) : (
                  <>
                    <span>உள்நுழைக (Sign In)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Navigation Link to Register */}
            <div className="text-center pt-2 border-t border-stone-200 dark:border-[#104434]">
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                புதியவரா? கணக்கு இல்லையா?{' '}
                <Link
                  to="/register"
                  className="font-bold text-[#064E3B] dark:text-[#A7F3D0] hover:underline"
                >
                  கணக்கை உருவாக்குங்கள் (Create Account)
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
