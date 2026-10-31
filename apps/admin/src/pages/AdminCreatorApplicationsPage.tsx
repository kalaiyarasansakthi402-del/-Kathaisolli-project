import React, { useState } from 'react';
import { CheckSquare, Check, X, ExternalLink, UserCheck, AlertCircle } from 'lucide-react';

interface CreatorApplication {
  id: string;
  applicantName: string;
  email: string;
  bio: string;
  sampleAudioUrl?: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const AdminCreatorApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<CreatorApplication[]>([
    {
      id: 'app-1',
      applicantName: 'செந்தில்குமார் (Senthilkumar)',
      email: 'senthil@example.com',
      bio: 'வானொலி மற்றும் குரல் கலைஞர். 5 ஆண்டுகள் தமிழ் கதைகள் வாசித்த அனுபவம் உண்டு.',
      sampleAudioUrl: 'https://example.com/sample1.mp3',
      submittedAt: 'நேற்று',
      status: 'PENDING',
    },
    {
      id: 'app-2',
      applicantName: 'பிரியா தர்ஷினி (Priya Dharshini)',
      email: 'priya@example.com',
      bio: 'சிறுவர் கதைகள் மற்றும் தன்னம்பிக்கை புத்தகங்களை ஒலிப்பதிவு செய்ய விரும்புகிறேன்.',
      sampleAudioUrl: 'https://example.com/sample2.mp3',
      submittedAt: '2 நாட்களுக்கு முன்',
      status: 'PENDING',
    },
  ]);

  const handleReview = (id: string, decision: 'APPROVED' | 'REJECTED') => {
    setApplications(
      applications.map((a) => (a.id === id ? { ...a, status: decision } : a))
    );
  };

  const pendingApps = applications.filter((a) => a.status === 'PENDING');

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
          படைப்பாளர் விண்ணப்பங்கள் (Creator Applications)
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          கதைசொல்லியில் கதை சொல்ல விண்ணப்பித்த நேயர்களின் மாதிரி ஆடியோக்களை மதிப்பாய்வு செய்து அனுமதிக்கவும்
        </p>
      </div>

      {pendingApps.length > 0 ? (
        <div className="space-y-4">
          {pendingApps.map((app) => (
            <div
              key={app.id}
              className="p-6 rounded-3xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-50 dark:border-emerald-900/30 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {app.applicantName}
                  </h3>
                  <p className="text-xs text-zinc-400">{app.email} • {app.submittedAt}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                  மதிப்பாய்வு நிலுவையில்
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  அறிமுகம் & அனுபவம்:
                </h4>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed bg-emerald-50/30 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100/50">
                  {app.bio}
                </p>
              </div>

              {app.sampleAudioUrl && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-zinc-500">மாதிரி ஆடியோ:</span>
                  <a
                    href={app.sampleAudioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    <span>மாதிரி குரலைக் கேட்க (Listen to Sample)</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => handleReview(app.id, 'REJECTED')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-semibold transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>நிராகரி (Reject)</span>
                </button>

                <button
                  onClick={() => handleReview(app.id, 'APPROVED')}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  <Check className="h-4 w-4" />
                  <span>ஒப்புதல் அளி (Approve as Creator)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40">
          <CheckSquare className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
            நிலுவையில் விண்ணப்பங்கள் ஏதும் இல்லை
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            அனைத்து படைப்பாளர் விண்ணப்பங்களும் மதிப்பாய்வு செய்யப்பட்டுள்ளன.
          </p>
        </div>
      )}
    </div>
  );
};
