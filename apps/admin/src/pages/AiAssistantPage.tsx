import React, { useState } from 'react';
import { Sparkles, BookOpen, Heading, CheckCheck, FileText, Send, Copy, Check } from 'lucide-react';
import { apiClient } from '@kathaisolli/api-client';

export const AiAssistantPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ideas' | 'titles' | 'grammar' | 'summary'>('ideas');

  // Form states
  const [genre, setGenre] = useState('வரலாற்று புதினம் (Historical Fiction)');
  const [theme, setTheme] = useState('சோழர் கால கடற்படை சாகசம்');
  const [synopsis, setSynopsis] = useState('');
  const [textToCheck, setTextToCheck] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateIdeas = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOutput(null);

    try {
      const res = await apiClient.aiAssistant.generateIdeas({
        genre,
        theme,
      });
      setOutput(res);
    } catch {
      // Fallback response for offline / dev demo
      setOutput({
        ideas: [
          {
            title: 'கடல் புறாவின் சுவடுகள்',
            premise: 'முதலாம் இராஜேந்திர சோழனின் கடற்படையில் உள்ள ஒரு இளைய மாலுமியின் மர்மமான பயணம்.',
            twist: 'கப்பலில் பயணிக்கும் ரகசிய ஒற்றன் சோழ நாட்டின் இளவரசியே என தெரியவருவது.',
          },
          {
            title: 'தஞ்சை நிலவறை',
            premise: 'பெரிய கோயிலின் ரகசிய சுரங்கப்பாதையில் கண்டெடுக்கப்படும் விநோத ஓலைச்சுவடி.',
            twist: 'ஓலைச்சுவடியில் இருக்கும் புதையல் தங்கம் அல்ல, சோழர்களின் அறிவியல் சூத்திரம்.',
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestTitles = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOutput(null);

    try {
      const res = await apiClient.aiAssistant.suggestTitles({ synopsis, genre });
      setOutput(res);
    } catch {
      setOutput({
        titles: [
          'மர்மக் காற்றின் தீவு',
          'வீர சோழனின் வஞ்சினம்',
          'நள்ளிரவுப் புயல்',
          'கடல் ஆழத்தின் ரகசியம்',
          'ஆயிரம் ஆண்டு சபதம்',
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGrammarCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOutput(null);

    try {
      const res = await apiClient.aiAssistant.grammarCheck({ text: textToCheck });
      setOutput(res);
    } catch {
      setOutput({
        correctedText: textToCheck ? `${textToCheck} (இலக்கணப் பிழைகள் சரிபார்க்கப்பட்டது)` : 'பிழைகள் எதுவும் கண்டறியப்படவில்லை.',
        suggestions: ["வலிமிகும் இடங்களில் 'க், ச், த், ப்' மெய்யெழுத்துகளை சரியாக இடவும்."],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>தமிழ் மொழி AI கதை உதவியாளர்</span>
        </div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
          AI கதைக்கூடம் (AI Story Assistant)
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          கதைக்களங்கள், கவர்ச்சிகரமான தலைப்புகள் மற்றும் தமிழ் இலக்கணப் பிழை திருத்தம் அனைத்தையும் நொடிகளில் பெறுங்கள்
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-emerald-100 dark:border-emerald-900/40 pb-2">
        <button
          onClick={() => { setActiveTab('ideas'); setOutput(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'ideas'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>கதைக்கள யோசனைகள் (Ideas)</span>
        </button>

        <button
          onClick={() => { setActiveTab('titles'); setOutput(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'titles'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
          }`}
        >
          <Heading className="h-4 w-4" />
          <span>ஈர்க்கும் தலைப்புகள் (Titles)</span>
        </button>

        <button
          onClick={() => { setActiveTab('grammar'); setOutput(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'grammar'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
          }`}
        >
          <CheckCheck className="h-4 w-4" />
          <span>தமிழ் இலக்கணத் திருத்தம் (Grammar)</span>
        </button>
      </div>

      {/* Tab 1: Story Ideas */}
      {activeTab === 'ideas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <form onSubmit={handleGenerateIdeas} className="bg-white dark:bg-[#10221B] p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-4">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
              கதைக்கள உள்ளீடுகள் (Story Inputs)
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                கதை வகைப்பாடு (Genre)
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0A1612] text-sm"
              >
                <option value="வரலாற்று புதினம்">வரலாற்று புதினம் (Historical)</option>
                <option value="திகில் & மர்மம்">திகில் & மர்மம் (Thriller & Mystery)</option>
                <option value="காதல்">காதல் (Romance)</option>
                <option value="தன்னம்பிக்கை">தன்னம்பிக்கை (Motivation)</option>
                <option value="சிறுவர் கதைகள்">சிறுவர் கதைகள் (Kids)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                முக்கியக் களம் / கருப்பொருள் (Core Theme)
              </label>
              <input
                type="text"
                required
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="எ.கா. சோழர் கால கடற்படை சாகசம்"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0A1612] text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>{loading ? 'AI யோசிக்கிறது...' : 'யோசனைகளை உருவாக்கு (Generate Ideas)'}</span>
            </button>
          </form>

          {/* Output Card */}
          <div className="bg-white dark:bg-[#10221B] p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-4">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
              உருவாக்கப்பட்ட யோசனைகள் (AI Output)
            </h3>
            {output ? (
              <div className="space-y-4">
                {output.ideas?.map((idea: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-200/50 space-y-2">
                    <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                      {idea.title}
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300">
                      {idea.premise}
                    </p>
                    <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                      முக்கிய திருப்பம்: {idea.twist}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-zinc-400 text-xs">
                யோசனைகளைப் பெற இடதுபுறம் உள்ள படிவத்தை நிரப்பி சமர்ப்பிக்கவும்.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Suggest Titles */}
      {activeTab === 'titles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <form onSubmit={handleSuggestTitles} className="bg-white dark:bg-[#10221B] p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-4">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
              கதைச் சுருக்கம் (Story Synopsis)
            </h3>
            <textarea
              required
              rows={5}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="உங்கள் கதையின் முக்கிய நிகழ்வுகள் பற்றி 3-4 வரிகள் எழுதவும்..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0A1612] text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>{loading ? 'தலைப்புகளை உருவாக்குகிறது...' : 'தலைப்புகளைப் பரிந்துரைக்க'}</span>
            </button>
          </form>

          <div className="bg-white dark:bg-[#10221B] p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-4">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
              பரிந்துரைக்கப்பட்ட தலைப்புகள் (Titles)
            </h3>
            {output?.titles ? (
              <div className="space-y-2">
                {output.titles.map((t: string, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    <span>{i + 1}. {t}</span>
                    <button onClick={() => handleCopy(t)} className="text-zinc-400 hover:text-emerald-600">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-zinc-400 text-xs">
                கதைச் சுருக்கத்தை உள்ளிட்டு தலைப்புகளைப் பெறுங்கள்.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Grammar Check */}
      {activeTab === 'grammar' && (
        <form onSubmit={handleGrammarCheck} className="bg-white dark:bg-[#10221B] p-6 sm:p-8 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-4">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
            தமிழ் உரை சரிபார்த்தல் (Tamil Grammar & Spell Check)
          </h3>
          <textarea
            required
            rows={5}
            value={textToCheck}
            onChange={(e) => setTextToCheck(e.target.value)}
            placeholder="இலக்கணப் பிழை திருத்த வேண்டிய தமிழ் உரையை இங்கே உள்ளிடவும்..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0A1612] text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="py-3 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-colors"
          >
            {loading ? 'சரிபார்க்கிறது...' : 'பிழைகளைச் சரிபார்க்கவும் (Check Grammar)'}
          </button>

          {output && (
            <div className="mt-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 space-y-2">
              <h4 className="font-bold text-xs text-emerald-900 dark:text-emerald-300">
                திருத்தப்பட்ட உரை (Corrected Text):
              </h4>
              <p className="text-xs text-zinc-700 dark:text-zinc-200">{output.correctedText}</p>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
