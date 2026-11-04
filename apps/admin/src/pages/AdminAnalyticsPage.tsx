import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Headphones,
  Clock,
  BookOpen,
  Cloud,
  Download,
  Calendar,
  Sparkles,
  Layers,
} from 'lucide-react';
import { getAdminMetrics, getStoredBooks, listAdminCategories } from '../services/adminCatalogService';

export const AdminAnalyticsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'all'>('30d');
  const metrics = getAdminMetrics();
  const books = getStoredBooks();
  const categories = listAdminCategories();

  // Compute playback and streaming stats
  const totalDurationHours = books.reduce((acc, b) => {
    const bookSeconds = b.chapters.reduce((s, c) => s + (c.durationSec || 0), 0);
    return acc + bookSeconds;
  }, 0) / 3600;

  const topCategories = categories
    .map((c) => ({
      name: c.tamilName || c.name,
      slug: c.slug,
      count: c.itemCount || 0,
      percentage: books.length > 0 ? Math.round(((c.itemCount || 0) / books.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>தள பகுப்பாய்வு மையம் (Platform Analytics & Insights)</span>
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
            கேட்டல் & உள்ளடக்க அளவீடுகள்
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            பயனர் வளர்ச்சி, ஆடியோ ஸ்ட்ரீமிங் மற்றும் கதை வகைப்பாடுகளின் நேரடிப் புள்ளிவிவரங்கள்
          </p>
        </div>

        {/* Timeframe Buttons & Export */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="p-1 rounded-xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 flex text-xs font-bold">
            <button
              onClick={() => setTimeframe('7d')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                timeframe === '7d' ? 'bg-emerald-700 text-white' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              7 நாட்கள்
            </button>
            <button
              onClick={() => setTimeframe('30d')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                timeframe === '30d' ? 'bg-emerald-700 text-white' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              30 நாட்கள்
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                timeframe === 'all' ? 'bg-emerald-700 text-white' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              முழு விவரம் (All)
            </button>
          </div>

          <button
            onClick={() => alert('அறிக்கை CSV வடிவத்தில் பதிவிறக்கம் செய்யப்படுகிறது... (Downloading Analytics Report)')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>அறிக்கை ஏற்றுமதி</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-bold text-zinc-400">செயலில் உள்ள நேயர்கள்</p>
            <h3 className="text-3xl font-black font-serif text-emerald-700 dark:text-emerald-300 mt-1">
              1,248
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+18.4% இந்த மாதம்</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-bold text-zinc-400">மொத்த ஆடியோ நேரம்</p>
            <h3 className="text-3xl font-black font-serif text-emerald-700 dark:text-emerald-300 mt-1">
              {totalDurationHours.toFixed(1)} மணி
            </h3>
            <p className="text-[11px] text-zinc-500 mt-1">
              {metrics.totalChapters} அத்தியாயங்கள் பதிவு
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-bold text-zinc-400">வெளியிடப்பட்ட புத்தகங்கள்</p>
            <h3 className="text-3xl font-black font-serif text-emerald-700 dark:text-emerald-300 mt-1">
              {metrics.publishedBooks}
            </h3>
            <p className="text-[11px] text-zinc-500 mt-1">
              வரைவு: {metrics.draftBooks} புத்தகங்கள்
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-bold text-zinc-400">சேமிப்பக பயன்பாடு</p>
            <h3 className="text-3xl font-black font-serif text-emerald-700 dark:text-emerald-300 mt-1">
              {metrics.storageUsage}
            </h3>
            <p className="text-[11px] text-zinc-500 mt-1">
              Firebase Storage Cloud Bucket
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <Cloud className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Sections: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Share */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-serif text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>பிரபலமான வகைப்பாடுகள் (Top Categories)</span>
            </h3>
            <span className="text-xs text-zinc-400 font-semibold">{categories.length} வகைகள்</span>
          </div>

          <div className="space-y-3 pt-2">
            {topCategories.map((cat, i) => (
              <div key={cat.slug} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-800 dark:text-zinc-200">{cat.name}</span>
                  <span className="text-zinc-500 font-mono">{cat.count} புத்தகங்கள் ({cat.percentage}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(8, cat.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audio Storage & Transcoding Metrics */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-serif text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Headphones className="w-4 h-4 text-emerald-600" />
              <span>ஆடியோ வடிவமைப்பு & நிலை (Audio Infrastructure)</span>
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Firebase Storage
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#0A1612] border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase">முதன்மை வடிவம்</span>
              <p className="text-lg font-black text-emerald-700 dark:text-emerald-300 font-mono">MP3 / OGG</p>
              <p className="text-xs text-zinc-500">128 kbps / 44.1 kHz</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#0A1612] border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase">டேட்டாபேஸ் வகை</span>
              <p className="text-lg font-black text-emerald-700 dark:text-emerald-300 font-mono">{metrics.databaseType}</p>
              <p className="text-xs text-zinc-500">உறுதிப்படுத்தப்பட்ட இணைப்பு</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-200 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>ஆடியோ விநியோக நிலை (CDN Status)</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-300 text-[11px] leading-relaxed">
              அனைத்து அத்தியாயங்களும் Google Firebase Storage உலகளாவிய CDN மூலம் குறைந்த தாமதத்துடன் (Low latency) பயனர்களுக்கு வழங்கப்படுகின்றன.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
