import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Leaf, Mail, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/library';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
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
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8F5E9] dark:bg-[#033B2B] transition-colors">
      <div className="max-w-md w-full space-y-7 bg-white dark:bg-[#083325] p-8 sm:p-10 rounded-[32px] border-2 border-[#E3DCBA] dark:border-[#124835] shadow-2xl relative overflow-hidden">
        {/* Subtle decorative leaf watermark */}
        <div className="absolute -top-10 -right-10 text-[#064E3B]/5 dark:text-emerald-400/5 pointer-events-none">
          <Leaf className="w-48 h-48" />
        </div>

        {/* Brand header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="mx-auto h-14 w-14 rounded-full bg-[#064E3B] text-white flex items-center justify-center shadow-lg border-2 border-[#D6A83F]/50">
            <Leaf className="h-7 w-7 text-[#A7F3D0] fill-current" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#064E3B] dark:text-[#F8F5E9] font-serif">
            Welcome Back
          </h2>
          <p className="text-xs font-tamil text-[#166534] dark:text-[#A7F3D0] font-medium">
            கதைசொல்லி — மீண்டும் உங்கள் கதை உலகிற்கு வருக
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-300">
            Sign in to access your saved library & listening history.
          </p>
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
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#166534]/60 dark:text-emerald-300/60" />
              <input
                type="email"
                required
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
                Password
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
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-full border border-[#D5CEBA] dark:border-[#124835] bg-[#F8F5E9]/60 dark:bg-[#033B2B]/60 text-sm text-[#173D2E] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#064E3B] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-full bg-[#064E3B] hover:bg-[#166534] text-white font-bold text-sm shadow-xl shadow-emerald-950/20 transition-all hover:scale-[1.01] disabled:opacity-50 mt-2"
          >
            {loading ? 'சரிபார்க்கிறது...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials for Easy Testing */}
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
              className="font-bold text-[#064E3B] dark:text-[#A7F3D0] hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
