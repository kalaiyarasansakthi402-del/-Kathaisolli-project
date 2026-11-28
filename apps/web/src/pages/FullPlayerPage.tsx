import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Heart,
  ChevronDown,
  Headphones,
  Gauge,
  ListMusic,
  X,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { formatDuration } from '@kathaisolli/shared-utils';
import { COMPLETE_LIBRARY_CATALOG } from '../data/libraryCatalog';
import { isBookSaved, toggleSaveBook } from '../services/userLibrary';

export const FullPlayerPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, api } = useAuth();
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    playbackError,
    currentTime,
    duration,
    playbackRate,
    sleepTimerMinutes,
    playEpisode,
    playNext,
    playPrevious,
    queue,
    queueIndex,
    togglePlay,
    seek,
    skipForward,
    skipBackward,
    setRate,
    setSleepTimer,
    clearError,
  } = usePlayer();

  const [showChaptersModal, setShowChaptersModal] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const hasPrevious = queueIndex > 0;
  const hasNext = queueIndex < queue.length - 1;

  // If no track is playing on mount, start with Arthashastram Chapter 1
  useEffect(() => {
    if (!currentTrack) {
      const defaultBook =
        COMPLETE_LIBRARY_CATALOG.find((b) => b.slug === 'arthashastram') ||
        COMPLETE_LIBRARY_CATALOG[0];
      const defaultChapter = defaultBook.chapters[0];
      if (defaultChapter) {
        playEpisode({
          episodeId: defaultChapter.id,
          title: `${defaultBook.tamilTitle} - ${defaultChapter.title}`,
          seriesId: defaultBook.id,
          seriesTitle: defaultBook.title,
          coverImageUrl: defaultBook.coverImageUrl,
          narratorName: defaultBook.authorName || defaultBook.narratorName || 'By Anzles Studio',
          durationSec: defaultChapter.durationSeconds,
          audioUrl: defaultChapter.audioUrl,
        });
      }
    }
  }, [currentTrack, playEpisode]);

  // Sync favorite state for current book
  useEffect(() => {
    const bookId = currentTrack?.seriesId || currentTrack?.episodeId || '';
    if (bookId) {
      setIsFavorited(isBookSaved(bookId, user?.id));
    }
  }, [currentTrack?.seriesId, currentTrack?.episodeId, user?.id]);

  const handleToggleFavorite = () => {
    if (!currentTrack) return;
    const bookId = currentTrack.seriesId || currentTrack.episodeId;
    const res = toggleSaveBook(
      {
        id: bookId,
        slug: bookId,
        title: currentTrack.seriesTitle || currentTrack.title,
        authorName: currentTrack.narratorName,
        coverImageUrl: currentTrack.coverImageUrl || currentTrack.coverImage || undefined,
      },
      user?.id,
      api,
    );
    setIsFavorited(res.isSaved);
  };

  const cycleRate = () => {
    const rates = [0.75, 1.0, 1.25, 1.5, 2.0];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    setRate(rates[nextIdx]);
  };

  const effectiveDuration =
    isFinite(duration) && duration > 0 ? duration : currentTrack?.durationSec || 180;

  // Extract clean chapter title & book title
  const rawTitle = currentTrack?.title || 'கதைசொல்லி தமிழ் ஆடியோ';
  const bookTitle = currentTrack?.seriesTitle || 'Kathaisolli';
  const chapterTitle =
    rawTitle.includes(' - ') ? rawTitle.split(' - ').slice(1).join(' - ') : rawTitle;
  const authorName =
    currentTrack?.narratorName || 'Kathaisolli Studio';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between px-4 sm:px-8 py-6 select-none overflow-x-hidden">
      {/* Top Bar: Collapse Chevron (Left) + Chapter Title & Book Title (Center) */}
      <header className="w-full max-w-xl mx-auto flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Collapse player"
          title="பின்செல்க (Back)"
          className="p-2 -ml-2 rounded-full text-stone-200 hover:text-white hover:bg-white/10 transition-colors shrink-0"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="flex-1 text-center min-w-0 px-2">
          <h1 className="text-base sm:text-lg font-bold font-serif text-white truncate">
            {chapterTitle}
          </h1>
          <p className="text-xs sm:text-sm font-semibold font-tamil text-stone-300 truncate mt-0.5">
            {bookTitle}
          </p>
        </div>

        {/* Spacer to keep title centered */}
        <div className="w-10 shrink-0" />
      </header>

      {/* Center: Large Vinyl Record Graphic with Tonearm & Circular Cover Image */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-xl mx-auto my-6 space-y-6">
        <div className="relative w-64 h-64 min-[375px]:w-72 min-[375px]:h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          {/* Tonearm (Turntable Needle) */}
          <div
            className={`absolute -top-3 right-6 sm:right-8 w-16 h-32 pointer-events-none transition-transform duration-700 origin-top-left z-20 ${
              isPlaying ? 'rotate-[22deg]' : 'rotate-6'
            }`}
          >
            {/* Pivot */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-200 to-stone-500 border-2 border-stone-700 shadow-xl flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-stone-800" />
            </div>
            {/* Arm */}
            <div className="w-1.5 h-24 bg-gradient-to-b from-stone-200 to-stone-400 rounded-full ml-3.5 -mt-1 shadow-md transform rotate-[-18deg] origin-top" />
            {/* Head */}
            <div className="w-3.5 h-6 rounded-sm bg-stone-200 border border-stone-500 shadow-lg ml-9 -mt-3 transform rotate-[-25deg]" />
          </div>

          {/* Vinyl Platter */}
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#1f1f1f] via-[#0a0a0a] to-[#1a1a1a] border border-white/15 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex items-center justify-center overflow-hidden">
            {/* Vinyl Grooves */}
            <div className="absolute inset-3 rounded-full border border-white/10 pointer-events-none" />
            <div className="absolute inset-6 rounded-full border border-white/5 pointer-events-none" />
            <div className="absolute inset-9 rounded-full border border-white/10 pointer-events-none" />
            <div className="absolute inset-12 rounded-full border border-white/5 pointer-events-none" />
            <div className="absolute inset-16 rounded-full border border-white/10 pointer-events-none" />

            {/* Circular Cover Image */}
            <div
              className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-stone-800 bg-stone-900 shadow-2xl flex items-center justify-center ${
                isPlaying ? 'animate-[spin_14s_linear_infinite]' : ''
              }`}
            >
              {currentTrack?.coverImageUrl || currentTrack?.coverImage ? (
                <img
                  src={(currentTrack.coverImageUrl || currentTrack.coverImage) ?? undefined}
                  alt={bookTitle}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/story-books-stack.jpg';
                  }}
                />
              ) : (
                <Headphones className="w-12 h-12 text-stone-400" />
              )}
            </div>
          </div>
        </div>

        {/* Author Name Below Vinyl */}
        <p className="text-base sm:text-lg font-bold font-serif text-white text-center px-4">
          {authorName}
        </p>

        {/* Playback Error Banner */}
        {playbackError && (
          <div className="w-full max-w-md p-3 rounded-2xl bg-amber-950/90 border border-amber-600/60 text-amber-200 text-xs flex items-center justify-between">
            <span className="truncate">{playbackError}</span>
            <button onClick={clearError} className="p-1 hover:bg-white/10 rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </main>

      {/* Bottom Section: Progress Bar + Main Controls + Utility Bar */}
      <footer className="w-full max-w-xl mx-auto space-y-6 pb-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm font-mono text-stone-300">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(effectiveDuration)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={effectiveDuration || 1}
            value={Math.min(currentTime, effectiveDuration || 1)}
            onChange={(e) => seek(parseFloat(e.target.value))}
            aria-label="Audio playback progress"
            className="w-full h-1.5 bg-stone-700 rounded-full appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Main Controls: Previous, Rewind 10s, Play/Pause, Forward 10s, Next */}
        <div className="flex items-center justify-between px-2 sm:px-6">
          <button
            type="button"
            onClick={playPrevious}
            disabled={!hasPrevious}
            aria-label="Previous Chapter"
            title="முந்தைய அத்தியாயம் (Previous Chapter)"
            className={`p-2.5 rounded-full transition-colors ${
              hasPrevious
                ? 'text-white hover:bg-white/10 active:scale-95'
                : 'text-stone-600 cursor-not-allowed'
            }`}
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </button>

          <button
            type="button"
            onClick={() => skipBackward(10)}
            aria-label="Rewind 10 seconds"
            title="10 விநாடிகள் பின்னே (Rewind 10s)"
            className="p-2.5 rounded-full text-stone-200 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
          >
            <RotateCcw className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title={isPlaying ? 'Pause' : 'Play'}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 border-white bg-black hover:bg-white/10 text-white flex items-center justify-center shadow-xl active:scale-95 transition-all"
          >
            {isBuffering ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>

          <button
            type="button"
            onClick={() => skipForward(10)}
            aria-label="Forward 10 seconds"
            title="10 விநாடிகள் முன்னே (Forward 10s)"
            className="p-2.5 rounded-full text-stone-200 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
          >
            <RotateCw className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={playNext}
            disabled={!hasNext}
            aria-label="Next Chapter"
            title="அடுத்த அத்தியாயம் (Next Chapter)"
            className={`p-2.5 rounded-full transition-colors ${
              hasNext
                ? 'text-white hover:bg-white/10 active:scale-95'
                : 'text-stone-600 cursor-not-allowed'
            }`}
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </button>
        </div>

        {/* Bottom Utility Bar: Speed (1x), Timer/Speedometer, Favorite Heart, பிற அத்தியாயங்கள் */}
        <div className="relative flex items-center justify-between pt-2 px-1 sm:px-4 border-t border-white/10">
          {/* Speed */}
          <button
            type="button"
            onClick={cycleRate}
            aria-label="Playback speed"
            title="இயக்க வேகம் (Playback Speed)"
            className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono font-bold text-white transition-all"
          >
            {playbackRate}x
          </button>

          {/* Timer / Speedometer */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTimerMenu((prev) => !prev)}
              aria-label="Sleep timer"
              title="Sleep Timer"
              className={`p-2 rounded-full transition-colors flex items-center gap-1 ${
                sleepTimerMinutes
                  ? 'text-emerald-400 bg-emerald-950/60'
                  : 'text-stone-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Gauge className="w-5 h-5" />
              {sleepTimerMinutes && (
                <span className="text-[10px] font-mono font-bold">{sleepTimerMinutes}m</span>
              )}
            </button>

            {showTimerMenu && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-36 rounded-2xl bg-stone-900 border border-white/15 shadow-2xl p-1.5 z-50 space-y-1">
                {[null, 15, 30, 45, 60].map((mins) => (
                  <button
                    key={String(mins)}
                    type="button"
                    onClick={() => {
                      setSleepTimer(mins);
                      setShowTimerMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      sleepTimerMinutes === mins
                        ? 'bg-emerald-600 text-white'
                        : 'text-stone-200 hover:bg-white/10'
                    }`}
                  >
                    {mins === null ? 'Timer Off' : `${mins} minutes`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Favorite Heart */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            title="விருப்பம் (Favorite)"
            className="p-2 rounded-full text-stone-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorited ? 'fill-rose-500 text-rose-500' : 'text-white'
              }`}
            />
          </button>

          {/* பிற அத்தியாயங்கள் (Other Chapters) */}
          <button
            type="button"
            onClick={() => setShowChaptersModal(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 text-xs sm:text-sm font-tamil font-semibold text-white transition-colors"
          >
            <ListMusic className="w-4 h-4" />
            <span>பிற அத்தியாயங்கள்</span>
          </button>
        </div>
      </footer>

      {/* Other Chapters Modal */}
      {showChaptersModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowChaptersModal(false)}
        >
          <div
            className="w-full max-w-md bg-stone-950 border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[75vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-base font-bold font-tamil text-white">
                  பிற அத்தியாயங்கள்
                </h2>
                <p className="text-xs text-stone-400 truncate">{bookTitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowChaptersModal(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 pr-1">
              {queue.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-6">
                  No other chapters available.
                </p>
              ) : (
                queue.map((track, idx) => {
                  const isCurrent = idx === queueIndex;
                  return (
                    <button
                      key={`${track.episodeId}-${idx}`}
                      type="button"
                      onClick={() => {
                        playEpisode(track, track.seriesId, queue, idx);
                        setShowChaptersModal(false);
                      }}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-emerald-950/60 border-emerald-500 text-white'
                          : 'bg-white/5 border-white/10 text-stone-200 hover:bg-white/10'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold font-tamil truncate">
                          {track.title}
                        </p>
                        {track.durationSec ? (
                          <p className="text-[11px] font-mono text-stone-400 mt-0.5">
                            {formatDuration(track.durationSec)}
                          </p>
                        ) : null}
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-black shrink-0">
                          Playing
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullPlayerPage;
