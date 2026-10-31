import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ChevronRight,
  Play,
  Flame,
  BookMarked,
  History,
  RefreshCw,
  AlertCircle,
  Leaf,
  Compass,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { StoryCard } from '../components/StoryCard';
import { CategoryPill } from '../components/CategoryPill';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';

const DEFAULT_HOME_STORIES = [
  {
    id: 'panchatantra-stories',
    slug: 'panchatantra-stories',
    title: 'பஞ்சதந்திரக் கதைகள் (Panchatantra)',
    authorName: 'விஷ்ணு சர்மா',
    coverImageUrl: '/images/story-panchatantra.jpg',
    categoryName: 'Moral Stories',
    language: 'தமிழ்',
    totalEpisodes: 18,
    totalDurationSeconds: 4200,
  },
  {
    id: 'tamil-folk-tales',
    slug: 'tamil-folk-tales',
    title: 'தமிழ் நாடோடிக் கதைகள் (Tamil Folk Tales)',
    authorName: 'நாட்டுப்புறப் பாடல் மரபு',
    coverImageUrl: '/images/story-tamil-folk.jpg',
    categoryName: 'Culture & Tradition',
    language: 'தமிழ்',
    totalEpisodes: 24,
    totalDurationSeconds: 5100,
  },
  {
    id: 'bedtime-stories',
    slug: 'bedtime-stories',
    title: 'தாலாட்டுக் கதைகள் (Bedtime Stories)',
    authorName: 'அம்மா சொல்லும் கதைகள்',
    coverImageUrl: '/images/story-bedtime.jpg',
    categoryName: 'For Kids',
    language: 'தமிழ்',
    totalEpisodes: 32,
    totalDurationSeconds: 6400,
  },
  {
    id: 'historical-stories',
    slug: 'historical-stories',
    title: 'சோழர் வரலாற்று காவியங்கள் (Chola Epics)',
    authorName: 'கல்கி கிருஷ்ணமூர்த்தி',
    coverImageUrl: '/images/story-historical.jpg',
    categoryName: 'Tamil History',
    language: 'தமிழ்',
    totalEpisodes: 15,
    totalDurationSeconds: 7800,
  },
  {
    id: 'motivational-stories',
    slug: 'motivational-stories',
    title: 'திருவள்ளுவர் தன்னம்பிக்கைக் கதைகள்',
    authorName: 'தமிழ்த்தென்றல் திரு.வி.க',
    coverImageUrl: '/images/story-motivational.jpg',
    categoryName: 'Life Lessons',
    language: 'தமிழ்',
    totalEpisodes: 20,
    totalDurationSeconds: 4500,
  },
  {
    id: 'clever-crow',
    slug: 'clever-crow',
    title: 'காக்கையின் தாகம் (The Clever Crow)',
    authorName: 'ஈசாப் & பஞ்சதந்திரம்',
    coverImageUrl: '/images/story-clever-crow.jpg',
    categoryName: 'Moral Stories',
    language: 'தமிழ்',
    totalEpisodes: 1,
    totalDurationSeconds: 360,
  },
];

