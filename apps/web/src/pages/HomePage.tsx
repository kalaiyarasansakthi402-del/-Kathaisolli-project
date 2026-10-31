import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronRight, Play, Flame, BookMarked, History, RefreshCw, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { StoryCard } from '../components/StoryCard';
import { CategoryPill } from '../components/CategoryPill';
import { StoryGridSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';

export const HomePage: React.FC = () => {
  const { user, api } = useAuth();
  const { currentEpisode, isPlaying, playEpisode } = usePlayer();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const {
    data: homeData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['catalog', 'home'],
    queryFn: () => api.catalog.getHome(),
  });

  const { data: continueListening } = useQuery({
    queryKey: ['library', 'continue-listening'],
    queryFn: () => api.library.getContinueListening(),
    enabled: !!user,
  });

  const featured = homeData?.featured || homeData?.featuredSeries || [];
  const latest = homeData?.latest || homeData?.trendingSeries || [];
  const categories = homeData?.categories || homeData?.popularCategories || [];

  const allStories = [...featured, ...latest].filter(
    (item, index, self) => index === self.findIndex((t) => t.id === item.id)
  );

  const filteredStories = selectedCategory === 'all'
    ? allStories
    : allStories.filter((s) => s.category?.slug === selectedCategory);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-[#0A261D] p-6 sm:p-10 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>100% இலவச ஆடியோ தளம் • வரம்பற்ற கேட்பு</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-serif">
            {user ? `வணக்கம், ${user.displayName || 'நேயரே'}!` : 'வணக்கம்! கதைசொல்லிக்கு நல்வரவு!'}
          </h1>
          <p className="text-emerald-100/80 text-sm sm:text-base">
            இன்றைய நாளுக்கான சிறந்த தமிழ் ஒலிப்புத்தகங்கள் மற்றும் கதைகளை உடனே கேட்கத் தொடங்குங்கள்.
          </p>
        </div>
      </div>

      {/* Continue Listening Shelf */}
      {currentEpisode && (
        <section className="bg-emerald-50 dark:bg-[#14231E] rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900/40">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                தொடர்ந்து கேட்க (Continue Listening)
              </h2>
            </div>
            <Link to="/library" className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
              நூலகம் காண்க
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#101A16] p-4 rounded-xl shadow-sm border border-emerald-100/60 dark:border-emerald-900/30">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-lg bg-emerald-950 flex items-center justify-center text-white shrink-0 overflow-hidden">
                {currentEpisode.coverImage ? (
                  <img src={currentEpisode.coverImage} alt={currentEpisode.title} className="w-full h-full object-cover" />
                ) : (
                  <Play className="h-6 w-6 fill-current text-emerald-400" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                  {currentEpisode.title}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {currentEpisode.seriesTitle || 'கதைசொல்லி தொடர்'}
                </p>
              </div>
            </div>
            <button
              onClick={() => playEpisode(currentEpisode.episodeId || currentEpisode.id || '', currentEpisode.seriesId)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>{isPlaying ? 'தற்போது ஒலிக்கிறது' : 'தொடர்க'}</span>
            </button>
          </div>
        </section>
      )}

      {/* Continue Listening Items from Backend */}
      {!currentEpisode && continueListening && continueListening.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-serif">
                தொடர்ந்து கேட்க (Continue Listening)
              </h2>
            </div>
            <Link to="/library" className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
              அனைத்தும்
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {continueListening.slice(0, 3).map((item) => (
              <div
                key={item.episodeId}
                className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#14231E] border border-emerald-100 dark:border-emerald-900/40 shadow-sm"
              >
                <div className="min-w-0 pr-3">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                    {item.episodeTitle || 'அத்தியாயம்'}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {item.series?.title || 'கதைசொல்லி தொடர்'}
                  </p>
                </div>
                <button
                  onClick={() =>
                    playEpisode(
                      {
                        episodeId: item.episodeId,
                        title: item.episodeTitle,
                        seriesId: item.series?.id,
                        seriesTitle: item.series?.title,
                        coverImage: item.series?.coverImage,
                        durationSec: item.durationSec,
                      },
                      item.series?.id
                    )
                  }
                  className="p-2.5 rounded-full bg-emerald-700 text-white hover:bg-emerald-600 transition-colors shrink-0"
                >
                  <Play className="h-4 w-4 fill-current" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-8">
          <div className="h-8 w-48 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-lg animate-pulse" />
          <StoryGridSkeleton count={8} />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-8 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-rose-600 mx-auto" />
          <h3 className="text-lg font-bold text-rose-900 dark:text-rose-200">
            கதைகளை ஏற்றுவதில் பிழை ஏற்பட்டது
          </h3>
          <p className="text-xs text-rose-700 dark:text-rose-300 max-w-md mx-auto">
            {(error as any)?.message || 'சர்வர் இணைப்பில் தடங்கல். தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'}
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

      {/* Content if loaded successfully */}
      {!isLoading && !isError && (
        <>
          {/* Category Filter Pills Bar */}
          {categories.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-serif">
                  வகைப்பாடுகள் (Categories)
                </h2>
                <Link to="/categories" className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
                  அனைத்தும் காண்க
                </Link>
              </div>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                <CategoryPill
                  id="all"
                  name="All"
                  tamilName="அனைத்தும்"
                  isActive={selectedCategory === 'all'}
                  onClick={setSelectedCategory}
                />
                {categories.map((cat) => (
                  <CategoryPill
                    key={cat.id || cat.slug}
                    id={cat.slug}
                    name={cat.name}
                    tamilName={cat.name}
                    isActive={selectedCategory === cat.slug}
                    onClick={setSelectedCategory}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Filtered Stories / Top Trending */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-500" />
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-serif">
                  {selectedCategory === 'all' ? 'முன்னணி கதைகள் (Top Trending Stories)' : 'தேர்ந்தெடுக்கப்பட்ட கதைகள்'}
                </h2>
              </div>
              <Link to="/explore" className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
                மேலும் கதைகள்
              </Link>
            </div>
            {filteredStories.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                இந்த வகைப்பாட்டில் தற்போது கதைகள் இல்லை.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredStories.map((story) => (
                  <StoryCard
                    key={story.id}
                    id={story.id}
                    slug={story.slug}
                    title={story.title}
                    authorName={story.authorName || undefined}
                    coverImage={story.coverImage}
                    categoryName={story.category?.name}
                    totalEpisodes={1}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Featured Stories Shelf */}
          {featured.length > 0 && selectedCategory === 'all' && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookMarked className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-serif">
                    சிறப்புக் கதைகள் (Featured Series)
                  </h2>
                </div>
                <Link to="/explore" className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
                  அனைத்தும் காண்க
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-5">
                {featured.map((story) => (
                  <StoryCard
                    key={story.id}
                    id={story.id}
                    slug={story.slug}
                    title={story.title}
                    authorName={story.authorName || undefined}
                    coverImage={story.coverImage}
                    categoryName={story.category?.name}
                    totalEpisodes={1}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};
