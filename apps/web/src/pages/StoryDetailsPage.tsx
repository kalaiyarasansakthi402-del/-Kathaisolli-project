import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause, Heart, Share2, Clock, Headphones, Star, AlertCircle, RefreshCw, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';

export const StoryDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, api } = useAuth();
  const { currentEpisode, isPlaying, playEpisode, pause } = usePlayer();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  // Fetch series details
  const {
    data: story,
    isLoading: storyLoading,
    isError: storyError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['catalog', 'series', slug],
    queryFn: () => api.catalog.getSeries(slug || ''),
    enabled: !!slug,
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

  const isFavorited = !!story && favorites.some((f: any) => f.seriesId === story.id || f.id === story.id);

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

  if (storyLoading) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-72 rounded-3xl bg-emerald-100/40 dark:bg-emerald-900/20" />
        <div className="h-48 rounded-3xl bg-emerald-100/40 dark:bg-emerald-900/20" />
      </div>
    );
  }

  if (storyError || !story) {
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
            to="/explore"
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
      {/* Story Hero Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start bg-white dark:bg-[#14231E] p-6 sm:p-8 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm">
        {/* Cover Image */}
        <div className="w-full sm:w-64 md:w-72 shrink-0 aspect-square rounded-2xl overflow-hidden shadow-xl bg-emerald-950 relative">
          <img
            src={coverUrl}
            alt={story.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 bg-emerald-700/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md">
            100% இலவசம்
          </div>
        </div>

        {/* Story Metadata */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {story.category?.name && (
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                {story.category.name}
              </span>
            )}
            <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs">
              {story.language?.nativeName || story.language?.name || 'தமிழ்'}
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
              <Star className="h-3.5 w-3.5 fill-current" />
              4.9
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif leading-tight">
            {story.title}
          </h1>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-zinc-600 dark:text-zinc-300">
            {story.authorName && (
              <div>
                <span className="text-zinc-400">எழுத்தாளர்:</span>{' '}
                <strong className="text-zinc-900 dark:text-zinc-100">{story.authorName}</strong>
              </div>
            )}
            {story.narratorName && (
              <div>
                <span className="text-zinc-400">குரல்:</span>{' '}
                <strong className="text-zinc-900 dark:text-zinc-100">{story.narratorName}</strong>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <Headphones className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              {allEpisodes.length} அத்தியாயங்கள்
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              {Math.round(allEpisodes.reduce((acc: number, ep: any) => acc + (ep.durationSec || 0), 0) / 60)} நிமிடங்கள்
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            {firstEpisode && (
              <button
                onClick={() => {
                  if (isCurrentStoryPlaying) {
                    pause();
                  } else {
                    playEpisode(
                      {
                        episodeId: firstEpisode.id,
                        title: firstEpisode.title,
                        seriesId: story.id,
                        seriesTitle: story.title,
                        coverImage: story.coverImage,
                        narratorName: story.narratorName || undefined,
                        durationSec: firstEpisode.durationSec,
                      },
                      story.id
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

            {/* Favorite Button */}
            {user && (
              <button
                onClick={() => favoriteMutation.mutate()}
                aria-label="Add to favorites"
                className={`p-3.5 rounded-xl border transition-colors ${
                  isFavorited
                    ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100'
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            )}

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
          {allEpisodes.map((ep: any) => {
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
                        playEpisode(
                          {
                            episodeId: ep.id,
                            title: ep.title,
                            seriesId: story.id,
                            seriesTitle: story.title,
                            coverImage: story.coverImage,
                            narratorName: story.narratorName || undefined,
                            durationSec: ep.durationSec,
                          },
                          story.id
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
