import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Layers,
  FileAudio,
  HardDrive,
  CheckCircle2,
  Clock,
  Sparkles,
  PlusCircle,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Eye,
  Calendar,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AudioPreviewPlayer } from '../components/AudioPreviewPlayer';
import type { AdminDashboardStats } from '@kathaisolli/shared-types';

export const AdminOverviewPage: React.FC = () => {
  const { api } = useAdminAuth();
  const [activePreview, setActivePreview] = useState<{ url: string; title: string } | null>(null);

  // Fetch real database dashboard data
  const {
    data: stats,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<AdminDashboardStats>({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.admin.getDashboard(),
    refetchInterval: 30000, // Auto refresh every 30s
  });

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-44 rounded-3xl bg-gray-200" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-gray-200" />
          ))}
        </div>
        <div className="h-72 rounded-2xl bg-gray-200" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 sm:p-8 max-w-7xl mx-auto">
        <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-rose-800 space-y-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-rose-600" />
            <h3 className="text-base font-bold">தரவுத்தள தகவல்களை ஏற்றுவதில் பிழை</h3>
          </div>
          <p className="text-xs text-rose-700">
            {(error as any)?.message || 'பின்னணி API சேவையுடன் தொடர்பு கொள்ள முடியவில்லை.'}
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>மீண்டும் முயற்சி செய் (Retry)</span>
          </button>
        </div>
      </div>
    );
  }

  const data = stats || {
    totalStories: 0,
    totalCategories: 0,
    totalAudioFiles: 0,
    totalAudioStorageUsage: 0,
    storageUsageFormatted: '0 MB',
    totalPublishedStories: 0,
    totalDraftStories: 0,
    coverImageCount: 0,
    recentlyUploadedStories: [],
    recentAdminActivities: [],
    storageUsageStatistics: {
      totalBytes: 0,
      audioCount: 0,
      imageCount: 0,
      audioBytes: 0,
      imageBytesApprox: 0,
    },
    monthlyUploadAnalytics: [],
  };

  // Find max value in monthly analytics for scaling chart
  const maxMonthValue = Math.max(
    1,
    ...data.monthlyUploadAnalytics.map((m) => Math.max(m.stories, m.episodes)),
  );

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Welcome & KPI Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#064E3B] via-[#047857] to-[#065F46] p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-emerald-800/40 relative overflow-hidden">
        {/* Subtle decorative leaf watermark */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/5 rounded-full pointer-events-none blur-2xl" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#A7F3D0] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>கதைசொல்லி நேரடி நிர்வாக மையம்</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight">
            தள மேலோட்டம் & நேரடி அளவீடுகள்
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-xl leading-relaxed">
            ஆடியோ புத்தகங்கள், MP3 அத்தியாயங்கள், வகைப்பாடுகள் மற்றும் சேமிப்பகத்தின் நேரடி புள்ளிவிவரங்கள்.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="புதிய தகவல்களை புதுப்பி (Refresh)"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>புதுப்பி</span>
          </button>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-400/30 text-[#A7F3D0] text-xs font-bold flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>நேரடி தரவுத்தளம் (Live Database)</span>
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
          விரைவு நடவடிக்கைகள் (Quick Actions):
        </span>
        <Link
          to="/admin/stories/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white font-bold text-xs transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>புதிய கதை சேர் (Add Story)</span>
        </Link>
        <Link
          to="/admin/audio-upload"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#047857] hover:bg-[#065F46] text-white font-bold text-xs transition-colors shadow-sm"
        >
          <FileAudio className="w-4 h-4" />
          <span>ஆடியோ பதிவேற்று (Upload Audio)</span>
        </Link>
        <Link
          to="/admin/categories"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#064E3B] font-bold text-xs transition-colors border border-emerald-200"
        >
          <Layers className="w-4 h-4" />
          <span>வகைப்பாடுகள் (Categories)</span>
        </Link>
        <Link
          to="/admin/storage"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs transition-colors border border-gray-200"
        >
          <HardDrive className="w-4 h-4" />
          <span>சேமிப்பகம் (Storage)</span>
        </Link>
      </div>

      {/* Active Audio Preview Bar if playing */}
      {activePreview && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#064E3B]">
            <span>ஆடியோ முன்னோட்டம்: {activePreview.title}</span>
            <button
              onClick={() => setActivePreview(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕ மூடு
            </button>
          </div>
          <AudioPreviewPlayer src={activePreview.url} title={activePreview.title} />
        </div>
      )}

      {/* 6 Real Database KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Stories */}
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              மொத்த கதைகள்
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#064E3B] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">{data.totalStories}</p>
          <div className="text-[11px] text-gray-400">
            {data.totalPublishedStories} வெளியிடப்பட்டது
          </div>
        </div>

        {/* Total Categories */}
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              வகைப்பாடுகள்
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">{data.totalCategories}</p>
          <div className="text-[11px] text-gray-400">செயலில் உள்ள பிரிவுகள்</div>
        </div>

        {/* Total Audio Files */}
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              ஆடியோ கோப்புகள்
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
              <FileAudio className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">{data.totalAudioFiles}</p>
          <div className="text-[11px] text-gray-400">MP3 அத்தியாயங்கள்</div>
        </div>

        {/* Audio Storage Usage */}
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              சேமிப்பக அளவு
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 truncate">
            {data.storageUsageFormatted}
          </p>
          <div className="text-[11px] text-gray-400">Firebase Storage</div>
        </div>

        {/* Published Stories */}
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              வெளியானவை
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700">{data.totalPublishedStories}</p>
          <div className="text-[11px] text-emerald-600 font-semibold">நேயர்களுக்குக் கிடைக்கும்</div>
        </div>

        {/* Draft Stories */}
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              வரைவு (Drafts)
            </span>
            <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-700">{data.totalDraftStories}</p>
          <div className="text-[11px] text-gray-400">வெளியிடத் தயார்</div>
        </div>
      </div>

      {/* Analytics & Storage Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Upload Analytics Chart (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 font-serif flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#064E3B]" />
                <span>மாதாந்திர பதிவேற்ற புள்ளிவிவரங்கள் (Monthly Upload Trends)</span>
              </h3>
              <p className="text-xs text-gray-500">
                கடந்த 6 மாதங்களில் சேர்க்கப்பட்ட கதைகள் மற்றும் அத்தியாயங்களின் வளர்ச்சி
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#064E3B]" />
                <span className="text-gray-600 font-semibold">கதைகள் (Stories)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#34D399]" />
                <span className="text-gray-600 font-semibold">அத்தியாயங்கள் (Audio)</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualizer */}
          <div className="pt-4 h-56 flex items-end justify-between gap-3 sm:gap-6 border-b border-gray-100 pb-2">
            {data.monthlyUploadAnalytics.map((item, idx) => {
              const storyHeight = Math.max(8, Math.round((item.stories / maxMonthValue) * 160));
              const epHeight = Math.max(8, Math.round((item.episodes / maxMonthValue) * 160));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="flex items-end gap-1.5 w-full justify-center">
                    {/* Story Bar */}
                    <div
                      style={{ height: `${storyHeight}px` }}
                      className="w-4 sm:w-6 bg-[#064E3B] rounded-t-lg transition-all group-hover:bg-[#047857] relative"
                      title={`Stories: ${item.stories}`}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-700 bg-white px-1.5 py-0.5 rounded shadow border border-gray-200 pointer-events-none transition-opacity">
                        {item.stories}
                      </span>
                    </div>

                    {/* Audio Episode Bar */}
                    <div
                      style={{ height: `${epHeight}px` }}
                      className="w-4 sm:w-6 bg-[#34D399] rounded-t-lg transition-all group-hover:bg-[#10B981] relative"
                      title={`Audio Chapters: ${item.episodes}`}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-700 bg-white px-1.5 py-0.5 rounded shadow border border-gray-200 pointer-events-none transition-opacity">
                        {item.episodes}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Storage Usage Statistics Widget (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900 font-serif flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#064E3B]" />
              <span>சேமிப்பகப் பகுப்பாய்வு (Storage Analytics)</span>
            </h3>
            <p className="text-xs text-gray-500">Firebase Cloud Storage பயன்பாடு</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#064E3B]">மொத்த ஆடியோ அளவு</span>
                <span className="font-black text-gray-900">{data.storageUsageFormatted}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-emerald-200 overflow-hidden">
                <div
                  className="h-full bg-[#064E3B] rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(5, (data.totalAudioStorageUsage / (10 * 1024 * 1024 * 1024)) * 100),
                    )}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <span>{data.totalAudioFiles} MP3 கோப்புகள்</span>
                <span>இலவச ஒதுக்கீடு: 10 GB</span>
              </div>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-600 font-medium">அட்டைப் படங்கள் (Cover Art)</span>
                <span className="font-bold text-gray-900">{data.coverImageCount} படங்கள்</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-600 font-medium">சேமிப்பக தளம் (Storage Provider)</span>
                <span className="font-bold text-[#047857]">Firebase Storage</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-gray-600 font-medium">நிலை (Status)</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>செயலில் உள்ளது</span>
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/admin/storage"
            className="w-full py-2.5 rounded-xl bg-gray-50 hover:bg-emerald-50 text-[#064E3B] text-xs font-bold text-center border border-gray-200 hover:border-emerald-200 transition-colors"
          >
            முழுமையான சேமிப்பகப் பட்டியல் காண்க →
          </Link>
        </div>
      </div>

      {/* Two Column Layout: Recently Uploaded Stories & Recent Admin Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recently Uploaded Stories (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 font-serif flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#064E3B]" />
              <span>சமீபத்திய கதைகள் (Recently Uploaded Stories)</span>
            </h3>
            <Link
              to="/admin/stories"
              className="text-xs font-bold text-[#047857] hover:underline flex items-center gap-1"
            >
              <span>அனைத்தும்</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {data.recentlyUploadedStories.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                புதிய கதைகள் எதுவும் இல்லை. "புதிய கதை சேர்" பொத்தானை அழுத்தவும்.
              </div>
            ) : (
              data.recentlyUploadedStories.map((story) => (
                <div
                  key={story.id}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/60 p-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-14 rounded-xl bg-emerald-100 border border-emerald-200 shrink-0 overflow-hidden flex items-center justify-center">
                      {story.coverImage ? (
                        <img
                          src={story.coverImage}
                          alt={story.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="w-5 h-5 text-[#064E3B]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/admin/stories/${story.id}/chapters`}
                        className="font-bold text-sm text-gray-900 hover:text-[#064E3B] truncate block"
                      >
                        {story.title}
                      </Link>
                      <p className="text-xs text-gray-500 truncate">
                        {story.authorName} • {story.categoryName} • {story.totalEpisodes} அத்தியாயங்கள்
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        story.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {story.status === 'PUBLISHED' ? 'வெளியானது' : 'வரைவு'}
                    </span>
                    <Link
                      to={`/admin/stories/${story.id}/chapters`}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#064E3B] hover:bg-emerald-50 transition-colors"
                      title="அத்தியாயங்கள் மேலாண்மை"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Admin Activities (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 font-serif flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#064E3B]" />
              <span>நிர்வாக நடவடிக்கைகள் (Recent Activities)</span>
            </h3>
            <span className="text-[11px] font-semibold text-gray-400">நேரடி பதிவு</span>
          </div>

          <div className="divide-y divide-gray-100 max-h-[380px] overflow-y-auto pr-1">
            {data.recentAdminActivities.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                நடவடிக்கைகள் எதுவும் பதிவு செய்யப்படவில்லை.
              </div>
            ) : (
              data.recentAdminActivities.map((act) => (
                <div key={act.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-[#064E3B]">
                      {act.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(act.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold text-gray-800">{act.actorName}</span>{' '}
                    ({act.targetType} {act.details?.title ? `"${act.details.title}"` : ''})
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
