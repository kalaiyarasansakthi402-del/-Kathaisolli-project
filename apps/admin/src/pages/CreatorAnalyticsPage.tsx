import React from 'react';
import { BarChart3, TrendingUp, Users, Clock, Globe } from 'lucide-react';

export const CreatorAnalyticsPage: React.FC = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
          படைப்பாளர் பகுப்பாய்வு (Analytics)
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          உங்கள் கதைகளின் கேட்பு புள்ளிவிவரங்கள் மற்றும் நேயர்களின் ஈடுபாடு
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-zinc-400">கடந்த 30 நாட்கள் கேட்புகள்</span>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">12,450</div>
          <p className="text-[11px] text-emerald-600 font-semibold">+18.4% அதிகரிப்பு</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-zinc-400">சராசரி நிறைவு விகிதம் (Completion)</span>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">82.6%</div>
          <p className="text-[11px] text-emerald-600 font-semibold">நேயர்களின் அதிக ஈடுபாடு</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-zinc-400">மொத்த கேட்கும் நேரம்</span>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">2,140 மணிநேரம்</div>
          <p className="text-[11px] text-zinc-500">100% கட்டணமில்லா கேட்பு</p>
        </div>
      </div>

      {/* Audience Demographics */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-emerald-600" />
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
            நேயர்களின் புவியியல் பரவல் (Audience Geography)
          </h3>
        </div>

        <div className="space-y-3">
          {[
            { region: 'தமிழ்நாடு & இந்தியா', percent: 68 },
            { region: 'இலங்கை (Sri Lanka)', percent: 14 },
            { region: 'மலேசியா & சிங்கப்பூர்', percent: 10 },
            { region: 'மத்திய கிழக்கு நாடுகள்', percent: 5 },
            { region: 'அமெரிக்கா & ஐரோப்பிய நாடுகள்', percent: 3 },
          ].map((d, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <span>{d.region}</span>
                <span>{d.percent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${d.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
