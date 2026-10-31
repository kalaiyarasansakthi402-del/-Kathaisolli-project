import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, BookOpen, Skull, Heart, Flame, ShieldAlert, Sparkles, Baby, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  history: <Compass className="h-8 w-8 text-amber-500" />,
  mystery: <Skull className="h-8 w-8 text-purple-500" />,
  thriller: <Skull className="h-8 w-8 text-purple-500" />,
  romance: <Heart className="h-8 w-8 text-rose-500" />,
  devotional: <Sparkles className="h-8 w-8 text-amber-400" />,
  inspiration: <Flame className="h-8 w-8 text-emerald-500" />,
  classics: <BookOpen className="h-8 w-8 text-teal-500" />,
  children: <Baby className="h-8 w-8 text-cyan-500" />,
  'science-fiction': <ShieldAlert className="h-8 w-8 text-blue-500" />,
};

export const CategoriesPage: React.FC = () => {
  const { api } = useAuth();

  const {
    data: categories = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['catalog', 'categories'],
    queryFn: () => api.catalog.getCategories(),
  });

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
          கதை வகைப்பாடுகள் (Categories)
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          உங்களுக்குப் பிடித்த வகைப்பாட்டின் படி தமிழ் ஆடியோ கதைகளைக் கண்டறியுங்கள்
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white dark:bg-[#14231E] border border-emerald-100/60 dark:border-emerald-900/40 animate-pulse space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-emerald-100/50 dark:bg-emerald-900/30" />
              <div className="h-5 bg-emerald-100/50 dark:bg-emerald-900/30 rounded w-2/3" />
              <div className="h-3 bg-emerald-50 dark:bg-emerald-950 rounded w-1/3" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="p-8 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-rose-600 mx-auto" />
          <h3 className="text-lg font-bold text-rose-900 dark:text-rose-200">
            வகைப்பாடுகளை ஏற்றுவதில் பிழை
          </h3>
          <p className="text-xs text-rose-700 dark:text-rose-300">
            {(error as any)?.message || 'சர்வர் இணைப்பில் பிழை ஏற்பட்டது.'}
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>மீண்டும் முயற்சி செய்</span>
          </button>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id || cat.slug}
              to={`/explore?category=${cat.slug}`}
              className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-[#14231E] border border-emerald-100 dark:border-emerald-900/40 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {CATEGORY_ICONS[cat.slug] || <BookOpen className="h-8 w-8 text-emerald-600" />}
              </div>

              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                {cat.name}
              </h3>

              {cat.slug && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 uppercase tracking-wider font-semibold">
                  {cat.slug}
                </p>
              )}

              <div className="mt-6 flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400 pt-3 border-t border-emerald-50 dark:border-emerald-900/30">
                <span>கதைகளைக் காண்க</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
