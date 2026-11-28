import React, { useState, useRef } from 'react';
import {
  User as UserIcon,
  Mail,
  BookOpen,
  PenTool,
  Mic,
  Upload,
  FileArchive,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

const MAX_ZIP_BYTES = 500 * 1024 * 1024; // 500 MB

export const StorySubmissionsPage: React.FC = () => {
  const { user, api } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState(
    user?.displayName || user?.username || '',
  );
  const [email, setEmail] = useState(user?.email || '');
  const [bookTitle, setBookTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [narratorName, setNarratorName] = useState('');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [acknowledgedNote, setAcknowledgedNote] = useState(false);

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) {
      setZipFile(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('Only *.ZIP archive files are accepted.');
      e.target.value = '';
      setZipFile(null);
      return;
    }

    if (file.size > MAX_ZIP_BYTES) {
      setError('Archive file size must not exceed 500 MB.');
      e.target.value = '';
      setZipFile(null);
      return;
    }

    if (file.size === 0) {
      setError('The selected ZIP file is empty.');
      e.target.value = '';
      setZipFile(null);
      return;
    }

    setZipFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedBookTitle = bookTitle.trim();
    const trimmedAuthorName = authorName.trim();
    const trimmedNarratorName = narratorName.trim();

    if (!trimmedUsername || trimmedUsername.length < 2) {
      setError('Please enter your User Name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid Mail-ID.');
      return;
    }

    if (!trimmedBookTitle || trimmedBookTitle.length < 2) {
      setError('Please enter the Book Title.');
      return;
    }

    if (!trimmedAuthorName || trimmedAuthorName.length < 2) {
      setError('Please enter the Author Name.');
      return;
    }

    if (!zipFile) {
      setError('Please upload a *.ZIP file containing the audio files and cover image.');
      return;
    }

    if (!zipFile.name.toLowerCase().endsWith('.zip')) {
      setError('Only *.ZIP files are accepted.');
      return;
    }

    if (!acknowledgedNote) {
      setError(
        'Please accept the 30-day review and analysis notice before uploading.',
      );
      return;
    }

    if (!storage) {
      setError('File storage is not configured. Please contact support.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const safeFileName = zipFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `submissions/${Date.now()}_${safeFileName}`;
      const storageRef = ref(storage, storagePath);

      const downloadUrl = await new Promise<string>((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, zipFile, {
          contentType: zipFile.type || 'application/zip',
        });

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (snapshot.totalBytes > 0) {
              const pct = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
              );
              setUploadProgress(pct);
            }
          },
          (uploadErr) => reject(uploadErr),
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            } catch (urlErr) {
              reject(urlErr);
            }
          },
        );
      });

      const res = await api.submissions.create({
        username: trimmedUsername,
        email: trimmedEmail,
        bookTitle: trimmedBookTitle,
        authorName: trimmedAuthorName,
        narratorName: trimmedNarratorName || undefined,
        archiveUrl: downloadUrl,
        archiveFileName: zipFile.name,
        archiveSizeBytes: zipFile.size,
        acknowledgedNote: true,
      });

      setSuccess(
        res?.message ||
          'Your story submission has been uploaded for review and analysis.',
      );
      setBookTitle('');
      setAuthorName('');
      setNarratorName('');
      setZipFile(null);
      setAcknowledgedNote(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('[StorySubmissions] Upload error:', err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to upload your story submission. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[#FAF7EE] dark:bg-[#03261C] text-[#173D2E] dark:text-[#F8F5E9] transition-colors">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F0E2] dark:bg-[#083325] border border-[#064E3B]/20 text-[#064E3B] dark:text-[#A7F3D0] text-xs font-bold tracking-wide">
            <Upload className="w-4 h-4" />
            <span>Creator &amp; Community Uploads</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-serif text-[#064E3B] dark:text-[#F8F5E9] tracking-tight">
            Story Submissions
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-md mx-auto">
            Submit your audiobook archive (*.ZIP) containing audio chapters and cover image for editorial review.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-[#083325] p-6 sm:p-10 rounded-[32px] border-2 border-[#E3DCBA] dark:border-[#124835] shadow-xl space-y-5">
          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs sm:text-sm"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm"
            >
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
              <span className="font-medium">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. User Name */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                User Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your user name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-[#104434] bg-white dark:bg-[#073224] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B] transition-all"
                />
              </div>
            </div>

            {/* 2. Mail-ID */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Mail-ID *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-[#104434] bg-white dark:bg-[#073224] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B] transition-all"
                />
              </div>
            </div>

            {/* 3. Book Title */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Book Title *
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="Enter book title"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-[#104434] bg-white dark:bg-[#073224] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B] transition-all"
                />
              </div>
            </div>

            {/* 4. Author Name */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Author Name *
              </label>
              <div className="relative">
                <PenTool className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Enter author name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-[#104434] bg-white dark:bg-[#073224] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B] transition-all"
                />
              </div>
            </div>

            {/* 5. Narrator Name (Optional) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Narrator Name
                </label>
                <span className="text-[11px] text-stone-400 font-medium">(Optional)</span>
              </div>
              <div className="relative">
                <Mic className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={narratorName}
                  onChange={(e) => setNarratorName(e.target.value)}
                  placeholder="Enter narrator name (optional)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-[#104434] bg-white dark:bg-[#073224] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B] transition-all"
                />
              </div>
            </div>

            {/* 6. Upload Audio Files And Cover image (*.ZIP) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Upload Audio Files And Cover image (*.ZIP) *
              </label>
              <label className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-stone-300 dark:border-[#104434] bg-[#FAF7EE]/60 dark:bg-[#073224]/60 hover:border-[#064E3B] dark:hover:border-[#A7F3D0] cursor-pointer transition-colors">
                <FileArchive className="w-5 h-5 text-[#064E3B] dark:text-[#A7F3D0] shrink-0" />
                <span className="text-xs sm:text-sm text-stone-700 dark:text-stone-200 truncate flex-1">
                  {zipFile
                    ? `${zipFile.name} (${(zipFile.size / (1024 * 1024)).toFixed(2)} MB)`
                    : 'Choose *.ZIP file (max 500 MB)'}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip,application/zip,application/x-zip-compressed"
                  onChange={handleFileChange}
                  required
                  className="sr-only"
                />
              </label>
            </div>

            {/* Upload Progress Bar */}
            {isSubmitting && uploadProgress > 0 && (
              <div className="space-y-1">
                <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-[#032419] overflow-hidden">
                  <div
                    className="h-full bg-[#064E3B] dark:bg-[#10B981] transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-[11px] font-mono text-right text-stone-500 dark:text-stone-300">
                  Uploading archive... {uploadProgress}%
                </p>
              </div>
            )}

            {/* Mandatory Acknowledgement Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-700 dark:text-stone-300 select-none">
                <input
                  type="checkbox"
                  checked={acknowledgedNote}
                  onChange={(e) => setAcknowledgedNote(e.target.checked)}
                  required
                  className="mt-0.5 w-4 h-4 rounded border-stone-300 text-[#064E3B] focus:ring-[#064E3B] accent-[#064E3B] shrink-0"
                />
                <span className="leading-relaxed">
                  It may take up to 30 days to upload the book. Whether or not to upload this book is our choice. This book will be uploaded after it has been analyzed.
                </span>
              </label>
            </div>

            {/* Upload Button */}
            <button
              type="submit"
              disabled={isSubmitting || !acknowledgedNote}
              className="w-full py-3.5 px-6 rounded-full bg-[#064E3B] hover:bg-[#166534] text-white font-bold text-sm shadow-xl shadow-emerald-950/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StorySubmissionsPage;
