import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Shield,
  Calendar,
  Bookmark,
  History,
  Settings as SettingsIcon,
  LogOut,
  Copy,
  Check,
  CheckCircle2,
  Headphones,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const player = usePlayer();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Derive unique 5-digit user ID
  const formattedUserId = React.useMemo(() => {
    if (!user?.id) return 'KTH-10001';
    if ((user as any).publicId) return (user as any).publicId;
    let hash = 0;
    for (let i = 0; i < user.id.length; i++) {
      hash = (hash * 31 + user.id.charCodeAt(i)) | 0;
    }
    const num = Math.abs(hash % 90000) + 10000;
    return `KTH-${num}`;
  }, [user]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(formattedUserId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (player?.stop) {
        player.stop();
      }
      await logout();
      navigate('/login', {
        replace: true,
        state: {
          successMessage: 'வெற்றிகரமாக வெளியேறிவிட்டீர்கள் (Signed out successfully).',
        },
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const registrationDate = React.useMemo(() => {
    if (!user?.createdAt) return 'நவம்பர் 2026';
    try {
      const d = new Date(user.createdAt);
      return d.toLocaleDateString('ta-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'நவம்பர் 2026';
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#064E3B]/10 text-[#064E3B] flex items-center justify-center">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 font-serif">
          உள்நுழைவு தேவை (Login Required)
        </h2>
        <p className="text-xs text-stone-500 max-w-sm">
          உங்கள் சுயவிவரத்தைக் காண தயவுசெய்து உள்நுழையவும்.
        </p>
        <Link
          to="/login"
          className="px-6 py-2.5 rounded-full bg-[#064E3B] text-white font-bold text-xs hover:bg-[#166534] transition-all shadow-md"
        >
          உள்நுழை (Sign In)
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Profile Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#064E3B] via-[#095742] to-[#04281E] text-white p-6 sm:p-8 shadow-xl shadow-emerald-950/20 overflow-hidden border border-emerald-800/40">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar with Mascot */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-[#F8F5E9] text-[#064E3B] p-1 flex items-center justify-center shadow-lg border-2 border-[#D6A83F]/60">
              <img
                src="/images/mascot.png"
                alt="Kathaisolli Mascot"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/app-icon.png';
                }}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-[#04281E] shadow-sm">
              <Headphones className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white">
                  {user.displayName || 'கதை நேயர்'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  செயலில் உள்ளது (Active)
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 font-medium mt-1">
                {user.email}
              </p>
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              {/* Unique User ID Badge */}
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono font-bold text-white transition-all group"
                title="Click to copy User ID"
              >
                <span>User ID:</span>
                <span className="text-[#FBBF24]">{formattedUserId}</span>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-white/60 group-hover:text-white" />
                )}
              </button>

              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs font-semibold text-emerald-100">
                <Shield className="w-3.5 h-3.5 text-emerald-300" />
                <span>Role: USER (நேயர்)</span>
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs font-semibold text-emerald-100">
                <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                <span>{registrationDate}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Details & Quick Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Nav 1: My Library */}
        <Link
          to="/my-library"
          className="p-6 rounded-2xl bg-white dark:bg-[#073224] border border-[#E8E1CE] dark:border-[#0E4738] shadow-sm hover:shadow-md hover:border-[#064E3B] transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#064E3B] dark:text-[#A7F3D0] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-100 font-serif">
            எனது நூலகம் (My Library)
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            சேமிக்கப்பட்ட கதைகள் மற்றும் பிடித்த ஆடியோ புத்தகங்கள்.
          </p>
        </Link>

        {/* Quick Nav 2: Listening History */}
        <Link
          to="/my-library?tab=history"
          className="p-6 rounded-2xl bg-white dark:bg-[#073224] border border-[#E8E1CE] dark:border-[#0E4738] shadow-sm hover:shadow-md hover:border-[#064E3B] transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#064E3B] dark:text-[#A7F3D0] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-100 font-serif">
            கேட்ட வரலாறு (Listening History)
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            நீங்கள் கேட்டுக்கொண்டிருக்கும் கதைகளைத் தொடருங்கள்.
          </p>
        </Link>

        {/* Quick Nav 3: Settings */}
        <Link
          to="/settings"
          className="p-6 rounded-2xl bg-white dark:bg-[#073224] border border-[#E8E1CE] dark:border-[#0E4738] shadow-sm hover:shadow-md hover:border-[#064E3B] transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#064E3B] dark:text-[#A7F3D0] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-100 font-serif">
            அமைப்புகள் (Settings)
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            மொழி, ஆடியோ தரம் மற்றும் கணக்கு விருப்பங்கள்.
          </p>
        </Link>
      </div>

      {/* Account Info Details Table */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#073224] border border-[#E8E1CE] dark:border-[#0E4738] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-[#064E3B] dark:text-[#A7F3D0]" />
          <span>கணக்கு விவரங்கள் (Account Information)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#FAF7EE] dark:bg-[#03261C] border border-[#E8E1CE] dark:border-[#104434]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              தனிப்பட்ட பயனர் எண் (User ID)
            </p>
            <p className="text-sm font-bold text-[#064E3B] dark:text-[#A7F3D0] font-mono mt-0.5">
              {formattedUserId}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF7EE] dark:bg-[#03261C] border border-[#E8E1CE] dark:border-[#104434]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              பெயர் (Display Name)
            </p>
            <p className="text-sm font-bold text-stone-800 dark:text-stone-100 mt-0.5">
              {user.displayName || 'கதை நேயர்'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF7EE] dark:bg-[#03261C] border border-[#E8E1CE] dark:border-[#104434]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              மின்னஞ்சல் முகவரி (Email)
            </p>
            <p className="text-sm font-bold text-stone-800 dark:text-stone-100 mt-0.5 truncate">
              {user.email}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF7EE] dark:bg-[#03261C] border border-[#E8E1CE] dark:border-[#104434]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              பதிவு செய்யப்பட்ட தேதி (Registered Date)
            </p>
            <p className="text-sm font-bold text-stone-800 dark:text-stone-100 mt-0.5">
              {registrationDate}
            </p>
          </div>
        </div>

        {/* Sign Out Action Button */}
        <div className="pt-4 border-t border-[#E8E1CE] dark:border-[#104434] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            கணக்கிலிருந்து பாதுகாப்பாக வெளியேற:
          </p>
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={handleLogout}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 font-bold text-xs transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{isLoggingOut ? 'வெளியேறுகிறது...' : 'வெளியேறு (Sign Out)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
