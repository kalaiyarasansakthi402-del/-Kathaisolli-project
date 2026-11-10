import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Headphones,
  BookOpen,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, user, isLoading: authLoading } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to home
  React.useEffect(() => {
    if (user && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'எளியது (Weak)', color: 'bg-rose-500 text-rose-600' };
    if (score === 2) return { score: 2, label: 'நடுத்தரம் (Medium)', color: 'bg-amber-500 text-amber-600' };
    if (score >= 3) return { score: 3, label: 'வலிமையானது (Strong)', color: 'bg-emerald-600 text-emerald-600' };
    return { score: 1, label: 'எளியது (Weak)', color: 'bg-rose-500 text-rose-600' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Client-side validations
    const trimmedName = displayName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || trimmedName.length < 2) {
      setError('தயவுசெய்து உங்கள் முழு பெயரை உள்ளிடவும் (Please enter your valid full name).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setError('சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும் (Please enter a valid email address).');
      return;
    }

    if (password.length < 8) {
      setError('கடவுச்சொல் குறைந்தது 8 எழுத்துக்கள் இருக்க வேண்டும் (Password must be at least 8 characters).');
      return;
    }

    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError('கடவுச்சொல்லில் எழுத்துக்கள் மற்றும் எண்கள் இரண்டும் இருக்க வேண்டும் (Password must contain letters and numbers).');
      return;
    }

    if (password !== confirmPassword) {
      setError('கடவுச்சொற்கள் பொருந்தவில்லை. மீண்டும் சரிபார்க்கவும் (Passwords do not match).');
      return;
    }

    if (!agreeTerms) {
      setError('தொடர விதிமுறைகள் மற்றும் நிபந்தனைகளை ஏற்க வேண்டும் (Please accept Terms & Conditions).');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        email: trimmedEmail,
        password,
        displayName: trimmedName,
        autoLogin: true,
      });

      setSuccess('கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது! முகப்புப் பக்கத்திற்கு செல்கிறது... (Account created successfully! Redirecting...)');
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1200);
    } catch (err: any) {
      console.error('[Register] Error:', err);
      const serverMessage = err?.response?.data?.message || err?.message;

      if (serverMessage && (serverMessage.includes('already exists') || err?.response?.status === 409)) {
        setError('இந்த மின்னஞ்சல் முகவரியில் ஏற்கனவே ஒரு கணக்கு உள்ளது. உள்நுழைய முயற்சிக்கவும் (An account with this email already exists).');
      } else if (err?.response?.status === 503 || (serverMessage && (serverMessage.includes('database') || serverMessage.includes('DATABASE_URL')))) {
        setError('தரவுத்தள இணைப்பு தற்காலிகமாக கிடைக்கவில்லை. தயவுசெய்து சிறிது நேரம் கழித்து முயற்சிக்கவும் (Database service temporarily unavailable).');
      } else if (err?.message === 'Network Error' || err?.code === 'ERR_NETWORK') {
        setError('சேவையகத்தை தொடர்பு கொள்ள முடியவில்லை. தயவுசெய்து உங்கள் இணைய இணைப்பை சரிபார்க்கவும் (Network error: Unable to reach server).');
      } else {
        setError(serverMessage || 'பதிவு செய்வதில் பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#FAF7EE] dark:bg-[#03261C] transition-colors">
      <div className="w-full max-w-5xl bg-white dark:bg-[#04281E] rounded-3xl shadow-2xl border border-[#E8E1CE] dark:border-[#0F4738] overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">
        
        {/* LEFT SECTION: Mascot & Brand Storytelling */}
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
              தமிழ் கதைகளின் மந்திர உலகம்
            </h3>
            <p className="mt-2 text-xs sm:text-sm font-tamil text-[#A7F3D0] max-w-xs leading-relaxed">
              ஒவ்வொரு கதைக்கும் ஒரு தனித்துவமான குரல். வரலாறும் நன்னெறியும் உங்கள் செவிகளில் ஒலிக்கட்டும்.
            </p>
          </div>

          {/* Features Highlights */}
          <div className="space-y-2.5 relative z-10 border-t border-[#166534]/50 pt-6">
            <div className="flex items-center gap-2 text-xs text-stone-200">
              <CheckCircle2 className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
              <span>100% கட்டணமில்லா ஆடியோ கதைகள் (Zero Paywalls)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-200">
              <Headphones className="w-4 h-4 text-[#A7F3D0] flex-shrink-0" />
              <span>உயர்தர ஒலிப்பதிவு & தொடர் அத்தியாயங்கள்</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-200">
              <BookOpen className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
              <span>தனிப்பயன் நூலகம் & கேட்ட வரலாற்றை சேமிக்கும் வசதி</span>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: Signup Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-6">
            
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F0E2] dark:bg-[#083325] text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0] uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                <span>இலவச கணக்கு (Free Registration)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-serif text-[#064E3B] dark:text-[#FAF7EE]">
                கணக்கை உருவாக்குங்கள்
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                இணைந்து உங்கள் கதை கேட்கும் பயணத்தை இன்றே தொடங்குங்கள்.
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
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  முழு பெயர் (Full Name) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="எ.கா. கலையரசன் (Kalaiyarasan)"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-[#104434] bg-white dark:bg-[#073224] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  மின்னஞ்சல் முகவரி (Email Address) <span className="text-rose-500">*</span>
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
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  கடவுச்சொல் (Password) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="குறைந்தது 8 எழுத்துக்கள்"
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

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex gap-1 h-1 w-full bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                      <div className={`h-full flex-1 ${strength.score >= 1 ? strength.color.split(' ')[0] : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 ${strength.score >= 2 ? strength.color.split(' ')[0] : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 ${strength.score >= 3 ? strength.color.split(' ')[0] : 'bg-transparent'}`} />
                    </div>
                    <p className={`text-[10px] font-bold ${strength.color.split(' ')[1]}`}>
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  கடவுச்சொல்லை உறுதிப்படுத்துக (Confirm Password) <span className="text-rose-500">*</span>
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
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#064E3B] focus:ring-[#064E3B] border-stone-300 dark:border-[#104434] bg-white dark:bg-[#073224] cursor-pointer"
                  />
                  <span className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    கதைசொல்லியின்{' '}
                    <Link to="/terms" className="text-[#064E3B] dark:text-[#A7F3D0] underline font-bold" target="_blank">
                      விதிமுறைகள்
                    </Link>{' '}
                    மற்றும்{' '}
                    <Link to="/privacy" className="text-[#064E3B] dark:text-[#A7F3D0] underline font-bold" target="_blank">
                      தனியுரிமைக் கொள்கையை
                    </Link>{' '}
                    முழுமையாக ஏற்றுக்கொள்கிறேன்.
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
                    <span>கணக்கு உருவாக்கப்படுகிறது...</span>
                  </>
                ) : (
                  <>
                    <span>கணக்கை உருவாக்கு (Create Account)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Navigation Link to Login */}
            <div className="text-center pt-2 border-t border-stone-200 dark:border-[#104434]">
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                ஏற்கனவே கணக்கு உள்ளதா?{' '}
                <Link
                  to="/login"
                  className="font-bold text-[#064E3B] dark:text-[#A7F3D0] hover:underline"
                >
                  உள்நுழையவும் (Log In)
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
