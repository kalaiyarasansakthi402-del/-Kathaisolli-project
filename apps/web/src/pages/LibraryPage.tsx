import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Heart,
  Home,
  BookOpen,
  Headphones,
  Clock,
  User,
  Shield,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  List,
  Play,
  Pause,
  X,
  Volume2,
  Sparkles,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Share2,
} from 'lucide-react';
import {
  COMPLETE_LIBRARY_CATALOG,
  LIBRARY_CATEGORIES,
  LibraryBook,
  LibraryChapter,
} from '../data/libraryCatalog';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';

export const LibraryPage: React.FC = () => {
  const { currentTrack, isPlaying, playEpisode } = usePlayer();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(16);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setVisibleCount(16);
  }, [selectedCategory, debouncedQuery]);

  // Selected book for details modal
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);

  // Filtered books
  const filteredBooks = useMemo(() => {
    return COMPLETE_LIBRARY_CATALOG.filter((book) => {
      // Category filter
      if (selectedCategory === 'Tamil' && book.language !== 'Tamil') return false;
      if (selectedCategory === 'English' && book.language !== 'English') return false;
      if (
        selectedCategory !== 'All' &&
        selectedCategory !== 'Tamil' &&
        selectedCategory !== 'English' &&
        book.category !== selectedCategory
      ) {
        return false;
      }

      // Search query filter
      if (debouncedQuery.trim()) {
        const q = debouncedQuery.toLowerCase().trim();
        const matchesTitle = book.title.toLowerCase().includes(q);
        const matchesTamil = book.tamilTitle.toLowerCase().includes(q);
        const matchesAuthor = book.authorName.toLowerCase().includes(q);
        const matchesCategory = book.category.toLowerCase().includes(q);
        const matchesFolder = book.folderName.toLowerCase().includes(q);
        return matchesTitle || matchesTamil || matchesAuthor || matchesCategory || matchesFolder;
      }

      return true;
    });
  }, [selectedCategory, debouncedQuery]);

  const visibleBooks = useMemo(() => {
    return filteredBooks.slice(0, visibleCount);
  }, [filteredBooks, visibleCount]);

  const handlePlayBookChapter = (book: LibraryBook, chapter: LibraryChapter) => {
    playEpisode({
      episodeId: chapter.id,
      title: `${book.tamilTitle} - ${chapter.title}`,
      seriesTitle: book.title,
      coverImageUrl: book.coverImageUrl || '/images/hero-art.jpg',
      narratorName: book.narratorName || 'By Anzles Studio',
      durationSec: chapter.durationSeconds,
      audioUrl: chapter.audioUrl || '/audio/sample-story.mp3',
    });
  };

  const handleQuickPlayBook = (book: LibraryBook, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!book.audioAvailable) {
      setSelectedBook(book);
      return;
    }

    const firstChapter = book.chapters[0];
    if (firstChapter) {
      handlePlayBookChapter(book, firstChapter);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#042419] text-[#173D2E] dark:text-[#F8F5E9] flex flex-col lg:flex-row transition-colors">
      {/* ============================================================== */}
      {/* 1. LEFT SIDEBAR (Botanical Green, matching UI reference) */}
      {/* ============================================================== */}
      <aside className="w-full lg:w-64 bg-[#063828] dark:bg-[#032016] text-[#E8F0E2] flex flex-col justify-between p-6 shrink-0 border-r border-[#084D37] shadow-xl">
        <div className="space-y-8">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D6A83F] to-[#F5D77F] text-[#063828] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-black font-serif tracking-tight text-white leading-none">
                Kathaisolli
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-[#A7F3D0] mt-1 font-medium">
                Stories • Knowledge • Life
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5 font-medium text-sm">
            <Link
              to="/home"
              className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Home className="w-5 h-5 text-stone-300" />
              <span>Home</span>
            </Link>

            <Link
              to="/library"
              className="flex items-center gap-3.5 px-4 py-3 rounded-xl bg-[#164E3D] text-white font-bold shadow-md border border-[#A7F3D0]/20"
            >
              <BookOpen className="w-5 h-5 text-[#A7F3D0]" />
              <span>Library</span>
            </Link>

            <Link
              to="/my-library"
              className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Headphones className="w-5 h-5 text-stone-300" />
              <span>My Library</span>
            </Link>

            <Link
              to="/my-library?tab=favorites"
              className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Heart className="w-5 h-5 text-stone-300" />
              <span>Favorites</span>
            </Link>

            <Link
              to="/my-library?tab=history"
              className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Clock className="w-5 h-5 text-stone-300" />
              <span>History</span>
            </Link>

            <Link
              to="/profile"
              className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <User className="w-5 h-5 text-stone-300" />
              <span>Profile</span>
            </Link>

            <div className="pt-2 border-t border-white/10">
              <Link
                to="/admin"
                className="flex items-center justify-between px-4 py-3 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <Shield className="w-5 h-5 text-[#D6A83F]" />
                  <span>Admin</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
            </div>
          </nav>
        </div>

        {/* Bottom Vintage Book Stack Illustration matching screenshot */}
        <div className="pt-8 text-center space-y-3">
          <div className="relative mx-auto w-32 h-24 flex items-center justify-center">
            {/* SVG Book stack illustration */}
            <svg viewBox="0 0 160 120" className="w-full h-full drop-shadow-md">
              {/* Bottom Book */}
              <path
                d="M 20 85 L 140 85 L 145 105 L 15 105 Z"
                fill="#854D0E"
                stroke="#D6A83F"
                strokeWidth="1.5"
              />
              <path d="M 25 87 L 135 87 L 138 103 L 22 103 Z" fill="#713F12" />
              {/* Middle Book */}
              <path
                d="M 28 65 L 132 65 L 136 85 L 24 85 Z"
                fill="#164E3D"
                stroke="#A7F3D0"
                strokeWidth="1.5"
              />
              <path d="M 32 67 L 128 67 L 130 83 L 28 83 Z" fill="#063828" />
              {/* Top Book (open or tilted) */}
              <path
                d="M 35 48 L 125 48 L 128 65 L 32 65 Z"
                fill="#9A3412"
                stroke="#FDBA74"
                strokeWidth="1.5"
              />
              {/* Botanical leaves branch on the right */}
              <path
                d="M 135 70 Q 155 50 150 25"
                fill="none"
                stroke="#A7F3D0"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="150" cy="25" r="4" fill="#A7F3D0" />
              <circle cx="145" cy="40" r="3.5" fill="#A7F3D0" />
              <circle cx="152" cy="50" r="3" fill="#A7F3D0" />
            </svg>
          </div>
          <p className="font-serif italic text-base text-[#D6A83F] tracking-wide">
            Good Stories Make a Better You
          </p>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. MAIN CONTENT AREA */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header with Search and Profile */}
        <header className="sticky top-0 z-30 bg-[#FDFBF7]/95 dark:bg-[#042419]/95 backdrop-blur-md px-6 py-4 flex items-center justify-between gap-4 border-b border-[#E3DCBA] dark:border-[#084D37]">
          {/* Search Input */}
          <div className="flex-1 max-w-2xl relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books, authors, or categories..."
              className="w-full pl-12 pr-4 py-2.5 rounded-full bg-white dark:bg-[#063828] border border-stone-200 dark:border-[#084D37] text-sm text-[#173D2E] dark:text-[#E8F0E2] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#064E3B] dark:focus:ring-[#A7F3D0] shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            <Link
              to="/notifications"
              className="w-10 h-10 rounded-full flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
            </Link>

            <Link
              to="/my-library?tab=favorites"
              className="w-10 h-10 rounded-full flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors"
              title="Favorites"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* Profile Avatar Pill */}
            <Link
              to={user ? '/profile' : '/login'}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white dark:bg-[#063828] border border-stone-200 dark:border-[#084D37] shadow-sm hover:shadow transition-shadow"
            >
              <div className="w-8 h-8 rounded-full bg-[#064E3B] text-white flex items-center justify-center text-xs font-bold">
                {user?.displayName ? user.displayName[0].toUpperCase() : 'G'}
              </div>
              <span className="text-xs font-semibold text-[#173D2E] dark:text-[#E8F0E2]">
                {user?.displayName || 'Guest'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* ============================================================== */}
          {/* 3. HERO LIBRARY BANNER (Image 3.png with Badge & Flourishes) */}
          {/* ============================================================== */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl border border-stone-300 dark:border-[#084D37] group">
            {/* Banner Background Image */}
            <div className="relative h-56 sm:h-64 lg:h-72 w-full overflow-hidden bg-[#162A21]">
              <img
                src="/images/3.png"
                alt="Library Study with Books and Headphones"
                onError={(e) => {
                  e.currentTarget.src = '/images/library-banner.jpg';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Dark Gradient Overlay for perfect typography contrast */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/70 flex flex-col items-center justify-center text-center p-6" />

              {/* Top-Right Badge: "Our Library 3.png" matching screenshot */}
              <div className="absolute top-4 right-4 z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-lg">
                <Bookmark className="w-4 h-4 text-[#D6A83F]" />
                <span>Our Library 3.png</span>
              </div>

              {/* Center Banner Content with Golden Flourishes */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10 space-y-2 pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-[#D6A83F]/20 flex items-center justify-center mb-1 border border-[#D6A83F]/40">
                  <BookOpen className="w-6 h-6 text-[#F5D77F]" />
                </div>

                <div className="flex items-center gap-4 text-white">
                  <span className="text-[#D6A83F] text-2xl font-serif">❧</span>
                  <h2 className="text-3xl sm:text-5xl font-black font-serif tracking-wide text-white drop-shadow-md">
                    Library
                  </h2>
                  <span className="text-[#D6A83F] text-2xl font-serif">☙</span>
                </div>

                <p className="text-sm sm:text-base text-stone-200 max-w-xl font-sans drop-shadow leading-relaxed">
                  Explore a world of Tamil and English stories, knowledge and timeless literature.
                </p>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 4. CATEGORY FILTER PILLS & VIEW SWITCHER */}
          {/* ============================================================== */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              {LIBRARY_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                      isActive
                        ? 'bg-[#064E3B] text-white shadow-md'
                        : 'bg-white dark:bg-[#063828] text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10 border border-stone-200 dark:border-[#084D37]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* View Switcher (Grid vs List) */}
            <div className="flex items-center bg-white dark:bg-[#063828] p-1 rounded-xl border border-stone-200 dark:border-[#084D37] shadow-sm shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#064E3B] text-white'
                    : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#064E3B] text-white'
                    : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Total Results Counter */}
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-medium">
            <span>
              Showing {filteredBooks.length} of {COMPLETE_LIBRARY_CATALOG.length} books in catalog
            </span>
            {selectedCategory !== 'All' && (
              <button
                onClick={() => setSelectedCategory('All')}
                className="text-[#064E3B] dark:text-[#A7F3D0] hover:underline font-bold"
              >
                Reset Filter
              </button>
            )}
          </div>

          {/* ============================================================== */}
          {/* 5. 62-BOOK CATALOG GRID / LIST */}
          {/* ============================================================== */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-9 gap-4 sm:gap-5">
              {visibleBooks.map((book) => {
                const isCurrentlyPlayingThisBook =
                  isPlaying &&
                  book.chapters.some((ch) => ch.id === currentTrack?.episodeId);

                return (
                  <div
                    key={book.id}
                    onClick={() => setSelectedBook(book)}
                    className="group cursor-pointer flex flex-col space-y-2 bg-transparent select-none"
                  >
                    {/* Book Cover Container */}
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 border border-stone-200 dark:border-[#084D37] group-hover:-translate-y-1">
                      {/* Stylized Gradient Cover with Tamil Typography */}
                      <div
                        className="w-full h-full p-3.5 flex flex-col justify-between text-white relative overflow-hidden"
                        style={{
                          background: `linear-gradient(145deg, ${book.gradient[0]}, ${book.gradient[1]})`,
                        }}
                      >
                        {/* Thematic SVG background pattern */}
                        <div className="absolute -right-4 -bottom-4 opacity-15 pointer-events-none">
                          <BookOpen className="w-24 h-24" />
                        </div>

                        {/* Top Tamil Title */}
                        <div className="relative z-10">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-white/60">
                            {book.category}
                          </span>
                          <h3 className="font-serif font-black text-sm sm:text-base leading-snug line-clamp-2 mt-1 drop-shadow-sm">
                            {book.tamilTitle}
                          </h3>
                        </div>

                        {/* Bottom Author & Decoration */}
                        <div className="relative z-10 pt-2 border-t border-white/20">
                          <p className="text-[10px] text-white/80 line-clamp-1 font-sans">
                            {book.authorName}
                          </p>
                        </div>

                        {/* Play Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={(e) => handleQuickPlayBook(book, e)}
                            className="w-11 h-11 rounded-full bg-[#064E3B] text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                            title={book.audioAvailable ? 'Play Audio' : 'Audio not available yet'}
                          >
                            {isCurrentlyPlayingThisBook ? (
                              <Pause className="w-5 h-5 fill-current" />
                            ) : (
                              <Play className="w-5 h-5 fill-current ml-0.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Book Title & Audio Status under cover */}
                    <div className="space-y-1">
                      <h4
                        className="font-bold text-xs sm:text-sm text-[#173D2E] dark:text-[#E8F0E2] truncate group-hover:text-[#064E3B] dark:group-hover:text-[#A7F3D0] transition-colors"
                        title={book.title}
                      >
                        {book.title}
                      </h4>

                      {/* Audio Availability Status Badge matching screenshot */}
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Headphones
                          className={`w-3.5 h-3.5 shrink-0 ${
                            book.audioAvailable
                              ? 'text-[#064E3B] dark:text-[#A7F3D0]'
                              : 'text-stone-400'
                          }`}
                        />
                        <span
                          className={`font-medium ${
                            book.audioAvailable
                              ? 'text-[#064E3B] dark:text-[#A7F3D0]'
                              : 'text-stone-400 dark:text-stone-500'
                          }`}
                        >
                          {book.audioAvailable ? 'Audio Available' : 'Audio not available yet'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-3">
              {visibleBooks.map((book) => (
                <div
                  key={book.id}
                  onClick={() => setSelectedBook(book)}
                  className="p-4 rounded-2xl bg-white dark:bg-[#063828] border border-stone-200 dark:border-[#084D37] shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-16 rounded-xl flex items-center justify-center text-white shrink-0 p-1.5 text-center text-[10px] font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${book.gradient[0]}, ${book.gradient[1]})`,
                      }}
                    >
                      {book.tamilTitle.slice(0, 8)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#064E3B] dark:text-[#A7F3D0]">
                        {book.title}
                      </h4>
                      <p className="text-xs text-stone-500 font-tamil">{book.tamilTitle}</p>
                      <p className="text-[11px] text-stone-400">
                        {book.authorName} · {book.category} · {book.language}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs">
                      <Headphones
                        className={`w-3.5 h-3.5 ${
                          book.audioAvailable ? 'text-[#064E3B]' : 'text-stone-400'
                        }`}
                      />
                      <span
                        className={
                          book.audioAvailable
                            ? 'text-[#064E3B] font-semibold'
                            : 'text-stone-400'
                        }
                      >
                        {book.audioAvailable ? 'Audio Available' : 'Audio not available yet'}
                      </span>
                    </div>

                    {book.audioAvailable && (
                      <button
                        onClick={(e) => handleQuickPlayBook(book, e)}
                        className="p-2.5 rounded-full bg-[#064E3B] text-white hover:bg-[#166534] transition-colors"
                      >
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Progressive Loading: Load More Stories */}
          {visibleCount < filteredBooks.length && (
            <div className="pt-8 text-center space-y-2">
              <button
                onClick={() => setVisibleCount((prev) => prev + 16)}
                className="px-8 py-3 rounded-2xl bg-[#064E3B] hover:bg-[#166534] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 font-tamil cursor-pointer"
              >
                மேலும் கதைகளைக் காட்டு ({filteredBooks.length - visibleBooks.length} மீதமுள்ளது)
              </button>
              <p className="text-xs text-stone-400 font-mono">
                Showing {visibleBooks.length} of {filteredBooks.length} books in catalog
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 6. BOOK DETAIL & CHAPTER PLAYBACK MODAL */}
      {/* ============================================================== */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] dark:bg-[#032016] text-[#173D2E] dark:text-[#F8F5E9] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 dark:border-[#084D37] relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 bg-stone-100 dark:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with Cover & Metadata */}
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div
                className="w-28 h-36 sm:w-36 sm:h-48 rounded-2xl p-4 flex flex-col justify-between text-white shrink-0 shadow-lg"
                style={{
                  background: `linear-gradient(145deg, ${selectedBook.gradient[0]}, ${selectedBook.gradient[1]})`,
                }}
              >
                <span className="text-[10px] font-bold uppercase text-white/70">
                  {selectedBook.category}
                </span>
                <h4 className="font-serif font-black text-base drop-shadow">
                  {selectedBook.tamilTitle}
                </h4>
                <p className="text-[10px] text-white/80 line-clamp-1">
                  {selectedBook.authorName}
                </p>
              </div>

              <div className="space-y-2 flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#E8F0E2] dark:bg-[#063828] text-[#064E3B] dark:text-[#A7F3D0]">
                  <span>{selectedBook.category}</span>
                  <span>•</span>
                  <span>{selectedBook.language}</span>
                </div>

                <h3 className="text-2xl font-black font-serif text-[#064E3B] dark:text-[#F8F5E9]">
                  {selectedBook.title}
                </h3>
                <h4 className="text-base font-tamil font-bold text-[#166534] dark:text-[#A7F3D0]">
                  {selectedBook.tamilTitle}
                </h4>

                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Author: <span className="font-semibold text-stone-700 dark:text-stone-200">{selectedBook.authorName}</span> · Narrator:{' '}
                  <span className="font-semibold text-[#064E3B] dark:text-[#A7F3D0]">{selectedBook.narratorName}</span>
                </p>

                {/* Status Indicator */}
                <div className="pt-2">
                  {selectedBook.audioAvailable ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Audio Available · Ready to Stream</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Audio not available yet · In Recording</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Synopsis / Description */}
            <div className="space-y-1.5 pt-2 border-t border-stone-200 dark:border-[#084D37]">
              <h5 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                About this Book
              </h5>
              <p className="text-sm text-[#173D2E]/80 dark:text-stone-300 leading-relaxed">
                {selectedBook.description}
              </p>
            </div>

            {/* Chapters & Audio Playback Section */}
            <div className="space-y-3 pt-2 border-t border-stone-200 dark:border-[#084D37]">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Audio Chapters ({selectedBook.chapters.length})
                </h5>
                <span className="text-[11px] text-stone-400">
                  Firebase Storage Cloud Streaming
                </span>
              </div>

              {selectedBook.audioAvailable && selectedBook.chapters.length > 0 ? (
                <div className="space-y-2">
                  {selectedBook.chapters.map((ch) => {
                    const isPlayingThisChapter =
                      isPlaying && currentTrack?.episodeId === ch.id;

                    return (
                      <div
                        key={ch.id}
                        className="p-3.5 rounded-2xl bg-white dark:bg-[#063828] border border-stone-200 dark:border-[#084D37] flex items-center justify-between hover:border-[#064E3B] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handlePlayBookChapter(selectedBook, ch)}
                            className="w-10 h-10 rounded-full bg-[#064E3B] text-white flex items-center justify-center hover:scale-105 transition-transform shrink-0 shadow-md"
                          >
                            {isPlayingThisChapter ? (
                              <Pause className="w-4 h-4 fill-current" />
                            ) : (
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            )}
                          </button>
                          <div>
                            <h6 className="font-bold text-xs sm:text-sm text-[#173D2E] dark:text-[#E8F0E2]">
                              {ch.title}
                            </h6>
                            <p className="text-[11px] text-stone-400">
                              Duration: {Math.floor(ch.durationSeconds / 60)} mins · Tamil Studio Audio
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handlePlayBookChapter(selectedBook, ch)}
                          className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#E8F0E2] dark:bg-[#164E3D] text-[#064E3B] dark:text-[#A7F3D0] hover:bg-[#064E3B] hover:text-white transition-colors"
                        >
                          {isPlayingThisChapter ? 'Playing' : 'Listen'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-stone-100 dark:bg-[#063828] text-center space-y-2">
                  <Headphones className="w-8 h-8 text-stone-400 mx-auto" />
                  <h6 className="font-bold text-sm text-stone-700 dark:text-stone-200">
                    Audio not available yet
                  </h6>
                  <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                    This book is scheduled for recording by our Tamil narrator team. You can save it to your Favorites to receive updates when audio is released.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
