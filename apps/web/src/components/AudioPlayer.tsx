import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Volume2,
  VolumeX,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Clock,
  Gauge,
  RotateCcw,
  RotateCw,
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
    isPlayerCollapsed,
    volume,
    isMuted,
    togglePlay,
    seek,
    skipForward,
    skipBackward,
    setSpeed,
    setPlayerVolume,
    toggleMute,
    setSleepTimerMinutes,
    openFullPlayer,
    closeFullPlayer,
    toggleCollapse,
    clearError,
    // Queue & Audio Navigation Controls
    playNext,
    playPrevious,
    toggleRepeat,
    repeatMode,
    isShuffle,
    toggleShuffle,
  } = usePlayer();

  const navigate = useNavigate();
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);

  if (!currentTrack) return null;

  const validDuration = isFinite(duration) && duration > 0 ? duration : (currentTrack.durationSec || 0);
  const progressPercent = validDuration > 0 ? Math.min(100, Math.max(0, (currentTime / validDuration) * 100)) : 0;

  const handleOpenPlayer = () => {
    navigate('/player');
  };

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0, 0.75];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setSpeed(nextSpeed);
  };

  return (
    <>
      {/* Collapsed Compact Mini Bar */}
      {!isFullPlayerOpen && isPlayerCollapsed && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#073224]/95 backdrop-blur-md text-white border-t border-[#0F4738] shadow-2xl transition-all">
          {/* Progress bar line along top edge */}
          <div className="w-full h-1 bg-[#144738]">
            <div
              className="h-full bg-[#10B981] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-3">
            {/* Left: Thumbnail & Title */}
            <div
              className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
              onClick={toggleCollapse}
              title="பிளேயரை விரிவாக்கு (Click to expand)"
            >
              <div className="w-8 h-8 rounded overflow-hidden bg-[#0A261D] flex-shrink-0 border border-[#145642]">
                <img
                  src={currentTrack.coverImageUrl || currentTrack.coverImage || '/images/temple-sunset.jpg'}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/temple-sunset.jpg';
                  }}
                />
              </div>
              <div className="min-w-0 flex items-center gap-2">
                <span className="text-xs font-semibold truncate font-tamil text-white group-hover:text-[#A7F3D0]">
                  {currentTrack.title}
                </span>
                <span className="hidden sm:inline text-[11px] font-mono text-[#86EFAC]/70">
                  {formatDuration(currentTime)} / {formatDuration(validDuration)}
                </span>
              </div>
            </div>

            {/* Right: Quick Controls & Expand Button */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-[#A7F3D0] hover:bg-[#6EE7B7] text-[#064E3B] flex items-center justify-center shadow transition-transform hover:scale-105 active:scale-95"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isBuffering ? (
                  <div className="w-3.5 h-3.5 border-2 border-[#064E3B] border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={toggleCollapse}
                className="p-1.5 rounded-full text-[#86EFAC] hover:text-white hover:bg-white/10 transition-colors"
                title="பிளேயரை விரிவாக்கு (Expand player)"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mini Player (Fixed Bottom Dock matching reference screenshot) */}
      {!isFullPlayerOpen && !isPlayerCollapsed && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#073224] text-white border-t border-[#0F4738] shadow-2xl transition-all">
          {playbackError && (
            <div className="bg-amber-600 text-white text-xs px-4 py-1.5 flex items-center justify-between font-tamil shadow-inner">
              <span className="truncate">{playbackError}</span>
              <button onClick={clearError} className="ml-2 font-bold px-1.5 hover:bg-black/20 rounded">✕</button>
            </div>
          )}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
            {/* Left: Book Cover & Metadata */}
            <div
              className="flex items-center gap-3 min-w-0 cursor-pointer flex-shrink-0 max-w-[280px] lg:max-w-xs group"
              onClick={handleOpenPlayer}
              title="Click to expand player"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#0A261D] flex-shrink-0 shadow-md border border-[#145642] group-hover:scale-105 transition-transform">
                {currentTrack.coverImage || currentTrack.coverImageUrl ? (
                  <img
                    src={currentTrack.coverImageUrl || currentTrack.coverImage || '/images/temple-sunset.jpg'}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/temple-sunset.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#064E3B] to-[#10B981] text-white text-xs font-bold font-tamil">
                    கதை
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate font-tamil text-white group-hover:text-[#A7F3D0] transition-colors">
                  {currentTrack.title}
                </p>
                <p className="text-xs text-[#86EFAC]/80 truncate font-tamil">
                  {currentTrack.seriesTitle || currentTrack.narratorName || 'பாக்கியம் ராமசாமி'}
                </p>
              </div>
            </div>

            {/* Center: Playback Controls & Scrubber (Matching Screenshot) */}
            <div className="flex-1 max-w-xl flex flex-col items-center justify-center gap-1.5">
              {/* Controls Top Row */}
              <div className="flex items-center gap-3.5 sm:gap-4 lg:gap-5">
                {/* 1. Shuffle Button */}
                <button
                  onClick={toggleShuffle}
                  className={`p-1.5 rounded-full transition-colors ${
                    isShuffle ? 'text-[#A7F3D0]' : 'text-[#86EFAC]/60 hover:text-white'
                  }`}
                  title={isShuffle ? 'குழப்பல் ஆன் (Shuffle On)' : 'குழப்பல் ஆஃப் (Shuffle Off)'}
                  aria-label="Shuffle"
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                {/* 2. Previous Audio / Chapter Button */}
                <button
                  onClick={playPrevious}
                  className="p-1.5 text-white hover:text-[#A7F3D0] transition-colors active:scale-95"
                  title="முந்தைய ஆடியோ (Previous Audio)"
                  aria-label="Previous Audio"
                >
                  <SkipBack className="w-4 h-4 fill-current" />
                </button>

                {/* 3. Rewind 10 Seconds Button */}
                <button
                  onClick={() => skipBackward(10)}
                  className="p-1.5 text-stone-300 hover:text-white transition-colors active:scale-95"
                  title="10 விநாடிகள் பின்னே (Rewind 10s)"
                  aria-label="Rewind 10s"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* 4. Circular Mint Play/Pause Button */}
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-[#A7F3D0] hover:bg-[#6EE7B7] text-[#064E3B] flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 flex-shrink-0"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isBuffering ? (
                    <div className="w-4 h-4 border-2 border-[#064E3B] border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                {/* 5. Forward 10 Seconds Button */}
                <button
                  onClick={() => skipForward(10)}
                  className="p-1.5 text-stone-300 hover:text-white transition-colors active:scale-95"
                  title="10 விநாடிகள் முன்னே (Forward 10s)"
                  aria-label="Forward 10s"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                {/* 6. Next Audio / Chapter Button */}
                <button
                  onClick={playNext}
                  className="p-1.5 text-white hover:text-[#A7F3D0] transition-colors active:scale-95"
                  title="அடுத்த ஆடியோ (Next Audio)"
                  aria-label="Next Audio"
                >
                  <SkipForward className="w-4 h-4 fill-current" />
                </button>

                {/* 7. Repeat Toggle Button */}
                <button
                  onClick={toggleRepeat}
                  className={`p-1.5 rounded-full transition-colors relative ${
                    repeatMode !== 'off' ? 'text-[#A7F3D0]' : 'text-[#86EFAC]/60 hover:text-white'
                  }`}
                  title={
                    repeatMode === 'one'
                      ? 'தற்போதைய ஆடியோவை மீண்டும் இயக்கு (Repeat One)'
                      : repeatMode === 'all'
                      ? 'அனைத்து ஆடியோக்களையும் மீண்டும் இயக்கு (Repeat All)'
                      : 'மீண்டும் இயக்கு ஆஃப் (Repeat Off)'
                  }
                  aria-label="Repeat"
                >
                  <Repeat className="w-4 h-4" />
                  {repeatMode === 'one' && (
                    <span className="absolute -top-1 -right-1 text-[8px] font-black bg-[#10B981] text-[#073224] rounded-full w-3 h-3 flex items-center justify-center">
                      1
                    </span>
                  )}
                </button>
              </div>

              {/* Scrubber Bottom Row */}
              <div className="w-full flex items-center gap-3">
                <span className="text-[11px] font-mono text-[#86EFAC]/70 w-9 text-right flex-shrink-0">
                  {formatDuration(currentTime)}
                </span>

                <div
                  className="relative flex-1 h-1.5 bg-[#144738] rounded-full cursor-pointer group flex items-center"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    seek(pct * validDuration);
                  }}
                >
                  <div
                    className="h-full bg-[#10B981] rounded-full relative transition-all"
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#A7F3D0] border border-[#064E3B] rounded-full shadow-md transition-transform scale-100 group-hover:scale-125" />
                  </div>
                </div>

                <span className="text-[11px] font-mono text-[#86EFAC]/70 w-9 text-left flex-shrink-0">
                  {formatDuration(validDuration)}
                </span>
              </div>
            </div>

            {/* Right: Speed, Volume & Maximize */}
            <div className="hidden sm:flex items-center gap-3.5 flex-shrink-0">
              {/* Speed Pill */}
              <button
                onClick={cycleSpeed}
                className="px-2.5 py-1 rounded-full bg-[#0B3D2E] hover:bg-[#104D3A] border border-[#145842] hover:border-[#10B981] text-xs font-mono font-semibold text-white transition-all shadow-inner"
                title="இயக்க வேகம் மாற்ற (Change Speed)"
              >
                {playbackRate.toFixed(1)}x
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-[#86EFAC] hover:text-white transition-colors"
                  title={isMuted ? 'ஒலியை இயக்கு (Unmute)' : 'ஒலியை நிறுத்து (Mute)'}
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setPlayerVolume(parseFloat(e.target.value))}
                  className="w-16 lg:w-20 h-1 bg-[#144738] rounded-full appearance-none cursor-pointer accent-[#10B981]"
                  title="ஒலியளவு (Volume)"
                />
              </div>

              {/* Expand Full Player Button */}
              <button
                onClick={handleOpenPlayer}
                className="p-1.5 text-[#86EFAC] hover:text-white transition-colors"
                title="முழுத்திரை பிளேயர் (Full Player)"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Collapse Mini-Player Bar Button */}
              <button
                onClick={toggleCollapse}
                className="p-1.5 text-[#86EFAC] hover:text-white transition-colors"
                title="பிளேயரைச் சுருக்கு (Collapse Player)"
              >
                <ChevronDown className="w-4 h-4" />
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
