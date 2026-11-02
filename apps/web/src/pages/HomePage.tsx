import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  Play,
  Flame,
  BookOpen,
  Headphones,
  CheckCircle2,
  Compass,
  Sparkles,
  BookMarked,
  Scroll,
  UserCheck,
  HeartHandshake,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { COMPLETE_LIBRARY_CATALOG, type LibraryBook } from '../data/libraryCatalog';

interface ContinueListeningItem {
  id: string;
  title: string;
  author: string;
  progressPercent: number;
  coverImage: string;
  audioUrl?: string;
  durationSec: number;
}

const CONTINUE_LISTENING_DATA: ContinueListeningItem[] = [
  {
    id: 'ch-arthashastram',
    title: 'அர்த்தசாஸ்திரம்',
    author: 'சாணக்கியர்',
    progressPercent: 65,
    coverImage: '/images/story-bedtime.jpg',
    audioUrl: 'https://firebasestorage.googleapis.com/v0/b/vaagai-audio-books-36a4e.appspot.com/o/Arthashastram%2F01.mp3?alt=media&token=f23cdc19-d206-4e89-bd98-51dc916e7804',
    durationSec: 1417,
  },
  {
    id: 'ch-appusamy-africa',
    title: 'அப்புசாமியும் ஆப்பிரிக்க...',
    author: 'பாக்கியம் ராமசாமி',
    progressPercent: 42,
    coverImage: '/images/story-books-stack.jpg',
    audioUrl: 'https://firebasestorage.googleapis.com/v0/b/vaagai-audio-books-36a4e.appspot.com/o/Appusamiyum%20Africa%20Azhagiyum%2F00_Interview%20-%20Ja.Ra.Su.ogg?alt=media',
    durationSec: 1546,
  },
  {
    id: 'ch-arul-tharum',
    title: 'அருள் தரும் வாழ்க்கை',
    author: 'அன்னை உமாசர்',
    progressPercent: 20,
    coverImage: '/images/ship-sunset.jpg',
    audioUrl: 'https://firebasestorage.googleapis.com/v0/b/vaagai-audio-books-36a4e.appspot.com/o/Arul%20Tharum%20Annaiyar%2F01.ogg?alt=media',
    durationSec: 1200,
  },
  {
    id: 'ch-dasavatharam',
    title: 'தசாவதாரம்',
    author: 'வைணவன்',
    progressPercent: 78,
    coverImage: '/images/temple-sunset.jpg',
    audioUrl: 'https://firebasestorage.googleapis.com/v0/b/vaagai-audio-books-36a4e.appspot.com/o/Dasavatharam%2F01.ogg?alt=media',
    durationSec: 1380,
  },
];

interface TrendingStoryItem {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  slug: string;
  audioUrl?: string;
  durationSec?: number;
}

const TRENDING_TAMIL_STORIES: TrendingStoryItem[] = [
  {
    id: 'trending-1',
    title: 'பொன்னியின் செல்வன்',
    author: 'கல்கி',
    coverImage: '/images/story-historical.jpg',
    slug: 'ponniyin-selvan',
    durationSec: 1800,
  },
  {
    id: 'trending-2',
    title: 'சிலப்பதிகாரம்',
    author: 'இளங்கோ அடிகள்',
    coverImage: '/images/story-tamil-folk.jpg',
    slug: 'silapathikaram',
    durationSec: 1650,
  },
  {
    id: 'trending-3',
    title: 'திருக்குறள் கதைகள்',
    author: 'வள்ளுவர்',
    coverImage: '/images/story-motivational.jpg',
    slug: 'thirukkural-kathaigal',
    durationSec: 1420,
  },
  {
    id: 'trending-4',
    title: 'கடல் பயணம்',
    author: 'கலைச்செல்வன்',
    coverImage: '/images/ship-sunset.jpg',
    slug: 'kadal-payanam',
    durationSec: 1560,
  },
  {
    id: 'trending-5',
    title: 'கிருஷ்ணன் கதைகள்',
    author: 'பாகவதம்',
    coverImage: '/images/krishna.jpg',
    slug: 'krishna-stories',
    durationSec: 1900,
  },
  {
    id: 'trending-6',
    title: 'மதுரை வரலாறு',
    author: 'சுந்தர பாண்டியன்',
    coverImage: '/images/temple-sunset.jpg',
    slug: 'madurai-history',
    durationSec: 1740,
  },
  {
    id: 'trending-7',
    title: 'நரசிம்மர் புராணம்',
    author: 'புராணக்கதை',
    coverImage: '/images/story-clever-crow.jpg',
    slug: 'narasimha-puranam',
    durationSec: 1350,
  },
  {
    id: 'trending-8',
    title: 'நிலவின் கதைகள்',
    author: 'தமிழ் நாட்டுப்புறம்',
    coverImage: '/images/story-bedtime.jpg',
    slug: 'nilavin-kathaigal',
    durationSec: 1280,
  },
];

