import React, { useState } from 'react';
import { Radio, RefreshCw, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface AudioJob {
  id: string;
  episodeTitle: string;
  format: string;
  bitrate: string;
  status: 'COMPLETED' | 'PROCESSING' | 'FAILED';
  duration: string;
  completedAt: string;
}

export const AdminAudioQueuePage: React.FC = () => {
  const [jobs, setJobs] = useState<AudioJob[]>([
    {
      id: 'job-101',
      episodeTitle: 'பொன்னியின் செல்வன் - பகுதி 5',
      format: 'HLS / AAC Stereo',
      bitrate: '128 kbps + 320 kbps',
      status: 'COMPLETED',
      duration: '24m 20s',
      completedAt: '5 நிமிடங்களுக்கு முன்',
    },
    {
      id: 'job-102',
      episodeTitle: 'சிவகாமியின் சபதம் - பகுதி 4',
      format: 'HLS / AAC Stereo',
      bitrate: '128 kbps + 320 kbps',
      status: 'COMPLETED',
      duration: '21m 40s',
      completedAt: '12 நிமிடங்களுக்கு முன்',
    },
    {
      id: 'job-103',
      episodeTitle: 'இரவின் நிழல்கள் - பகுதி 3',
      format: 'HLS / AAC Stereo',
      bitrate: '128 kbps + 320 kbps',
      status: 'COMPLETED',
      duration: '20m 00s',
      completedAt: '1 மணி நேரத்திற்கு முன்',
    },
  ]);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
            ஆடியோ செயலாக்க வரிசை (Audio Queue Monitor)
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            BullMQ, Redis மற்றும் FFmpeg பின்னணி ஆடியோ டிரான்ஸ்கோடிங் வேலைகள்
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-[#10221B] text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 text-emerald-600 ${refreshing ? 'animate-spin' : ''}`} />
          <span>நிலையைப் புதுப்பி (Refresh Queue)</span>
        </button>
      </div>

      {/* Queue Health Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-zinc-400">செயலில் உள்ள பணிகள்</span>
          <div className="text-3xl font-extrabold text-emerald-600">0</div>
          <p className="text-[11px] text-zinc-500">வரிசை சீராக இயங்குகிறது</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-zinc-400">வெற்றிகரமாக மாற்றப்பட்டவை</span>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">112</div>
          <p className="text-[11px] text-emerald-600 font-semibold">100% வெற்றி விகிதம்</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-zinc-400">தோல்வியுற்ற பணிகள்</span>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">0</div>
          <p className="text-[11px] text-zinc-500">பிழைகள் எதுவும் இல்லை</p>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white dark:bg-[#10221B] rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-emerald-50/50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/30 text-xs font-bold text-zinc-600 dark:text-zinc-300">
            <tr>
              <th className="py-4 px-6">பணி ID</th>
              <th className="py-4 px-6">அத்தியாயம் (Episode)</th>
              <th className="py-4 px-6">வடிவம் & தரம்</th>
              <th className="py-4 px-6">நிலை (Status)</th>
              <th className="py-4 px-6 text-right">முடிக்கப்பட்ட நேரம்</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-50 dark:divide-emerald-900/30">
            {jobs.map((j) => (
              <tr key={j.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-colors">
                <td className="py-4 px-6 font-mono text-xs text-zinc-400">{j.id}</td>
                <td className="py-4 px-6 font-bold text-zinc-900 dark:text-zinc-100">
                  {j.episodeTitle}
                </td>
                <td className="py-4 px-6 text-xs text-zinc-600 dark:text-zinc-300">
                  {j.format} ({j.bitrate})
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    முடிக்கப்பட்டது
                  </span>
                </td>
                <td className="py-4 px-6 text-right text-xs text-zinc-400">
                  {j.completedAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
