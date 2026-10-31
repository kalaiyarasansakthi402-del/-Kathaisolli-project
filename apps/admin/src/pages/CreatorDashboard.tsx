import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Headphones, Play, PlusCircle, Sparkles, TrendingUp, Users } from 'lucide-react';

export const CreatorDashboard: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-900 to-[#06241C] p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>படைப்பாளர் ஸ்டுடியோ (Creator Studio)</span>
          </div>
          <h1 className="text-3xl font-extrabold font-serif">
            உங்கள் கதைக் கூடம்
          </h1>
          <p className="text-emerald-100/80 text-sm max-w-xl">
            புதிய தொடர்களை உருவாக்கி, அத்தியாயங்களை ஒலிப்பதிவு செய்து, லட்சக்கணக்கான தமிழ் நேயர்களுடன் பகிருங்கள்.
          </p>
        </div>

        <Link
          to="/creator/series/new"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-sm shadow-lg transition-transform hover:scale-105"
        >
          <PlusCircle className="h-4 w-4" />
          <span>புதிய தொடர் தொடங்கு</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">மொத்த தொடர்கள்</span>
            <BookOpen className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">4</div>
          <p className="text-[11px] text-emerald-600 font-medium">3 வெளியிடப்பட்டது • 1 வரைவு</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">மொத்த அத்தியாயங்கள்</span>
            <Headphones className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">18</div>
          <p className="text-[11px] text-zinc-500">முழுமையாக ஆடியோவுடன்</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">மொத்தக் கேட்புகள் (Listens)</span>
            <Play className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">12,450</div>
          <p className="text-[11px] text-emerald-600 font-medium">↑ +18% இந்த வாரம்</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">நேயர்கள் மதிப்பீடு</span>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">4.9 ★</div>
          <p className="text-[11px] text-zinc-500">840 நேயர்கள் மதிப்பீடு</p>
        </div>
      </div>

      {/* Quick Action Shelves */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Series */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
              சமீபத்திய கதைகள் (Recent Series)
            </h3>
            <Link to="/creator/series" className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
              அனைத்தும்
            </Link>
          </div>

          <div className="divide-y divide-emerald-50 dark:divide-emerald-900/30 text-sm">
            {[
              { id: '1', title: 'பொன்னியின் செல்வன்', status: 'வெளியிடப்பட்டது', episodes: 5 },
              { id: '2', title: 'சிவகாமியின் சபதம்', status: 'வெளியிடப்பட்டது', episodes: 4 },
              { id: '3', title: 'இரவின் நிழல்கள் (திகில்)', status: 'மதிப்பாய்வில்', episodes: 3 },
            ].map((s) => (
              <div key={s.id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{s.title}</h4>
                  <span className="text-xs text-zinc-400">{s.episodes} அத்தியாயங்கள்</span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-medium">
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Assistant Promo */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-[#0E2019] dark:to-[#0A1A14] border border-emerald-200/60 dark:border-emerald-900/40 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
              AI தமிழ் கதை எழுத்து உதவி (AI Assistant)
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              கதைக்கள யோசனைகள், ஈர்க்கும் தலைப்புகள் மற்றும் தமிழ் இலக்கணப் பிழை திருத்தத்திற்கு கதைசொல்லி AI உதவியைப் பயன்படுத்துங்கள்.
            </p>
          </div>

          <Link
            to="/creator/ai-assistant"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs shadow-sm"
          >
            <Sparkles className="h-4 w-4" />
            <span>AI உதவியாளரைத் தொடங்கு</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
