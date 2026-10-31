import React, { useState } from 'react';
import { ShieldCheck, Check, X, Send, BookOpen, AlertCircle } from 'lucide-react';
import { apiClient } from '@kathaisolli/api-client';

interface PendingSeries {
  id: string;
  title: string;
  creatorName: string;
  category: string;
  episodesCount: number;
  synopsis: string;
  submittedAt: string;
}

export const AdminModerationQueuePage: React.FC = () => {
  const [pendingList, setPendingList] = useState<PendingSeries[]>([
    {
      id: 'ser-mod-1',
      title: 'இரவின் நிழல்கள் (திகில் தொடர்)',
      creatorName: 'கார்த்திக் சுப்புராஜ்',
      category: 'திகில் & மர்மம்',
      episodesCount: 3,
      synopsis: 'கொடைக்கானல் பழைய பங்களாவில் நடைபெறும் தொடர் மர்ம நிகழ்வுகளும், துப்பறியும் அதிகாரியின் புத்திசாலித்தனமான விசாரணையும்.',
      submittedAt: '3 மணி நேரத்திற்கு முன்',
    },
    {
      id: 'ser-mod-2',
      title: 'மனதின் ரகசியம் (தன்னம்பிக்கை)',
      creatorName: 'ஆனந்த கிருஷ்ணன்',
      category: 'தன்னம்பிக்கை',
      episodesCount: 2,
      synopsis: 'வாழ்க்கையின் சவால்களை வெல்லும் மனவலிமையும் தன்னம்பிக்கை வழிகாட்டுதலும்.',
      submittedAt: 'நேற்று',
    },
  ]);

  const [selectedSeries, setSelectedSeries] = useState<PendingSeries | null>(null);
  const [moderationNote, setModerationNote] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const handleApproveAndPublish = async (seriesId: string) => {
    setReviewing(true);
    try {
      await apiClient.admin.reviewSeries(seriesId, 'APPROVE');
      await apiClient.admin.publishSeries(seriesId);
    } catch {
      // Mock fallback
    } finally {
      setPendingList(pendingList.filter((s) => s.id !== seriesId));
      setSelectedSeries(null);
      setReviewing(false);
    }
  };

  const handleReject = async (seriesId: string) => {
    if (!moderationNote.trim()) {
      alert('நிராகரிப்பதற்கான காரணத்தைக் குறிப்பிடுவது கட்டாயம் (Moderation note is mandatory).');
      return;
    }
    setReviewing(true);
    try {
      await apiClient.admin.reviewSeries(seriesId, 'REJECT', moderationNote);
    } catch {
      // Mock fallback
    } finally {
      setPendingList(pendingList.filter((s) => s.id !== seriesId));
      setSelectedSeries(null);
      setModerationNote('');
      setReviewing(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
          உள்ளடக்க மதிப்பாய்வு வரிசை (Content Moderation Queue)
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          வெளியீட்டுக்கு முன் கதைகளின் தரம், பதிப்புரிமை மற்றும் வழிகாட்டுதல்களை உறுதிசெய்து வெளியிட ஒப்புதல் அளியுங்கள்
        </p>
      </div>

      {pendingList.length > 0 ? (
        <div className="space-y-6">
          {pendingList.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-50 dark:border-emerald-900/30 pb-3">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    படைப்பாளர்: <strong className="text-zinc-700 dark:text-zinc-300">{item.creatorName}</strong> • {item.category} • {item.episodesCount} அத்தியாயங்கள்
                  </p>
                </div>
                <span className="text-xs text-zinc-400">{item.submittedAt}</span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  கதைச் சுருக்கம்:
                </h4>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed bg-emerald-50/30 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100/50">
                  {item.synopsis}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedSeries(item)}
                  className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold"
                >
                  நிராகரி (Reject with Note)
                </button>

                <button
                  onClick={() => handleApproveAndPublish(item.id)}
                  disabled={reviewing}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  <Check className="h-4 w-4" />
                  <span>ஒப்புதல் அளித்து வெளியிடு (Approve & Publish)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40">
          <ShieldCheck className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
            மதிப்பாய்வு வரிசை காலியாக உள்ளது
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            அனைத்து கதைகளும் வெற்றிகரமாக மதிப்பாய்வு செய்யப்பட்டு வெளியிடப்பட்டுள்ளன.
          </p>
        </div>
      )}

      {/* Reject Modal */}
      {selectedSeries && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#10221B] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-rose-200 dark:border-rose-900/40 space-y-4">
            <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400">
              கதையை நிராகரிக்கக் காரணம் (Mandatory Note)
            </h3>
            <p className="text-xs text-zinc-500">
              படைப்பாளர் திருத்தம் செய்வதற்காக நிராகரிப்பதற்கான தெளிவான காரணத்தைக் குறிப்பிடவும்.
            </p>

            <textarea
              required
              rows={4}
              value={moderationNote}
              onChange={(e) => setModerationNote(e.target.value)}
              placeholder="எ.கா. ஆடியோவின் முதல் அத்தியாயத்தில் இரைச்சல் அதிகமாக உள்ளது. பின்னணி இசையைக் குறைத்து மீண்டும் பதிவேற்றவும்."
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0A1612] text-sm focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSeries(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
              >
                ரத்து செய்க
              </button>
              <button
                type="button"
                onClick={() => handleReject(selectedSeries.id)}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
              >
                நிராகரிப்பை உறுதிசெய்
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
