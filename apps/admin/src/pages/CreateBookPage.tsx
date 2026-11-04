import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import {
  BookOpen,
  ArrowLeft,
  Upload,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { uploadBookCoverImage } from '../services/firebaseAdminStorage';
import { upsertAdminBook, getAdminBook, listAdminCategories } from '../services/adminCatalogService';

export const CreateBookPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookId } = useParams<{ bookId: string }>();

  const [title, setTitle] = useState('');
  const [tamilTitle, setTamilTitle] = useState('');
  const [description, setDescription] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [narratorName, setNarratorName] = useState('By Anzles Studio');
  const [categoryId, setCategoryId] = useState('history');
  const [languageId, setLanguageId] = useState('ta');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');

  // Cover image upload
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [coverUploadProgress, setCoverUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookId) {
      const existing = getAdminBook(bookId);
      if (existing) {
        setTitle(existing.title);
        setTamilTitle(existing.tamilTitle || '');
        setDescription(existing.description || '');
        setAuthorName(existing.authorName);
        setNarratorName(existing.narratorName || 'By Anzles Studio');
        setCategoryId(existing.categoryId);
        setLanguageId(existing.languageId || 'ta');
        setStatus(existing.status);
        if (existing.coverImageUrl) {
          setCoverPreview(existing.coverImageUrl);
        }
      }
    }
  }, [bookId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp)$/i)) {
      setError('படங்கள் JPG, PNG அல்லது WebP வடிவத்தில் மட்டுமே இருக்க வேண்டும்.');
      return;
    }

    setCoverFile(file);
    const localUrl = URL.createObjectURL(file);
    setCoverPreview(localUrl);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !tamilTitle.trim()) {
      setError('தயவுசெய்து புத்தகத்தின் தலைப்பை உள்ளிடவும்.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const targetId = bookId || `kb-${Date.now()}`;
      let coverImageUrl = coverPreview || '/images/temple-sunset.jpg';
      let coverStoragePath: string | undefined;

      // Upload cover image if provided
      if (coverFile) {
        const uploadResult = await uploadBookCoverImage(
          targetId,
          coverFile,
          (pct) => setCoverUploadProgress(pct)
        );
        coverImageUrl = uploadResult.url;
        coverStoragePath = uploadResult.storagePath;
      }

      // Save Book Metadata
      upsertAdminBook({
        id: targetId,
        title: title || tamilTitle,
        tamilTitle: tamilTitle || title,
        description,
        authorName: authorName || 'கதைசொல்லி',
        narratorName: narratorName || 'By Anzles Studio',
        categoryId,
        languageId,
        coverImageUrl,
        coverStoragePath,
        status,
      });

      navigate(`/books/${targetId}/chapters`);
    } catch (err: any) {
      console.error('Failed to create book:', err);
      setError(err?.message || 'புத்தகம் உருவாக்குவதில் பிழை ஏற்பட்டது.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-8">
      {/* Back link */}
      <Link
        to="/books"
        className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>புத்தகங்கள் பட்டியலுக்குத் திரும்பு (Back to Books)</span>
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
          புதிய ஆடியோ புத்தகம் சேர் (Add New Audiobook)
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          புத்தகத்தின் தலைப்பு, விவரங்கள் மற்றும் அட்டைப் படத்தை உள்ளிடவும். அத்தியாயங்களை அடுத்த படியில் சேர்க்கலாம்.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-[#10221B] p-6 sm:p-8 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm">
        {/* Cover Image Upload Area */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            புத்தக அட்டைப் படம் (Book Cover Image)
          </label>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Preview Box */}
            <div className="w-36 h-48 rounded-2xl bg-zinc-100 dark:bg-[#0A1612] border-2 border-dashed border-zinc-300 dark:border-zinc-700 overflow-hidden flex items-center justify-center relative shrink-0 shadow-inner">
              {coverPreview ? (
                <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-3 text-zinc-400 space-y-1">
                  <ImageIcon className="w-8 h-8 mx-auto stroke-1" />
                  <span className="text-[10px] block font-medium">படம் தேர்ந்தெடுக்கவும்</span>
                </div>
              )}
            </div>

            {/* Upload Selector */}
            <div className="flex-1 space-y-3 w-full">
              <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-[#071E16] hover:bg-emerald-50 dark:hover:bg-[#08261C] cursor-pointer transition-colors">
                <Upload className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-2" />
                <span className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  படத்தைத் தேர்ந்தெடுக்க இங்கே கிளிக் செய்யவும்
                </span>
                <span className="text-xs text-zinc-500 mt-1">
                  JPG, PNG, WebP (அதிகபட்சம் 5MB)
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              {coverUploadProgress > 0 && coverUploadProgress < 100 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-500 font-mono">
                    <span>Firebase Storage ஏற்றுதல்...</span>
                    <span>{coverUploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${coverUploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Titles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              தமிழ் தலைப்பு (Tamil Title) *
            </label>
            <input
              type="text"
              required
              placeholder="எ.கா. பொன்னியின் செல்வன்"
              value={tamilTitle}
              onChange={(e) => setTamilTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0A1612] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              ஆங்கிலத் தலைப்பு (English Title) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ponniyin Selvan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0A1612] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Author & Narrator */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              எழுத்தாளர் (Author Name) *
            </label>
            <input
              type="text"
              required
              placeholder="எ.கா. கல்கி கிருஷ்ணமூர்த்தி"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0A1612] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              குரல் / கதைசொல்லி (Narrator)
            </label>
            <input
              type="text"
              placeholder="By Anzles Studio"
              value={narratorName}
              onChange={(e) => setNarratorName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0A1612] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Category & Language */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              பிரிவு (Category)
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0A1612] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="general">பொதுவானவை (General)</option>
              <option value="history">வரலாறு (History)</option>
              <option value="motivation">சுயமுன்னேற்றம் (Motivation)</option>
              <option value="literature">இலக்கியம் (Literature)</option>
              <option value="moral-stories">நீதிக் கதைகள் (Moral Stories)</option>
              <option value="biography">சுயசரிதை (Biography)</option>
              <option value="kids">சிறுவர் கதைகள் (Kids)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              மொழி (Language)
            </label>
            <select
              value={languageId}
              onChange={(e) => setLanguageId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0A1612] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="en">ஆங்கிலம் (English)</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            கதைச் சுருக்கம் (Description / Synopsis)
          </label>
          <textarea
            rows={4}
            placeholder="புத்தகத்தைப் பற்றிய சுருக்கமான அறிமுகம் மற்றும் சிறப்பம்சங்கள்..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0A1612] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
          />
        </div>

        {/* Publishing Status Toggle */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#0A1612] border border-zinc-200 dark:border-zinc-800 space-y-3">
          <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
            வெளியீட்டு நிலை (Publishing Status)
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
              <input
                type="radio"
                name="status"
                value="DRAFT"
                checked={status === 'DRAFT'}
                onChange={() => setStatus('DRAFT')}
                className="accent-emerald-600"
              />
              <span>வரைவு (Draft - நிர்வாகிக்கு மட்டுமே தெரியும்)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
              <input
                type="radio"
                name="status"
                value="PUBLISHED"
                checked={status === 'PUBLISHED'}
                onChange={() => setStatus('PUBLISHED')}
                className="accent-emerald-600"
              />
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                வெளியிடு (Publish Immediately - பொதுத் தளத்தில் தோன்றும்)
              </span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => navigate('/books')}
            className="px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            ரத்துசெய் (Cancel)
          </button>

          <button
            type="submit"
            disabled={isUploading}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {isUploading ? 'சேமிக்கப்படுகிறது...' : 'புத்தகத்தைச் சேமித்து அத்தியாயம் சேர்க்க (Save & Next)'}
          </button>
        </div>
      </form>
    </div>
  );
};
