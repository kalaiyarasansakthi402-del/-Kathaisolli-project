import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Bookmark,
  Heart,
  Search,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Headphones,
  ShieldAlert,
  FileText,
  Check,
  Share2,
  Leaf,
  X,
} from 'lucide-react';
import { usePlayer, type PlayingTrack } from '../context/PlayerContext';
import { formatDuration } from '@kathaisolli/shared-utils';
import {
  COMPLETE_LIBRARY_CATALOG,
  type LibraryBook,
  type LibraryChapter,
} from '../data/libraryCatalog';

export const FullPlayerPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    playbackError,
    currentTime,
    duration,
    playbackRate,
    sleepTimerMinutes,
    volume,
    isMuted,
    playEpisode,
    playNext,
    playPrevious,
    queue,
    queueIndex,
    pause,
    resume,
    togglePlay,
    seek,
    skipForward,
    skipBackward,
    setRate,
    setSleepTimer,
    setPlayerVolume,
    toggleMute,
    clearError,
  } = usePlayer();

  // Active category filter tab in right panel
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);

  const hasPrevious = queueIndex > 0;
  const hasNext = queueIndex < queue.length - 1;

  // If no track is playing on mount, start with Arthashastram Chapter 1 (Real verified MP3)
  useEffect(() => {
    if (!currentTrack) {
      const defaultBook = COMPLETE_LIBRARY_CATALOG.find((b) => b.slug === 'arthashastram') || COMPLETE_LIBRARY_CATALOG[0];
      const defaultChapter = defaultBook.chapters[0];
      if (defaultChapter) {
        playEpisode({
          episodeId: defaultChapter.id,
          title: `${defaultBook.tamilTitle} - ${defaultChapter.title}`,
          seriesId: defaultBook.id,
          seriesTitle: defaultBook.title,
          coverImageUrl: defaultBook.coverImageUrl,
          narratorName: defaultBook.narratorName || 'By Anzles Studio',
          durationSec: defaultChapter.durationSeconds,
          audioUrl: defaultChapter.audioUrl,
        });
      }
    }
  }, [currentTrack, playEpisode]);

  // Flatten all chapters from catalog with book reference for the right grid
  const allCatalogChapters = useMemo(() => {
    const list: Array<{
      book: LibraryBook;
      chapter: LibraryChapter;
      trackId: string;
    }> = [];

    for (const book of COMPLETE_LIBRARY_CATALOG) {
      for (const chapter of book.chapters) {
        list.push({
          book,
          chapter,
          trackId: chapter.id,
        });
      }
    }
    return list;
  }, []);

  // Filtered chapters for the right-side grid
  const filteredChapters = useMemo(() => {
    return allCatalogChapters.filter(({ book, chapter }) => {
      // Tab category filter
      if (activeTab === 'moral' && book.category !== 'Motivation' && book.category !== 'Self Help') {
        return false;
      }
      if (activeTab === 'history' && book.category !== 'History') {
        return false;
      }
      if (activeTab === 'philosophy' && book.category !== 'Mythology' && book.category !== 'Literature') {
        return false;
      }
      if (activeTab === 'biography' && book.category !== 'Biography') {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesBook = book.title.toLowerCase().includes(q) || book.tamilTitle.toLowerCase().includes(q);
        const matchesChapter = chapter.title.toLowerCase().includes(q) || chapter.tamilTitle.toLowerCase().includes(q);
        const matchesAuthor = book.authorName.toLowerCase().includes(q);
        return matchesBook || matchesChapter || matchesAuthor;
      }

      return true;
    });
  }, [allCatalogChapters, activeTab, searchQuery]);

  const handlePlayChapterItem = (book: LibraryBook, chapter: LibraryChapter) => {
    const bookQueue: PlayingTrack[] = book.chapters.map((ch) => ({
      id: ch.id,
      episodeId: ch.id,
      title: `${book.tamilTitle} - ${ch.title}`,
      seriesId: book.id,
      seriesTitle: book.title,
      coverImageUrl: book.coverImageUrl,
      narratorName: book.authorName || book.narratorName || 'By Anzles Studio',
      durationSec: ch.durationSeconds,
      audioUrl: ch.audioUrl,
    }));
    const chIdx = book.chapters.findIndex((c) => c.id === chapter.id);

    playEpisode(
      {
        episodeId: chapter.id,
        title: `${book.tamilTitle} - ${chapter.title}`,
        seriesId: book.id,
        seriesTitle: book.title,
        coverImageUrl: book.coverImageUrl,
        narratorName: book.narratorName || 'By Anzles Studio',
        durationSec: chapter.durationSeconds,
        audioUrl: chapter.audioUrl,
      },
      book.id,
      bookQueue,
      chIdx >= 0 ? chIdx : 0,
    );
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  const cycleRate = () => {
    const rates = [0.75, 1.0, 1.25, 1.5, 2.0];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    setRate(rates[nextIdx]);
  };

  const cycleSleepTimer = () => {
    const timers = [null, 15, 20, 30, 45, 60];
    const nextIdx = (timers.indexOf(sleepTimerMinutes) + 1) % timers.length;
    setSleepTimer(timers[nextIdx]);
  };

  const effectiveDuration = duration > 0 ? duration : currentTrack?.durationSec || 180;
  const progressPercent = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#07241D] text-[#E8F0E2] flex flex-col font-sans select-none overflow-x-hidden">
      {/* ============================================================== */}
      {/* 1. TOP HEADER (White / Cream cleanly aligned branding)        */}
      {/* ============================================================== */}
      <header className="w-full bg-[#FAF7EE] text-[#063828] border-b border-[#E3DCBA] px-6 lg:px-12 py-3.5 flex items-center justify-between shadow-md z-30">
        {/* Left: Kathaisolli concentric brand mark & typography */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-full bg-[#064E3B] text-white flex items-center justify-center shadow-md relative group-hover:scale-105 transition-transform">
            <div className="w-8 h-8 rounded-full border-2 border-[#A7F3D0]/60 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-[#A7F3D0] fill-current" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-serif tracking-tight text-[#064E3B]">
                Kathaisolli
              </span>
              <span className="text-sm font-bold font-tamil text-[#0B6B52]">
                கதைசொல்லி
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-[#0B6B52]/75 font-semibold">
              Kathaisolli | Botanical Oasis · By Anzles
            </p>
          </div>
        </Link>

        {/* Right Action: Clean Navigation & Close controls */}
        <div className="flex items-center gap-3">
          <Link
            to="/categories"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#E5EFEA] hover:bg-[#D2E4DC] text-[#064E3B] text-xs font-bold transition-colors shadow-sm"
          >
            <span>கதைகளை உலாவு (Explore)</span>
          </Link>
          <Link
            to="/my-library"
            className="hidden md:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#E5EFEA] hover:bg-[#D2E4DC] text-[#064E3B] text-xs font-bold transition-colors shadow-sm"
          >
            <span>எனது நூலகம் (Library)</span>
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-[#064E3B] text-white hover:bg-[#085a44] flex items-center justify-center transition-transform hover:scale-105 shadow-sm"
            title="மூடு / பின்செல்க (Close / Back)"
            aria-label="Close Player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. MAIN TWO-COLUMN STUDIO PLAYER INTERFACE                     */}
      {/* ============================================================== */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-12 py-8 pb-32 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ------------------------------------------------------------ */}
        {/* LEFT COLUMN: TURNTABLE RECORD PLAYER CONSOLE (5 cols)         */}
        {/* ------------------------------------------------------------ */}
        <section className="lg:col-span-5 flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-[#0F352C]/90 backdrop-blur-2xl border border-[#1C5749]/60 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-6">
          {/* Vinyl Record Turntable Frame */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl bg-gradient-to-tr from-[#08221B] to-[#124237] p-5 shadow-2xl border-2 border-[#1E5C4E] flex items-center justify-center">
            {/* Turntable Platter Outer Ring */}
            <div className="relative w-full h-full rounded-full bg-[#041410] border-4 border-[#1B5749] flex items-center justify-center shadow-inner overflow-hidden">
              {/* Subtle Vinyl Grooves Pattern */}
              <div className="absolute inset-2 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute inset-6 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute inset-10 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute inset-14 rounded-full border border-white/5 pointer-events-none" />

              {/* Rotating Center Vinyl Disc Label */}
              <div
                className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-[#07241D] bg-gradient-to-br from-[#064E3B] via-[#0B3D2E] to-[#042419] shadow-2xl flex flex-col items-center justify-center p-3 text-center transition-transform duration-700 ${
                  isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#032419]/90 border border-[#A7F3D0]/40 flex items-center justify-center mb-1">
                  <Headphones className="w-5 h-5 text-[#A7F3D0]" />
                </div>
                <span className="text-[10px] font-bold font-serif text-[#A7F3D0] uppercase tracking-wider">
                  கதைசொல்லி
                </span>
                <span className="text-[8px] text-white/70 font-mono">
                  Tamil Audio
                </span>
              </div>

              {/* Center Spindle Hole */}
              <div className="absolute w-5 h-5 rounded-full bg-[#1B5749] border-2 border-[#A7F3D0] shadow-md z-10" />
            </div>

            {/* Stylized Tonearm (Turntable Needle) resting on record */}
            <div
              className={`absolute top-4 right-4 w-12 h-28 pointer-events-none transition-transform duration-700 origin-top-right ${
                isPlaying ? 'rotate-12' : 'rotate-0'
              }`}
            >
              {/* Tonearm Pivot Base */}
              <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-[#1B5749] border border-[#A7F3D0]/60 shadow-lg" />
              {/* Arm stem */}
              <div className="absolute top-4 right-2.5 w-1 h-20 bg-gradient-to-b from-[#A7F3D0] to-[#10B981] rounded-full shadow" />
              {/* Cartridge & Needle head */}
              <div className="absolute bottom-0 right-1 w-4 h-6 rounded-sm bg-[#041410] border border-[#10B981] shadow-md" />
            </div>
          </div>

          {/* Title & Narrator Metadata */}
          <div className="text-center space-y-1.5 w-full px-2">
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-[#F8F5E9] tracking-tight truncate drop-shadow">
              {currentTrack?.title || 'கதைசொல்லி தமிழ் ஆடியோ'}
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-[#A7F3D0]/80 truncate">
              {currentTrack?.narratorName || currentTrack?.seriesTitle || 'Kathaisolli Original · By Anzles Studio'}
            </p>
          </div>

          {/* Interactive Playback Controls Bar */}
          <div className="flex items-center justify-between w-full max-w-sm px-4 pt-1">
            {/* Script / Lyrics toggle button (歌词 / தமிழ்) */}
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                showTranscript
                  ? 'bg-[#10B981] text-[#07241D] border-[#10B981]'
                  : 'bg-white/5 hover:bg-white/10 text-stone-300 border-white/10'
              }`}
              title="Toggle Story Script / Tamil Text"
            >
              தமிழ் உரை
            </button>

            {/* Previous Chapter */}
            <button
              onClick={playPrevious}
              disabled={!hasPrevious}
              className={`p-3 rounded-full active:scale-95 transition-all ${
                hasPrevious
                  ? 'text-[#E8F0E2] hover:text-[#10B981] hover:bg-white/5'
                  : 'text-stone-600 opacity-40 cursor-not-allowed'
              }`}
              title={hasPrevious ? 'முந்தைய அத்தியாயம் (Previous Chapter)' : 'முதல் அத்தியாயம் (First Chapter)'}
              aria-label="Previous Chapter"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>

            {/* Rewind 10 Seconds */}
            <button
              onClick={() => skipBackward(10)}
              className="p-2.5 rounded-full text-stone-300 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
              title="10 விநாடிகள் பின்னே (Rewind 10s)"
              aria-label="Rewind 10 seconds"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Large Glowing Circular Play / Pause Button */}
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-white text-[#07241D] flex items-center justify-center hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all"
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isBuffering ? (
                <div className="w-6 h-6 border-3 border-[#07241D] border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-7 h-7 fill-current" />
              ) : (
                <Play className="w-7 h-7 fill-current ml-1" />
              )}
            </button>

            {/* Forward 10 Seconds */}
            <button
              onClick={() => skipForward(10)}
              className="p-2.5 rounded-full text-stone-300 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
              title="10 விநாடிகள் முன்னே (Forward 10s)"
              aria-label="Forward 10 seconds"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {/* Next Chapter */}
            <button
              onClick={playNext}
              disabled={!hasNext}
              className={`p-3 rounded-full active:scale-95 transition-all ${
                hasNext
                  ? 'text-[#E8F0E2] hover:text-[#10B981] hover:bg-white/5'
                  : 'text-stone-600 opacity-40 cursor-not-allowed'
              }`}
              title={hasNext ? 'அடுத்த அத்தியாயம் (Next Chapter)' : 'கடைசி அத்தியாயம் (Last Chapter)'}
              aria-label="Next Chapter"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>
          </div>

          {/* Glowing Cyan/Teal Progress Seekbar */}
          <div className="w-full max-w-sm space-y-2">
            <div
              className="relative w-full h-2.5 bg-black/40 rounded-full cursor-pointer overflow-hidden group shadow-inner"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                seek(pct * effectiveDuration);
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-[#059669] via-[#10B981] to-[#34D399] relative transition-all rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-mono font-semibold text-stone-400">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(effectiveDuration)}</span>
            </div>
          </div>

          {/* Playback Error Banner if any */}
          {playbackError && (
            <div className="w-full max-w-sm p-3 rounded-2xl bg-amber-950/80 border border-amber-600/60 text-amber-200 text-xs flex items-center justify-between">
              <span className="truncate">{playbackError}</span>
              <button onClick={clearError} className="p-1 hover:bg-white/10 rounded">✕</button>
            </div>
          )}

          {/* Transcript Panel (Collapsible) */}
          {showTranscript && (
            <div className="w-full max-w-sm p-4 rounded-2xl bg-black/50 border border-white/10 text-xs text-stone-200 leading-relaxed max-h-40 overflow-y-auto font-tamil">
              <p className="font-bold text-[#A7F3D0] mb-1">தமிழ் உரை சுருக்கம்:</p>
              <p>
                {currentTrack?.title} — கதைசொல்லி வழங்கும் உயர்தர தமிழ் ஒலிநூல் வடிவம்.
                அரசியல், தத்துவம், தன்னம்பிக்கை மற்றும் வாழ்க்கைப் பாடங்களை எங்கும் எப்போதும் கேட்டு மகிழுங்கள்.
              </p>
            </div>
          )}
        </section>

        {/* ------------------------------------------------------------ */}
        {/* RIGHT COLUMN: CHAPTER & AUDIOBOOK 4-COLUMN GRID (7 cols)     */}
        {/* ------------------------------------------------------------ */}
        <section className="lg:col-span-7 space-y-6">
          {/* Top Filter Tabs & Search Pill (Matching Reference UI) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-1 text-sm font-bold">
              {[
                { id: 'all', label: 'அனைத்தும்' },
                { id: 'moral', label: 'நீதிக்கதை' },
                { id: 'history', label: 'வரலாறு' },
                { id: 'philosophy', label: 'தத்துவம்' },
                { id: 'biography', label: 'வாழ்க்கை' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative pb-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.id ? 'text-[#A7F3D0]' : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10B981] rounded-full shadow-[0_0_8px_#10B981]" />
                  )}
                </button>
              ))}
            </div>

            {/* Rounded Search Pill Input */}
            <div className="relative w-full sm:w-56 shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="தேடுங்கள்..."
                className="w-full pl-9 pr-8 py-2 rounded-full bg-[#0F352C]/80 border border-[#1C5749] text-xs text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#10B981] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 4-Column Card Grid (Matching Reference UI Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredChapters.slice(0, 12).map(({ book, chapter }) => {
              const isCardPlaying =
                (currentTrack?.episodeId === chapter.id || currentTrack?.title?.includes(chapter.title)) &&
                isPlaying;

              return (
                <div
                  key={`${book.id}-${chapter.id}`}
                  onClick={() => handlePlayChapterItem(book, chapter)}
                  className={`p-4 rounded-2xl cursor-pointer group shadow-md border transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between space-y-3 bg-[#08221B] ${
                    isCardPlaying
                      ? 'border-[#10B981] ring-1 ring-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'border-white/10 hover:border-[#10B981]/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-[#A7F3D0] truncate max-w-[120px]">
                      {book.category || 'General'}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isCardPlaying
                          ? 'bg-[#10B981] text-[#07241D] scale-100 shadow-md'
                          : 'bg-white/10 text-white group-hover:bg-[#10B981] group-hover:text-[#07241D]'
                      }`}
                    >
                      {isCardPlaying ? (
                        <div className="w-2.5 h-2.5 bg-[#07241D] rounded-sm animate-pulse" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-[#F8F5E9] font-serif line-clamp-2 group-hover:text-[#A7F3D0] transition-colors">
                      {chapter.tamilTitle || chapter.title}
                    </h3>
                    <p className="text-[11px] text-stone-300/80 truncate mt-1 font-medium">
                      {book.authorName}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ============================================================== */}
      {/* 3. STICKY BOTTOM MINI-PLAYER DOCK (Matching Reference UI)      */}
      {/* ============================================================== */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A261F]/95 backdrop-blur-2xl border-t border-[#16493B]/80 px-6 py-3.5 flex items-center justify-between gap-4 shadow-[0_-10px_35px_rgba(0,0,0,0.6)]">
        {/* Left: Green Circular Headphone Icon + Title */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[#059669] text-[#07241D] flex items-center justify-center shrink-0 shadow-lg">
            <Headphones className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold font-serif text-[#F8F5E9] truncate font-tamil">
              {currentTrack?.title || 'கதைசொல்லி தமிழ் ஆடியோ'}
            </p>
            <p className="text-xs text-[#A7F3D0]/70 truncate">
              {currentTrack?.narratorName || currentTrack?.seriesTitle || 'By Anzles Studio'}
            </p>
          </div>
        </div>

        {/* Center: Controls, Speed, and Sleep Timer Pills */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Collapse / Expand icon */}
          <button
            onClick={() => navigate('/categories')}
            className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-white/5 transition-colors"
            title="கதைகளை உலாவவும் (Browse Stories)"
          >
            <ChevronUp className="w-5 h-5" />
          </button>

          {/* Mini Play / Pause */}
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shadow-sm"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Speed Selector Pill */}
          <button
            onClick={cycleRate}
            className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-white/10 hover:bg-white/20 text-[#A7F3D0] border border-white/10 transition-colors"
            title="Playback Speed"
          >
            {playbackRate}x
          </button>

          {/* Sleep Timer Pill */}
          <button
            onClick={cycleSleepTimer}
            className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-white/10 hover:bg-white/20 text-stone-300 border border-white/10 transition-colors"
            title="Sleep Timer"
          >
            {sleepTimerMinutes ? `${sleepTimerMinutes}m` : 'Timer'}
          </button>
        </div>

        {/* Right: Theme Toggle, Favorite, and Volume Slider */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Favorite Toggle */}
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className={`p-2 rounded-full transition-colors ${
              isFavorited ? 'text-rose-500' : 'text-stone-400 hover:text-white'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-stone-400 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => setPlayerVolume(parseFloat(e.target.value))}
              className="w-16 sm:w-20 h-1.5 bg-black/40 rounded-full appearance-none cursor-pointer accent-[#10B981]"
            />
          </div>
        </div>
      </footer>
    </div>
  );
};
