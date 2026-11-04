import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  History,
  Heart,
  ListMusic,
  Play,
  Leaf,
  Trash2,
  Bookmark,
  Clock,
  BookOpen,
  ArrowRight,
  Headphones,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { StoryCard } from '../components/StoryCard';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { getSavedBooks, removeBook, type SavedBookItem } from '../services/userLibrary';
import { formatDuration } from '@kathaisolli/shared-utils';

export const MyLibraryPage: React.FC = () => {
  const { user, api } = useAuth();
  const { playEpisode } = usePlayer();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab =
    (searchParams.get('tab') as 'saved' | 'favorites' | 'history' | 'playlists') || 'saved';
  const [activeTab, setActiveTab] = useState<'saved' | 'favorites' | 'history' | 'playlists'>(initialTab);

  const [savedBooks, setSavedBooks] = useState<SavedBookItem[]>(() => getSavedBooks(user?.id));

  // Sync saved books with user changes and cross-tab/component updates
  useEffect(() => {
    const refresh = () => setSavedBooks(getSavedBooks(user?.id));
    refresh();
    window.addEventListener('kathaisolli:library-updated', refresh);
    return () => window.removeEventListener('kathaisolli:library-updated', refresh);
  }, [user?.id]);

  useEffect(() => {
    const tab = searchParams.get('tab') as any;
    if (tab && ['saved', 'favorites', 'history', 'playlists'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'saved' | 'favorites' | 'history' | 'playlists') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleRemove = (bookId: string) => {
    const updated = removeBook(bookId, user?.id, api);
    setSavedBooks(updated);
  };

  const handleContinueListening = (book: SavedBookItem) => {
    playEpisode({
      episodeId: book.lastEpisodeId || book.id,
      title: book.lastEpisodeTitle || book.title,
      seriesId: book.id,
      seriesTitle: book.title,
      coverImageUrl: book.coverImageUrl || '/images/temple-sunset.jpg',
      narratorName: book.authorName || 'By Anzles Studio',
      durationSec: book.durationSec || 600,
    }, book.id);
  };

  const { data: userFavorites = [] } = useQuery({
    queryKey: ['library', 'favorites'],
    queryFn: () => api.library.getFavorites(),
    enabled: !!user,
  });

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 bg-[#F8F5E9] dark:bg-[#033B2B] text-[#173D2E] dark:text-[#F8F5E9] transition-colors min-h-[75vh]">
      {/* Header */}
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
          onClick={() => handleTabChange('saved')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'saved'
              ? 'bg-[#064E3B] text-white shadow-md'
              : 'text-[#173D2E] dark:text-stone-300 hover:bg-[#E8F0E2] dark:hover:bg-[#083325]'
          }`}
        >
          <Bookmark className="h-4 w-4" />
          <span>சேமித்த புத்தகங்கள் (Saved) ({savedBooks.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('favorites')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'favorites'
              ? 'bg-[#064E3B] text-white shadow-md'
              : 'text-[#173D2E] dark:text-stone-300 hover:bg-[#E8F0E2] dark:hover:bg-[#083325]'
          }`}
        >
          <Heart className="h-4 w-4" />
          <span>விருப்பங்கள் (Favorites) ({userFavorites.length})</span>
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

      {/* Saved Books Tab Content */}
      {activeTab === 'saved' && (
        <>
          {savedBooks.length === 0 ? (
            /* Friendly Empty State Required by Prompt */
            <div className="text-center py-16 px-4 bg-white dark:bg-[#083325] rounded-3xl border border-[#E3DCBA] dark:border-[#124835] space-y-5 max-w-lg mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[#E8F0E2] dark:bg-[#04261B] text-[#064E3B] dark:text-[#A7F3D0] flex items-center justify-center mx-auto shadow-inner">
                <Bookmark className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-serif text-[#064E3B] dark:text-[#F8F5E9]">
                  உங்கள் நூலகம் காலியாக உள்ளது
                </h3>
                <p className="text-xs sm:text-sm text-[#173D2E]/70 dark:text-stone-300">
                  Your library is empty. Save an audiobook to listen later.
                </p>
              </div>
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#064E3B] hover:bg-[#166534] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#064E3B]/20 transition-all hover:scale-105"
              >
                <span>கதைகளை உலாவு (Explore Audiobooks)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedBooks.map((book) => {
                const pos = book.progressSec || 0;
                const dur = book.durationSec || book.totalDurationSeconds || 0;
                const percent = dur > 0 ? Math.min(100, Math.round((pos / dur) * 100)) : 0;

                return (
                  <div
                    key={book.id}
                    className="flex flex-col rounded-2xl bg-white dark:bg-[#083325] border border-[#E3DCBA] dark:border-[#124835] shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="p-4 flex gap-4">
                      {/* Audio Icon Badge */}
                      <Link
                        to={`/stories/${book.slug || book.id}`}
                        className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#064E3B] to-[#0A261D] flex items-center justify-center flex-shrink-0 shadow border border-[#145642] hover:opacity-90"
                      >
                        <Headphones className="w-8 h-8 text-[#A7F3D0]" />
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          {book.categoryName && (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F0E2] dark:bg-[#064E3B] text-[#064E3B] dark:text-[#A7F3D0] mb-1">
                              {book.categoryName}
                            </span>
                          )}
                          <Link to={`/stories/${book.slug || book.id}`}>
                            <h3 className="text-sm font-bold font-serif text-[#064E3B] dark:text-[#F8F5E9] hover:underline truncate">
                              {book.title}
                            </h3>
                          </Link>
                          {book.authorName && (
                            <p className="text-xs text-[#173D2E]/70 dark:text-stone-300 truncate">
                              {book.authorName}
                            </p>
                          )}
                        </div>

                        {/* Listening Progress Bar */}
                        <div className="space-y-1 pt-2">
                          <div className="flex justify-between text-[10px] font-mono text-stone-500 dark:text-stone-400">
                            <span>
                              {pos > 0 ? `கேட்டது: ${formatDuration(pos)}` : 'தொடங்கவில்லை'}
                            </span>
                            <span>{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#10B981] rounded-full transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="px-4 py-3 bg-[#FAF7EE] dark:bg-[#04261B] border-t border-[#E3DCBA]/60 dark:border-[#124835] flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleContinueListening(book)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#064E3B] hover:bg-[#166534] text-white text-xs font-bold shadow-sm transition-all hover:scale-105"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{pos > 0 ? 'தொடர்ந்து கேள் (Continue)' : 'கேள் (Play)'}</span>
                      </button>

                      <button
                        onClick={() => handleRemove(book.id)}
                        className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="நூலகத்திலிருந்து நீக்கு (Remove from Library)"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Favorites Tab Content */}
      {activeTab === 'favorites' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {userFavorites.length > 0 ? (
            userFavorites.map((story: any) => (
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
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-sm text-stone-500">
              விருப்பமான கதைகள் எதுவும் சேர்க்கப்படவில்லை.
            </div>
          )}
        </div>
      )}

      {/* History Tab Content */}
      {activeTab === 'history' && (
        <div className="space-y-4 max-w-3xl">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#083325] border border-[#E3DCBA] dark:border-[#124835] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#064E3B] flex items-center justify-center flex-shrink-0 border border-[#145642]">
                <Headphones className="w-6 h-6 text-[#A7F3D0]" />
              </div>
              <div>
                <h4 className="font-bold font-serif text-[#064E3B] dark:text-[#F8F5E9]">
                  அர்த்தசாஸ்திரம் - அத்தியாயம் 1
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  கௌடில்யர் (சாணக்கியர்) · தமிழ் ஆடியோ உரை
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                playEpisode({
                  episodeId: 'arthashastram-ch1',
                  title: 'அர்த்தசாஸ்திரம் - அத்தியாயம் 1',
                  seriesTitle: 'அர்த்தசாஸ்திரம்',
                  coverImageUrl: '/images/temple-sunset.jpg',
                  narratorName: 'By Anzles Studio',
                  audioUrl: '/audio/arthashastram_01.mp3',
                  durationSec: 1456,
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
export default MyLibraryPage;
