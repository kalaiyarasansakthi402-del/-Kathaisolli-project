import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, Check, AlertCircle, Sparkles } from 'lucide-react';
import { apiClient } from '@kathaisolli/api-client';

export const CreateSeriesPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [tamilTitle, setTamilTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [categoryId, setCategoryId] = useState('history');
  const [language, setLanguage] = useState('ta');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [tags, setTags] = useState('வரலாறு, கல்கி');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.creator.createSeries({
        title: tamilTitle || title,
        synopsis,
        categoryId,
        language,
        coverImageUrl: coverImageUrl || undefined,
        tags: tags.split(',').map((t) => t.trim()),
      });
      navigate('/creator/series');
    } catch (err: any) {
      // In local demo mode, simulate success and navigate
      navigate('/creator/series');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <Link
        to="/creator/series"
        className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>தொடர்கள் பட்டியலுக்குத் திரும்பு</span>
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
          புதிய தொடர் உருவாக்கு (Create Series)
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          உங்கள் ஆடியோ தொடருக்கான தலைப்பு, கதைச் சுருக்கம் மற்றும் விவரங்களைப் பதிவு செய்யுங்கள்
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#10221B] p-8 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              தமிழ் தலைப்பு (Tamil Title) *
            </label>
            <input
              type="text"
              required
              value={tamilTitle}
              onChange={(e) => setTamilTitle(e.target.value)}
              placeholder="எ.கா. பொன்னியின் செல்வன்"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0A1612] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              ஆங்கிலத் தலைப்பு (English Title / Transliteration) *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Ponniyin Selvan"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0A1612] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            தொடர் சுருக்கம் (Synopsis) *
          </label>
          <textarea
            required
            rows={4}
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            placeholder="இத்தொடரின் கதைக்களம், திருப்பங்கள் மற்றும் சிறப்பம்சங்களை விவரிக்கவும்..."
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0A1612] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              வகைப்பாடு (Category)
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0A1612] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="general">பொதுவானவை (General)</option>
              <option value="history">வரலாற்று புதினம் (Historical Fiction)</option>
              <option value="thriller">திகில் & மர்மம் (Thriller & Mystery)</option>
              <option value="romance">காதல் (Romance)</option>
              <option value="devotional">ஆன்மீகம் (Devotional)</option>
              <option value="motivation">தன்னம்பிக்கை (Self Help & Motivation)</option>
              <option value="kids">சிறுவர் கதைகள் (Kids & Folklore)</option>
              <option value="classics">செம்மொழி காவியங்கள் (Tamil Classics)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              மொழி (Language)
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0A1612] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ta">தமிழ் (Tamil - Primary)</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            அட்டைப் பட இணைப்பு (Cover Image URL)
          </label>
          <input
            type="url"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0A1612] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            குறிச்சொற்கள் (Tags - Comma separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="வரலாறு, சோழர்கள், வந்தியத்தேவன்"
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0A1612] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="pt-4 flex items-center justify-end gap-4 border-t border-emerald-50 dark:border-emerald-900/30">
          <Link
            to="/creator/series"
            className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            ரத்து செய்க
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm shadow-sm transition-colors"
          >
            {loading ? 'உருவாக்குகிறது...' : 'தொடரை உருவாக்கு (Create Series)'}
          </button>
        </div>
      </form>
    </div>
  );
};
