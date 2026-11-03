import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Mail, Lock, User, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'LISTENER' | 'CREATOR'>('LISTENER');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('கடவுச்சொல் குறைந்தது 6 எழுத்துக்கள் இருக்க வேண்டும் (Password must be at least 6 characters)');
      return;
    }

    setLoading(true);

    try {
      await register({
        email,
        password,
        displayName,
        role,
      });
      navigate('/explore');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'பதிவு செய்வதில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும் (Registration failed)',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8F5E9] dark:bg-[#033B2B] transition-colors">
      <div className="max-w-md w-full space-y-7 bg-white dark:bg-[#083325] p-8 sm:p-10 rounded-[32px] border-2 border-[#E3DCBA] dark:border-[#124835] shadow-2xl relative overflow-hidden">
        {/* Subtle decorative leaf watermark */}
        <div className="absolute -top-10 -right-10 text-[#064E3B]/5 dark:text-emerald-400/5 pointer-events-none">
          <Leaf className="w-48 h-48" />
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="mx-auto h-14 w-14 rounded-full bg-[#064E3B] text-white flex items-center justify-center shadow-lg border-2 border-[#D6A83F]/50">
            <Leaf className="h-7 w-7 text-[#A7F3D0] fill-current" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#064E3B] dark:text-[#F8F5E9] font-serif">
            Create Account
          </h2>
          <p className="text-xs font-tamil text-[#166534] dark:text-[#A7F3D0] font-medium">
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
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
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

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#173D2E] dark:text-stone-200 mb-1.5 font-sans">
              Email Address (மின்னஞ்சல்)
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#166534]/60 dark:text-emerald-300/60" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-full border border-[#D5CEBA] dark:border-[#124835] bg-[#F8F5E9]/60 dark:bg-[#033B2B]/60 text-sm text-[#173D2E] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#064E3B] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#173D2E] dark:text-stone-200 mb-1.5 font-sans">
              Password (கடவுச்சொல்)
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#166534]/60 dark:text-emerald-300/60" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-full border border-[#D5CEBA] dark:border-[#124835] bg-[#F8F5E9]/60 dark:bg-[#033B2B]/60 text-sm text-[#173D2E] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#064E3B] transition-all"
              />
            </div>
          </div>

          {/* Account Role Selector */}
          <div className="pt-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#173D2E] dark:text-stone-200 mb-1.5 font-sans">
              I want to (விருப்பம்)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('LISTENER')}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all ${
                  role === 'LISTENER'
                    ? 'border-[#064E3B] bg-[#E8F0E2] text-[#064E3B] dark:bg-[#033B2B] dark:text-[#A7F3D0]'
                    : 'border-[#D5CEBA] dark:border-[#124835] text-stone-500 hover:bg-stone-50 dark:hover:bg-[#042419]'
                }`}
              >
                Listen Stories (நேயர்)
              </button>
              <button
                type="button"
                onClick={() => setRole('CREATOR')}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all ${
                  role === 'CREATOR'
                    ? 'border-[#064E3B] bg-[#E8F0E2] text-[#064E3B] dark:bg-[#033B2B] dark:text-[#A7F3D0]'
                    : 'border-[#D5CEBA] dark:border-[#124835] text-stone-500 hover:bg-stone-50 dark:hover:bg-[#042419]'
                }`}
              >
                Write / Narrate (படைப்பாளி)
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-full bg-[#064E3B] hover:bg-[#166534] text-white font-bold text-sm shadow-xl shadow-emerald-950/20 transition-all hover:scale-[1.01] disabled:opacity-50 mt-2"
          >
            {loading ? 'பதிவு செய்யப்படுகிறது...' : 'Create Free Account'}
          </button>
        </form>

        {/* Existing account link */}
        <div className="text-center pt-2 relative z-10 border-t border-[#E3DCBA] dark:border-[#124835]">
          <p className="text-xs text-stone-600 dark:text-stone-300">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-[#064E3B] dark:text-[#A7F3D0] hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
