import React, { useState } from 'react';
import { Settings, Sliders, Moon, Volume2, ShieldCheck, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [audioQuality, setAudioQuality] = useState<'standard' | 'high' | 'ultra'>('high');
  const [autoplayNext, setAutoplayNext] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
          அமைப்புகள் (Settings)
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          ஆடியோ தரம் மற்றும் பயன்பாட்டு அமைப்புகளைத் தனிப்பயனாக்குங்கள்
        </p>
      </div>

      <div className="bg-white dark:bg-[#14231E] p-6 sm:p-8 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-6">
        {/* Audio Quality */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
              ஒலி தரம் (Audio Streaming Quality)
            </h3>
          </div>
          <p className="text-xs text-zinc-500">
            இணைய வேகத்திற்கு ஏற்ப பொருத்தமான ஆடியோ தரத்தைத் தேர்ந்தெடுக்கவும்.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'standard', title: 'சாதாரண தரம் (64 kbps)', desc: 'குறைந்த இணையப் பயன்பாடு' },
              { id: 'high', title: 'உயர்தரம் (128 kbps)', desc: 'தெளிவான ஸ்டீரியோ ஒலி' },
              { id: 'ultra', title: 'ஸ்டுடியோ தரம் (320 kbps)', desc: 'சிறந்த ஒலி அனுபவம்' },
            ].map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setAudioQuality(q.id as any)}
                className={`p-3.5 rounded-2xl border text-left transition-colors ${
                  audioQuality === q.id
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-100'
                    : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-[#101A16] text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <div className="font-bold text-xs">{q.title}</div>
                <div className="text-[11px] opacity-75 mt-0.5">{q.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Autoplay Next Episode */}
        <div className="pt-4 border-t border-emerald-50 dark:border-emerald-900/30 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              அடுத்த அத்தியாயத்தை தானாக இயக்கு (Autoplay Next Episode)
            </h4>
            <p className="text-xs text-zinc-500">
              தற்போதைய பகுதி முடிந்ததும் அடுத்த பகுதி தானாகவே தொடங்கும்
            </p>
          </div>
          <button
            onClick={() => setAutoplayNext(!autoplayNext)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              autoplayNext ? 'bg-emerald-700' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                autoplayNext ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-emerald-50 dark:border-emerald-900/30 flex items-center justify-between">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm shadow-sm transition-colors flex items-center gap-2"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                <span>சேமிக்கப்பட்டது!</span>
              </>
            ) : (
              <span>அமைப்புகளைச் சேமி (Save Settings)</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
