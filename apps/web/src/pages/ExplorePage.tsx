import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, AlertCircle, RefreshCw, Globe } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { StoryCard } from '../components/StoryCard';
import { EmptyState } from '../components/EmptyState';
import { StoryGridSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';

export const ExplorePage: React.FC = () => {
  const { api } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get('category') || 'all';
  const initialLang = searchParams.get('language') || 'all';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [language, setLanguage] = useState<string>(initialLang);

  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    const lang = searchParams.get('language') || 'all';
    setSelectedCategory(cat);
    setLanguage(lang);
  }, [searchParams]);

  // Fetch real categories
  const { data: categories = [] } = useQuery({
    queryKey: ['catalog', 'categories'],
    queryFn: () => api.catalog.getCategories(),
  });

  // Fetch real languages
  const { data: languages = [] } = useQuery({
    queryKey: ['catalog', 'languages'],
    queryFn: () => api.catalog.getLanguages(),
  });

  // Fetch real stories matching current category and language
  const {
    data: seriesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['catalog', 'explore', selectedCategory, language],
    queryFn: () =>
      api.catalog.search({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        language: language !== 'all' ? language : undefined,
        pageSize: 30,
      }),
  });

  const stories = seriesData?.items || [];

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const newParams: Record<string, string> = {};
    if (cat !== 'all') newParams.category = cat;
    if (language !== 'all') newParams.language = language;
    setSearchParams(newParams);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    const newParams: Record<string, string> = {};
    if (selectedCategory !== 'all') newParams.category = selectedCategory;
    if (lang !== 'all') newParams.language = lang;
    setSearchParams(newParams);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
          கதைகளை உலாவுங்கள் (Explore Stories)
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          அனைத்து தமிழ் ஆடியோ கதைகளும் 100% இலவசம் • விருப்பத்திற்கேற்ப வகைப்படுத்தி கேளுங்கள்
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#14231E] border border-emerald-100 dark:border-emerald-900/40 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full sm:w-auto text-sm rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-[#101A16] px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">அனைத்து வகைப்பாடுகள் (All Categories)</option>
              {categories.map((cat) => (
                <option key={cat.id || cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Language Dropdown */}
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full sm:w-auto text-sm rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-[#101A16] px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">அனைத்து மொழிகள் (All Languages)</option>
              {languages.map((lang) => (
                <option key={lang.id || lang.code} value={lang.code}>
                  {lang.nativeName || lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stories Count */}
        <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          {isLoading ? 'ஏற்றுகிறது...' : `${stories.length} கதைகள் கண்டறியப்பட்டன`}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && <StoryGridSkeleton count={8} />}

      {/* Error State */}
      {isError && (
        <div className="p-8 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-rose-600 mx-auto" />
          <h3 className="text-lg font-bold text-rose-900 dark:text-rose-200">
            கதைகளை ஏற்றுவதில் பிழை ஏற்பட்டது
          </h3>
          <p className="text-xs text-rose-700 dark:text-rose-300 max-w-md mx-auto">
            {(error as any)?.message || 'சர்வர் இணைப்பில் பிழை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'}
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold shadow-sm transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>மீண்டும் முயற்சி செய்</span>
          </button>
        </div>
      )}

      {/* Stories Grid */}
      {!isLoading && !isError && (
        <>
          {stories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {stories.map((story) => (
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
              icon={Filter}
              title="கதைகள் எதுவும் இல்லை"
              description="தேர்ந்தெடுக்கப்பட்ட வகைப்பாட்டில் அல்லது மொழியில் கதைகள் எதுவும் கிடைக்கவில்லை."
              actionLabel="அனைத்துக் கதைகளையும் காண்க"
              onAction={() => {
                setSelectedCategory('all');
                setLanguage('all');
                setSearchParams({});
              }}
            />
          )}
        </>
      )}
    </div>
  );
};
