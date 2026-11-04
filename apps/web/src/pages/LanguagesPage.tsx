import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

export const LanguagesPage: React.FC = () => {
  const { api } = useAuth();

  const {
    data: languages = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['catalog', 'languages'],
    queryFn: () => api.catalog.getLanguages(),
  });

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
          மொழிகள் (Languages)
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          கதைசொல்லி தமிழ் மொழியை முதன்மையாகக் கொண்ட 100% இலவச ஆடியோ தளம்
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white dark:bg-[#14231E] border border-emerald-100/60 dark:border-emerald-900/40 animate-pulse h-28" />
          ))}
        </div>
      )}

      {isError && (
        <div className="p-8 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-rose-600 mx-auto" />
          <h3 className="text-lg font-bold text-rose-900 dark:text-rose-200">
            மொழிகளை ஏற்றுவதில் பிழை
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {languages.map((lang) => (
            <div
              key={lang.id || lang.code}
              className="p-6 rounded-2xl bg-white dark:bg-[#14231E] border-2 border-emerald-500/40 dark:border-emerald-700/60 shadow-sm flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{lang.code === 'ta' ? '🇮🇳' : '🌐'}</span>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {lang.nativeName || lang.name} ({lang.name})
                  </h3>
                  {lang.code === 'ta' && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                      முதன்மை மொழி
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {lang.code === 'ta' ? 'முழுமையான தமிழ் ஆடியோ கதைகள்' : '100% Free Catalog'}
                </p>
              </div>

              <Link
                to={lang.code === 'en' ? '/categories?category=English' : '/categories'}
                className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                <span>கதைகள்</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
