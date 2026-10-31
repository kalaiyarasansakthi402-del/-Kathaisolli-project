import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Headphones, Mail, Lock, User, AlertCircle, Sparkles } from 'lucide-react';
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

    if (password.length < 8) {
      setError('கடவுச்சொல் குறைந்தது 8 எழுத்துக்கள் இருக்க வேண்டும் (At least 8 chars)');
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
      navigate('/home');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'பதிவு செய்வதில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-[#14231E] p-8 sm:p-10 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-700 flex items-center justify-center text-white shadow-md">
            <Headphones className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
            பதிவு செய்க (Create Account)
          </h2>
          <div className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
            <Sparkles className="h-3 w-3" />
            <span>100% இலவச கணக்கு • சந்தா இல்லை</span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              முழு பெயர் (Display Name)
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="எ.கா. கதிர்வேலன்"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#101A16] text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              மின்னஞ்சல் முகவரி (Email Address)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#101A16] text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              கடவுச்சொல் (Password - min 8 chars)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#101A16] text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              பயனர் வகை (Account Type)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('LISTENER')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-colors ${
                  role === 'LISTENER'
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                நேயர் (Listener)
              </button>
              <button
                type="button"
                onClick={() => setRole('CREATOR')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-colors ${
                  role === 'CREATOR'
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                படைப்பாளர் (Creator)
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-50"
          >
            {loading ? 'பதிவு செய்யப்படுகிறது...' : 'இலவச கணக்கு தொடங்கு (Sign Up Free)'}
          </button>
        </form>

        <div className="pt-4 border-t border-emerald-50 dark:border-emerald-900/30 text-center">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            ஏற்கனவே கணக்கு உள்ளதா?{' '}
            <Link to="/login" className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
              உள்நுழையவும்
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