export const HomePage: React.FC = () => {
  const { user, api } = useAuth();
  const { currentEpisode, isPlaying, playEpisode } = usePlayer();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const {
    data: homeData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['catalog', 'home'],
    queryFn: () => api.catalog.getHome(),
  });

  const featured = homeData?.featured || homeData?.featuredSeries || [];
  const latest = homeData?.latest || homeData?.trendingSeries || [];

  const apiStories = [...featured, ...latest].filter(
    (item, index, self) => index === self.findIndex((t) => t.id === item.id),
  );

  const displayStories = apiStories.length > 0 ? apiStories : DEFAULT_HOME_STORIES;

  const filteredStories =
    selectedCategory === 'all'
      ? displayStories
      : displayStories.filter(
          (s: any) =>
            s.category?.slug === selectedCategory ||
            s.categoryName === selectedCategory,
        );

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 bg-[#F8F5E9] dark:bg-[#033B2B] text-[#173D2E] dark:text-[#F8F5E9] transition-colors">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#064E3B] via-[#166534] to-[#033B2B] p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl border-2 border-[#D6A83F]/30">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E8F0E2]/20 backdrop-blur-md text-[#A7F3D0] text-xs font-bold uppercase tracking-wider">
            <Leaf className="h-3.5 w-3.5 fill-current" />
            <span>By Anzles · 100% Free Tamil Storytelling</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight">
            {user ? `வணக்கம், ${user.displayName || 'நேயரே'}!` : 'வணக்கம்! கதைசொல்லிக்கு நல்வரவு!'}
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            இன்றைய நாளுக்கான சிறந்த தமிழ் ஒலிப்புத்தகங்கள், பஞ்சதந்திர கதைகள் மற்றும் காவியங்களை உடனே கேட்கத் தொடங்குங்கள்.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-[#064E3B] font-bold text-xs hover:bg-[#E8F0E2] transition-all shadow-md"
            >
              <span>கதைகளை உலாவுங்கள்</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Continue Listening Shelf */}
      {currentEpisode && (
        <section className="bg-white dark:bg-[#083325] rounded-3xl p-6 border-2 border-[#E3DCBA] dark:border-[#124835] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-[#064E3B] dark:text-[#A7F3D0]" />
              <h2 className="text-lg font-bold font-serif text-[#064E3B] dark:text-[#F8F5E9]">
                தொடர்ந்து கேட்க (Continue Listening)
              </h2>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#F8F5E9] dark:bg-[#033B2B] border border-[#E3DCBA] dark:border-[#124835]">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <img
                src={currentEpisode.coverImageUrl || '/images/story-clever-crow.jpg'}
                alt={currentEpisode.title}
                className="w-16 h-16 rounded-xl object-cover shadow-sm"
              />
              <div>
                <h3 className="font-bold font-serif text-sm sm:text-base text-[#064E3B] dark:text-[#F8F5E9]">
                  {currentEpisode.title}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-300">
                  {currentEpisode.seriesTitle || 'Kathaisolli Series'}
                </p>
              </div>
            </div>
            <Link
              to="/player"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#064E3B] hover:bg-[#166534] text-white text-xs font-bold transition-all shadow-md"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Continue Listening</span>
            </Link>
          </div>
        </section>
      )}

      {/* Category Filter Pills */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#166534] dark:text-[#A7F3D0]">
            <Leaf className="w-3.5 h-3.5 fill-current" />
            <span>Stories By Category</span>
          </div>
          <Link
            to="/categories"
            className="text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0] hover:underline"
          >
            All Categories →
          </Link>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['all', 'Moral Stories', 'Culture & Tradition', 'For Kids', 'Tamil History', 'Life Lessons'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#064E3B] text-white shadow-md'
                  : 'bg-white dark:bg-[#083325] border border-[#E3DCBA] dark:border-[#124835] text-[#173D2E] dark:text-stone-200 hover:bg-[#E8F0E2] dark:hover:bg-[#0d4432]'
              }`}
            >
              {cat === 'all' ? 'அனைத்தும் (All)' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-black font-serif text-[#064E3B] dark:text-[#F8F5E9]">
            பிரபலமான கதைகள் (Popular Stories)
          </h2>
          <Link
            to="/explore"
            className="text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0] hover:underline"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
          {filteredStories.map((story: any) => (
            <StoryCard
              key={story.id}
              id={story.id}
              slug={story.slug || story.id}
              title={story.title}
              authorName={story.authorName}
              coverImageUrl={story.coverImageUrl || story.coverImage}
              categoryName={story.categoryName || story.category?.name}
              language={story.language}
              totalEpisodes={story.totalEpisodes || 1}
              totalDurationSeconds={story.totalDurationSeconds}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
