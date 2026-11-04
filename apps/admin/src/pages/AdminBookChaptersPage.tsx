import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Headphones,
  Upload,
  CheckCircle,
  Clock,
  Trash2,
  AlertCircle,
  Volume2,
  FileAudio,
} from 'lucide-react';
import {
  getAdminBook,
  upsertAdminChapter,
  deleteAdminChapter,
  type AdminBook,
  type AdminChapter,
} from '../services/adminCatalogService';
import {
  uploadChapterAudioMp3,
  formatFileSize,
} from '../services/firebaseAdminStorage';
import { formatDuration } from '@kathaisolli/shared-utils';
import { AudioPreviewPlayer } from '../components/AudioPreviewPlayer';

export const AdminBookChaptersPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<AdminBook | null>(() => (bookId ? getAdminBook(bookId) : null));

  // Add chapter modal state
  const [showModal, setShowModal] = useState(false);
  const [chapterNumber, setChapterNumber] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [tamilTitle, setTamilTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [detectedDuration, setDetectedDuration] = useState<number>(0);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Active playing preview
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);
  const [activePreviewTitle, setActivePreviewTitle] = useState<string>('');

  // Bulk upload state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFiles, setBulkFiles] = useState<
    Array<{
      file: File;
      chapterNumber: number;
      title: string;
      tamilTitle: string;
      durationSec: number;
      progress: number;
      status: 'pending' | 'uploading' | 'completed' | 'error';
      isDuplicate: boolean;
      error?: string;
    }>
  >([]);
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  useEffect(() => {
    if (bookId) {
      const b = getAdminBook(bookId);
      setBook(b);
      if (b) {
        setChapterNumber(b.chapters.length + 1);
      }
    }
  }, [bookId]);

  const refreshBook = () => {
    if (bookId) {
      const b = getAdminBook(bookId);
      setBook(b);
      if (b) {
        setChapterNumber(b.chapters.length + 1);
      }
    }
  };

  const handleAudioSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MP3
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

    // Detect duration using Audio element
    const audio = new Audio();
    audio.src = localUrl;
    audio.onloadedmetadata = () => {
      setDetectedDuration(Math.round(audio.duration || 0));
    };
  };

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book || !title.trim() && !tamilTitle.trim()) {
      setError('தயவுசெய்து அத்தியாயத்தின் தலைப்பை உள்ளிடவும்.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const chapterId = `ch-${book.id}-${Date.now()}`;
      let audioUrl = previewAudioUrl || '/audio/arthashastram_01.mp3';
      let storagePath: string | undefined;
      let finalDuration = detectedDuration || 300;
      let fileSizeBytes = selectedFile?.size || 2866408;

      // Upload MP3 to Firebase Storage if a real file was selected
      if (selectedFile) {
        const uploadRes = await uploadChapterAudioMp3(
          book.id,
          chapterId,
          selectedFile,
          (pct) => setUploadProgress(pct)
        );
        audioUrl = uploadRes.url;
        storagePath = uploadRes.storagePath;
        finalDuration = uploadRes.durationSec || finalDuration;
        fileSizeBytes = uploadRes.fileSizeBytes;
      }

      // Save Chapter to database
      upsertAdminChapter(book.id, {
        id: chapterId,
        number: chapterNumber,
        title: title || tamilTitle,
        tamilTitle: tamilTitle || title,
        description,
        audioUrl,
        storagePath,
        durationSec: finalDuration,
        fileSizeBytes,
        fileName: selectedFile?.name || `${chapterNumber}.mp3`,
        status,
      });

      // Reset modal
      setShowModal(false);
      setSelectedFile(null);
      setPreviewAudioUrl('');
      setTitle('');
      setTamilTitle('');
      setDescription('');
      setUploadProgress(0);
      setDetectedDuration(0);
      refreshBook();
    } catch (err: any) {
      console.error('Failed to save chapter:', err);
      setError(err?.message || 'அத்தியாயம் சேமிப்பதில் பிழை ஏற்பட்டது.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteChapter = (chId: string, chTitle: string) => {
    if (!book) return;
    if (confirm(`"${chTitle}" அத்தியாயத்தை நிச்சயமாக நீக்க விரும்புகிறீர்களா?`)) {
      deleteAdminChapter(book.id, chId);
      refreshBook();
    }
  };

  const handleBulkFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !book) return;

    let baseNumber = book.chapters.length + 1;
    const prepared = files.map((file, idx) => {
      // Auto-extract number from filename (e.g. 01.mp3 -> 1, Chapter_05.mp3 -> 5)
      const numMatch = file.name.match(/\d+/);
      const parsedNum = numMatch ? parseInt(numMatch[0], 10) : baseNumber + idx;
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');

      // Duplicate detection against existing book chapters
      const isDuplicate = book.chapters.some(
        (c) => c.number === parsedNum || c.fileName?.toLowerCase() === file.name.toLowerCase()
      );

      return {
        file,
        chapterNumber: parsedNum,
        title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
        tamilTitle: `அத்தியாயம் ${parsedNum}`,
        durationSec: 300,
        progress: 0,
        status: 'pending' as const,
        isDuplicate,
      };
    });

    setBulkFiles(prepared);
    setShowBulkModal(true);
  };

  const startBulkUpload = async () => {
    if (!book || !bulkFiles.length) return;
    setIsBulkUploading(true);

    const updatedFiles = [...bulkFiles];

    for (let i = 0; i < updatedFiles.length; i++) {
      const item = updatedFiles[i];
      item.status = 'uploading';
      setBulkFiles([...updatedFiles]);

      try {
        const chapterId = `ch-${book.id}-${Date.now()}-${i}`;
        const uploadRes = await uploadChapterAudioMp3(
          book.id,
          chapterId,
          item.file,
          (pct) => {
            item.progress = pct;
            setBulkFiles([...updatedFiles]);
          }
        );

        upsertAdminChapter(book.id, {
          id: chapterId,
          number: item.chapterNumber,
          title: item.title,
          tamilTitle: item.tamilTitle,
          audioUrl: uploadRes.url,
          storagePath: uploadRes.storagePath,
          durationSec: uploadRes.durationSec || item.durationSec,
          fileSizeBytes: uploadRes.fileSizeBytes,
          fileName: item.file.name,
          status: 'PUBLISHED',
        });

        item.status = 'completed';
        item.progress = 100;
      } catch (err: any) {
        item.status = 'error';
        item.error = err?.message || 'Upload failed';
      }

      setBulkFiles([...updatedFiles]);
    }

    setIsBulkUploading(false);
    refreshBook();
  };

  if (!book) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-zinc-500">புத்தகம் கிடைக்கவில்லை (Book not found).</p>
        <Link to="/books" className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs">
          புத்தகங்கள் பட்டியலுக்குச் செல்
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8">
      {/* Back button */}
      <Link
        to="/books"
        className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>புத்தகங்கள் மேலாண்மைக்குத் திரும்பு</span>
      </Link>

      {/* Book Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm flex flex-col sm:flex-row gap-6 items-start justify-between">
        <div className="flex gap-4 items-center">
          <div className="w-20 h-24 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-sm">
            <img
              src={book.coverImageUrl || '/images/temple-sunset.jpg'}
              alt={book.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/images/temple-sunset.jpg';
              }}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  book.status === 'PUBLISHED'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {book.status === 'PUBLISHED' ? 'வெளியிடப்பட்டது (Published)' : 'வரைவு (Draft)'}
              </span>
              <span className="text-xs text-zinc-400 font-mono">ID: {book.id}</span>
            </div>
            <h1 className="text-2xl font-black font-serif text-zinc-900 dark:text-zinc-100">
              {book.tamilTitle || book.title}
            </h1>
            <p className="text-xs text-zinc-500">{book.title} • {book.authorName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-300 font-bold text-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>மொத்தப் பதிவேற்றம் (Bulk MP3)</span>
            <input
              type="file"
              multiple
              accept="audio/mp3,audio/mpeg,audio/ogg,audio/wav,audio/x-m4a"
              onChange={handleBulkFilesSelect}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              setShowModal(true);
              setError(null);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all hover:scale-105 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>புதிய அத்தியாயம் சேர்க்க (Upload MP3)</span>
          </button>
        </div>
      </div>

      {/* Active Audio Preview Bar */}
      {activePreviewUrl && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <span>ஆடியோ பின்னணி முன்னோட்டம் (Live Audio Preview)</span>
            <button
              onClick={() => setActivePreviewUrl(null)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              ✕ மூடு
            </button>
          </div>
          <AudioPreviewPlayer src={activePreviewUrl} title={activePreviewTitle} />
        </div>
      )}

      {/* Chapters List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-serif text-zinc-900 dark:text-zinc-100">
          அத்தியாயங்கள் பட்டியல் ({book.chapters.length})
        </h2>

        {book.chapters.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#10221B] border border-dashed border-zinc-300 dark:border-zinc-700 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
              <Headphones className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                அத்தியாயங்கள் எதுவும் சேர்க்கப்படவில்லை
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                முதல் அத்தியாயத்திற்கான MP3 ஆடியோ கோப்பைப் பதிவேற்றி, முன்னோட்டம் பார்த்து வெளியிடவும்.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
            >
              + அத்தியாயம் பதிவேற்று
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {book.chapters.map((ch) => {
              const isCurrentPlaying = activePreviewUrl === ch.audioUrl;

              return (
                <div
                  key={ch.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    {/* Chapter Number Badge */}
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-300 dark:border-emerald-800">
                      {ch.number}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {ch.tamilTitle || ch.title}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ch.status === 'PUBLISHED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {ch.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {ch.title} • {formatDuration(ch.durationSec)} • {formatFileSize(ch.fileSizeBytes)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {ch.audioUrl && (
                      <button
                        onClick={() => {
                          setActivePreviewUrl(ch.audioUrl!);
                          setActivePreviewTitle(ch.tamilTitle || ch.title);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          isCurrentPlaying
                            ? 'bg-emerald-500 text-emerald-950'
                            : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                        title="முன்னோட்டம் கேள் (Preview Audio)"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isCurrentPlaying ? 'இயங்குகிறது' : 'கேள் (Play)'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteChapter(ch.id, ch.tamilTitle || ch.title)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="நீக்கு (Delete)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Chapter Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0A1E16] text-zinc-900 dark:text-zinc-100 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-emerald-900/60 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-bold font-serif">
                  புதிய அத்தியாயம் சேர்க்க (Upload MP3 Chapter)
                </h3>
                <p className="text-xs text-zinc-500">
                  {book.tamilTitle} • அத்தியாயம் {chapterNumber}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-lg"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveChapter} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                    எண் (No.)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={chapterNumber}
                    onChange={(e) => setChapterNumber(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-[#06241C] text-sm"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                    தமிழ் தலைப்பு *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="எ.கா. அத்தியாயம் 1 - தொடக்கம்"
                    value={tamilTitle}
                    onChange={(e) => setTamilTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-[#06241C] text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                  ஆங்கிலத் தலைப்பு (English Title)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 1 - The Beginning"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-[#06241C] text-sm"
                />
              </div>

              {/* Audio Upload Box */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  MP3 ஆடியோ கோப்பு (Audio File) *
                </label>

                <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-[#071E16] hover:bg-emerald-50 cursor-pointer transition-colors text-center">
                  <FileAudio className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-1" />
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    {selectedFile ? selectedFile.name : 'MP3 கோப்பைத் தேர்ந்தெடுக்க இங்கே கிளிக் செய்யவும்'}
                  </span>
                  <span className="text-[11px] text-zinc-500 mt-0.5">
                    MIME Type: audio/mpeg (.mp3)
                  </span>
                  <input
                    type="file"
                    accept="audio/mpeg,audio/mp3,.mp3"
                    onChange={handleAudioSelect}
                    className="hidden"
                  />
                </label>

                {/* Upload Progress Bar */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-500 font-mono">
                      <span>Firebase Storage ஏற்றுதல்...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Detected Audio Metadata */}
                {selectedFile && (
                  <div className="p-3 rounded-xl bg-zinc-100 dark:bg-[#06241C] text-xs space-y-1 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-300 font-mono">
                      <span>கோப்பு அளவு:</span>
                      <span className="font-bold">{formatFileSize(selectedFile.size)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-300 font-mono">
                      <span>ஆடியோ நீளம்:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {detectedDuration > 0 ? formatDuration(detectedDuration) : 'கணக்கிடுகிறது...'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Interactive Audio Preview */}
                {previewAudioUrl && (
                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                      உடனடி ஆடியோ சரிபார்ப்பு (Audio Preview before Save):
                    </p>
                    <AudioPreviewPlayer src={previewAudioUrl} title={tamilTitle || selectedFile?.name} />
                  </div>
                )}
              </div>

              {/* Status Toggle */}
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#06241C] border border-zinc-200 dark:border-zinc-800 flex gap-4 text-xs font-semibold">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="chapterStatus"
                    value="PUBLISHED"
                    checked={status === 'PUBLISHED'}
                    onChange={() => setStatus('PUBLISHED')}
                    className="accent-emerald-600"
                  />
                  <span>வெளியிடு (Publish)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="chapterStatus"
                    value="DRAFT"
                    checked={status === 'DRAFT'}
                    onChange={() => setStatus('DRAFT')}
                    className="accent-emerald-600"
                  />
                  <span>வரைவு (Draft)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-100"
                >
                  ரத்துசெய்
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {isUploading ? 'ஏற்றப்படுகிறது...' : 'அத்தியாயத்தைச் சேமி (Save Chapter)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Chapter Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/60 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-serif text-zinc-900 dark:text-zinc-100">
                  மொத்த ஆடியோ அத்தியாயங்கள் பதிவேற்றம் (Bulk Audio Upload)
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  தேர்ந்தெடுக்கப்பட்ட கோப்புகள்: {bulkFiles.length} • தானியங்கி அத்தியாய எண் கண்டறிதல் & நகல் சரிபார்ப்பு
                </p>
              </div>
              <button
                onClick={() => {
                  if (!isBulkUploading) setShowBulkModal(false);
                }}
                disabled={isBulkUploading}
                className="text-zinc-400 hover:text-zinc-600 text-sm font-bold disabled:opacity-50"
              >
                ✕ மூடு
              </button>
            </div>

            {/* File List Table */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-zinc-50 dark:bg-[#0A1612] text-zinc-500 uppercase font-bold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">கோப்பு பெயர்</th>
                    <th className="px-4 py-3 text-center">அத்தியாயம் #</th>
                    <th className="px-4 py-3">பரிந்துரைக்கப்பட்ட தலைப்பு</th>
                    <th className="px-4 py-3 text-center">நகல் சரிபார்ப்பு</th>
                    <th className="px-4 py-3 text-center">நிலை / முன்னேற்றம்</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {bulkFiles.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-[#081813]">
                      <td className="px-4 py-3 font-mono font-semibold truncate max-w-[160px]">
                        {item.file.name}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-700 dark:text-emerald-400">
                        #{item.chapterNumber}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.title}
                          disabled={isBulkUploading}
                          onChange={(e) => {
                            const newFiles = [...bulkFiles];
                            newFiles[idx].title = e.target.value;
                            setBulkFiles(newFiles);
                          }}
                          className="w-full px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0A1612] text-xs font-medium"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.isDuplicate ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            நகல் எச்சரிக்கை
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            புதியது
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.status === 'pending' && <span className="text-zinc-400">காத்திருக்கிறது</span>}
                        {item.status === 'uploading' && (
                          <div className="w-20 mx-auto space-y-1">
                            <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-emerald-600">{item.progress}%</span>
                          </div>
                        )}
                        {item.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>வெற்றி</span>
                          </span>
                        )}
                        {item.status === 'error' && (
                          <span className="text-rose-600 font-bold">{item.error || 'தோல்வி'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-xs text-zinc-500">
                Firebase Storage: <code className="font-mono text-emerald-600">vaagai-audio-books-36a4e.appspot.com</code>
              </span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  disabled={isBulkUploading}
                  className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-100 disabled:opacity-50"
                >
                  ரத்து செய்
                </button>
                <button
                  type="button"
                  onClick={startBulkUpload}
                  disabled={isBulkUploading || bulkFiles.length === 0}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {isBulkUploading ? 'பதிவேற்றப்படுகிறது...' : `அனைத்தையும் பதிவேற்று (${bulkFiles.length} கோப்புகள்)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
