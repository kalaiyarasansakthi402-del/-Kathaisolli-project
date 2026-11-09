import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Headphones,
  Upload,
  CheckCircle2,
  Clock,
  Trash2,
  AlertCircle,
  Volume2,
  FileAudio,
  Play,
  Pause,
  RefreshCw,
  X,
  Edit,
  FolderOpen,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  uploadChapterAudioMp3,
  formatFileSize,
  detectAudioDuration,
} from '../services/firebaseAdminStorage';
import { formatDuration } from '@kathaisolli/shared-utils';
import { AudioPreviewPlayer } from '../components/AudioPreviewPlayer';

export const AdminBookChaptersPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const { api, permissions } = useAdminAuth();
  const queryClient = useQueryClient();

  // Active playing preview
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);
  const [activePreviewTitle, setActivePreviewTitle] = useState<string>('');

  // Add/Edit Chapter Modal
  const [showModal, setShowModal] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [chapterNumber, setChapterNumber] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [tamilTitle, setTamilTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');

  // File upload state for single chapter
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [detectedDuration, setDetectedDuration] = useState<number>(0);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Bulk Upload Modal state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFiles, setBulkFiles] = useState<
    Array<{
      file: File;
      chapterNumber: number;
      title: string;
      durationSec: number;
      progress: number;
      status: 'pending' | 'uploading' | 'completed' | 'error';
      error?: string;
    }>
  >([]);
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  // Fetch story details with chapters from real database
  const {
    data: story,
    isLoading,
    isError,
    error: storyError,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'story', bookId],
    queryFn: () => api.admin.getStory(bookId!),
    enabled: !!bookId,
  });

  const chapters: any[] = story?.chapters || [];

  useEffect(() => {
    if (chapters.length > 0 && !editingChapterId) {
      setChapterNumber(chapters.length + 1);
    }
  }, [chapters.length, editingChapterId]);

  const handleAudioSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isMp3 =
      file.type === 'audio/mpeg' ||
      file.type === 'audio/mp3' ||
      file.name.toLowerCase().endsWith('.mp3');

    if (!isMp3) {
      setError('தயவுசெய்து MP3 ஆடியோ கோப்பை மட்டும் தேர்ந்தெடுக்கவும் (Only MP3 audio/mpeg allowed).');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create instant local blob URL for preview and detect duration
    const localUrl = URL.createObjectURL(file);
    setPreviewAudioUrl(localUrl);

    try {
      const dur = await detectAudioDuration(file);
      setDetectedDuration(dur);
    } catch {
      setDetectedDuration(180);
    }
  };

  const openAddModal = () => {
    setEditingChapterId(null);
    setChapterNumber(chapters.length + 1);
    setTitle(`Chapter ${chapters.length + 1}`);
    setTamilTitle(`அத்தியாயம் ${chapters.length + 1}`);
    setDescription('');
    setStatus('PUBLISHED');
    setSelectedFile(null);
    setPreviewAudioUrl('');
    setDetectedDuration(0);
    setError(null);
    setSuccess(null);
    setShowModal(true);
  };

  const openEditModal = (ch: any) => {
    setEditingChapterId(ch.id);
    setChapterNumber(ch.number);
    setTitle(ch.title);
    setTamilTitle(ch.title);
    setDescription(ch.description || '');
    setStatus(ch.status || 'PUBLISHED');
    setSelectedFile(null);
    setPreviewAudioUrl(ch.audioUrl || '');
    setDetectedDuration(ch.durationSec || 0);
    setError(null);
    setSuccess(null);
    setShowModal(true);
  };

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookId) return;

    if (!title.trim() && !tamilTitle.trim()) {
      setError('தயவுசெய்து அத்தியாயத்தின் தலைப்பை உள்ளிடவும்.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const displayTitle = tamilTitle.trim() && title.trim() && tamilTitle.trim() !== title.trim()
        ? `${tamilTitle.trim()} (${title.trim()})`
        : tamilTitle.trim() || title.trim();

      let chapterId = editingChapterId;

      if (!chapterId) {
        // Create chapter in database
        const created = await api.admin.createChapter(bookId, {
          title: displayTitle,
          episodeNumber: chapterNumber,
          description: description.trim() || undefined,
          durationSec: detectedDuration || 0,
          status,
        });
        chapterId = created.id;
      } else {
        // Update chapter in database
        await api.admin.updateChapter(bookId, chapterId, {
          title: displayTitle,
          episodeNumber: chapterNumber,
          description: description.trim() || undefined,
          durationSec: detectedDuration || undefined,
          status,
        });
      }

      // If an audio file was selected, upload it to Firebase Storage and save URL to DB
      if (selectedFile && chapterId) {
        const uploadRes = await uploadChapterAudioMp3(
          bookId,
          chapterId,
          selectedFile,
          (pct) => setUploadProgress(pct),
        );

        await api.admin.saveChapterAudio(bookId, chapterId, {
          audioUrl: uploadRes.url,
          storagePath: uploadRes.storagePath,
          durationSec: uploadRes.durationSec,
          fileSizeBytes: uploadRes.fileSizeBytes,
          fileName: uploadRes.fileName,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['admin', 'story', bookId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stories'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });

      setSuccess('அத்தியாயம் வெற்றிகரமாகச் சேமிக்கப்பட்டது!');
      setTimeout(() => {
        setShowModal(false);
      }, 1000);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'அத்தியாயத்தைச் சேமிப்பதில் பிழை ஏற்பட்டது.',
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteChapter = async (ch: any) => {
    if (!bookId) return;
    if (
      confirm(
        `"${ch.title}" அத்தியாயத்தை நிச்சயமாக நீக்க விரும்புகிறீர்களா? (Delete chapter?)`,
      )
    ) {
      try {
        await api.admin.deleteChapter(bookId, ch.id);
        queryClient.invalidateQueries({ queryKey: ['admin', 'story', bookId] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      } catch (err: any) {
        alert(err?.response?.data?.message || 'நீக்குவதில் பிழை ஏற்பட்டது.');
      }
    }
  };

  const handleDeleteAudioOnly = async (ch: any) => {
    if (!bookId) return;
    if (confirm(`இந்த அத்தியாயத்தின் ஆடியோவை மட்டும் நீக்கவா?`)) {
      try {
        await api.admin.deleteChapterAudio(bookId, ch.id);
        queryClient.invalidateQueries({ queryKey: ['admin', 'story', bookId] });
      } catch (err: any) {
        alert(err?.response?.data?.message || 'ஆடியோ நீக்குவதில் பிழை.');
      }
    }
  };

  // Bulk Upload File Handlers
  const handleBulkFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Filter only MP3 files and sort alphabetically
    const mp3Files = files.filter(
      (f) =>
        f.type === 'audio/mpeg' ||
        f.type === 'audio/mp3' ||
        f.name.toLowerCase().endsWith('.mp3'),
    );

    mp3Files.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }),
    );

    const startNum = chapters.length + 1;
    const initialList = await Promise.all(
      mp3Files.map(async (file, idx) => {
        const num = startNum + idx;
        const cleanName = file.name.replace(/\.mp3$/i, '').replace(/[_-]/g, ' ');
        let durationSec = 180;
        try {
          durationSec = await detectAudioDuration(file);
        } catch {
          // fallback
        }
        return {
          file,
          chapterNumber: num,
          title: `Chapter ${num} - ${cleanName}`,
          durationSec,
          progress: 0,
          status: 'pending' as const,
        };
      }),
    );

    setBulkFiles(initialList);
    setShowBulkModal(true);
  };

  const startBulkUpload = async () => {
    if (!bookId || bulkFiles.length === 0) return;
    setIsBulkUploading(true);

    for (let i = 0; i < bulkFiles.length; i++) {
      const item = bulkFiles[i];
      if (item.status === 'completed') continue;

      // Update state to uploading
      setBulkFiles((prev) =>
        prev.map((it, idx) => (idx === i ? { ...it, status: 'uploading' } : it)),
      );

      try {
        // 1. Create chapter
        const chapter = await api.admin.createChapter(bookId, {
          title: item.title,
          episodeNumber: item.chapterNumber,
          durationSec: item.durationSec,
          status: 'PUBLISHED',
        });

        // 2. Upload MP3 to Firebase
        const uploadRes = await uploadChapterAudioMp3(
          bookId,
          chapter.id,
          item.file,
          (pct) => {
            setBulkFiles((prev) =>
              prev.map((it, idx) => (idx === i ? { ...it, progress: pct } : it)),
            );
          },
        );

        // 3. Save audio link to database
        await api.admin.saveChapterAudio(bookId, chapter.id, {
          audioUrl: uploadRes.url,
          storagePath: uploadRes.storagePath,
          durationSec: uploadRes.durationSec,
          fileSizeBytes: uploadRes.fileSizeBytes,
          fileName: uploadRes.fileName,
        });

        setBulkFiles((prev) =>
          prev.map((it, idx) =>
            idx === i ? { ...it, status: 'completed', progress: 100 } : it,
          ),
        );
      } catch (err: any) {
        setBulkFiles((prev) =>
          prev.map((it, idx) =>
            idx === i ? { ...it, status: 'error', error: err?.message || 'Upload failed' } : it,
          ),
        );
      }
    }

    setIsBulkUploading(false);
    queryClient.invalidateQueries({ queryKey: ['admin', 'story', bookId] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'stories'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-[#064E3B] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-gray-500 font-tamil">அத்தியாயங்கள் ஏற்றப்படுகின்றன...</p>
      </div>
    );
  }

  if (isError || !story) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-rose-800 space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span>கதை விவரங்களை ஏற்றுவதில் பிழை</span>
          </div>
          <p className="text-xs">{(storyError as any)?.message || 'கதை காணப்படவில்லை.'}</p>
          <Link
            to="/admin/stories"
            className="px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold inline-block"
          >
            கதைகள் பட்டியலுக்குத் திரும்பு
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/admin/stories"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#064E3B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>கதைகள் பட்டியலுக்குத் திரும்பு (Back)</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-serif">
            {story.title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            எழுத்தாளர்: <span className="font-semibold text-gray-700">{story.authorName}</span> • மொத்தம்{' '}
            {chapters.length} அத்தியாயங்கள்
          </p>
        </div>

        {/* Action Buttons */}
        {permissions.canUploadAudio && (
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Bulk Upload Button */}
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs cursor-pointer transition-colors shadow-sm">
              <FolderOpen className="w-4 h-4 text-[#064E3B]" />
              <span>மொத்த MP3 பதிவேற்றம் (Bulk Upload)</span>
              <input
                type="file"
                multiple
                accept="audio/mpeg,audio/mp3,.mp3"
                onChange={handleBulkFilesSelect}
                className="hidden"
              />
            </label>

            {/* Single Chapter Modal Button */}
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white font-bold text-xs shadow-md transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>புதிய அத்தியாயம் சேர் (Add Chapter)</span>
            </button>
          </div>
        )}
      </div>

      {/* Active Audio Preview Bar */}
      {activePreviewUrl && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#064E3B]">
            <span>நேரடி ஆடியோ முன்னோட்டம்: {activePreviewTitle}</span>
            <button
              onClick={() => setActivePreviewUrl(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕ மூடு
            </button>
          </div>
          <AudioPreviewPlayer src={activePreviewUrl} title={activePreviewTitle} />
        </div>
      )}

      {/* Chapters Table & List Card */}
      <div className="rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-[#064E3B]" />
            <h3 className="font-bold text-sm text-gray-900 font-serif">
              அத்தியாயங்களின் வரிசை (Chapters & Episodes)
            </h3>
          </div>
          <span className="text-xs text-gray-400 font-semibold">
            {chapters.filter((c) => c.audioUrl).length} / {chapters.length} ஆடியோ உள்ளது
          </span>
        </div>

        {chapters.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#064E3B] flex items-center justify-center mx-auto">
              <FileAudio className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900">
                அத்தியாயங்கள் எதுவும் சேர்க்கப்படவில்லை
              </h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                இந்தக் கதைக்கு இன்னும் MP3 அத்தியாயங்கள் பதிவேற்றப்படவில்லை. மேலே உள்ள "புதிய அத்தியாயம் சேர்" அல்லது "மொத்த MP3 பதிவேற்றம்" பொத்தானைப் பயன்படுத்தவும்.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {chapters.map((ch: any) => {
              const hasAudio = Boolean(ch.audioUrl);
              const isPlaying = activePreviewUrl === ch.audioUrl;

              return (
                <div
                  key={ch.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Chapter Number Badge */}
                    <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center font-bold text-xs shrink-0 font-serif">
                      #{ch.number}
                    </div>

                    {/* Title & Metadata */}
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-gray-900 truncate">
                          {ch.title}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            ch.status === 'PUBLISHED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {ch.status === 'PUBLISHED' ? 'வெளியானது' : 'வரைவு'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        {ch.durationSec ? (
                          <span className="flex items-center gap-1 font-semibold text-gray-600">
                            <Clock className="w-3 h-3" />
                            <span>{formatDuration(ch.durationSec)}</span>
                          </span>
                        ) : null}
                        {ch.fileSizeBytes ? (
                          <span>{formatFileSize(ch.fileSizeBytes)}</span>
                        ) : null}
                        {hasAudio ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Firebase MP3</span>
                          </span>
                        ) : (
                          <span className="text-amber-700 font-bold">ஆடியோ இல்லை</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {hasAudio && (
                      <button
                        onClick={() => {
                          if (isPlaying) {
                            setActivePreviewUrl(null);
                          } else {
                            setActivePreviewUrl(ch.audioUrl);
                            setActivePreviewTitle(ch.title);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          isPlaying
                            ? 'bg-[#064E3B] text-white shadow-sm'
                            : 'bg-emerald-50 text-[#064E3B] border border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isPlaying ? 'நிறுத்து' : 'கேளுங்கள்'}</span>
                      </button>
                    )}

                    {permissions.canUploadAudio && (
                      <button
                        onClick={() => openEditModal(ch)}
                        className="p-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors shadow-sm"
                        title="திருத்து / மாற்று (Edit / Replace Audio)"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}

                    {permissions.canUploadAudio && (
                      <button
                        onClick={() => handleDeleteChapter(ch)}
                        className="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="அத்தியாயத்தை நீக்கு (Delete Chapter)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Chapter Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 space-y-5 border border-gray-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#064E3B] text-xs font-bold uppercase tracking-wider mb-2">
                <Headphones className="w-3.5 h-3.5" />
                <span>
                  {editingChapterId ? 'அத்தியாயத்தைத் திருத்து' : 'புதிய MP3 அத்தியாயம்'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 font-serif">
                {editingChapterId ? 'அத்தியாயம் & ஆடியோ விவரங்கள்' : 'புதிய அத்தியாயம் பதிவு'}
              </h3>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#064E3B] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#047857]" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSaveChapter} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700">
                    எண் (No.)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={chapterNumber}
                    onChange={(e) => setChapterNumber(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-gray-700">
                    நிலை (Status)
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                  >
                    <option value="PUBLISHED">வெளியீடு (Published)</option>
                    <option value="DRAFT">வரைவு (Draft)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">
                  அத்தியாயத் தலைப்பு (Chapter Title)
                </label>
                <input
                  type="text"
                  required
                  placeholder="எ.கா: அத்தியாயம் 1 - புதிய விடியல்"
                  value={tamilTitle}
                  onChange={(e) => setTamilTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">
                  சுருக்கமான விளக்கம் (Description - விருப்பமானது)
                </label>
                <textarea
                  rows={2}
                  placeholder="இந்த அத்தியாயத்தில் இடம்பெறும் காட்சிகள் பற்றிய சுருக்கம்..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                />
              </div>

              {/* Audio File Selection & Progress */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <label className="block text-xs font-bold text-gray-700">
                  MP3 ஆடியோ கோப்பு (Audio File - audio/mpeg)
                </label>

                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 text-xs font-bold text-gray-800 cursor-pointer shadow-sm transition-colors">
                    <Upload className="w-4 h-4 text-[#064E3B]" />
                    <span>MP3 கோப்பைத் தேர்ந்தெடு</span>
                    <input
                      type="file"
                      accept="audio/mpeg,audio/mp3,.mp3"
                      onChange={handleAudioSelect}
                      className="hidden"
                    />
                  </label>

                  {selectedFile ? (
                    <span className="text-xs text-emerald-800 font-bold truncate max-w-[200px]">
                      {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </span>
                  ) : previewAudioUrl ? (
                    <span className="text-xs text-gray-500 font-semibold truncate max-w-[200px]">
                      ஏற்கனவே ஆடியோ உள்ளது
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">கோப்பு தேர்ந்தெடுக்கப்படவில்லை</span>
                  )}
                </div>

                {detectedDuration > 0 && (
                  <div className="text-[11px] text-[#064E3B] font-bold">
                    கண்டறியப்பட்ட ஆடியோ கால அளவு: {formatDuration(detectedDuration)}
                  </div>
                )}

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-gray-600">
                      <span>Firebase பதிவேற்றம்</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full bg-[#064E3B] transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  ரத்து செய்
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white text-xs font-bold shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>பதிவேற்றப்படுகிறது...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>சேமித்து வெளியிடு</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 space-y-5 border border-gray-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                if (!isBulkUploading) setShowBulkModal(false);
              }}
              disabled={isBulkUploading}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#064E3B] text-xs font-bold uppercase tracking-wider mb-2">
                <FolderOpen className="w-3.5 h-3.5" />
                <span>மொத்த ஆடியோ பதிவேற்றம் (Bulk Upload Queue)</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 font-serif">
                {bulkFiles.length} MP3 கோப்புகள் வரிசைப்படுத்தப்பட்டுள்ளன
              </h3>
              <p className="text-xs text-gray-500">
                கோப்புகள் ஒவ்வொன்றாக Firebase Storage-க்கு பதிவேற்றப்பட்டு தானாக அத்தியாயங்களாக இணைக்கப்படும்.
              </p>
            </div>

            {/* Queue List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-2xl p-2 bg-gray-50">
              {bulkFiles.map((item, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-3">
                    <p className="font-bold text-gray-900 truncate">
                      #{item.chapterNumber} • {item.title}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {formatFileSize(item.file.size)} • {formatDuration(item.durationSec)}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {item.status === 'completed' && (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>முடிந்தது</span>
                      </span>
                    )}
                    {item.status === 'uploading' && (
                      <span className="text-[#064E3B] font-bold">
                        {item.progress}%
                      </span>
                    )}
                    {item.status === 'pending' && (
                      <span className="text-gray-400">காத்திருக்கிறது</span>
                    )}
                    {item.status === 'error' && (
                      <span className="text-rose-600 font-bold">பிழை</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Controls */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                disabled={isBulkUploading}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                மூடு (Close)
              </button>
              <button
                type="button"
                onClick={startBulkUpload}
                disabled={isBulkUploading}
                className="flex-1 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white text-xs font-bold shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isBulkUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>பதிவேற்றப்படுகிறது...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>அனைத்தையும் பதிவேற்று ({bulkFiles.length} Files)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
