import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  History,
  Heart,
  ListMusic,
  Play,
  Leaf,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { StoryCard } from '../components/StoryCard';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';

const SAMPLE_FAVORITES = [
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
];

export const MyLibraryPage: React.FC = () => {
  const { user, api } = useAuth();
  const { playEpisode } = usePlayer();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab =
    (searchParams.get('tab') as 'favorites' | 'history' | 'playlists') || 'favorites';
  const [activeTab, setActiveTab] = useState<'favorites' | 'history' | 'playlists'>(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab') as any;
    if (tab && ['favorites', 'history', 'playlists'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'favorites' | 'history' | 'playlists') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const { data: userFavorites = [] } = useQuery({
    queryKey: ['library', 'favorites'],
    queryFn: () => api.library.getFavorites(),
    enabled: !!user,
  });

  const favoritesList = userFavorites.length > 0 ? userFavorites : SAMPLE_FAVORITES;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 bg-[#F8F5E9] dark:bg-[#033B2B] text-[#173D2E] dark:text-[#F8F5E9] transition-colors">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E8F0E2] dark:bg-[#083325] text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0] uppercase tracking-wider">
          <Leaf className="w-3.5 h-3.5 fill-current" />
          <span>My Personal Collection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-serif text-[#064E3B] dark:text-[#F8F5E9]">
          எனது நூலகம் (My Library)
        </h1>
        <p className="text-sm text-[#173D2E]/75 dark:text-stone-300 max-w-xl">
          நீங்கள் சேமித்த, விரும்பிய மற்றும் கேட்ட தமிழ் கதைகளின் தனிப்பயன் தொகுப்பு.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-[#E3DCBA] dark:border-[#124835] pb-3 overflow-x-auto">
        <button
          onClick={() => handleTabChange('favorites')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'favorites'
              ? 'bg-[#064E3B] text-white shadow-md'
              : 'text-[#173D2E] dark:text-stone-300 hover:bg-[#E8F0E2] dark:hover:bg-[#083325]'
          }`}
        >
          <Heart className="h-4 w-4" />
          <span>விருப்பங்கள் (Favorites) ({favoritesList.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('history')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-[#064E3B] text-white shadow-md'
              : 'text-[#173D2E] dark:text-stone-300 hover:bg-[#E8F0E2] dark:hover:bg-[#083325]'
          }`}
        >
          <History className="h-4 w-4" />
          <span>கேட்ட வரலாறு (History)</span>
        </button>

        <button
          onClick={() => handleTabChange('playlists')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'playlists'
              ? 'bg-[#064E3B] text-white shadow-md'
              : 'text-[#173D2E] dark:text-stone-300 hover:bg-[#E8F0E2] dark:hover:bg-[#083325]'
          }`}
        >
          <ListMusic className="h-4 w-4" />
          <span>வரிசைகள் (Playlists)</span>
        </button>
      </div>

      {/* Favorites Tab Content */}
      {activeTab === 'favorites' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favoritesList.map((story: any) => (
            <StoryCard
              key={story.id}
              id={story.id}
              slug={story.slug || story.id}
              title={story.title}
              authorName={story.authorName}
              coverImageUrl={story.coverImageUrl || story.coverImage}
              categoryName={story.categoryName}
              language={story.language}
              totalEpisodes={story.totalEpisodes || 1}
              totalDurationSeconds={story.totalDurationSeconds}
            />
          ))}
        </div>
      )}

      {/* History Tab Content */}
      {activeTab === 'history' && (
        <div className="space-y-4 max-w-3xl">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#083325] border border-[#E3DCBA] dark:border-[#124835] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/images/story-clever-crow.jpg"
                alt="Clever Crow"
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div>
                <h4 className="font-bold font-serif text-[#064E3B] dark:text-[#F8F5E9]">
                  காக்கையின் தாகம் (The Clever Crow)
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  பஞ்சதந்திரக் கதைகள் · 3 நிமிடங்கள் கேட்டது
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                playEpisode({
                  episodeId: 'ep-clever-crow',
                  title: 'காக்கையின் தாகம் (The Clever Crow)',
                  seriesTitle: 'பஞ்சதந்திரக் கதைகள்',
                  coverImageUrl: '/images/story-clever-crow.jpg',
                  narratorName: 'By Anzles Studio',
                  durationSec: 360,
                })
              }
              className="p-3 rounded-full bg-[#064E3B] text-white hover:bg-[#166534] transition-all"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </button>
          </div>
        </div>
      )}

      {/* Playlists Tab Content */}
      {activeTab === 'playlists' && (
        <div className="text-center py-12 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#E8F0E2] dark:bg-[#083325] text-[#064E3B] dark:text-[#A7F3D0] flex items-center justify-center mx-auto">
            <ListMusic className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold font-serif text-[#064E3B] dark:text-[#F8F5E9]">
            புதிய கதை வரிசை (Create Playlist)
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-300">
            உங்களுக்குப் பிடித்த கதைகளை ஒரு வரிசையில் தொகுத்து தொடர்ந்து கேளுங்கள்.
          </p>
          <Link
            to="/playlists"
            className="inline-block px-6 py-3 rounded-full bg-[#064E3B] text-white font-bold text-xs hover:bg-[#166534] shadow-md transition-all"
          >
            + புதிய வரிசை உருவாக்கு (New Playlist)
          </Link>
        </div>
      )}
    </div>
  );
};
