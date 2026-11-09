import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileAudio,
  Headphones,
  Plus,
  BookOpen,
  ArrowRight,
  Upload,
  Clock,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Play,
  Pause,
  RefreshCw,
  FolderOpen,
  Trash2,
  Edit,
  Sparkles,
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

export const AdminAudioUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { api, permissions } = useAdminAuth();
  const queryClient = useQueryClient();

  const [selectedStoryId, setSelectedStoryId] = useState<string>('');
  const [activePreview, setActivePreview] = useState<{ url: string; title: string } | null>(null);

  // Upload Form State
  const [chapterNumber, setChapterNumber] = useState<number>(1);
  const [chapterTitle, setChapterTitle] = useState('');
  const [audioDescription, setAudioDescription] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [detectedDuration, setDetectedDuration] = useState<number>(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Fetch all stories for selection
  const {
    data: storiesData,
    isLoading: isStoriesLoading,
    refetch: refetchStories,
  } = useQuery({
    queryKey: ['admin', 'stories', 'all-for-upload'],
    queryFn: () => api.admin.listStories({ pageSize: 100 }),
  });

  const stories = storiesData?.items || [];

  // Set default selected story
  useEffect(() => {
    if (stories.length > 0 && !selectedStoryId) {
      setSelectedStoryId(stories[0].id);
    }
  }, [stories, selectedStoryId]);

  // Selected story detail with chapters
  const { data: currentStory, refetch: refetchCurrentStory } = useQuery({
    queryKey: ['admin', 'story', selectedStoryId],
    queryFn: () => api.admin.getStory(selectedStoryId),
    enabled: !!selectedStoryId,
  });

  const chapters: any[] = currentStory?.chapters || [];

  useEffect(() => {
    if (chapters.length > 0) {
      setChapterNumber(chapters.length + 1);
      setChapterTitle(`அத்தியாயம் ${chapters.length + 1}`);
    } else {
      setChapterNumber(1);
      setChapterTitle('அத்தியாயம் 1');
    }
  }, [chapters.length]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MP3
    const isMp3 =
      file.type === 'audio/mpeg' ||
      file.type === 'audio/mp3' ||
      file.name.toLowerCase().endsWith('.mp3');

    if (!isMp3) {
      setFormError('தயவுசெய்து MP3 ஆடியோ கோப்பை மட்டும் தேர்ந்தெடுக்கவும் (Only MP3 audio/mpeg allowed).');
      return;
    }

    // Size limit check (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setFormError('ஆடியோ கோப்பின் அளவு 100MB-க்கு மிகாமல் இருக்க வேண்டும்.');
      return;
    }

    setAudioFile(file);
    setFormError(null);

    try {
      const dur = await detectAudioDuration(file);
      setDetectedDuration(dur);
    } catch {
      setDetectedDuration(180);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoryId) {
      setFormError('தயவுசெய்து ஒரு கதையைத் தேர்ந்தெடுக்கவும்.');
      return;
    }
    if (!audioFile) {
      setFormError('தயவுசெய்து MP3 ஆடியோ கோப்பைத் தேர்ந்தெடுக்கவும்.');
      return;
    }
    if (!chapterTitle.trim()) {
      setFormError('அத்தியாயத்தின் தலைப்பை உள்ளிடவும்.');
      return;
    }

    setIsUploading(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      // 1. Create Chapter in DB
      const chapter = await api.admin.createChapter(selectedStoryId, {
        title: chapterTitle.trim(),
        episodeNumber: chapterNumber,
        description: audioDescription.trim() || undefined,
        durationSec: detectedDuration || 0,
        status: 'PUBLISHED',
      });

      // 2. Upload file to Firebase Storage
      const uploadRes = await uploadChapterAudioMp3(
        selectedStoryId,
        chapter.id,
        audioFile,
        (pct) => setUploadProgress(pct),
      );

      // 3. Save Chapter Audio link in DB
      await api.admin.saveChapterAudio(selectedStoryId, chapter.id, {
        audioUrl: uploadRes.url,
        storagePath: uploadRes.storagePath,
        durationSec: uploadRes.durationSec,
        fileSizeBytes: uploadRes.fileSizeBytes,
        fileName: uploadRes.fileName,
      });

      queryClient.invalidateQueries({ queryKey: ['admin', 'story', selectedStoryId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stories'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });

      setFormSuccess(`"${chapterTitle}" MP3 அத்தியாயம் வெற்றிகரமாகப் பதிவேற்றப்பட்டது!`);
      setAudioFile(null);
      setUploadProgress(0);
      setAudioDescription('');
      setChapterNumber((n) => n + 1);
      setChapterTitle(`அத்தியாயம் ${chapterNumber + 1}`);
    } catch (err: any) {
      setFormError(
        err?.response?.data?.message ||
          err?.message ||
          'ஆடியோ பதிவேற்றுவதில் பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#064E3B] text-xs font-bold uppercase tracking-wider mb-1.5 border border-emerald-200">
            <FileAudio className="w-3.5 h-3.5" />
            <span>ஆடியோ பதிவேற்ற மையம் (Audiobook Upload Hub)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-serif">
            MP3 ஆடியோ பதிவேற்றம் & மேலாண்மை
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            கதையைத் தேர்ந்தெடுத்து MP3 அத்தியாயங்களைப் பதிவேற்றி, கால அளவை முன்னோட்டம் பார்த்து வெளியிடவும்
          </p>
        </div>

        {selectedStoryId && (
          <button
            onClick={() => navigate(`/admin/stories/${selectedStoryId}/chapters`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 shrink-0"
          >
            <FolderOpen className="w-4 h-4" />
            <span>முழு அத்தியாயங்கள் பட்டியல் காண்க</span>
          </button>
        )}
      </div>

      {/* Active Audio Preview */}
      {activePreview && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#064E3B]">
            <span>நேரடி ஆடியோ முன்னோட்டம்: {activePreview.title}</span>
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

      {/* Story Selector & Upload Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload Form (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-gray-900 font-serif">
                புதிய MP3 அத்தியாயம் பதிவேற்று (Upload Chapter)
              </h3>
              <p className="text-xs text-gray-500">
                MP3 (audio/mpeg) கோப்புகள் Android, iOS மற்றும் கணினி உலாவிகளில் இயங்கும்
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-[#047857]" />
          </div>

          {formError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#064E3B] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#047857]" />
              <span>{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-5">
            {/* Story Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                கதையைத் தேர்ந்தெடுக்கவும் (Story Selection) <span className="text-rose-500">*</span>
              </label>
              {isStoriesLoading ? (
                <div className="h-10 rounded-xl bg-gray-100 animate-pulse" />
              ) : stories.length === 0 ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                  <span>கதைகள் எதுவும் இல்லை. முதலில் ஒரு கதையை உருவாக்கவும்.</span>
                  <Link
                    to="/admin/stories/new"
                    className="font-bold underline text-[#064E3B]"
                  >
                    புதிய கதை சேர் →
                  </Link>
                </div>
              ) : (
                <select
                  value={selectedStoryId}
                  onChange={(e) => setSelectedStoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                >
                  {stories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.totalEpisodes} அத்தியாயங்கள்) • {s.authorName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Chapter Number and Title */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
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

              <div className="col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  அத்தியாயத் தலைப்பு (Chapter Title) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="எ.கா: அத்தியாயம் 1 - தொடக்கம்"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                />
              </div>
            </div>

            {/* Audio Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                அத்தியாய விளக்கம் (Description - விருப்பமானது)
              </label>
              <textarea
                rows={2}
                placeholder="இந்த அத்தியாயத்தைப் பற்றிய சிறு குறிப்பு..."
                value={audioDescription}
                onChange={(e) => setAudioDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
              />
            </div>

            {/* MP3 File Input Box */}
            <div className="p-5 rounded-2xl bg-[#FAF7EE] border-2 border-dashed border-emerald-300 space-y-3">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-white text-[#064E3B] flex items-center justify-center mx-auto shadow-sm">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <label className="inline-block px-4 py-2 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white text-xs font-bold cursor-pointer transition-colors shadow-sm">
                    <span>MP3 ஆடியோ கோப்பைத் தேர்ந்தெடு (Select MP3)</span>
                    <input
                      type="file"
                      accept="audio/mpeg,audio/mp3,.mp3"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-gray-500 mt-1">
                    வடிவம்: MP3 (audio/mpeg) • அதிகபட்சம் 100MB
                  </p>
                </div>
              </div>

              {audioFile && (
                <div className="p-3 rounded-xl bg-white border border-emerald-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileAudio className="w-4 h-4 text-[#047857] shrink-0" />
                    <span className="font-bold text-gray-900 truncate">
                      {audioFile.name}
                    </span>
                    <span className="text-gray-400">({formatFileSize(audioFile.size)})</span>
                  </div>
                  {detectedDuration > 0 && (
                    <span className="font-bold text-[#064E3B] shrink-0">
                      {formatDuration(detectedDuration)}
                    </span>
                  )}
                </div>
              )}

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-gray-700">
                    <span>Firebase Storage-ல் பதிவேற்றப்படுகிறது...</span>
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isUploading || !audioFile}
              className="w-full py-3 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>பதிவேற்றப்படுகிறது... ({uploadProgress}%)</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>ஆடியோ அத்தியாயத்தைப் பதிவேற்று (Upload Chapter)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Existing Chapters for Selected Story (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-gray-900 font-serif flex items-center gap-2">
              <Headphones className="w-4 h-4 text-[#064E3B]" />
              <span>தற்போதுள்ள அத்தியாயங்கள்</span>
            </h3>
            <span className="text-xs font-bold text-[#047857]">
              {chapters.length} கோப்புகள்
            </span>
          </div>

          <div className="divide-y divide-gray-100 max-h-[480px] overflow-y-auto pr-1">
            {chapters.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                இந்தக் கதைக்கு இன்னும் அத்தியாயங்கள் இல்லை. இடதுபுறப் படிவத்தைப் பயன்படுத்தி முதல் அத்தியாயத்தைப் பதிவேற்றவும்.
              </div>
            ) : (
              chapters.map((ch: any) => {
                const isPlaying = activePreview?.url === ch.audioUrl;
                return (
                  <div
                    key={ch.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-gray-50/70 p-2 rounded-xl transition-colors"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="font-bold text-gray-900 truncate">
                        #{ch.number} • {ch.title}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {ch.durationSec ? formatDuration(ch.durationSec) : '00:00'} •{' '}
                        {ch.fileSizeBytes ? formatFileSize(ch.fileSizeBytes) : '0 B'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {ch.audioUrl && (
                        <button
                          onClick={() => {
                            if (isPlaying) {
                              setActivePreview(null);
                            } else {
                              setActivePreview({ url: ch.audioUrl, title: ch.title });
                            }
                          }}
                          className={`p-2 rounded-xl transition-colors ${
                            isPlaying
                              ? 'bg-[#064E3B] text-white'
                              : 'bg-emerald-50 text-[#064E3B] hover:bg-emerald-100'
                          }`}
                          title={isPlaying ? 'நிறுத்து' : 'முன்னோட்டம் கேள்'}
                        >
                          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
