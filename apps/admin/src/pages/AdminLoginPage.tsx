import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, AlertCircle, ArrowRight, Leaf } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@kathaisolli.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err?.message || 'அங்கீகரிக்கப்படாத உள்நுழைவு (Unauthorized: Admin credentials required).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#041E16] text-[#E8F0E2] flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-emerald-950">
      <div className="w-full max-w-md space-y-8 p-8 sm:p-10 rounded-3xl bg-[#06281E]/95 border border-emerald-900/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-700/80 text-emerald-200 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-black font-serif text-white tracking-tight">
                Kathaisolli
              </span>
              <span className="text-base font-bold font-tamil text-emerald-400">
                கதைசொல்லி
              </span>
            </div>
            <p className="text-xs uppercase tracking-widest text-emerald-400/80 font-bold mt-1">
              தனிப்பட்ட தலைமை நிர்வாக மையம் (Private Admin Portal)
            </p>
          </div>
        </div>

        {/* Notice Badge */}
        <div className="p-3 rounded-xl bg-[#031812] border border-emerald-800/40 text-[11px] text-emerald-300 flex items-center gap-2">
          <Leaf className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>அங்கீகரிக்கப்பட்ட நிர்வாகிகளுக்கு மட்டுமே அனுமதி. பொதுப் பயனர்கள் அணுக முடியாது.</span>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-emerald-200">
              நிர்வாகி மின்னஞ்சல் (Admin Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kathaisolli.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#031812] border border-emerald-800/70 text-sm text-white placeholder:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-emerald-200">
              கடவுச்சொல் (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#031812] border border-emerald-800/70 text-sm text-white placeholder:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-emerald-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>நிர்வாக மையத்தில் உள்நுழைக (Enter Admin)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-[11px] text-emerald-500/70">
          Kathaisolli Admin Engine • Connected to Firebase & Cloudflare D1
        </div>
      </div>
    </div>
  );
};
