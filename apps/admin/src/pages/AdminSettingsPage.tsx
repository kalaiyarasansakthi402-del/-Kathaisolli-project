import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Cloud,
  Shield,
  User,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Save,
  Server,
  Lock,
  Sparkles,
  RefreshCw,
  Clock,
  Cpu,
  HardDrive,
  LogOut,
  Sliders,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import type { AdminSystemHealth } from '@kathaisolli/shared-types';

export const AdminSettingsPage: React.FC = () => {
  const { user, api, logout, isSuperAdmin, isAdmin } = useAdminAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'storage' | 'system'>('profile');

  // Diagnostics State
  const [systemHealth, setSystemHealth] = useState<AdminSystemHealth | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>('');

  // Profile Form State
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // General App Settings (stored in local config state)
  const [platformName, setPlatformName] = useState('Kathaisolli (கதைசொல்லி)');
  const [brandingText, setBrandingText] = useState('By Anzles Studio');
  const [appSaved, setAppSaved] = useState(false);

  const fetchHealth = async () => {
    try {
      setHealthLoading(true);
      const res = await api.admin.getSystemHealth();
      setSystemHealth(res);
      setLastChecked(new Date().toLocaleTimeString('ta-IN'));
    } catch (err: any) {
      console.warn('[AdminSettings] Failed to fetch system health:', err?.message);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      setProfileError(null);
      await api.auth.updateProfile({
        displayName: displayName.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
      });
      setProfileSuccess('சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது.');
      setTimeout(() => setProfileSuccess(null), 3500);
    } catch (err: any) {
      setProfileError(err?.response?.data?.message || err?.message || 'சுயவிவரத்தைப் புதுப்பிப்பதில் பிழை.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      setPasswordError('புதிய கடவுச்சொல் குறைந்தது 8 எழுத்துக்கள் கொண்டிருக்க வேண்டும்.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('புதிய கடவுச்சொற்கள் இரண்டும் பொருந்தவில்லை.');
      return;
    }

    try {
      setPasswordSaving(true);
      await api.auth.changePassword({ currentPassword, newPassword });
      setPasswordSuccess('நிர்வாகக் கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: any) {
      setPasswordError(
        err?.response?.data?.message || err?.message || 'கடவுச்சொல் மாற்றுவதில் பிழை ஏற்பட்டது.'
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSaveAppSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setAppSaved(true);
    setTimeout(() => setAppSaved(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#064E3B] text-xs font-semibold mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>தள அமைப்புகள் & பாதுகாப்பு (Settings & Security)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 font-serif tracking-tight">
            நிர்வாக அமைப்புகள் மற்றும் கணினி நிலை
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            சுயவிவரம், பாதுகாப்பு அமைப்புகள், Firebase சேமிப்பக நிலை மற்றும் நேரடி தரவுத்தள ஆரோக்கியம்.
          </p>
        </div>

        <button
          onClick={fetchHealth}
          disabled={healthLoading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium text-sm shadow-sm transition-all self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 text-emerald-700 ${healthLoading ? 'animate-spin' : ''}`} />
          <span>கணினி நிலையைச் சரிபார்</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-white border-t-2 border-[#064E3B] text-[#064E3B] shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>நிர்வாகி சுயவிவரம் (Profile)</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-white border-t-2 border-[#064E3B] text-[#064E3B] shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>கடவுச்சொல் & பாதுகாப்பு (Security)</span>
        </button>

        <button
          onClick={() => setActiveTab('storage')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap ${
            activeTab === 'storage'
              ? 'bg-white border-t-2 border-[#064E3B] text-[#064E3B] shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>சேமிப்பக கட்டமைப்பு (Storage)</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap ${
            activeTab === 'system'
              ? 'bg-white border-t-2 border-[#064E3B] text-[#064E3B] shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>கணினி ஆரோக்கியம் (System Health)</span>
        </button>
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4 text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-emerald-100 border-4 border-emerald-50 text-[#064E3B] flex items-center justify-center font-bold text-3xl font-serif">
              {user?.displayName?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900">{user?.displayName || 'Administrator'}</h2>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">{user?.email}</p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-[#064E3B]">
              {user?.role === 'SUPER_ADMIN'
                ? 'Super Admin (தலைமை நிர்வாகி)'
                : user?.role === 'ADMIN'
                ? 'Admin (நிர்வாகி)'
                : 'Editor (உள்ளடக்க ஆசிரியர்)'}
            </span>

            <div className="w-full pt-4 border-t border-zinc-100 text-left space-y-2 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span>கணக்கு வகை:</span>
                <strong className="text-zinc-800">நிர்வாக அணுகல்</strong>
              </div>
              <div className="flex justify-between">
                <span>நிலை:</span>
                <strong className="text-emerald-700">செயலில் (Active)</strong>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 font-serif">சுயவிவர அமைப்புகளைப் புதுப்பி</h2>
              <p className="text-xs text-zinc-500 mt-0.5">நிர்வாகியின் காட்சிப் பெயர் மற்றும் சுயவிவரப் படம்</p>
            </div>

            {profileSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#064E3B] flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-[#047857]" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">நிர்வாகி மின்னஞ்சல் (மாற்ற முடியாது):</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-500 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">காட்சிப் பெயர் (Display Name):</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="உங்கள் பெயர்"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">சுயவிவரப் படம் URL (விருப்பத்தேர்வு):</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{profileSaving ? 'சேமிக்கப்படுகிறது...' : 'சுயவிவரத்தை சேமி'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: SECURITY */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-zinc-900 font-serif flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#064E3B]" />
              <span>பாதுகாப்பு வழிகாட்டுதல்</span>
            </h2>
            <p className="text-xs text-zinc-600 leading-relaxed">
              அனைத்து நிர்வாக கடவுச்சொற்களும் <strong>Argon2id</strong> அல்காரிதம் கொண்டு குறியாக்கம் செய்யப்படுகின்றன.
            </p>
            <ul className="text-xs text-zinc-600 space-y-2 list-disc list-inside">
              <li>குறைந்தது 8 எழுத்துக்கள் இருக்க வேண்டும்.</li>
              <li>எண்கள் மற்றும் குறியீடுகளைப் பயன்படுத்தவும்.</li>
              <li>அமர்வுகளுக்கு JWT டோக்கன்கள் பயன்படுத்தப்படுகின்றன.</li>
              <li>டோக்கன் காலாவதியானால் தானாகவே வெளியேற்றப்படும்.</li>
            </ul>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 font-serif">கடவுச்சொல்லை மாற்று (Change Password)</h2>
              <p className="text-xs text-zinc-500 mt-0.5">உங்கள் நிர்வாகக் கணக்கிற்கான புதிய கடவுச்சொல்லை உள்ளிடவும்</p>
            </div>

            {passwordSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#064E3B] flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-[#047857]" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">தற்போதைய கடவுச்சொல்:</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">புதிய கடவுச்சொல் (குறைந்தது 8 எழுத்துகள்):</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">புதிய கடவுச்சொல்லை உறுதி செய்:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                  required
                  minLength={8}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{passwordSaving ? 'மாற்றப்படுகிறது...' : 'கடவுச்சொல்லை மாற்று'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: STORAGE */}
      {activeTab === 'storage' && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 font-serif flex items-center gap-2">
              <Cloud className="w-5 h-5 text-[#064E3B]" />
              <span>Firebase Cloud Storage கட்டமைப்பு நிலை</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              ஆடியோ அத்தியாயங்கள் மற்றும் அட்டைப்படங்களுக்கான மேகக்கணி சேமிப்பகத் தகவல்
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">சேமிப்பக தளம்</span>
              <p className="text-sm font-bold text-zinc-900 mt-1">Google Firebase Storage</p>
              <span className="text-xs text-emerald-700 font-medium">இணைக்கப்பட்டுள்ளது</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Bucket பெயர்</span>
              <p className="text-sm font-mono font-bold text-zinc-900 mt-1 truncate" title="vaagai-audio-books-36a4e.appspot.com">
                vaagai-audio-books-36a4e.appspot.com
              </p>
              <span className="text-xs text-zinc-500">Default production bucket</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">அங்கீகரிக்கப்பட்ட MIME வகைகள்</span>
              <p className="text-xs font-mono text-zinc-800 mt-1">audio/mpeg, audio/mp3, image/*</p>
              <span className="text-xs text-zinc-500">அதிகபட்ச அளவு: 100 MB</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-[#064E3B] space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              <span>பாதுகாப்பு விதிகளின் சுருக்கம்:</span>
            </div>
            <p>
              Firebase Admin Credentials முன்முனை குறியீட்டில் வெளிப்படுத்தப்படவில்லை. அனைத்து ஆடியோ கோப்புகளும் நேரடி CORS மற்றும் பாதுகாப்பான HTTPS நெறிமுறைகள் வழியாக வழங்கப்படுகின்றன.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM HEALTH */}
      {activeTab === 'system' && (
        <div className="space-y-6 animate-fadeIn">
          {systemHealth ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">API ஆரோக்கியம்</span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-extrabold text-emerald-700 uppercase font-serif">
                    {systemHealth.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">NestJS Backend API ஆன்லைனில் உள்ளது</p>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">தரவுத்தளம் (Prisma)</span>
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                    <Database className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-extrabold text-zinc-900 font-serif">
                    {systemHealth.database.latencyMs} ms
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">Status: {systemHealth.database.status}</p>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">நினைவகப் பயன்பாடு</span>
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                    <Cpu className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-extrabold text-zinc-900 font-serif">
                    {systemHealth.system.memoryUsageMb} MB
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">Node.js Heap Memory</p>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">கணினி இயங்கு நேரம்</span>
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-extrabold text-zinc-900 font-serif">
                    {Math.floor(systemHealth.system.uptimeSeconds / 60)} நிமிடங்கள்
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">சுற்றுச்சூழல்: {systemHealth.system.environment}</p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-zinc-200">
              <RefreshCw className="w-8 h-8 text-emerald-700 animate-spin mx-auto mb-2" />
              <p className="text-xs text-zinc-500">கணினி ஆரோக்கியத் தரவு பெறப்படுகிறது...</p>
            </div>
          )}

          {/* System details card */}
          {systemHealth && (
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-zinc-900 font-serif flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-[#064E3B]" />
                <span>தொழில்நுட்ப விவரங்கள் (Runtime Details)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-zinc-50 rounded-xl">
                  <span className="text-zinc-500 block">Node பதிப்பு:</span>
                  <strong className="text-zinc-800 font-mono text-sm">{systemHealth.system.nodeVersion}</strong>
                </div>
                <div className="p-3 bg-zinc-50 rounded-xl">
                  <span className="text-zinc-500 block">இயங்குதளம் (OS):</span>
                  <strong className="text-zinc-800 font-mono text-sm">{systemHealth.system.platform}</strong>
                </div>
                <div className="p-3 bg-zinc-50 rounded-xl">
                  <span className="text-zinc-500 block">சேமிப்பக நிலை:</span>
                  <strong className="text-emerald-700 font-mono text-sm">{systemHealth.storage.status}</strong>
                </div>
                <div className="p-3 bg-zinc-50 rounded-xl">
                  <span className="text-zinc-500 block">சரிபார்க்கப்பட்ட நேரம்:</span>
                  <strong className="text-zinc-800 text-xs">{lastChecked || 'இப்போது'}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminSettingsPage;