// Carousel Row Component with smooth left/right controls
const CarouselRow: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  viewAllLink: string;
  items: Array<{
    id: string;
    title: string;
    author: string;
    coverImage: string;
    slug?: string;
    audioUrl?: string;
    durationSec?: number;
  }>;
  onPlay: (item: any) => void;
}> = ({ title, subtitle, icon, viewAllLink, items, onPlay }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <section className="space-y-3 relative group/section">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-serif text-[#064E3B] dark:text-[#A7F3D0] inline-block">
              {title}
            </h2>
            <span className="hidden sm:inline-block ml-2 text-xs font-medium text-stone-500 dark:text-stone-400">
              {subtitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={viewAllLink}
            className="text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0] hover:underline flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div className="relative">
        {/* Left Arrow Button */}
        <button
          onClick={scrollLeft}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white dark:bg-[#073224] shadow-md border border-[#E3DCBA] dark:border-[#0F4738] text-stone-700 dark:text-stone-200 flex items-center justify-center opacity-0 group-hover/section:opacity-100 hover:scale-110 active:scale-95 transition-all"
          aria-label="Previous items"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Track */}
        <div
          ref={scrollRef}
          className="flex items-stretch gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-3 pt-1 -mx-2 px-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-36 sm:w-44 md:w-48 group cursor-pointer"
              onClick={() => onPlay(item)}
            >
              {/* Cover Card */}
              <div className="relative aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-stone-200 dark:bg-[#0A261D] shadow-sm group-hover:shadow-lg transition-all duration-300 border border-[#E3DCBA]/60 dark:border-[#0F4738]">
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/story-panchatantra.jpg';
                  }}
                />

                {/* Floating Play Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlay(item);
                  }}
                  className="absolute bottom-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/60 hover:bg-[#064E3B] text-white flex items-center justify-center shadow-md backdrop-blur-sm border border-white/20 transition-all group-hover:scale-110"
                  aria-label={`Play ${item.title}`}
                >
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </button>
              </div>

              {/* Title & Author */}
              <div className="mt-2 text-left">
                <p className="font-bold font-tamil text-xs sm:text-sm text-[#064E3B] dark:text-[#F8F5E9] truncate group-hover:text-[#166534] transition-colors">
                  {item.title}
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 font-tamil truncate">
                  {item.author}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={scrollRight}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white dark:bg-[#073224] shadow-md border border-[#E3DCBA] dark:border-[#0F4738] text-stone-700 dark:text-stone-200 flex items-center justify-center opacity-90 group-hover/section:opacity-100 hover:scale-110 active:scale-95 transition-all"
          aria-label="Next items"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { playEpisode } = usePlayer();

  const handlePlayStory = (item: any) => {
    playEpisode({
      episodeId: item.id || 'ep-1',
      title: item.title,
      seriesTitle: item.author || 'கதைசொல்லி',
      coverImage: item.coverImage,
      coverImageUrl: item.coverImage,
      narratorName: item.author,
      audioUrl: item.audioUrl || 'https://firebasestorage.googleapis.com/v0/b/vaagai-audio-books-36a4e.appspot.com/o/Arthashastram%2F01.mp3?alt=media&token=f23cdc19-d206-4e89-bd98-51dc916e7804',
      durationSec: item.durationSec || 1200,
    });
  };

  // Convert catalog books to carousel format
  const popularTamilAudiobooks = COMPLETE_LIBRARY_CATALOG.slice(0, 10).map((b, i) => {
    const covers = [
      '/images/temple-sunset.jpg',
      '/images/story-books-stack.jpg',
      '/images/ship-sunset.jpg',
      '/images/krishna.jpg',
      '/images/story-bedtime.jpg',
      '/images/story-tamil-folk.jpg',
      '/images/story-motivational.jpg',
      '/images/story-historical.jpg',
    ];
    return {
      id: b.id,
      title: b.tamilTitle || b.title,
      author: b.authorName,
      coverImage: covers[i % covers.length],
      slug: b.slug,
      audioUrl: b.chapters?.[0]?.audioUrl,
      durationSec: b.totalDurationSeconds || 1200,
    };
  });

  const englishAudiobooks = COMPLETE_LIBRARY_CATALOG.filter((b) => b.language === 'English')
    .slice(0, 10)
    .map((b, i) => ({
      id: b.id,
      title: b.title,
      author: b.authorName,
      coverImage: ['/images/story-books-stack.jpg', '/images/ship-sunset.jpg'][i % 2],
      slug: b.slug,
      audioUrl: b.chapters?.[0]?.audioUrl,
      durationSec: b.totalDurationSeconds || 1200,
    }));

  const mythologyStories = COMPLETE_LIBRARY_CATALOG.filter((b) => b.category === 'Mythology')
    .slice(0, 10)
    .map((b, i) => ({
      id: b.id,
      title: b.tamilTitle || b.title,
      author: b.authorName,
      coverImage: ['/images/krishna.jpg', '/images/temple-sunset.jpg'][i % 2],
      slug: b.slug,
      audioUrl: b.chapters?.[0]?.audioUrl,
      durationSec: b.totalDurationSeconds || 1200,
    }));

  const biographyStories = COMPLETE_LIBRARY_CATALOG.filter((b) => b.category === 'Biography')
    .slice(0, 10)
    .map((b, i) => ({
      id: b.id,
      title: b.tamilTitle || b.title,
      author: b.authorName,
      coverImage: ['/images/story-motivational.jpg', '/images/story-historical.jpg'][i % 2],
      slug: b.slug,
      audioUrl: b.chapters?.[0]?.audioUrl,
      durationSec: b.totalDurationSeconds || 1200,
    }));

  const literatureStories = COMPLETE_LIBRARY_CATALOG.filter((b) => b.category === 'Literature')
    .slice(0, 10)
    .map((b, i) => ({
      id: b.id,
      title: b.tamilTitle || b.title,
      author: b.authorName,
      coverImage: ['/images/story-tamil-folk.jpg', '/images/ship-sunset.jpg'][i % 2],
      slug: b.slug,
      audioUrl: b.chapters?.[0]?.audioUrl,
      durationSec: b.totalDurationSeconds || 1200,
    }));

  const selfHelpStories = COMPLETE_LIBRARY_CATALOG.filter((b) => b.category === 'Self Help' || b.category === 'Motivation')
    .slice(0, 10)
    .map((b, i) => ({
      id: b.id,
      title: b.tamilTitle || b.title,
      author: b.authorName,
      coverImage: ['/images/story-bedtime.jpg', '/images/story-books-stack.jpg'][i % 2],
      slug: b.slug,
      audioUrl: b.chapters?.[0]?.audioUrl,
      durationSec: b.totalDurationSeconds || 1200,
    }));

  return (
    <div className="min-h-screen bg-[#FAF7EE] dark:bg-[#03261C] text-[#173D2E] dark:text-[#F8F5E9] transition-colors relative overflow-hidden pb-28">
      {/* Subtle Decorative Botanical Sprigs in Background */}
      <div className="absolute top-48 left-0 w-32 h-64 opacity-20 pointer-events-none -translate-x-12 hidden lg:block">
        <svg viewBox="0 0 100 200" fill="none" stroke="#064E3B" strokeWidth="2" className="w-full h-full">
          <path d="M10,200 Q40,120 20,40" />
          <path d="M20,160 Q60,150 70,130 Q50,140 20,160" fill="#064E3B" opacity="0.4" />
          <path d="M25,120 Q65,100 80,80 Q55,100 25,120" fill="#064E3B" opacity="0.4" />
          <path d="M20,70 Q55,50 65,30 Q45,50 20,70" fill="#064E3B" opacity="0.4" />
        </svg>
      </div>

      <div className="absolute top-48 right-0 w-32 h-64 opacity-20 pointer-events-none translate-x-12 hidden lg:block scale-x-[-1]">
        <svg viewBox="0 0 100 200" fill="none" stroke="#064E3B" strokeWidth="2" className="w-full h-full">
          <path d="M10,200 Q40,120 20,40" />
          <path d="M20,160 Q60,150 70,130 Q50,140 20,160" fill="#064E3B" opacity="0.4" />
          <path d="M25,120 Q65,100 80,80 Q55,100 25,120" fill="#064E3B" opacity="0.4" />
          <path d="M20,70 Q55,50 65,30 Q45,50 20,70" fill="#064E3B" opacity="0.4" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-10 sm:space-y-12">
        {/* ================= HERO SECTION (Matching Reference Image) ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Headline & Action Controls */}
          <div className="lg:col-span-6 space-y-5">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E2EFE9] dark:bg-[#073829] border border-[#C5DDD1] dark:border-[#0E4738] text-[#064E3B] dark:text-[#A7F3D0] text-xs font-bold uppercase tracking-wider">
              <span className="text-base leading-none">🌱</span>
              <span>BY ANZLES · 100% FREE PLATFORM</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black font-serif tracking-tight text-[#064E3B] dark:text-[#A7F3D0] leading-[1.12]">
              Explore Stories <br />
              <span className="text-[#064E3B] dark:text-white">in Tamil</span>
            </h1>

            {/* Description */}
            <p className="text-stone-700 dark:text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Discover a magical world of timeless Tamil folktales, captivating bedtime fables, and inspiring cultural sagas. Immerse your family in reading or listening to original stories anytime, anywhere — completely free.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 rounded-full bg-[#064E3B] hover:bg-[#166534] text-white font-bold text-sm shadow-lg shadow-emerald-950/20 hover:scale-105 active:scale-95 transition-all"
              >
                <span>Get Started</span>
                <ChevronRight className="w-4 h-4" />
              </Link>

              <Link
                to="/library"
                className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 rounded-full bg-white dark:bg-[#073224] border border-[#064E3B]/30 hover:border-[#064E3B] text-[#064E3B] dark:text-[#A7F3D0] font-bold text-sm shadow-sm hover:scale-105 active:scale-95 transition-all"
              >
                <Compass className="w-4 h-4 text-[#064E3B] dark:text-[#A7F3D0]" />
                <span>Explore Catalog</span>
              </Link>
            </div>

            {/* 3 Benefit Checkmarks */}
            <div className="pt-3 flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-semibold text-[#064E3B] dark:text-[#A7F3D0]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Zero Subscription Fees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Original Storybook Art</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Professional Tamil Audio</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Storybook Artwork (Rounded 32px matching screenshot) */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-lg lg:max-w-none rounded-[32px] overflow-hidden border-4 border-white dark:border-[#0F4738] shadow-2xl aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10] group">
              <img
                src="/images/hero-art.jpg"
                alt="Enchanted Storybook in Tamil Forest"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </section>

        {/* ================= 1. CONTINUE LISTENING (4 Cards Matching Screenshot) ================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-[#064E3B] dark:text-[#A7F3D0]" />
              <div>
                <h2 className="text-lg sm:text-xl font-bold font-serif text-[#064E3B] dark:text-[#A7F3D0] inline-block">
                  Continue Listening
                </h2>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium text-stone-500 dark:text-stone-400">
                  Pick up where you left off
                </span>
              </div>
            </div>

            <Link
              to="/library"
              className="text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0] hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CONTINUE_LISTENING_DATA.map((card) => (
              <div
                key={card.id}
                onClick={() => handlePlayStory(card)}
                className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#073224] border border-[#E3DCBA] dark:border-[#0F4738] shadow-sm hover:shadow-md hover:border-[#064E3B] transition-all cursor-pointer group"
              >
                {/* Left Thumbnail */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-stone-200 dark:bg-[#0A261D] flex-shrink-0 shadow-sm border border-[#E3DCBA]/60 dark:border-[#0F4738]">
                  <img
                    src={card.coverImage}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/story-panchatantra.jpg';
                    }}
                  />
                </div>

                {/* Middle Info + Progress */}
                <div className="flex-1 min-w-0 pr-1">
                  <h3 className="font-bold font-tamil text-sm text-[#064E3B] dark:text-[#F8F5E9] truncate group-hover:text-[#166534] transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-tamil truncate mt-0.5">
                    {card.author}
                  </p>

                  {/* Progress Bar & Percentage */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1 bg-stone-200 dark:bg-[#144738] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#10B981] rounded-full"
                        style={{ width: `${card.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 font-medium">
                      {card.progressPercent}%
                    </span>
                  </div>
                </div>

                {/* Right Circular Play Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayStory(card);
                  }}
                  className="w-8 h-8 rounded-full bg-[#064E3B] text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all flex-shrink-0"
                  aria-label={`Play ${card.title}`}
                >
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ================= 2. TRENDING TAMIL STORIES (Matching Screenshot) ================= */}
        <CarouselRow
          title="Trending Tamil Stories"
          subtitle="Most loved audio stories by our listeners"
          icon={<Flame className="w-5 h-5 text-amber-500 fill-amber-500" />}
          viewAllLink="/explore"
          items={TRENDING_TAMIL_STORIES}
          onPlay={handlePlayStory}
        />

        {/* ================= 3. POPULAR TAMIL AUDIOBOOKS (Matching Screenshot) ================= */}
        <CarouselRow
          title="Popular Tamil Audiobooks"
          subtitle="Handpicked and widely listened audiobooks"
          icon={<BookOpen className="w-5 h-5 text-[#064E3B] dark:text-[#A7F3D0]" />}
          viewAllLink="/library"
          items={popularTamilAudiobooks}
          onPlay={handlePlayStory}
        />

        {/* ================= 4. ENGLISH AUDIOBOOKS ================= */}
        {englishAudiobooks.length > 0 && (
          <CarouselRow
            title="English Audiobooks"
            subtitle="Great classics and inspiring stories in English"
            icon={<BookMarked className="w-5 h-5 text-[#064E3B] dark:text-[#A7F3D0]" />}
            viewAllLink="/library"
            items={englishAudiobooks}
            onPlay={handlePlayStory}
          />
        )}

        {/* ================= 5. MYTHOLOGY (புராணங்கள்) ================= */}
        {mythologyStories.length > 0 && (
          <CarouselRow
            title="Mythology (புராணங்கள்)"
            subtitle="Epics, divine lore, and timeless mythology stories"
            icon={<Sparkles className="w-5 h-5 text-amber-600" />}
            viewAllLink="/categories"
            items={mythologyStories}
            onPlay={handlePlayStory}
          />
        )}

        {/* ================= 6. BIOGRAPHY (வாழ்க்கை வரலாறு) ================= */}
        {biographyStories.length > 0 && (
          <CarouselRow
            title="Biography (வாழ்க்கை வரலாறு)"
            subtitle="Inspiring true stories of legends and leaders"
            icon={<UserCheck className="w-5 h-5 text-[#064E3B] dark:text-[#A7F3D0]" />}
            viewAllLink="/categories"
            items={biographyStories}
            onPlay={handlePlayStory}
          />
        )}

        {/* ================= 7. LITERATURE (இலக்கியம்) ================= */}
        {literatureStories.length > 0 && (
          <CarouselRow
            title="Literature (இலக்கியம்)"
            subtitle="Rich classical and contemporary Tamil literature"
            icon={<Scroll className="w-5 h-5 text-[#064E3B] dark:text-[#A7F3D0]" />}
            viewAllLink="/categories"
            items={literatureStories}
            onPlay={handlePlayStory}
          />
        )}

        {/* ================= 8. SELF HELP & MOTIVATION ================= */}
        {selfHelpStories.length > 0 && (
          <CarouselRow
            title="Self Help (சுயமுன்னேற்றம்)"
            subtitle="Mindset, success habits, and peaceful living"
            icon={<HeartHandshake className="w-5 h-5 text-[#064E3B] dark:text-[#A7F3D0]" />}
            viewAllLink="/categories"
            items={selfHelpStories}
            onPlay={handlePlayStory}
          />
        )}

        {/* ================= 9. RECENTLY ADDED ================= */}
        <CarouselRow
          title="Recently Added (புதிய வரவுகள்)"
          subtitle="Latest releases added to Kathaisolli"
          icon={<Clock className="w-5 h-5 text-[#064E3B] dark:text-[#A7F3D0]" />}
          viewAllLink="/explore"
          items={popularTamilAudiobooks.slice().reverse()}
          onPlay={handlePlayStory}
        />
      </div>
    </div>
  );
};
