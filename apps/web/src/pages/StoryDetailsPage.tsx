import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause, Heart, Bookmark, Share2, Clock, Headphones, Star, AlertCircle, RefreshCw, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePlayer, type PlayingTrack } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { COMPLETE_LIBRARY_CATALOG, type LibraryBook } from '../data/libraryCatalog';
import { isBookSaved, toggleSaveBook } from '../services/userLibrary';

export const StoryDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, api } = useAuth();
  const { currentEpisode, isPlaying, playEpisode, pause } = usePlayer();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  // Fallback to static catalog if backend API has no match or is unavailable
  const catalogBook = React.useMemo(() => {
    if (!slug) return null;
    const lower = slug.toLowerCase();
    return (
      COMPLETE_LIBRARY_CATALOG.find(
        (b) =>
          b.slug.toLowerCase() === lower ||
          b.id.toLowerCase() === lower ||
          b.folderName.toLowerCase() === lower,
      ) || null
    );
  }, [slug]);

  // Fetch series details from API (optional)
  const {
    data: apiStory,
    isLoading: storyLoading,
    isError: storyError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['catalog', 'series', slug],
    queryFn: () => api.catalog.getSeries(slug || ''),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Fetch episodes list
  const { data: seasons = [] } = useQuery({
    queryKey: ['catalog', 'series', slug, 'episodes'],
    queryFn: () => api.catalog.getEpisodes(slug || ''),
    enabled: !!slug,
  });

  // Fetch user favorites if logged in
  const { data: favorites = [] } = useQuery({
    queryKey: ['library', 'favorites'],
    queryFn: () => api.library.getFavorites(),
    enabled: !!user,
  });

  const story = React.useMemo(() => {
    if (apiStory) return apiStory;
    if (!catalogBook) return null;
    return {
      id: catalogBook.id,
      slug: catalogBook.slug,
      title: catalogBook.tamilTitle ? `${catalogBook.tamilTitle} (${catalogBook.title})` : catalogBook.title,
      authorName: catalogBook.authorName,
      narratorName: catalogBook.narratorName,
      coverImage: catalogBook.coverImageUrl,
      shortDescription: catalogBook.description,
      fullDescription: catalogBook.description,
      category: { name: catalogBook.category },
      language: {
        name: catalogBook.language === 'Tamil' ? 'தமிழ்' : catalogBook.language,
        nativeName: catalogBook.language === 'Tamil' ? 'தமிழ்' : 'English',
      },
      tags: [catalogBook.category, catalogBook.language] as string[],
      seasons: [
        {
          id: 'season-1',
          number: 1,
          title: 'அத்தியாயங்கள் (Chapters)',
          episodes: catalogBook.chapters.map((ch) => ({
            id: ch.id,
            episodeNumber: ch.number,
            title: ch.tamilTitle ? `${ch.tamilTitle} (${ch.title})` : ch.title,
            durationSec: ch.durationSeconds,
            audioUrl: ch.audioUrl,
          })),
        },
      ],
    };
  }, [apiStory, catalogBook]);

  const isFavorited = !!story && favorites.some((f: any) => f.seriesId === story.id || f.id === story.id);
  const [isSavedLocally, setIsSavedLocally] = useState(() => isBookSaved(slug || '', user?.id));

  useEffect(() => {
    if (story) {
      setIsSavedLocally(isBookSaved(story.id, user?.id) || isBookSaved(story.slug, user?.id));
    }
  }, [story, user?.id]);

  const isSaved = isSavedLocally || isFavorited;

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (!story) return;
      if (isFavorited) {
        await api.library.removeFavorite(story.id);
      } else {
        await api.library.addFavorite(story.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'favorites'] });
    },
  });

  const handleToggleLibrary = () => {
    if (!story) return;
    const res = toggleSaveBook(
      {
        id: story.id,
        slug: story.slug || slug || story.id,
        title: story.title,
        authorName: story.authorName || undefined,
        coverImageUrl: story.coverImage || undefined,
        categoryName: story.category?.name || undefined,
        language: story.language?.name || undefined,
        totalEpisodes: allEpisodes.length,
        totalDurationSeconds: allEpisodes.reduce((acc: number, ep: any) => acc + (ep.durationSec || 0), 0),
      },
      user?.id,
      api,
    );
    setIsSavedLocally(res.isSaved);
    if (user) {
      favoriteMutation.mutate();
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Flatten all episodes across seasons
  const allEpisodes = story?.seasons
    ? story.seasons.flatMap((s: any) => s.episodes || [])
    : seasons.flatMap((s: any) => s.episodes || []);

  const firstEpisode = allEpisodes[0];
  const isCurrentStoryPlaying = !!story && currentEpisode?.seriesId === story.id && isPlaying;

  if (storyLoading && !catalogBook) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-72 rounded-3xl bg-emerald-100/40 dark:bg-emerald-900/20" />
        <div className="h-48 rounded-3xl bg-emerald-100/40 dark:bg-emerald-900/20" />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="py-20 px-4 text-center max-w-md mx-auto space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-600 mx-auto" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          கதை கண்டறியப்படவில்லை
        </h2>
        <p className="text-xs text-zinc-500">
          {(error as any)?.message || 'கோரப்பட்ட கதை கிடைக்கவில்லை அல்லது நீக்கப்பட்டுள்ளது.'}
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => refetch()}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-semibold text-sm hover:bg-emerald-600"
          >
            மீண்டும் முயற்சி செய்
          </button>
          <Link
            to="/categories"
            className="px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            கதைகளை உலாவு
          </Link>
        </div>
      </div>
    );
  }

  const coverUrl = story.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Story Hero Header (Text-First Clean Layout) */}
      <div className="bg-white dark:bg-[#14231E] p-6 sm:p-10 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-6">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#064E3B] text-[#A7F3D0] text-xs font-bold shadow-sm">
            100% இலவசம்
          </span>
          {story.category?.name && (
            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              {story.category.name}
            </span>
          )}
          <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-semibold">
            {story.language?.nativeName || story.language?.name || 'தமிழ்'}
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
            <Star className="h-3.5 w-3.5 fill-current" />
            4.9
          </span>
        </div>

        {/* Story Metadata */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif leading-tight">
            {story.title}
          </h1>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-zinc-600 dark:text-zinc-300">
            {story.authorName && (
              <div>
                <span className="text-zinc-400">எழுத்தாளர்:</span>{' '}
                <strong className="text-zinc-900 dark:text-zinc-100 font-serif">{story.authorName}</strong>
              </div>
            )}
            {story.narratorName && (
              <div>
                <span className="text-zinc-400">குரல்:</span>{' '}
                <strong className="text-zinc-900 dark:text-zinc-100 font-serif">{story.narratorName}</strong>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1 font-semibold">
              <Headphones className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              {allEpisodes.length} அத்தியாயங்கள்
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              {Math.round(allEpisodes.reduce((acc: number, ep: any) => acc + (ep.durationSec || 0), 0) / 60)} நிமிடங்கள்
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {firstEpisode && (
              <button
                onClick={() => {
                  if (isCurrentStoryPlaying) {
                    pause();
                  } else {
                    const storyQueue: PlayingTrack[] = allEpisodes.map((ep: any) => ({
                      id: ep.id,
                      episodeId: ep.id,
                      title: ep.title,
                      seriesId: story.id,
                      seriesTitle: story.title,
                      coverImage: story.coverImage,
                      coverImageUrl: story.coverImage,
                      narratorName: story.narratorName || undefined,
                      durationSec: ep.durationSec,
                      audioUrl: ep.audioUrl,
                    }));
                    playEpisode(
                      {
                        episodeId: firstEpisode.id,
                        title: firstEpisode.title,
                        seriesId: story.id,
                        seriesTitle: story.title,
                        coverImage: story.coverImage,
                        narratorName: story.narratorName || undefined,
                        durationSec: firstEpisode.durationSec,
                        audioUrl: firstEpisode.audioUrl,
                      },
                      story.id,
                      storyQueue,
                      0,
                    );
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-6 py-3.5 text-base shadow-lg shadow-emerald-900/20 transition-all hover:scale-105"
              >
                {isCurrentStoryPlaying ? (
                  <>
                    <Pause className="h-5 w-5 fill-current" />
                    <span>நிறுத்து (Pause)</span>
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 fill-current" />
                    <span>முதல் அத்தியாயம் கேள் (Play Ep 1)</span>
                  </>
                )}
              </button>
            )}

            {/* Save to My Library Button */}
            <button
              onClick={handleToggleLibrary}
              aria-label={isSaved ? 'Remove from My Library' : 'Save to My Library'}
              title={isSaved ? 'சேமிக்கப்பட்டது (Saved to My Library)' : 'நூலகத்தில் சேமி (Save to My Library)'}
              className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border font-bold text-sm transition-all shadow-sm active:scale-95 ${
                isSaved
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                  : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current text-emerald-600 dark:text-emerald-400' : ''}`} />
              <span>{isSaved ? 'சேமிக்கப்பட்டது (Saved)' : 'நூலகத்தில் சேமி (Save)'}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 transition-colors"
              title="பகிர்க"
            >
              {copied ? <Check className="h-5 w-5 text-emerald-600" /> : <Share2 className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Story Synopsis */}
      <div className="bg-white dark:bg-[#14231E] p-6 sm:p-8 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-serif">
          கதைச் சுருக்கம் (About This Story)
        </h2>
        <p className="text-zinc-700 dark:text-zinc-300 text-base leading-relaxed">
          {story.fullDescription || story.shortDescription || 'தமிழ் ஆடியோ கதை அனுபவம்.'}
        </p>

        {story.tags && story.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {story.tags.map((tag: string) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Episodes List */}
      <div className="bg-white dark:bg-[#14231E] p-6 sm:p-8 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-serif">
            அத்தியாயங்கள் ({allEpisodes.length} Episodes)
          </h2>
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full">
            அனைத்தும் இலவசம் (All Free)
          </span>
        </div>

        <div className="divide-y divide-emerald-50 dark:divide-emerald-900/30">
          {allEpisodes.map((ep: any, epIndex: number) => {
            const isThisEpisodePlaying = (currentEpisode?.episodeId === ep.id || currentEpisode?.id === ep.id) && isPlaying;

            return (
              <div
                key={ep.id}
                className="py-4 flex items-center justify-between gap-4 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 px-3 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      if (isThisEpisodePlaying) {
                        pause();
                      } else {
                        const storyQueue: PlayingTrack[] = allEpisodes.map((item: any) => ({
                          id: item.id,
                          episodeId: item.id,
                          title: item.title,
                          seriesId: story.id,
                          seriesTitle: story.title,
                          coverImage: story.coverImage,
                          coverImageUrl: story.coverImage,
                          narratorName: story.narratorName || undefined,
                          durationSec: item.durationSec,
                          audioUrl: item.audioUrl,
                        }));
                        playEpisode(
                          {
                            episodeId: ep.id,
                            title: ep.title,
                            seriesId: story.id,
                            seriesTitle: story.title,
                            coverImage: story.coverImage,
                            narratorName: story.narratorName || undefined,
                            durationSec: ep.durationSec,
                            audioUrl: ep.audioUrl,
                          },
                          story.id,
                          storyQueue,
                          epIndex,
                        );
                      }
                    }}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white hover:bg-emerald-600 transition-colors shadow-sm"
                  >
                    {isThisEpisodePlaying ? (
                      <Pause className="h-5 w-5 fill-current" />
                    ) : (
                      <Play className="h-5 w-5 fill-current ml-0.5" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        பகுதி {ep.episodeNumber}
                      </span>
                    </div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                      {ep.title}
                    </h3>
                    {ep.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                        {ep.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-zinc-400 shrink-0">
                  <span>{Math.round((ep.durationSec || 60) / 60)} நிமி</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
