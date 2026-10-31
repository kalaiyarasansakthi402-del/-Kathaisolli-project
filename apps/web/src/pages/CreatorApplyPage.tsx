import React, { useState } from 'react';
import { Mic, Check, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CreatorApplyPage: React.FC = () => {
  const { user, api } = useAuth();
  const [bio, setBio] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [sampleAudioUrl, setSampleAudioUrl] = useState('');
  const [genres, setGenres] = useState<string[]>(['வரலாறு']);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError('விதிமுறைகளை ஒப்புக்கொள்ள வேண்டும் (Please agree to terms).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.creator.apply({
        bio,
        portfolioUrl: portfolioUrl || undefined,
        sampleAudioUrl: sampleAudioUrl || undefined,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'விண்ணப்பத்தை சமர்ப்பிக்க முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="py-20 px-4 max-w-xl mx-auto text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
          <Check className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
          விண்ணப்பம் பெறப்பட்டது! (Application Received)
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          உங்கள் படைப்பாளர் விண்ணப்பம் எங்கள் மதிப்பாய்வுக் குழுவிற்கு அனுப்பப்பட்டுள்ளது. 24-48 மணி நேரத்திற்குள் உங்களுக்கு அறிவிக்கப்படும்.
        </p>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
          <Mic className="h-3.5 w-3.5" />
          <span>படைப்பாளர் ஸ்டுடியோ (Creator Studio)</span>
        </div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
          படைப்பாளராக இணையுங்கள் (Apply as Creator)
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          உங்கள் குரலால் தமிழ் கதைகளுக்கு உயிர் கொடுங்கள். உலகெங்கும் உள்ள தமிழ் நேயர்களைச் சென்றடையுங்கள்.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#14231E] p-6 sm:p-8 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            உங்களைப் பற்றிய சிறு அறிமுகம் (Bio / Experience)
          </label>
          <textarea
            required
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="உங்கள் குரல் அல்லது கதை சொல்லும் அனுபவம் பற்றி சுருக்கமாகக் குறிப்பிடவும்..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#101A16] text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            மாதிரி ஆடியோ இணைப்பு (Sample Audio Link - Drive/SoundCloud/YouTube)
          </label>
          <input
            type="url"
            value={sampleAudioUrl}
            onChange={(e) => setSampleAudioUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#101A16] text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            வலைப்பக்கம் அல்லது சமூக வலைத்தள இணைப்பு (Portfolio / Social Profile)
          </label>
          <input
            type="url"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#101A16] text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-start gap-3 pt-2">
          <input
            type="checkbox"
            id="terms"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="terms" className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            கதைசொல்லி 100% இலவச ஆடியோ தளம் என்பதையும், எனது படைப்புகள் நேயர்களுக்கு கட்டணமின்றி பகிர்ந்தளிக்கப்படும் என்பதையும் ஒப்புக்கொள்கிறேன்.
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-50"
        >
          {loading ? 'விண்ணப்பிக்கிறது...' : 'விண்ணப்பத்தை சமர்ப்பிக்கவும் (Submit Application)'}
        </button>
      </form>
    </div>
  );
};
