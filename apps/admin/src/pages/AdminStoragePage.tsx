import React, { useState } from 'react';
import {
  HardDrive,
  Search,
  Filter,
  FileAudio,
  Image as ImageIcon,
  Play,
  Pause,
  Trash2,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth } from '../context/AdminAuthContext';
import { formatFileSize, formatDuration } from '@kathaisolli/shared-utils';
import { AudioPreviewPlayer } from '../components/AudioPreviewPlayer';
import type { AdminStorageFile, AdminStorageOverview } from '@kathaisolli/shared-types';

export const AdminStoragePage: React.FC = () => {
  const { api, permissions } = useAdminAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'AUDIO' | 'IMAGE'>('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Active playing preview
  const [activePreview, setActivePreview] = useState<{ url: string; title: string } | null>(null);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch storage overview metrics
  const { data: overview, refetch: refetchOverview } = useQuery<AdminStorageOverview>({
    queryKey: ['admin', 'storage', 'overview'],
    queryFn: () => api.admin.getStorageOverview(),
  });

  // Fetch paginated bounded storage files from database
  const {
    data: filesData,
    isLoading,
    isError,
    error,
    refetch: refetchFiles,
    isFetching,
  } = useQuery({
    queryKey: ['admin', 'storage', 'files', page, pageSize, debouncedSearch, typeFilter],
    queryFn: () =>
      api.admin.listStorageFiles({
        page,
        pageSize,
        search: debouncedSearch || undefined,
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
      }),
  });

  // Delete file mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.admin.deleteStorageFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'storage'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || 'கோப்பை நீக்குவதில் பிழை.');
    },
  });

  const handleDelete = (file: AdminStorageFile) => {
    if (confirm(`"${file.name}" கோப்பை நிச்சயமாக நீக்க விரும்புகிறீர்களா?`)) {
      deleteMutation.mutate(file.id);
    }
  };

  const files = filesData?.items || [];
  const total = filesData?.total || 0;
  const totalPages = filesData?.totalPages || 1;

  // Overview stats
  const totalBytes = overview?.totalStorageBytes || 0;
  const audioCount = overview?.audioFilesCount || 0;
  const imageCount = overview?.imageFilesCount || 0;
  const bucketName = overview?.bucket || 'vaagai-audio-books-36a4e.appspot.com';

  const mb = (totalBytes / (1024 * 1024)).toFixed(1);
  const gb = (totalBytes / (1024 * 1024 * 1024)).toFixed(2);
  const formattedUsage = totalBytes > 1024 * 1024 * 1024 ? `${gb} GB` : `${mb} MB`;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#064E3B] text-xs font-bold uppercase tracking-wider mb-1.5 border border-emerald-200">
            <HardDrive className="w-3.5 h-3.5" />
            <span>சேமிப்பக மேலாண்மை (Audio Storage Management)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-serif">
            Firebase ஆடியோ சேமிப்பகம் & கோப்புகள்
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Firebase Cloud Storage-ல் உள்ள MP3 அத்தியாயங்கள், அட்டைப் படங்கள் மற்றும் கோப்பு விவரங்கள்
          </p>
        </div>

        <button
          onClick={() => {
            refetchOverview();
            refetchFiles();
          }}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-sm transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>புதுப்பி (Refresh)</span>
        </button>
      </div>

      {/* Storage Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              பயன்படுத்தப்பட்ட சேமிப்பகம்
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#064E3B] flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">{formattedUsage}</p>
          <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-[#064E3B]"
              style={{
                width: `${Math.min(100, Math.max(3, (totalBytes / (10 * 1024 * 1024 * 1024)) * 100))}%`,
              }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              ஆடியோ கோப்புகள் (MP3)
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
              <FileAudio className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">{audioCount}</p>
          <span className="text-[11px] text-gray-400">பதிவேற்றப்பட்ட அத்தியாயங்கள்</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              அட்டைப் படங்கள் (Covers)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">{imageCount}</p>
          <span className="text-[11px] text-gray-400">கதைப் படங்கள்</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              சேமிப்பக வாளி (Bucket)
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs font-mono font-bold text-gray-900 truncate" title={bucketName}>
            {bucketName}
          </p>
          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>இணைக்கப்பட்டுள்ளது</span>
          </span>
        </div>
      </div>

      {/* Active Audio Preview Bar */}
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

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="கோப்புப் பெயர், பாதை அல்லது கதைத் தலைப்பு தேடுக..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-full md:w-auto text-xs font-bold">
          <button
            onClick={() => {
              setTypeFilter('ALL');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              typeFilter === 'ALL'
                ? 'bg-[#064E3B] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            அனைத்தும் ({overview?.totalFilesCount || 0})
          </button>
          <button
            onClick={() => {
              setTypeFilter('AUDIO');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              typeFilter === 'AUDIO'
                ? 'bg-[#047857] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ஆடியோ ({audioCount})
          </button>
          <button
            onClick={() => {
              setTypeFilter('IMAGE');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              typeFilter === 'IMAGE'
                ? 'bg-amber-700 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            படங்கள் ({imageCount})
          </button>
        </div>
      </div>

      {/* Files Table Card */}
      <div className="rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900 font-serif">
            சேமிப்பக கோப்புகளின் பட்டியல் ({total} கோப்புகள்)
          </h3>
          <span className="text-xs text-gray-400 font-semibold">
            வரையறுக்கப்பட்ட பக்கவாரியான வினவல் (Bounded Query)
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#064E3B] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-500 font-tamil">கோப்புகள் பட்டியலிடப்படுகின்றன...</p>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-xs text-rose-700">
            {(error as any)?.message || 'கோப்புகளைப் பெறுவதில் பிழை.'}
          </div>
        ) : files.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400 space-y-2">
            <HardDrive className="w-8 h-8 mx-auto opacity-40" />
            <p>கோப்புகள் எதுவும் காணப்படவில்லை.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">கோப்பு (File Name)</th>
                  <th className="py-3 px-4">இணைக்கப்பட்ட கதை (Story)</th>
                  <th className="py-3 px-4">வகை (Type)</th>
                  <th className="py-3 px-4">அளவு (Size)</th>
                  <th className="py-3 px-4">பதிவேற்ற தேதி</th>
                  <th className="py-3 px-4 text-right">செயல்கள் (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {files.map((file) => {
                  const isAudio = file.contentType?.includes('audio');
                  const isPlaying = activePreview?.url === file.url;

                  return (
                    <tr key={file.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5 min-w-0 max-w-xs">
                          {isAudio ? (
                            <FileAudio className="w-4 h-4 text-[#047857] shrink-0" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-amber-600 shrink-0" />
                          )}
                          <div className="truncate">
                            <p className="font-bold text-gray-900 truncate" title={file.name}>
                              {file.name}
                            </p>
                            <span className="text-[10px] font-mono text-gray-400 truncate block">
                              {file.path}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {file.associatedStory ? (
                          <span className="font-semibold text-gray-700">
                            {file.associatedStory}
                            {file.associatedChapter ? ` (${file.associatedChapter})` : ''}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">இணைக்கப்படவில்லை</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-gray-500">
                        {file.contentType}
                      </td>

                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {formatFileSize(file.sizeBytes)}
                        {file.durationSec ? (
                          <span className="text-gray-400 font-normal ml-1">
                            ({formatDuration(file.durationSec)})
                          </span>
                        ) : null}
                      </td>

                      <td className="py-3 px-4 text-gray-500">
                        {new Date(file.createdAt).toLocaleDateString([], {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {isAudio && (
                            <button
                              onClick={() => {
                                if (isPlaying) {
                                  setActivePreview(null);
                                } else {
                                  setActivePreview({ url: file.url, title: file.name });
                                }
                              }}
                              className={`p-1.5 rounded-xl transition-colors ${
                                isPlaying
                                  ? 'bg-[#064E3B] text-white'
                                  : 'bg-emerald-50 text-[#064E3B] hover:bg-emerald-100'
                              }`}
                              title={isPlaying ? 'நிறுத்து' : 'முன்னோட்டம்'}
                            >
                              {isPlaying ? (
                                <Pause className="w-3.5 h-3.5" />
                              ) : (
                                <Play className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}

                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-xl border border-gray-200 text-gray-500 hover:text-[#064E3B] hover:bg-gray-100 transition-colors"
                            title="புதிய தாவலில் திற (Open URL)"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {permissions.canManageStorage && (
                            <button
                              onClick={() => handleDelete(file)}
                              disabled={deleteMutation.isPending}
                              className="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="நீக்கு (Delete)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold">
            <span className="text-gray-500">
              பக்கம் {page} / {totalPages} (மொத்தம் {total} கோப்புகள்)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 rounded-xl bg-emerald-50 text-[#064E3B] border border-emerald-200 font-extrabold">
                {page}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
