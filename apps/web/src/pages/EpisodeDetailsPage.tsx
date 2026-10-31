import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, Pause, Headphones, Clock, ArrowLeft, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';

export const EpisodeDetailsPage: React.FC = () => {
  const { episodeId } = useParams<{ episodeId: string }>();
  const { api } = useAuth();
  const { currentEpisode, isPlaying, playEpisode, pause } = usePlayer();
  const navigate = useNavigate();

  const {
    data: authData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['playback', 'episode', episodeId],
    queryFn: () => api.playback.authorize(episodeId || ''),
    enabled: !!episodeId,
  });

  const isThisEpisodePlaying = (currentEpisode?.episodeId === episodeId || currentEpisode?.id === episodeId) && isPlaying;

  if (isLoading) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-emerald-100/50 dark:bg-emerald-900/30 rounded" />
        <div className="h-64 rounded-3xl bg-emerald-100/40 dark:bg-emerald-900/20" />
      </div>
    );
  }

  if (isError || !authData) {
    return (
      <div className="py-20 px-4 text-center max-w-md mx-auto space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-600 mx-auto" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          அத்தியாயம் கண்டறியப்படவில்லை
        </h2>
        <p className="text-xs text-zinc-500">
          {(error as any)?.message || 'கோரப்பட்ட அத்தியாய ஆடியோ கிடைக்கவில்லை.'}
        </p>
        <button
          onClick={() => navigate('/explore')}
          className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-semibold text-sm hover:bg-emerald-600"
        >
          கதைகளை உலாவு
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>முந்தைய பக்கத்திற்குத் திரும்பு</span>
      </button>

      {/* Episode Header */}
      <div className="bg-white dark:bg-[#14231E] p-6 sm:p-8 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-32 h-32 rounded-2xl bg-emerald-950 flex items-center justify-center text-white shrink-0 shadow-md">
            <Headphones className="h-12 w-12 text-emerald-400" />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              100% இலவச ஆடியோ • கதைசொல்லி
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
              {authData.title}
            </h1>

            <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-zinc-400 pt-1">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-emerald-600" />
                {Math.round((authData.durationSec || 60) / 60)} நிமிடங்கள்
              </span>
            </div>
          </div>
        </div>

        {/* Play control banner */}
        <div className="pt-4 border-t border-emerald-50 dark:border-emerald-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => {
              if (isThisEpisodePlaying) {
                pause();
              } else {
                playEpisode(
                  {
                    episodeId: authData.episodeId,
                    title: authData.title,
                    durationSec: authData.durationSec,
                  }
                );
              }
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-8 py-3.5 shadow-md transition-all hover:scale-105"
          >
            {isThisEpisodePlaying ? (
              <>
                <Pause className="h-5 w-5 fill-current" />
                <span>நிறுத்து (Pause)</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5 fill-current" />
                <span>இப்போதே கேள் (Play Now)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
