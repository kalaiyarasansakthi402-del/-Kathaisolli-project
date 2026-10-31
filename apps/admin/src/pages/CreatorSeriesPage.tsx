import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Headphones, Edit, CheckCircle, Clock, Trash2, ArrowRight } from 'lucide-react';

interface CreatorSeriesItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  episodesCount: number;
  status: 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'REJECTED';
  updatedAt: string;
}

export const CreatorSeriesPage: React.FC = () => {
  const [seriesList, setSeriesList] = useState<CreatorSeriesItem[]>([
    {
      id: 's-1',
      slug: 'ponniyin-selvan',
      title: 'பொன்னியின் செல்வன்',
      category: 'வரலாற்று புதினம்',
      episodesCount: 5,
      status: 'PUBLISHED',
      updatedAt: '2025-02-01',
    },
    {
      id: 's-2',
      slug: 'sivagamiyin-sabatham',
      title: 'சிவகாமியின் சபதம்',
      category: 'வரலாற்று புதினம்',
      episodesCount: 4,
      status: 'PUBLISHED',
      updatedAt: '2025-02-03',
    },
    {
      id: 's-3',
      slug: 'iravin-nilaalgal',
      title: 'இரவின் நிழல்கள் (திகில் தொடர்)',
      category: 'திகில் & மர்மம்',
      episodesCount: 3,
      status: 'IN_REVIEW',
      updatedAt: '2025-02-05',
    },
    {
      id: 's-4',
      slug: 'manathin-ragasiyam',
      title: 'மனதின் ரகசியம் (தன்னம்பிக்கை)',
      category: 'தன்னம்பிக்கை',
      episodesCount: 1,
      status: 'DRAFT',
      updatedAt: '2025-02-06',
    },
  ]);

  const handleSubmitForReview = (id: string) => {
    setSeriesList(
      seriesList.map((s) => (s.id === id ? { ...s, status: 'IN_REVIEW' } : s))
    );
  };

  const getStatusBadge = (status: CreatorSeriesItem['status']) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle className="h-3 w-3" />
            வெளியிடப்பட்டது (Published)
          </span>
        );
      case 'IN_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <Clock className="h-3 w-3" />
            மதிப்பாய்வில் (In Review)
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
            வரைவு (Draft)
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            நிராகரிக்கப்பட்டது (Rejected)
          </span>
        );
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
            எனது தொடர்கள் (My Stories)
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            உங்கள் ஆடியோ தொடர்களை உருவாக்கி, அத்தியாயங்களை நிர்வகியுங்கள்
          </p>
        </div>

        <Link
          to="/creator/series/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm shadow-sm transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          <span>புதிய தொடர் (Create Series)</span>
        </Link>
      </div>

      {/* Series List Table */}
      <div className="bg-white dark:bg-[#10221B] rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-emerald-50/50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/30 text-xs font-bold text-zinc-600 dark:text-zinc-300">
            <tr>
              <th className="py-4 px-6">தொடர் தலைப்பு (Title)</th>
              <th className="py-4 px-6">வகைப்பாடு (Category)</th>
              <th className="py-4 px-6">அத்தியாயங்கள் (Episodes)</th>
              <th className="py-4 px-6">நிலை (Status)</th>
              <th className="py-4 px-6 text-right">செயல்கள் (Actions)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-50 dark:divide-emerald-900/30">
            {seriesList.map((s) => (
              <tr key={s.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-colors">
                <td className="py-4 px-6">
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">{s.title}</div>
                  <span className="text-xs text-zinc-400">/{s.slug}</span>
                </td>
                <td className="py-4 px-6 text-zinc-600 dark:text-zinc-300">
                  {s.category}
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
                    <Headphones className="h-4 w-4 text-emerald-600" />
                    {s.episodesCount}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {getStatusBadge(s.status)}
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/creator/series/${s.id}/episodes`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors inline-flex items-center gap-1"
                    >
                      <span>அத்தியாயங்கள்</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>

                    {s.status === 'DRAFT' && (
                      <button
                        onClick={() => handleSubmitForReview(s.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors"
                      >
                        மதிப்பாய்வுக்கு அனுப்பு
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
