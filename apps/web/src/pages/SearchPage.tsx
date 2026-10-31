import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, X, Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { StoryCard } from '../components/StoryCard';
import { EmptyState } from '../components/EmptyState';
import { StoryGridSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';

const POPULAR_SEARCH_TAGS = [
  'பொன்னியின் செல்வன்',
  'கல்கி',
  'சிவகாமியின் சபதம்',
  'மர்மத் தீவு',
  'நம்பிக்கை ஒளி',
  'தெனாலிராமன்',
  'வரலாறு',
  'அறிவியல்',
];

export const SearchPage: React.FC = () => {
  const { api } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState<string>(initialQuery);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== query) {
      setQuery(q);
    }
  }, [searchParams]);

  const trimmedQuery = query.trim();

  const {
    data: searchResults,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['catalog', 'search', trimmedQuery],
    queryFn: () => api.catalog.search({ q: trimmedQuery, pageSize: 30 }),
    enabled: trimmedQuery.length > 0,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    setSearchParams({ q: tag });
  };

  const results = searchResults?.items || [];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Search Header & Input */}
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
          கதைகளைத் தேடுங்கள் (Search Stories)
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          தலைப்பு, கதாசிரியர், கதை சொல்லி அல்லது கதைக் களம் மூலம் தேடுங்கள்
        </p>

        <form onSubmit={handleSearchSubmit} className="relative mt-4">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="எ.கா. பொன்னியின் செல்வன், கல்கி, திகில்..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 bg-white dark:bg-[#14231E] text-zinc-900 dark:text-zinc-100 shadow-sm focus:outline-none focus:border-emerald-500 text-base"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSearchParams({});
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </form>

        {/* Suggested Search Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            பிரபலமான தேடல்கள்:
          </span>
          {POPULAR_SEARCH_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className="text-xs px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && trimmedQuery.length > 0 && (
        <div className="space-y-4">
          <div className="h-6 w-40 bg-emerald-100/40 dark:bg-emerald-900/30 rounded animate-pulse" />
          <StoryGridSkeleton count={8} />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-8 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-center space-y-2">
          <AlertCircle className="h-8 w-8 text-rose-600 mx-auto" />
          <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">
            தேடுவதில் பிழை ஏற்பட்டது
          </h3>
          <p className="text-xs text-rose-700 dark:text-rose-300">
            {(error as any)?.message || 'சர்வர் இணைப்பில் பிழை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'}
          </p>
        </div>
      )}

      {/* Results View */}
      {!isLoading && !isError && trimmedQuery.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-900/40 pb-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              "{trimmedQuery}" -க்கான முடிவுகள் ({results.length})
            </h2>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {results.map((story) => (
                <StoryCard
                  key={story.id}
                  id={story.id}
                  slug={story.slug}
                  title={story.title}
                  authorName={story.authorName || undefined}
                  coverImage={story.coverImage}
                  categoryName={story.category?.name}
                  language={story.language?.nativeName || story.language?.name}
                  totalEpisodes={1}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="கதைகள் எதுவும் கண்டறியப்படவில்லை"
              description={`"${trimmedQuery}" என்ற தேடலுக்குப் பொருத்தமான முடிவுகள் எதுவும் கிடைக்கவில்லை. வேறு சொற்களைக் கொண்டு தேடவும்.`}
              actionLabel="அனைத்துக் கதைகளையும் உலாவுங்கள்"
              onAction={() => {
                setQuery('');
                setSearchParams({});
              }}
            />
          )}
        </div>
      )}

      {/* Empty Initial Search State */}
      {!trimmedQuery && (
        <div className="text-center py-16 text-zinc-400 dark:text-zinc-500">
          <SearchIcon className="h-12 w-12 mx-auto mb-3 opacity-30 text-emerald-600" />
          <p className="text-sm">நீங்கள் கேட்க விரும்பும் கதையின் தலைப்பை அல்லது எழுத்தாளரின் பெயரை மேலே உள்ள பெட்டியில் உள்ளிடவும்.</p>
        </div>
      )}
    </div>
  );
};
