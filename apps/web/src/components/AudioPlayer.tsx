import React, { useState } from 'react';
import {
  ChevronDown,
  Clock,
  FastForward,
  Gauge,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
} from 'lucide-react';
import { formatDuration } from '@kathaisolli/shared-utils';
import { usePlayer } from '../context/PlayerContext';

export const AudioPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    playbackError,
    currentTime,
    duration,
    playbackRate,
    sleepTimer,
    isFullPlayerOpen,
    togglePlay,
    seek,
    skipForward,
    skipBackward,
    setSpeed,
    setSleepTimerMinutes,
    openFullPlayer,
    closeFullPlayer,
    clearError,
  } = usePlayer();

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* Mini Player (Bottom Dock) */}
      {!isFullPlayerOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#182620]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#23382F] shadow-2xl transition-all">
          {playbackError && (
            <div className="bg-amber-600 text-white text-xs px-4 py-1.5 flex items-center justify-between font-tamil shadow-inner">
              <span className="truncate">{playbackError}</span>
              <button onClick={clearError} className="ml-2 font-bold px-1.5 hover:bg-black/20 rounded">✕</button>
            </div>
          )}
          {/* Top Progress bar */}
          <div
            className="w-full h-1 bg-slate-200 dark:bg-slate-800 cursor-pointer relative group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              seek(pct * duration);
            }}
          >
            <div
              className="h-full bg-[#10B981] relative transition-all"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-[#10B981] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
            {/* Track Info */}
            <div
              className="flex items-center gap-3 min-w-0 cursor-pointer"
              onClick={openFullPlayer}
            >
              <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 flex-shrink-0 shadow-sm">
                {currentTrack.coverImage ? (
                  <img
                    src={currentTrack.coverImage}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#064E3B] to-[#10B981] text-white text-xs font-bold font-tamil">
                    கதை
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate font-tamil text-slate-900 dark:text-slate-100">
                  {currentTrack.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {currentTrack.seriesTitle || 'கதைசொல்லி தமிழ் ஆடியோ'}
                </p>
              </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => skipBackward(10)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-[#10B981] transition-colors"
                title="10 விநாடிகள் பின்னே"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-[#064E3B] dark:bg-[#10B981] text-white dark:text-[#022C22] flex items-center justify-center hover:scale-105 transition-transform shadow-md"
              >
                {isBuffering ? (
                  <div className="w-4 h-4 border-2 border-white dark:border-[#022C22] border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>
              <button
                onClick={() => skipForward(10)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-[#10B981] transition-colors"
                title="10 விநாடிகள் முன்னே"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {/* Right Meta & Maximize */}
            <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
              <span className="font-mono">
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </span>
              <button
                onClick={openFullPlayer}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300"
                title="முழுமையான பிளேயர்"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Player Modal */}
      {isFullPlayerOpen && (
        <div className="fixed inset-0 z-50 bg-[#F8FAF7] dark:bg-[#101A16] flex flex-col justify-between p-6 sm:p-10 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={closeFullPlayer}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-[#182620] text-slate-600 dark:text-slate-300"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
            <div className="text-center">
              <span className="text-xs uppercase font-bold tracking-widest text-[#10B981]">
                இப்போது ஒலிக்கிறது (NOW PLAYING)
              </span>
              <p className="text-sm font-semibold truncate max-w-xs sm:max-w-md">
                {currentTrack.seriesTitle || 'கதைசொல்லி'}
              </p>
            </div>
            <div className="w-8" />
          </div>

          {/* Center Art */}
          <div className="flex-1 flex flex-col items-center justify-center my-6">
            <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-2xl overflow-hidden shadow-2xl bg-slate-200 dark:bg-slate-800 border-2 border-emerald-900/10">
              {currentTrack.coverImage ? (
                <img
                  src={currentTrack.coverImage}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#064E3B] to-[#10B981] text-white text-3xl font-bold font-tamil">
                  கதைசொல்லி
                </div>
              )}
            </div>
            <div className="mt-8 text-center max-w-lg px-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-tamil tracking-tight text-slate-900 dark:text-white">
                {currentTrack.title}
              </h2>
              <p className="text-base text-slate-500 dark:text-slate-400 mt-2 font-tamil">
                {currentTrack.seriesTitle}
              </p>
            </div>
          </div>

          {/* Controls & Scrubber */}
          <div className="max-w-xl mx-auto w-full space-y-4">
            {/* Scrubber */}
            <div>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#10B981]"
              />
              <div className="flex justify-between text-xs font-mono text-slate-500 mt-1">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Playback Buttons */}
            <div className="flex items-center justify-center gap-6 sm:gap-10">
              <button
                onClick={() => skipBackward(10)}
                className="p-3 text-slate-600 dark:text-slate-300 hover:text-[#10B981] transition-colors"
                title="-10s"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-[#064E3B] dark:bg-[#10B981] text-white dark:text-[#022C22] flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
              >
                {isBuffering ? (
                  <div className="w-6 h-6 border-3 border-white dark:border-[#022C22] border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 ml-1" />
                )}
              </button>
              <button
                onClick={() => skipForward(10)}
                className="p-3 text-slate-600 dark:text-slate-300 hover:text-[#10B981] transition-colors"
                title="+10s"
              >
                <RotateCw className="w-6 h-6" />
              </button>
            </div>

            {/* Extra Options: Speed & Sleep Timer */}
            <div className="flex items-center justify-around pt-4 border-t border-slate-200 dark:border-[#23382F] text-xs">
              {/* Speed selector */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#182620] hover:bg-slate-200 font-semibold"
                >
                  <Gauge className="w-4 h-4 text-[#10B981]" />
                  <span>{playbackRate}x வேகம்</span>
                </button>
                {showSpeedMenu && (
                  <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-[#182620] border border-slate-200 dark:border-[#23382F] rounded-xl shadow-xl p-1 z-50 flex flex-col gap-1">
                    {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => {
                          setSpeed(rate);
                          setShowSpeedMenu(false);
                        }}
                        className={`px-4 py-1.5 rounded-lg text-left text-xs ${
                          playbackRate === rate
                            ? 'bg-[#064E3B] text-[#A7F3D0]'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sleep timer */}
              <div className="relative">
                <button
                  onClick={() => setShowTimerMenu(!showTimerMenu)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#182620] hover:bg-slate-200 font-semibold"
                >
                  <Clock className="w-4 h-4 text-[#10B981]" />
                  <span>
                    {sleepTimer ? `${sleepTimer} நிமிடம்` : 'ஸ்லீப் டைமர்'}
                  </span>
                </button>
                {showTimerMenu && (
                  <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-[#182620] border border-slate-200 dark:border-[#23382F] rounded-xl shadow-xl p-1 z-50 flex flex-col gap-1 w-36">
                    <button
                      onClick={() => {
                        setSleepTimerMinutes(null);
                        setShowTimerMenu(false);
                      }}
                      className="px-3 py-1.5 rounded-lg text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      அணை (Off)
                    </button>
                    {[15, 30, 45, 60].map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          setSleepTimerMinutes(m);
                          setShowTimerMenu(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-left text-xs ${
                          sleepTimer === m
                            ? 'bg-[#064E3B] text-[#A7F3D0]'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {m} நிமிடங்கள்
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
