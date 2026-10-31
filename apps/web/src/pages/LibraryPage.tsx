import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { History, Heart, ListMusic, Play, Trash2, Plus, Clock, UserCheck, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StoryCard } from '../components/StoryCard';
import { EmptyState } from '../components/EmptyState';
import { StoryGridSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';

export const LibraryPage: React.FC = () => {
  const { user, api } = useAuth();
  const { currentEpisode, isPlaying, playEpisode } = usePlayer();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const initialTab = (searchParams.get('tab') as 'continue' | 'favorites' | 'history' | 'playlists') || 'continue';
  const [activeTab, setActiveTab] = useState<'continue' | 'favorites' | 'history' | 'playlists'>(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab') as any;
    if (tab && ['continue', 'favorites', 'history', 'playlists'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'continue' | 'favorites' | 'history' | 'playlists') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Queries for authenticated user
  const { data: continueListening = [], isLoading: loadingContinue } = useQuery({
    queryKey: ['library', 'continue-listening'],
    queryFn: () => api.library.getContinueListening(),
    enabled: !!user,
  });

  const { data: favorites = [], isLoading: loadingFavorites } = useQuery({
    queryKey: ['library', 'favorites'],
    queryFn: () => api.library.getFavorites(),
    enabled: !!user,
  });

  const { data: history = [], isLoading: loadingHistory } = useQuery({
    queryKey: ['library', 'history'],
    queryFn: () => api.library.getHistory(),
    enabled: !!user,
  });

  const { data: playlists = [], isLoading: loadingPlaylists } = useQuery({
    queryKey: ['playlists', 'list'],
    queryFn: () => api.playlists.list(),
    enabled: !!user,
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (seriesId: string) => api.library.removeFavorite(seriesId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'favorites'] });
    },
  });

  if (!user) {
    return (
      <div className="py-20 px-4 max-w-lg mx-auto text-center space-y-5">
        <div className="h-16 w-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 mx-auto">
          <Heart className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
          உங்கள் நூலகம் (Your Library)
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          விருப்பமான கதைகளைச் சேமிக்கவும், கேட்ட வரலாற்றைப் பார்க்கவும் இலவச கணக்கில் உள்நுழையவும்.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-colors"
          >
            உள்நுழைக (Sign In)
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-3 rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold text-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
          >
            இலவச பதிவு (Register)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
          எனது நூலகம் (My Library)
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          நீங்கள் சேமித்த, கேட்ட மற்றும் உருவாக்கிய ஆடியோ கதைகள்
        </p>
      </div>

      {/* Library Tabs */}
      <div className="flex items-center gap-2 border-b border-emerald-100 dark:border-emerald-900/40 pb-2 overflow-x-auto">
        <button
          onClick={() => handleTabChange('continue')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'continue'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
          }`}
        >
          <Play className="h-4 w-4" />
          <span>தொடர்ந்து கேட்க</span>
        </button>

        <button
          onClick={() => handleTabChange('favorites')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'favorites'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
          }`}
        >
          <Heart className="h-4 w-4" />
          <span>விருப்பங்கள் ({favorites.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'history'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
          }`}
        >
          <History className="h-4 w-4" />
          <span>கேட்ட வரலாறு ({history.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('playlists')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'playlists'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
          }`}
        >
          <ListMusic className="h-4 w-4" />
          <span>பிளேலிஸ்ட்கள் ({playlists.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'continue' && (
          <div className="space-y-6">
            {loadingContinue && <StoryGridSkeleton count={4} />}

            {!loadingContinue && continueListening.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {continueListening.map((item: any) => (
                  <div
                    key={item.episodeId}
                    className="p-5 rounded-2xl bg-white dark:bg-[#14231E] border border-emerald-100 dark:border-emerald-900/40 shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        அத்தியாயம் {item.episodeNumber || ''}
                      </span>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base mt-1">
                        {item.episodeTitle || 'அத்தியாயம்'}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {item.series?.title || 'கதைசொல்லி'}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-emerald-50 dark:border-emerald-900/30">
                      <span className="text-xs text-zinc-400">
                        {Math.floor((item.positionSec || 0) / 60)} / {Math.floor((item.durationSec || 60) / 60)} நிமி
                      </span>
                      <button
                        onClick={() =>
                          playEpisode(
                            {
                              episodeId: item.episodeId,
                              title: item.episodeTitle,
                              seriesId: item.series?.id,
                              seriesTitle: item.series?.title,
                              coverImage: item.series?.coverImage,
                              durationSec: item.durationSec,
                            },
                            item.series?.id
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>தொடர்க</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : !loadingContinue ? (
              <EmptyState
                icon={Play}
                title="தொடர்ந்து கேட்க கதைகள் இல்லை"
                tamilTitle="No in-progress stories"
                description="நீங்கள் கேட்கத் தொடங்கும் கதைகள் தானாகவே இங்கு தோன்றும்."
                actionLabel="கதைகளை உலாவுங்கள்"
                actionHref="/explore"
              />
            ) : null}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="space-y-6">
            {loadingFavorites && <StoryGridSkeleton count={4} />}

            {!loadingFavorites && favorites.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {favorites.map((fav: any) => (
                  <div key={fav.favoriteId || fav.id} className="relative group">
                    <StoryCard
                      id={fav.id}
                      slug={fav.slug}
                      title={fav.title}
                      authorName={fav.authorName}
                      coverImage={fav.coverImage}
                      categoryName={fav.category?.name}
                    />
                    <button
                      onClick={() => removeFavoriteMutation.mutate(fav.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      title="விருப்பங்களில் இருந்து நீக்கு"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : !loadingFavorites ? (
              <EmptyState
                icon={Heart}
                title="விருப்பமான கதைகள் எதுவும் சேர்க்கப்படவில்லை"
                description="கதை விவரப் பக்கத்தில் உள்ள இதயக் குறியீட்டை அழுத்தி விருப்பங்களில் சேர்க்கலாம்."
                actionLabel="கதைகளை உலாவுங்கள்"
                actionHref="/explore"
              />
            ) : null}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            {loadingHistory && <StoryGridSkeleton count={4} />}

            {!loadingHistory && history.length > 0 ? (
              <div className="divide-y divide-emerald-50 dark:divide-emerald-900/30 bg-white dark:bg-[#14231E] rounded-3xl p-6 border border-emerald-100 dark:border-emerald-900/40 shadow-sm">
                {history.map((item: any) => (
                  <div key={item.progressId || item.id} className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {item.series?.title}
                      </span>
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base mt-0.5">
                        {item.episode?.title}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>கேட்ட நேரம்: {new Date(item.lastPlayedAt).toLocaleDateString('ta-IN')}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => playEpisode(item.episode?.id, item.series?.id)}
                      className="p-3 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white transition-colors shrink-0"
                    >
                      <Play className="h-4 w-4 fill-current ml-0.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : !loadingHistory ? (
              <EmptyState
                icon={History}
                title="கேட்ட வரலாறு எதுவும் இல்லை"
                description="நீங்கள் கேட்கும் கதைகள் தானாகவே வரலாற்றில் பதிவாகும்."
                actionLabel="கேட்கத் தொடங்குங்கள்"
                actionHref="/explore"
              />
            ) : null}
          </div>
        )}

        {activeTab === 'playlists' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-zinc-500">உங்கள் பிரத்யேக ஆடியோ தொகுப்புகள்</p>
              <Link
                to="/playlists"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-600"
              >
                <Plus className="h-4 w-4" />
                <span>புதிய பிளேலிஸ்ட்</span>
              </Link>
            </div>

            {loadingPlaylists && <StoryGridSkeleton count={3} />}

            {!loadingPlaylists && playlists.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {playlists.map((pl: any) => (
                  <Link
                    key={pl.id}
                    to={`/playlists?id=${pl.id}`}
                    className="p-6 rounded-2xl bg-white dark:bg-[#14231E] border border-emerald-100 dark:border-emerald-900/40 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300 mb-3">
                      <ListMusic className="h-6 w-6" />
                    </div>
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{pl.title}</h4>
                    {pl.description && <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{pl.description}</p>}
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-3 font-semibold">
                      {pl.items?.length || 0} கதைகள்
                    </p>
                  </Link>
                ))}
              </div>
            ) : !loadingPlaylists ? (
              <EmptyState
                icon={ListMusic}
                title="பிளேலிஸ்ட் எதுவும் இல்லை"
                description="உங்களுக்கு பிடித்த கதைகளை தனித்தனி தொகுப்பாக உருவாக்கலாம்."
                actionLabel="புதிய பிளேலிஸ்ட் உருவாக்குங்கள்"
                actionHref="/playlists"
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
