import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Headphones,
  ShieldCheck,
  Clock,
  CheckSquare,
  Radio,
  Sparkles,
  PlusCircle,
  FileAudio,
  HardDrive,
  Database,
  CheckCircle,
  Eye,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  getAdminMetrics,
  getRecentUploads,
} from '../services/adminCatalogService';
import { formatDuration } from '@kathaisolli/shared-utils';
import { formatFileSize } from '../services/firebaseAdminStorage';
import { AudioPreviewPlayer } from '../components/AudioPreviewPlayer';

export const AdminOverviewPage: React.FC = () => {
  const [metrics, setMetrics] = useState(() => getAdminMetrics());
  const [recentUploads, setRecentUploads] = useState(() => getRecentUploads(6));
  const [activePreview, setActivePreview] = useState<{ url: string; title: string } | null>(null);

  const refreshData = () => {
    setMetrics(getAdminMetrics());
    setRecentUploads(getRecentUploads(6));
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('kathaisolli:admin-books-updated', refreshData);
    return () => window.removeEventListener('kathaisolli:admin-books-updated', refreshData);
  }, []);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 selection:bg-emerald-500 selection:text-emerald-950">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-[#0A261D] to-[#041E16] p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md border border-emerald-900/60">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>கதைசொல்லி தலைமை நிர்வாக மையம் (Super Admin Dashboard)</span>
          </div>
          <h1 className="text-3xl font-extrabold font-serif">
            தள மேலோட்டம் & நேரடி புள்ளிவிவரங்கள்
          </h1>
          <p className="text-emerald-100/80 text-sm max-w-xl">
            ஆடியோ புத்தகங்கள், MP3 அத்தியாயங்கள், Firebase Storage மற்றும் Cloudflare D1 தரவுத்தளத்தின் நேரடி புள்ளிவிவரங்கள்.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cloudflare D1: இணைக்கப்பட்டுள்ளது</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>Firebase Storage: தயார்</span>
          </span>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-[#10221B] p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm">
        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-2">
          விரைவு நடவடிக்கைகள் (Quick Actions):
        </span>
        <Link
          to="/admin/books/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>புதிய புத்தகம் சேர் (Add Book)</span>
        </Link>
        <Link
          to="/admin/audio-upload"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 font-bold text-xs transition-colors shadow-sm border border-emerald-600/40"
        >
          <FileAudio className="w-4 h-4" />
          <span>ஆடியோ பதிவேற்று (Upload Audio)</span>
        </Link>
        <Link
          to="/admin/books"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-zinc-800 dark:text-emerald-200 font-bold text-xs transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>புத்தகங்கள் மேலாண்மை (Manage Books)</span>
        </Link>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Books */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">மொத்த புத்தகங்கள் (Books)</span>
            <BookOpen className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
            {metrics.totalBooks}
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-emerald-600 font-bold">{metrics.publishedBooks} வெளியிடப்பட்டவை</span>
            <span className="text-zinc-400">•</span>
            <span className="text-amber-500 font-medium">{metrics.draftBooks} வரைவுகள்</span>
          </div>
        </div>

        {/* Total Chapters */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">மொத்த அத்தியாயங்கள் (Chapters)</span>
            <Headphones className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
            {metrics.totalChapters}
          </div>
          <p className="text-[11px] text-zinc-500">
            {metrics.totalUploadedAudio} MP3 ஆடியோ கோப்புகள் இணைக்கப்பட்டுள்ளன
          </p>
        </div>

        {/* Total Storage Usage */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">சேமிப்பக பயன்பாடு (Storage)</span>
            <HardDrive className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
            {metrics.storageUsage}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium truncate" title={metrics.storageBucket}>
            Firebase Storage (Audio & Covers)
          </p>
        </div>

        {/* Database & Cover Images */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">அட்டைப் படங்கள் & தரவுத்தளம்</span>
            <Database className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
            {metrics.totalCoverImages} படங்கள்
          </div>
          <p className="text-[11px] text-emerald-600 font-medium truncate">
            {metrics.databaseType}
          </p>
        </div>
      </div>

      {/* Floating / Active In-Dashboard Audio Preview */}
      {activePreview && (
        <div className="p-5 rounded-2xl bg-emerald-950/90 border border-emerald-800 text-white shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-emerald-300">
                <FileAudio className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-300">நேரடி ஆடியோ முன்னோட்டம் (Audio Preview)</p>
                <p className="text-sm font-bold text-white">{activePreview.title}</p>
              </div>
            </div>
            <button
              onClick={() => setActivePreview(null)}
              className="text-xs px-2.5 py-1 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-300 transition-colors"
            >
              மூடு (Close)
            </button>
          </div>
          <AudioPreviewPlayer src={activePreview.url} title={activePreview.title} autoPlay={true} />
        </div>
      )}

      {/* Recent Uploads Section */}
      <div className="rounded-3xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-serif text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FileAudio className="w-5 h-5 text-emerald-600" />
              <span>சமீபத்திய ஆடியோ பதிவேற்றங்கள் (Recent Uploads)</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Firebase Storage-இல் சமீபத்தில் பதிவேற்றப்பட்ட MP3 கோப்புகளின் விவரங்கள்
            </p>
          </div>
          <Link
            to="/admin/audio-upload"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <span>அனைத்து பதிவேற்றங்களையும் பார்க்க</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentUploads.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 space-y-2">
            <FileAudio className="w-8 h-8 mx-auto text-zinc-300 opacity-60" />
            <p className="text-xs font-medium">இன்னும் ஆடியோ கோப்புகள் பதிவேற்றப்படவில்லை.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-emerald-100 dark:border-emerald-900/40 text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">புத்தகம் & அத்தியாயம்</th>
                  <th className="py-3 px-3">கோப்பு பெயர்</th>
                  <th className="py-3 px-3">கால அளவு</th>
                  <th className="py-3 px-3">அளவு</th>
                  <th className="py-3 px-3">நிலை (Status)</th>
                  <th className="py-3 px-3 text-right">முன்னோட்டம்</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50 dark:divide-emerald-950/60 font-medium">
                {recentUploads.map((up) => (
                  <tr key={up.id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">
                        {up.bookTitle}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        அத்தியாயம் {up.chapterNumber}: {up.chapterTitle}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-600 dark:text-zinc-300">
                      {up.fileName}
                    </td>
                    <td className="py-3 px-3 text-zinc-600 dark:text-zinc-300">
                      {formatDuration(up.durationSec)}
                    </td>
                    <td className="py-3 px-3 text-zinc-600 dark:text-zinc-300">
                      {formatFileSize(up.fileSizeBytes)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          up.status === 'PUBLISHED'
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {up.status === 'PUBLISHED' ? 'வெளியிடப்பட்டது' : 'வரைவு (Draft)'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {up.audioUrl && (
                        <button
                          onClick={() =>
                            setActivePreview({
                              url: up.audioUrl!,
                              title: `${up.bookTitle} - அத்தியாயம் ${up.chapterNumber}`,
                            })
                          }
                          className="px-3 py-1 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:hover:bg-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold text-[11px] transition-colors"
                        >
                          கேளுங்கள்
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Queues Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/books"
          className="p-6 rounded-3xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm hover:shadow-md transition-shadow space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              {metrics.totalBooks} நூல்கள்
            </span>
          </div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
            ஆடியோ புத்தகங்கள் அட்டவணை
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            புத்தகங்களைச் சேர்த்தல், அட்டைப் படம் பதிவேற்றுதல், அத்தியாயங்களை நிர்வகித்தல் மற்றும் வெளியிடுதல்.
          </p>
        </Link>

        <Link
          to="/admin/audio-upload"
          className="p-6 rounded-3xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm hover:shadow-md transition-shadow space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <FileAudio className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
              {metrics.totalChapters} அத்தியாயங்கள்
            </span>
          </div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
            ஆடியோ பதிவேற்ற மையம் (MP3 Upload)
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            உயர்தர MP3 கோப்புகளைப் பதிவேற்றி, கால அளவை தானாகக் கண்டறிந்து Firebase Storage-இல் சேமிக்கவும்.
          </p>
        </Link>

        <Link
          to="/admin/users"
          className="p-6 rounded-3xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm hover:shadow-md transition-shadow space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              இயங்குகிறது
            </span>
          </div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
            பயனர்கள் & படைப்பாளர்கள்
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            நேயர்களின் செயல்பாடுகள், படைப்பாளர் விண்ணப்பங்கள் மற்றும் உள்ளடக்க ஒப்புதல் நிலைகள்.
          </p>
        </Link>
      </div>
    </div>
  );
};