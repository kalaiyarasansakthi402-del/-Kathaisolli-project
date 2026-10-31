import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Headphones, Upload, CheckCircle, Clock, Trash2 } from 'lucide-react';

interface EpisodeItem {
  id: string;
  number: number;
  title: string;
  tamilTitle: string;
  durationSec: number;
  status: 'READY' | 'PROCESSING' | 'PENDING_UPLOAD';
}

export const ManageEpisodesPage: React.FC = () => {
  const { seriesId } = useParams<{ seriesId: string }>();

  const [episodes, setEpisodes] = useState<EpisodeItem[]>([
    {
      id: 'ep-1',
      number: 1,
      title: 'Aadi Thirunal - Arrival of Vandiyathevan',
      tamilTitle: 'ஆடித் திருநாள் - வந்தியத்தேவன் வருகை',
      durationSec: 1440,
      status: 'READY',
    },
    {
      id: 'ep-2',
      number: 2,
      title: 'Alwarkkadiyan Nambi',
      tamilTitle: 'ஆழ்வார்க்கடியான் நம்பி',
      durationSec: 1380,
      status: 'READY',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTamilTitle, setNewTamilTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleAddEpisode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTamilTitle) return;

    setUploading(true);
    // Simulate upload progress to MinIO storage
    let p = 0;
    const interval = setInterval(() => {
      p += 25;
      setUploadProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setUploading(false);
        const newEp: EpisodeItem = {
          id: `ep-${Date.now()}`,
          number: episodes.length + 1,
          title: newTitle || newTamilTitle,
          tamilTitle: newTamilTitle,
          durationSec: 1200,
          status: 'READY',
        };
        setEpisodes([...episodes, newEp]);
        setShowAddModal(false);
        setNewTitle('');
        setNewTamilTitle('');
        setSelectedFile(null);
        setUploadProgress(0);
      }
    }, 200);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <Link
        to="/creator/series"
        className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>தொடர்களுக்குத் திரும்பு</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
            அத்தியாயங்கள் மேலாண்மை (Manage Episodes)
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            பொன்னியின் செல்வன் • {episodes.length} அத்தியாயங்கள்
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>புதிய அத்தியாயம் சேர்க்க (Add Episode)</span>
        </button>
      </div>

      {/* Episode list */}
      <div className="bg-white dark:bg-[#10221B] rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm overflow-hidden divide-y divide-emerald-50 dark:divide-emerald-900/30">
        {episodes.map((ep) => (
          <div key={ep.id} className="p-5 flex items-center justify-between gap-4 hover:bg-emerald-50/20 transition-colors">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center font-bold text-sm text-emerald-800 dark:text-emerald-300 shrink-0">
                {ep.number}
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                  {ep.tamilTitle}
                </h4>
                <p className="text-xs text-zinc-400">{ep.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="text-zinc-400">{Math.round(ep.durationSec / 60)} நிமிடங்கள்</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                <CheckCircle className="h-3 w-3" />
                ஆடியோ தயார்
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Episode Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#10221B] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-4">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-serif">
              புதிய அத்தியாயம் மற்றும் ஆடியோ பதிவேற்றம்
            </h3>

            <form onSubmit={handleAddEpisode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  அத்தியாயத் தமிழ் தலைப்பு *
                </label>
                <input
                  type="text"
                  required
                  value={newTamilTitle}
                  onChange={(e) => setNewTamilTitle(e.target.value)}
                  placeholder="எ.கா. பகுதி 3 - கடம்பூர் மாளிகை"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0A1612] text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  ஆங்கிலத் தலைப்பு (Episode Title)
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Episode 3 - Kadambur Palace"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0A1612] text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* File upload input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  ஆடியோ கோப்பு (.mp3, .m4a, .wav)
                </label>
                <div className="border-2 border-dashed border-emerald-300 dark:border-emerald-800 rounded-2xl p-6 text-center hover:bg-emerald-50/30 cursor-pointer">
                  <Upload className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                    {selectedFile ? selectedFile.name : 'ஆடியோ கோப்பைத் தேர்ந்தெடுக்க இங்கே கிளிக் செய்யவும்'}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1">MP3, M4A, FLAC, WAV (அதிகபட்சம் 200MB)</p>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                    className="hidden"
                    id="audio-upload"
                  />
                  <label
                    htmlFor="audio-upload"
                    className="mt-3 inline-block px-4 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold cursor-pointer"
                  >
                    கோப்பைத் தேர்ந்தெடு
                  </label>
                </div>
              </div>

              {uploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>பதிவேற்றப்படுகிறது...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  ரத்து செய்க
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm disabled:opacity-50"
                >
                  {uploading ? 'பதிவேற்றுகிறது...' : 'சேமி & பதிவேற்று'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
