import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import {
  BookOpen,
  ArrowLeft,
  Upload,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth } from '../context/AdminAuthContext';
import { uploadBookCoverImage } from '../services/firebaseAdminStorage';

export const CreateBookPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookId } = useParams<{ bookId: string }>();
  const { api, permissions } = useAdminAuth();
  const queryClient = useQueryClient();

  const isEditing = Boolean(bookId && bookId !== 'new');

  const [title, setTitle] = useState('');
  const [tamilTitle, setTamilTitle] = useState('');
  const [description, setDescription] = useState('');
  const [authorName, setAuthorName] = useState('குகநாதன்');
  const [narratorName, setNarratorName] = useState('By Anzles Studio');
  const [categoryId, setCategoryId] = useState('');
  const [languageId, setLanguageId] = useState('ta');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');

  // Cover image upload
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [coverUrlInput, setCoverUrlInput] = useState<string>('');
  const [coverUploadProgress, setCoverUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch real categories from database
  const { data: categories = [] } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => api.admin.listCategories(),
  });

  // Set default category when categories load
  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id || categories[0].slug);
    }
  }, [categories, categoryId]);

  // If editing, fetch real story details
  const { data: existingStory, isLoading: isStoryLoading } = useQuery({
    queryKey: ['admin', 'story', bookId],
    queryFn: () => api.admin.getStory(bookId!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingStory) {
      setTitle(existingStory.title || '');
      setTamilTitle(existingStory.tamilTitle || '');
      setDescription(existingStory.fullDescription || existingStory.shortDescription || '');
      setAuthorName(existingStory.authorName || 'குகநாதன்');
      setNarratorName(existingStory.narratorName || 'By Anzles Studio');
      setCategoryId(existingStory.categoryId || '');
      setLanguageId(existingStory.languageId || 'ta');
      setStatus(existingStory.status || 'DRAFT');
      if (existingStory.coverImage || existingStory.coverImageUrl) {
        setCoverPreview(existingStory.coverImage || existingStory.coverImageUrl);
        setCoverUrlInput(existingStory.coverImage || existingStory.coverImageUrl);
      }
    }
  }, [existingStory]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp|jpg)$/i)) {
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
      setError('தயவுசெய்து கதை அல்லது புத்தகத்தின் தலைப்பை உள்ளிடவும்.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      let finalCoverUrl = coverUrlInput.trim() || coverPreview;

      // Upload file to Firebase Storage if a local file was picked
      if (coverFile) {
        const uploadResult = await uploadBookCoverImage(
          bookId || `story-${Date.now()}`,
          coverFile,
          (pct) => setCoverUploadProgress(pct),
        );
        finalCoverUrl = uploadResult.url;
      }

      const displayTitle = tamilTitle.trim() && title.trim()
        ? `${tamilTitle.trim()} (${title.trim()})`
        : tamilTitle.trim() || title.trim();

      const payload = {
        title: displayTitle,
        shortDescription: description.trim().slice(0, 480) || displayTitle,
        fullDescription: description.trim() || undefined,
        coverImage: finalCoverUrl || undefined,
        authorName: authorName.trim() || 'குகநாதன்',
        narratorName: narratorName.trim() || 'By Anzles Studio',
        categoryId: categoryId || (categories[0]?.id || 'general'),
        languageId: languageId || 'ta',
        status,
        tags: [languageId === 'ta' ? 'தமிழ்' : 'English'],
      };

      let resultId = bookId;

      if (isEditing) {
        await api.admin.updateStory(bookId!, payload);
        setSuccess('கதை விவரங்கள் வெற்றிகரமாகப் புதுப்பிக்கப்பட்டன!');
      } else {
        const created = await api.admin.createStory(payload);
        resultId = created?.id;
        setSuccess('புதிய கதை வெற்றிகரமாக உருவாக்கப்பட்டது!');
      }

      queryClient.invalidateQueries({ queryKey: ['admin', 'stories'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });

      setTimeout(() => {
        if (resultId) {
          navigate(`/admin/stories/${resultId}/chapters`);
        } else {
          navigate('/admin/stories');
        }
      }, 1200);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'கதை சேமிப்பதில் பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (isEditing && isStoryLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-[#064E3B] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-gray-500 font-tamil">கதை விவரங்கள் ஏற்றப்படுகின்றன...</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/stories"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#064E3B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>கதைகள் பட்டியலுக்குத் திரும்பு (Back to Stories)</span>
        </Link>
      </div>

      <div className="p-6 sm:p-10 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#064E3B] text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isEditing ? 'கதையைத் திருத்து (Edit Story)' : 'புதிய கதை சேர் (Add New Story)'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-serif">
            {isEditing ? 'கதை விவரங்களைப் புதுப்பிக்கவும்' : 'புதிய ஆடியோ கதை உருவாக்கம்'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            தலைப்பு, அட்டைப் படம் மற்றும் விவரங்களை உள்ளிட்ட பிறகு, அடுத்த படியில் MP3 அத்தியாயங்களைப் பதிவேற்றலாம்.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#064E3B] text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#047857]" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titles Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                தமிழ் தலைப்பு (Tamil Title) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="எ.கா: பொன்னியின் செல்வன் / அடுத்த நிமிடம்"
                value={tamilTitle}
                onChange={(e) => setTamilTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                ஆங்கில தலைப்பு (English / Phonetic Title)
              </label>
              <input
                type="text"
                placeholder="e.g. Ponniyin Selvan / Adutha Vinadi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              கதை விளக்கம் / சுருக்கம் (Description)
            </label>
            <textarea
              rows={4}
              placeholder="கதையின் சுருக்கமான உத்வேகம், களம் அல்லது பின்னணி விளக்கம்..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
            />
          </div>

          {/* Author and Narrator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                எழுத்தாளர் பெயர் (Author Name)
              </label>
              <input
                type="text"
                placeholder="எ.கா: குகநாதன் / கல்கி"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                குரல் / ஸ்டுடியோ (Narrator / Studio)
              </label>
              <input
                type="text"
                placeholder="By Anzles Studio"
                value={narratorName}
                onChange={(e) => setNarratorName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
              />
            </div>
          </div>

          {/* Category, Language & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                வகைப்பாடு (Category)
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
              >
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.tamilName || c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                மொழி (Language)
              </label>
              <select
                value={languageId}
                onChange={(e) => setLanguageId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
              >
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="en">English (ஆங்கிலம்)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                வெளியீட்டு நிலை (Status)
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
              >
                <option value="DRAFT">வரைவு (Save as Draft)</option>
                <option value="PUBLISHED">நேரடி வெளியீடு (Publish Live)</option>
              </select>
            </div>
          </div>

          {/* Cover Image Upload & Preview */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-700">
              கதை அட்டைப் படம் (Story Cover Art - JPG, PNG, WebP)
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Image Preview Box */}
              <div className="w-full h-48 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4 text-gray-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <span className="text-xs">படம் தேர்ந்தெடுக்கப்படவில்லை</span>
                  </div>
                )}
                {coverUploadProgress > 0 && coverUploadProgress < 100 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {coverUploadProgress}% பதிவேற்றப்படுகிறது...
                    </span>
                  </div>
                )}
              </div>

              {/* Upload or URL Controls */}
              <div className="md:col-span-2 space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    கணினியிலிருந்து படத்தைப் பதிவேற்றவும் (Upload to Firebase Storage):
                  </label>
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-xs font-bold text-gray-700 cursor-pointer transition-colors shadow-sm">
                    <Upload className="w-4 h-4 text-[#064E3B]" />
                    <span>படத்தைத் தேர்ந்தெடு (Choose Image)</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="pt-2">
                  <label className="block text-xs text-gray-500 mb-1">
                    அல்லது நேரடிப் பட முகவரியை (Direct Image URL) உள்ளிடவும்:
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/cover.jpg"
                    value={coverUrlInput}
                    onChange={(e) => {
                      setCoverUrlInput(e.target.value);
                      if (e.target.value.startsWith('http')) {
                        setCoverPreview(e.target.value);
                      }
                    }}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <Link
              to="/admin/stories"
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              ரத்து செய் (Cancel)
            </Link>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>சேமிக்கப்படுகிறது...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? 'மாற்றங்களைச் சேமி' : 'கதையை உருவாக்கி அத்தியாயங்களுக்குச் செல் →'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
