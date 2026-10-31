import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Moon,
  Clock,
  ArrowLeft,
  Headphones,
  Sparkles,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatTamilDuration } from '@kathaisolli/shared-utils';

export const FullPlayerPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    sleepTimerMinutes,
    volume,
    isMuted,
    play,
    pause,
    seek,
    setRate,
    setSleepTimer,
    setPlayerVolume,
    toggleMute,
  } = usePlayer();

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerVolume(parseFloat(e.target.value));
  };

  const cycleRate = () => {
    const rates = [0.75, 1.0, 1.25, 1.5, 2.0];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    setRate(rates[nextIdx]);
  };

  const cycleSleepTimer = () => {
    const timers = [null, 15, 30, 45, 60];
    const nextIdx = (timers.indexOf(sleepTimerMinutes) + 1) % timers.length;
    setSleepTimer(timers[nextIdx]);
  };

  if (!currentEpisode) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4 space-y-4">
        <Headphones className="h-16 w-16 text-emerald-600 mx-auto" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          ஆடியோ எதுவும் இயக்கப்படவில்லை
        </h2>
        <p className="text-sm text-zinc-500">
          கேட்க விரும்பும் கதையை தேர்ந்தெடுங்கள்.
        </p>
        <button
          onClick={() => navigate('/explore')}
          className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-700 text-white font-semibold text-sm hover:bg-emerald-600"
        >
          கதைகளை உலாவுங்கள்
        </button>
      </div>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-10 px-4 sm:px-6 max-w-2xl mx-auto space-y-8">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="text-center">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            100% இலவச தமிழ் ஆடியோ
          </span>
          <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {currentEpisode.seriesTitle || 'கதைசொல்லி'}
          </h4>
        </div>
        <div className="w-10" />
      </div>

      {/* Album Artwork */}
      <div className="aspect-square max-w-sm mx-auto w-full rounded-3xl overflow-hidden shadow-2xl bg-emerald-950 relative border-4 border-emerald-900/30">
        <img
          src={
            currentEpisode.coverImage ||
            currentEpisode.coverImageUrl ||
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
          }
          alt={currentEpisode.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-emerald-700/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md">
          இலவசம்
        </div>
      </div>

      {/* Title & Narrator */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
          {currentEpisode.title}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          குரல்: {currentEpisode.narratorName || 'கதைசொல்லி கலைஞர்'}
        </p>
      </div>

      {/* Progress Bar & Timestamps */}
      <div className="space-y-2">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 rounded-lg bg-zinc-200 dark:bg-emerald-950 accent-emerald-600 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-zinc-400">
          <span>{formatTamilDuration(currentTime)}</span>
          <span>{formatTamilDuration(duration)}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={() => seek(currentTime - 10)}
          className="p-3 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          title="10 வினாடிகள் பின்செல்"
        >
          <RotateCcw className="h-6 w-6" />
        </button>

        <button
          onClick={isPlaying ? pause : play}
          className="h-16 w-16 rounded-full bg-emerald-700 text-white flex items-center justify-center hover:bg-emerald-600 transition-transform active:scale-95 shadow-xl shadow-emerald-900/30"
        >
          {isPlaying ? (
            <Pause className="h-8 w-8 fill-current" />
          ) : (
            <Play className="h-8 w-8 fill-current ml-1" />
          )}
        </button>

        <button
          onClick={() => seek(currentTime + 10)}
          className="p-3 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          title="10 வினாடிகள் முன்செல்"
        >
          <RotateCw className="h-6 w-6" />
        </button>
      </div>

      {/* Auxiliary Settings: Speed & Sleep Timer & Volume */}
      <div className="flex items-center justify-around pt-4 border-t border-emerald-100 dark:border-emerald-900/30 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
        {/* Playback Speed */}
        <button
          onClick={cycleRate}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-emerald-950/40 hover:bg-zinc-200 transition-colors"
        >
          <Clock className="h-4 w-4 text-emerald-600" />
          <span>வேகம்: {playbackRate}x</span>
        </button>

        {/* Sleep Timer */}
        <button
          onClick={cycleSleepTimer}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-emerald-950/40 hover:bg-zinc-200 transition-colors"
        >
          <Moon className="h-4 w-4 text-emerald-600" />
          <span>{sleepTimerMinutes ? `${sleepTimerMinutes} நிமி` : 'தூக்க டைமர்'}</span>
        </button>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="text-zinc-500">
            {isMuted ? <VolumeX className="h-4 w-4 text-rose-500" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 h-1.5 rounded-lg bg-zinc-200 dark:bg-emerald-950 accent-emerald-600 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
