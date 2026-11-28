import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Headphones,
  BookOpen,
  ArrowRight,
  Infinity,
  Play,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import {
  COMPLETE_LIBRARY_CATALOG,
  type LibraryBook,
} from '../data/libraryCatalog';
import { getUncompletedListeningHistory } from '../services/userLibrary';
import { formatDuration } from '@kathaisolli/shared-utils';

interface UncompletedBookCardItem {
  bookId: string;
  slug?: string;
  title: string;
  authorName: string;
  coverImageUrl: string;
  episodeId: string;
  episodeTitle: string;
  positionSec: number;
  durationSec: number;
  progressPercent: number;
  lastPlayedAt: number;
  audioUrl?: string;
}

export const HomePage: React.FC = () => {
  const { user, api } = useAuth();
  const { playEpisode, seek } = usePlayer();
  const navigate = useNavigate();
  const [uncompletedBooks, setUncompletedBooks] = useState<UncompletedBookCardItem[]>([]);

  useEffect(() => {
    if (!user?.id) {
      setUncompletedBooks([]);
      return;
    }

    let isMounted = true;

    const loadUncompleted = async () => {
      const localEntries = getUncompletedListeningHistory(user.id, 5);
      const mappedLocal: UncompletedBookCardItem[] = [];

      for (const entry of localEntries) {
        const matchedBook: LibraryBook | undefined = COMPLETE_LIBRARY_CATALOG.find(
          (b) =>
            b.id === entry.bookId ||
            b.slug === entry.bookId ||
            b.chapters.some((c) => c.id === entry.episodeId),
        );
        if (matchedBook) {
          const matchedChapter =
            matchedBook.chapters.find((c) => c.id === entry.episodeId) ||
            matchedBook.chapters[0];
          const dur = entry.durationSec || matchedChapter?.durationSeconds || 0;
          const pct =
            dur > 0 ? Math.min(99, Math.max(1, Math.round((entry.positionSec / dur) * 100))) : 0;
          mappedLocal.push({
            bookId: matchedBook.id,
            slug: matchedBook.slug,
            title: matchedBook.tamilTitle
              ? `${matchedBook.tamilTitle} (${matchedBook.title})`
              : matchedBook.title,
            authorName: matchedBook.authorName,
            coverImageUrl: matchedBook.coverImageUrl,
            episodeId: matchedChapter?.id || entry.episodeId,
            episodeTitle:
              entry.episodeTitle || matchedChapter?.tamilTitle || matchedChapter?.title || '',
            positionSec: entry.positionSec,
            durationSec: dur,
            progressPercent: pct,
            lastPlayedAt: entry.lastPlayedAt,
            audioUrl: matchedChapter?.audioUrl,
          });
        }
      }

      try {
        const apiItems = await api.library.getContinueListening();
        if (Array.isArray(apiItems) && apiItems.length > 0) {
          const mappedApi: UncompletedBookCardItem[] = apiItems
            .filter((item: any) => (item.progressPercentage ?? 0) < 95)
            .map((item: any) => ({
              bookId: item.series?.id || item.episodeId,
              slug: item.series?.slug,
              title: item.series?.title || item.episodeTitle,
              authorName: item.series?.authorName || item.series?.narratorName || 'Kathaisolli',
              coverImageUrl: item.series?.coverImage || '/images/story-books-stack.jpg',
              episodeId: item.episodeId,
              episodeTitle: item.episodeTitle,
              positionSec: item.positionSec || 0,
              durationSec: item.durationSec || 0,
              progressPercent: item.progressPercentage || 0,
              lastPlayedAt: item.lastPlayedAt ? new Date(item.lastPlayedAt).getTime() : Date.now(),
            }));

          const mergedMap = new Map<string, UncompletedBookCardItem>();
          for (const item of [...mappedApi, ...mappedLocal]) {
            if (!mergedMap.has(item.bookId)) {
              mergedMap.set(item.bookId, item);
            }
          }
          const merged = Array.from(mergedMap.values())
            .sort((a, b) => b.lastPlayedAt - a.lastPlayedAt)
            .slice(0, 5);
          if (isMounted) setUncompletedBooks(merged);
          return;
        }
      } catch {
        // Fallback to local user-specific history
      }

      if (isMounted) {
        setUncompletedBooks(mappedLocal.slice(0, 5));
      }
    };

    loadUncompleted();

    const onHistoryUpdated = () => {
      loadUncompleted();
    };
    window.addEventListener('kathaisolli:history-updated', onHistoryUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('kathaisolli:history-updated', onHistoryUpdated);
    };
  }, [user?.id, api]);

  const handleResumeBook = async (item: UncompletedBookCardItem) => {
    await playEpisode(
      {
        episodeId: item.episodeId,
        title: item.episodeTitle || item.title,
        seriesId: item.bookId,
        seriesTitle: item.title,
        coverImageUrl: item.coverImageUrl,
        narratorName: item.authorName,
        durationSec: item.durationSec,
        audioUrl: item.audioUrl,
      },
      item.bookId,
    );
    if (item.positionSec > 0) {
      seek(item.positionSec);
    }
    navigate('/player');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAF7EE] dark:bg-[#03261C] text-[#173D2E] dark:text-[#F8F5E9] transition-colors py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* ========================================================================= */}
        {/* VIEW 1: FIRST-TIME VISIT (GUEST VIEW) — WHEN USER IS NOT LOGGED IN         */}
        {/* ========================================================================= */}
        {!user ? (
          <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#064E3B] via-[#054433] to-[#02281D] border border-[#166534]/40 shadow-2xl text-white p-6 sm:p-10 lg:p-14">
            {/* Subtle Foliage / Leaves Accent Overlays */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
              {/* Left Column: Kathaisolli Branding & Hero Copy */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h1 className="text-4xl sm:text-6xl font-black font-serif tracking-tight text-white leading-tight">
                    Kathaisolli
                  </h1>
                  <p className="text-2xl sm:text-3xl font-bold font-tamil text-[#FDE047] mt-1">
                    கதைசொல்லி
                  </p>
                  <p className="text-base sm:text-xl font-medium text-[#A7F3D0] mt-2 tracking-wide">
                    Tamil Audiobooks for Every Reader
                  </p>
                </div>

                {/* Heading & 3 Value Proposition Bullets */}
                <div className="space-y-3 pt-1">
                  <p className="text-sm sm:text-base font-bold text-[#FDE047] tracking-wide">
                    It&apos;s the audiobook library
                  </p>
                  <div className="flex items-center gap-3 text-sm sm:text-base text-stone-100">
                    <Headphones className="w-5 h-5 text-[#FDE047] flex-shrink-0" />
                    <span>Thousands of Tamil Stories</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm sm:text-base text-stone-100">
                    <BookOpen className="w-5 h-5 text-[#FDE047] flex-shrink-0" />
                    <span>Classical to Modern Literature</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm sm:text-base text-stone-100">
                    <Infinity className="w-5 h-5 text-[#FDE047] flex-shrink-0" />
                    <span>Listen Anytime, Anywhere</span>
                  </div>
                </div>

                {/* Guest Action CTA Buttons */}
                <div className="pt-3 flex flex-wrap items-center gap-3 sm:gap-4">
                  <Link
                    to="/signup"
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-full bg-white text-[#064E3B] font-bold text-sm sm:text-base shadow-xl shadow-black/20 hover:bg-[#FAF7EE] hover:scale-[1.02] active:scale-95 transition-all text-center"
                  >
                    Sign Up — Create Free Account
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-full bg-transparent text-white border-2 border-white/80 hover:bg-white/10 font-bold text-sm sm:text-base hover:scale-[1.02] active:scale-95 transition-all text-center"
                  >
                    Login — Existing User
                  </Link>
                </div>
              </div>

              {/* Right Column: Joyful Mascot & Audio Visual */}
              <div className="lg:col-span-5 flex justify-center items-center">
                <div className="relative group">
                  <img
                    src="/3.png"
                    alt="Kathaisolli Storytelling Mascot"
                    className="w-full max-w-[340px] sm:max-w-[420px] h-auto object-contain drop-shadow-2xl rounded-2xl transform group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/mascot.png';
                    }}
                  />
                </div>
              </div>
            </div>
          </section>
        ) : (
          /* ========================================================================= */
          /* VIEW 4: AUTHENTICATED USER VIEW — HERO & LAST 5 UNCOMPLETED BOOKS          */
          /* ========================================================================= */
          <div className="space-y-8">
            {/* Authenticated Hero Section */}
            <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#064E3B] via-[#054433] to-[#02281D] border border-[#166534]/40 shadow-xl text-white p-6 sm:p-10 lg:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
                <div className="lg:col-span-7 space-y-4">
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-tamil text-white leading-tight">
                    ஆயிரக்கணக்கான தமிழ் கதைகள் ஒரே இடத்தில்
                  </h1>
                  <p className="text-sm sm:text-base text-[#A7F3D0] font-medium">
                    Explore, Listen and Enjoy Tamil Audiobooks
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/categories"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#064E3B] border border-[#A7F3D0]/40 text-white font-bold text-sm shadow-md hover:bg-[#166534] transition-all hover:scale-[1.02]"
                    >
                      <span>Explore Categories</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-center lg:justify-end">
                  <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                    <img
                      src="/images/story-books-stack.jpg"
                      alt="Tamil Audiobooks Stack"
                      className="w-full h-48 sm:h-56 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/3.png';
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Last 5 Uncompleted Books Section (Hidden when empty) */}
            {uncompletedBooks.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black font-serif text-[#064E3B] dark:text-[#A7F3D0]">
                      Continue Listening
                    </h2>
                    <p className="text-xs sm:text-sm font-tamil text-stone-600 dark:text-stone-300">
                      நீங்கள் கேட்டுக்கொண்டிருந்த கடைசி புத்தகங்கள்
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {uncompletedBooks.map((item) => (
                    <button
                      key={`${item.bookId}-${item.episodeId}`}
                      type="button"
                      onClick={() => handleResumeBook(item)}
                      className="text-left rounded-2xl bg-white dark:bg-[#073224] border border-[#E3DCBA] dark:border-[#0F4738] shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col group"
                    >
                      <div className="relative w-full h-36 bg-[#064E3B]/10 overflow-hidden">
                        <img
                          src={item.coverImageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/story-books-stack.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <span className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-[#A7F3D0] text-[#064E3B] flex items-center justify-center shadow-md">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </span>
                      </div>

                      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5 w-full">
                        <div className="space-y-1">
                          <h3 className="font-bold text-sm text-[#064E3B] dark:text-white line-clamp-2 font-tamil">
                            {item.title}
                          </h3>
                          <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                            {item.authorName}
                          </p>
                        </div>

                        <div className="space-y-1.5 w-full">
                          <div className="w-full h-1.5 rounded-full bg-[#E8F0E2] dark:bg-[#032419] overflow-hidden">
                            <div
                              className="h-full bg-[#064E3B] dark:bg-[#10B981] rounded-full transition-all"
                              style={{ width: `${item.progressPercent}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(item.positionSec)}
                            </span>
                            <span>{item.progressPercent}%</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
