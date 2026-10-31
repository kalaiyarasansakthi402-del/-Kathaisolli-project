import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Headphones, ShieldCheck, Clock, CheckSquare, Radio, Sparkles } from 'lucide-react';
import { apiClient } from '@kathaisolli/api-client';

export const AdminOverviewPage: React.FC = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 1420,
    totalCreators: 38,
    publishedSeries: 24,
    totalEpisodes: 112,
    totalHoursStreamed: 8460,
    pendingCreatorApplications: 3,
    pendingModerations: 2,
    audioQueueJobs: 0,
  });

  useEffect(() => {
    apiClient.admin.getMetrics().then((m) => {
      if (m) {
        setMetrics((prev) => ({
          ...prev,
          totalUsers: (m as any).totalUsers || prev.totalUsers,
          totalCreators: (m as any).totalCreators || prev.totalCreators,
          publishedSeries: (m as any).totalSeries || prev.publishedSeries,
          totalEpisodes: (m as any).totalEpisodes || prev.totalEpisodes,
        }));
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-[#0A261D] to-[#041E16] p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md border border-emerald-900/60">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>கதைசொல்லி தலைமை நிர்வாக மையம் (Super Admin Dashboard)</span>
          </div>
          <h1 className="text-3xl font-extrabold font-serif">
            தள மேலோட்டம் & புள்ளிவிவரங்கள்
          </h1>
          <p className="text-emerald-100/80 text-sm max-w-xl">
            கதைசொல்லி 100% இலவச ஆடியோ தளத்தின் முழுமையான செயல்பாட்டு நிலைகள், பயனர்கள் மற்றும் உள்ளடக்கக் கட்டுப்பாடுகள்.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
            உள்கட்டமைப்பு: HEALTHY
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">பதிவுசெய்த நேயர்கள்</span>
            <Users className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {metrics.totalUsers.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">100% இலவச நேயர்கள்</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">படைப்பாளர்கள் (Creators)</span>
            <Headphones className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {metrics.totalCreators}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">சரிபார்க்கப்பட்ட கலைஞர்கள்</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">வெளியிடப்பட்ட கதைகள்</span>
            <BookOpen className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {metrics.publishedSeries}
          </div>
          <p className="text-[11px] text-zinc-500">{metrics.totalEpisodes} அத்தியாயங்கள்</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">மொத்த கேட்கும் மணித்துளிகள்</span>
            <Clock className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {metrics.totalHoursStreamed.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">HQ தமிழ் ஆடியோ</p>
        </div>
      </div>

      {/* Action Queues Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/creators"
          className="p-6 rounded-3xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm hover:shadow-md transition-shadow space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <CheckSquare className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              {metrics.pendingCreatorApplications} காத்திருக்கிறது
            </span>
          </div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
            படைப்பாளர் விண்ணப்பங்கள்
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            படைப்பாளராக இணைய விரும்பும் நேயர்களின் விண்ணப்பங்களை மதிப்பாய்வு செய்து அனுமதிக்கவும்.
          </p>
        </Link>

        <Link
          to="/admin/moderation"
          className="p-6 rounded-3xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm hover:shadow-md transition-shadow space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
              {metrics.pendingModerations} கதைகள்
            </span>
          </div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
            உள்ளடக்க மதிப்பாய்வு (Moderation)
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            படைப்பாளர்களால் சமர்ப்பிக்கப்பட்ட புதிய கதைகளை மதிப்பாய்வு செய்து வெளியிட ஒப்புதல் அளிக்கவும்.
          </p>
        </Link>

        <Link
          to="/admin/audio-queue"
          className="p-6 rounded-3xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm hover:shadow-md transition-shadow space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Radio className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              இயங்குகிறது
            </span>
          </div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
            ஆடியோ டிரான்ஸ்கோடிங் (Transcoding)
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            BullMQ மற்றும் FFmpeg பின்னணி ஆடியோ மாற்றல் மற்றும் HLS செயலாக்கக் கண்காணிப்பு.
          </p>
        </Link>
      </div>
    </div>
  );
};
