import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Clock,
  ArrowLeft,
  Headphones,
  Sparkles,
  Share2,
  Bookmark,
  Leaf,
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
    playEpisode,
    play,
    pause,
    seek,
    setRate,
    setSleepTimer,
    setPlayerVolume,
    toggleMute,
  } = usePlayer();

  // If no track is currently playing, initialize with "The Clever Crow" demo track
  useEffect(() => {
    if (!currentEpisode) {
      playEpisode({
        episodeId: 'ep-clever-crow',
        title: 'காக்கையின் தாகம் (The Clever Crow)',
        seriesTitle: 'பஞ்சதந்திரக் கதைகள் (Panchatantra Tales)',
        coverImageUrl: '/images/story-clever-crow.jpg',
        narratorName: 'கதைசொல்லி Studio',
        durationSec: 360,
      });
    }
  }, [currentEpisode, playEpisode]);

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

  const activeTrack = currentEpisode || {
    title: 'காக்கையின் தாகம் (The Clever Crow)',
    seriesTitle: 'பஞ்சதந்திரக் கதைகள் (Panchatantra)',
    coverImageUrl: '/images/story-clever-crow.jpg',
    narratorName: 'கதைசொல்லி ஸ்டுடியோ',
    durationSec: 360,
  };

  const effectiveDuration = duration > 0 ? duration : activeTrack.durationSec || 360;
  const progressPercent = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-10 px-4 sm:px-6 max-w-2xl mx-auto space-y-8 bg-[#F8F5E9] dark:bg-[#033B2B] text-[#173D2E] dark:text-[#F8F5E9] transition-colors">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-full bg-white dark:bg-[#083325] border border-[#D5CEBA] dark:border-[#124835] text-[#173D2E] dark:text-stone-200 hover:scale-105 transition-all shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E8F0E2] dark:bg-[#083325] text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0] uppercase tracking-wider">
            <Leaf className="w-3.5 h-3.5 fill-current" />
            <span>100% Free Tamil Audio</span>
          </div>
          <h4 className="text-xs font-medium text-stone-500 dark:text-stone-400 mt-1">
            {activeTrack.seriesTitle || 'Kathaisolli'}
          </h4>
        </div>
        <button
          onClick={() => alert('பகிர்வதற்கான இணைப்பு நகலெடுக்கப்பட்டது (Share link copied)!')}
          className="p-2.5 rounded-full bg-white dark:bg-[#083325] border border-[#D5CEBA] dark:border-[#124835] text-[#173D2E] dark:text-stone-200 hover:scale-105 transition-all shadow-sm"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      {/* Main Storybook Album Artwork */}
      <div className="relative aspect-square max-w-sm mx-auto w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-[#124835] group">
        <img
          src={activeTrack.coverImageUrl || '/images/story-clever-crow.jpg'}
          alt={activeTrack.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
      </div>

      {/* Title & Metadata */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl sm:text-3xl font-black font-serif text-[#064E3B] dark:text-[#F8F5E9] tracking-tight">
          {activeTrack.title}
        </h2>
        <p className="text-sm font-semibold font-tamil text-[#166534] dark:text-[#A7F3D0]">
          {activeTrack.narratorName ? `குரல்: ${activeTrack.narratorName}` : 'Kathaisolli Production'}
        </p>
      </div>

      {/* Progress Bar & Timestamps */}
      <div className="space-y-2">
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={effectiveDuration}
            step={1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-[#E3DCBA] dark:bg-[#124835] rounded-lg appearance-none cursor-pointer accent-[#064E3B] dark:accent-[#A7F3D0]"
          />
        </div>
        <div className="flex justify-between text-xs font-mono font-medium text-stone-500 dark:text-stone-400">
          <span>{formatTamilDuration(Math.floor(currentTime))}</span>
          <span>{formatTamilDuration(Math.floor(effectiveDuration))}</span>
        </div>
      </div>

      {/* Main Playback Controls */}
      <div className="flex items-center justify-center gap-6 sm:gap-8">
        <button
          onClick={cycleRate}
          className="p-2.5 rounded-full text-xs font-bold font-mono bg-white dark:bg-[#083325] border border-[#D5CEBA] dark:border-[#124835] text-[#064E3B] dark:text-[#A7F3D0] hover:scale-105 transition-all w-11 h-11 flex items-center justify-center"
          title="Playback Speed"
        >
          {playbackRate}x
        </button>

        <button
          onClick={() => seek(Math.max(0, currentTime - 10))}
          className="p-3 rounded-full hover:bg-[#E8F0E2] dark:hover:bg-[#083325] text-[#064E3B] dark:text-[#A7F3D0] transition-colors"
          title="Rewind 10 seconds"
        >
          <RotateCcw className="h-6 w-6" />
        </button>

        <button
          onClick={isPlaying ? pause : play}
          className="h-16 w-16 rounded-full bg-[#064E3B] hover:bg-[#166534] text-white flex items-center justify-center shadow-xl shadow-emerald-950/30 hover:scale-105 transition-all"
        >
          {isPlaying ? (
            <Pause className="h-8 w-8 fill-current" />
          ) : (
            <Play className="h-8 w-8 fill-current ml-1" />
          )}
        </button>

        <button
          onClick={() => seek(Math.min(effectiveDuration, currentTime + 10))}
          className="p-3 rounded-full hover:bg-[#E8F0E2] dark:hover:bg-[#083325] text-[#064E3B] dark:text-[#A7F3D0] transition-colors"
          title="Forward 10 seconds"
        >
          <RotateCw className="h-6 w-6" />
        </button>

        <button
          onClick={cycleSleepTimer}
          className={`p-2.5 rounded-full w-11 h-11 flex items-center justify-center border transition-all ${
            sleepTimerMinutes
              ? 'bg-[#064E3B] text-white border-[#064E3B]'
              : 'bg-white dark:bg-[#083325] border-[#D5CEBA] dark:border-[#124835] text-[#064E3B] dark:text-[#A7F3D0]'
          }`}
          title="Sleep Timer"
        >
          <Clock className="h-4 w-4" />
        </button>
      </div>

      {/* Volume and Extras */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E3DCBA] dark:border-[#124835]">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className="p-2 rounded-lg text-stone-500 hover:text-[#064E3B] dark:hover:text-[#A7F3D0]"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-5 w-5 text-rose-500" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-24 h-1.5 bg-[#E3DCBA] dark:bg-[#124835] rounded-lg appearance-none cursor-pointer accent-[#064E3B] dark:accent-[#A7F3D0]"
          />
        </div>

        <button
          onClick={() => alert('நூலகத்தில் சேமிக்கப்பட்டது (Saved to Library)!')}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#083325] border border-[#D5CEBA] dark:border-[#124835] text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0] hover:scale-105 transition-all"
        >
          <Bookmark className="w-4 h-4" />
          <span>Save to Library</span>
        </button>
      </div>
    </div>
  );
};
