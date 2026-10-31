import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Headphones, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/home';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'மின்னஞ்சல் அல்லது கடவுச்சொல் தவறானது (Invalid credentials)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-[#14231E] p-8 sm:p-10 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-xl">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-700 flex items-center justify-center text-white shadow-md">
            <Headphones className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
            உள்நுழைய (Sign In)
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            கதைசொல்லி — ஒவ்வொரு கதைக்கும் ஒரு குரல்
          </p>
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
              கடவுச்சொல் (Password)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#101A16] text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-50"
          >
            {loading ? 'சரிபார்க்கிறது...' : 'உள்நுழைக (Sign In)'}
          </button>
        </form>

        {/* Guest and Register Links */}
        <div className="pt-4 border-t border-emerald-50 dark:border-emerald-900/30 text-center space-y-3">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            புதிய கணக்கு தொடங்க வேண்டுமா?{' '}
            <Link to="/register" className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
              இலவசமாகப் பதிவு செய்க
            </Link>
          </p>

          <Link
            to="/home"
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium"
          >
            <span>விருந்தினராக தொடரவும் (Browse as Guest)</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
