import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileAudio,
  Headphones,
  Plus,
  BookOpen,
  ArrowRight,
  Upload,
  Clock,
  CheckCircle,
  AlertCircle,
  Volume2,
} from 'lucide-react';
import {
  getStoredBooks,
  getRecentUploads,
  type AdminBook,
} from '../services/adminCatalogService';
import { formatDuration } from '@kathaisolli/shared-utils';
import { formatFileSize } from '../services/firebaseAdminStorage';
import { AudioPreviewPlayer } from '../components/AudioPreviewPlayer';

export const AdminAudioUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [books] = useState<AdminBook[]>(() => getStoredBooks());
  const [selectedBookId, setSelectedBookId] = useState<string>(books[0]?.id || '');
  const [activePreview, setActivePreview] = useState<{ url: string; title: string } | null>(null);

  const selectedBook = books.find((b) => b.id === selectedBookId) || books[0];
  const recentUploads = getRecentUploads(8);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <FileAudio className="w-3.5 h-3.5" />
            <span>ஆடியோ பதிவேற்ற மையம் (Audio Upload Hub)</span>
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
            MP3 ஆடியோ அத்தியாயங்கள் மேலாண்மை
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            புத்தகத்தைத் தேர்ந்தெடுத்து புதிய MP3 அத்தியாயங்களைப் பதிவேற்றி, முன்னோட்டம் பார்த்து வெளியிடவும்
          </p>
        </div>

        {selectedBook && (
          <button
            onClick={() => navigate(`/books/${selectedBook.id}/chapters`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all hover:scale-105 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>புதிய MP3 அத்தியாயம் சேர்</span>
          </button>
        )}
      </div>

      {/* Active Audio Preview */}
      {activePreview && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <span>நேரடி ஆடியோ முன்னோட்டம்: {activePreview.title}</span>
            <button
              onClick={() => setActivePreview(null)}
              className="text-zinc-400 hover:text-zinc-600"
            >
              ✕ மூடு
            </button>
          </div>
          <AudioPreviewPlayer src={activePreview.url} title={activePreview.title} />
        </div>
      )}

      {/* Select Book Selector Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-4">
        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          புத்தகத்தைத் தேர்ந்தெடுக்கவும் (Select Audiobook)
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-[#0A1612] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.tamilTitle || b.title} ({b.chapters.length} அத்தியாயங்கள்) • {b.authorName}
                </option>
              ))}
            </select>
          </div>

          {selectedBook && (
            <Link
              to={`/books/${selectedBook.id}/chapters`}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold text-xs transition-colors"
            >
              <span>அத்தியாயங்கள் பக்கத்தைத் திற (Open Chapters)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {selectedBook && (
          <div className="pt-2 flex items-center gap-4 text-xs text-zinc-500">
            <span>பிரிவு: <strong>{selectedBook.categoryName}</strong></span>
            <span>•</span>
            <span>மொழி: <strong>{selectedBook.languageName}</strong></span>
            <span>•</span>
            <span>நிலை: <strong className={selectedBook.status === 'PUBLISHED' ? 'text-emerald-600' : 'text-amber-600'}>{selectedBook.status}</strong></span>
          </div>
        )}
      </div>

      {/* Recent Uploads Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-serif text-zinc-900 dark:text-zinc-100">
            சமீபத்திய ஆடியோ பதிவேற்றங்கள் (Recent Uploads)
          </h2>
          <span className="text-xs text-zinc-500">மொத்தம் {recentUploads.length} கோப்புகள்</span>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-emerald-100 dark:border-emerald-900/40 bg-white dark:bg-[#10221B] shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-[#0A1612] border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-bold">புத்தகம் & அத்தியாயம்</th>
                <th className="py-3.5 px-4 font-bold">கோப்பு பெயர்</th>
                <th className="py-3.5 px-4 font-bold">ஆடியோ நீளம்</th>
                <th className="py-3.5 px-4 font-bold">அளவு</th>
                <th className="py-3.5 px-4 font-bold">நிலை</th>
                <th className="py-3.5 px-4 font-bold text-right">முன்னோட்டம்</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentUploads.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                    <p className="font-bold">{item.bookTitle}</p>
                    <p className="text-[11px] text-zinc-400 font-normal">அத்தியாயம் {item.chapterNumber}: {item.chapterTitle}</p>
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-500 text-[11px]">
                    {item.fileName}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatDuration(item.durationSec)}
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-500">
                    {formatFileSize(item.fileSizeBytes)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {item.audioUrl && (
                      <button
                        onClick={() => setActivePreview({ url: item.audioUrl!, title: `${item.bookTitle} - ${item.chapterTitle}` })}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>கேள்</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
