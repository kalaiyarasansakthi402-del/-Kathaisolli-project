import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, KeyRound, Trash2, LogOut, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, api, logout, refreshProfile } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="text-zinc-500">சுயவிவரத்தைப் பார்க்க உள்நுழையவும்.</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-4 px-6 py-2 rounded-xl bg-emerald-700 text-white text-sm font-semibold"
        >
          உள்நுழைக
        </button>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    try {
      await api.auth.updateProfile({ displayName, avatarUrl });
      await refreshProfile();
      setMessage('சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது (Profile updated successfully)');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'சுயவிவரத்தை புதுப்பிக்க முடியவில்லை.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword.length < 8) {
      setError('புதிய கடவுச்சொல் குறைந்தது 8 எழுத்துக்கள் இருக்க வேண்டும்.');
      return;
    }

    try {
      await api.auth.changePassword({ currentPassword, newPassword });
      setMessage('கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது (Password changed)');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'கடவுச்சொல்லை மாற்ற முடியவில்லை.');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('உங்கள் கணக்கை நிரந்தரமாக நீக்க விரும்புகிறீர்களா? (Delete account permanently?)')) {
      try {
        await api.auth.deleteAccount();
        logout();
        navigate('/');
      } catch (err: any) {
        setError('கணக்கை நீக்க முடியவில்லை.');
      }
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
          எனது சுயவிவரம் (My Profile)
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          உங்கள் கணக்கு விவரங்களை நிர்வகியுங்கள்
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Account Info Card */}
      <div className="bg-white dark:bg-[#14231E] p-6 sm:p-8 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-6">
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 rounded-full bg-emerald-700 text-white flex items-center justify-center text-3xl font-bold font-serif shadow-md">
            {user.displayName?.charAt(0) || user.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {user.displayName || 'கதைசொல்லி நேயர்'}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{user.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              {user.role} • 100% இலவச உறுப்பினர்
            </span>
          </div>
        </div>

        {/* Edit Info Form */}
        <form onSubmit={handleUpdateProfile} className="space-y-4 pt-4 border-t border-emerald-50 dark:border-emerald-900/30">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            சுயவிவரப் பெயர் மாற்றம் (Edit Details)
          </h3>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              பெயர் (Display Name)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full sm:w-80 px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#101A16] text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-sm shadow-sm transition-colors"
          >
            {saving ? 'சேமிக்கிறது...' : 'மாற்றங்களைச் சேமி (Save Changes)'}
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-white dark:bg-[#14231E] p-6 sm:p-8 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            கடவுச்சொல் மாற்று (Change Password)
          </h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              தற்போதைய கடவுச்சொல் (Current Password)
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#101A16] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              புதிய கடவுச்சொல் (New Password)
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#101A16] text-sm"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-zinc-800 text-white font-medium text-xs hover:bg-zinc-700 transition-colors"
          >
            கடவுச்சொல் மாற்று
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-3xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-rose-700 dark:text-rose-400 text-sm">
            கணக்கை நீக்கு (Delete Account)
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            உங்கள் கணக்கும் அனைத்து தரவுகளும் நிரந்தரமாக நீக்கப்படும்.
          </p>
        </div>
        <button
          onClick={handleDeleteAccount}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          <span>கணக்கை நீக்கு</span>
        </button>
      </div>
    </div>
  );
};
