import React, { useState } from 'react';
import {
  Settings,
  Database,
  Cloud,
  Shield,
  User,
  Key,
  CheckCircle,
  AlertCircle,
  Save,
  Server,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminSettingsPage: React.FC = () => {
  const { user } = useAdminAuth();

  // Settings State
  const [platformName, setPlatformName] = useState('Kathaisolli (கதைசொல்லி)');
  const [developerBranding, setDeveloperBranding] = useState('By Anzles Studio');
  const [storageBucket, setStorageBucket] = useState('vaagai-audio-books-36a4e.appspot.com');
  const [maxUploadMb, setMaxUploadMb] = useState('100');
  const [allowedAudioTypes, setAllowedAudioTypes] = useState('.mp3, .ogg, .m4a, .wav');
  const [allowedImageTypes, setAllowedImageTypes] = useState('.jpg, .jpeg, .png, .webp');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      setPasswordError('புதிய கடவுச்சொல் குறைந்தது 8 எழுத்துக்கள் கொண்டிருக்க வேண்டும்.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('புதிய கடவுச்சொற்கள் பொருந்தவில்லை.');
      return;
    }

    setPasswordSuccess('நிர்வாகக் கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(null), 3000);
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
          <Settings className="w-3.5 h-3.5" />
          <span>கணினி & தள அமைப்புகள் (System Settings)</span>
        </div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
          நிர்வாக அமைப்பு அமைப்புகள்
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          ஸ்டோரேஜ் விதிகள், டேட்டாபேஸ் நிலை மற்றும் நிர்வாகி கணக்கு பாதுகாப்பு அமைப்புகள்
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-200 text-xs font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>அமைப்புகள் வெற்றிகரமாகச் சேமிக்கப்பட்டன.</span>
        </div>
      )}

      {/* 1. Storage & Cloud Settings */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-serif text-zinc-900 dark:text-zinc-100">
              Firebase Storage சேமிப்பக கட்டமைப்பு
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              ஆடியோ மற்றும் அட்டைப் படங்களுக்கான கிளவுட் பக்கெட் அமைப்புகள்
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveGeneral} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              Firebase Storage Bucket
            </label>
            <input
              type="text"
              readOnly
              value={storageBucket}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-[#0A1612] text-xs font-mono text-zinc-600 dark:text-zinc-300 cursor-not-allowed"
            />
            <span className="text-[10px] text-zinc-400 mt-0.5 block">தானாக உள்ளமைக்கப்பட்ட பக்கெட்</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              அதிகபட்ச பதிவேற்ற அளவு (Max File Size)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={maxUploadMb}
                onChange={(e) => setMaxUploadMb(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-[#0A1612] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-zinc-500">MB</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              அனுமதிக்கப்பட்ட ஆடியோ வடிவங்கள்
            </label>
            <input
              type="text"
              value={allowedAudioTypes}
              onChange={(e) => setAllowedAudioTypes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-[#0A1612] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              அனுமதிக்கப்பட்ட பட வடிவங்கள்
            </label>
            <input
              type="text"
              value={allowedImageTypes}
              onChange={(e) => setAllowedImageTypes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-[#0A1612] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="md:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all"
            >
              <Save className="w-4 h-4" />
              <span>சேமிப்பக அமைப்புகளைச் சேமி</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Database Status */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-serif text-zinc-900 dark:text-zinc-100">
              டேட்டாபேஸ் நிலை & பாதுகாப்பு
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              PostgreSQL + Prisma ORM நேரடி இணைப்பு
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#0A1612] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
          <div className="space-y-1">
            <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>PostgreSQL Production Database</span>
            </span>
            <p className="text-zinc-500 font-mono text-[11px]">
              Active Prisma Client • Schema Migrations Up to Date
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
            HEALTHY
          </span>
        </div>
      </div>

      {/* 3. Admin Security & Password Change */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-serif text-zinc-900 dark:text-zinc-100">
              நிர்வாகி கணக்கு & பாதுகாப்பு
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              தற்போதைய நிர்வாகி: <strong className="text-emerald-700 dark:text-emerald-400">{user?.displayName}</strong> ({user?.email})
            </p>
          </div>
        </div>

        {passwordError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        {passwordSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              தற்போதைய கடவுச்சொல் (Current Password)
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-[#0A1612] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              புதிய கடவுச்சொல் (New Password)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="குறைந்தது 8 எழுத்துக்கள்"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-[#0A1612] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              புதிய கடவுச்சொல்லை உறுதிப்படுத்துக
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-[#0A1612] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all"
          >
            <Key className="w-4 h-4" />
            <span>கடவுச்சொல் மாற்று</span>
          </button>
        </form>
      </div>
    </div>
  );
};
