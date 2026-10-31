import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ListMusic, Plus, Play, Trash2, X, AlertCircle, RefreshCw, Music } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmptyState } from '../components/EmptyState';
import { StoryGridSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';

export const PlaylistsPage: React.FC = () => {
  const { user, api } = useAuth();
  const { playEpisode } = usePlayer();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activePlaylistId = searchParams.get('id');
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Fetch all playlists
  const {
    data: playlists = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['playlists', 'list'],
    queryFn: () => api.playlists.list(),
    enabled: !!user,
  });

  // If viewing a specific playlist
  const { data: currentPlaylist } = useQuery({
    queryKey: ['playlists', 'detail', activePlaylistId],
    queryFn: () => api.playlists.get(activePlaylistId!),
    enabled: !!user && !!activePlaylistId,
  });

  // Create playlist mutation
  const createMutation = useMutation({
    mutationFn: (data: { title: string; description?: string; isPublic?: boolean }) =>
      api.playlists.create(data),
    onSuccess: (newPl) => {
      queryClient.invalidateQueries({ queryKey: ['playlists', 'list'] });
      setShowModal(false);
      setNewTitle('');
      setNewDesc('');
      setSearchParams({ id: newPl.id });
    },
  });

  // Delete playlist mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.playlists.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists', 'list'] });
      setSearchParams({});
    },
  });

  if (!user) {
    return (
      <div className="py-20 px-4 max-w-lg mx-auto text-center space-y-5">
        <div className="h-16 w-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 mx-auto">
          <ListMusic className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
          பிளேலிஸ்ட்கள் (Playlists)
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          உங்களுக்குப் பிடித்த கதைகளை தனித்தனி தொகுப்பாக உருவாக்க உங்கள் இலவச கணக்கில் உள்நுழையவும்.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-colors"
        >
          உள்நுழைக (Sign In)
        </button>
      </div>
    );
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createMutation.mutate({
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      isPublic: true,
    });
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
            பிளேலிஸ்ட்கள் (Playlists)
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            உங்களுக்குப் பிடித்த கதைகளைத் தனித்தனி தொகுப்புகளாக உருவாக்குங்கள்
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>புதிய பிளேலிஸ்ட் (New Playlist)</span>
        </button>
      </div>

      {isLoading && <StoryGridSkeleton count={4} />}

      {isError && (
        <div className="p-8 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-rose-600 mx-auto" />
          <h3 className="font-bold text-rose-900 dark:text-rose-200">பிளேலிஸ்ட்களை ஏற்றுவதில் பிழை</h3>
          <p className="text-xs text-rose-700 dark:text-rose-300">{(error as any)?.message || 'சர்வர் பிழை'}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold"
          >
            மீண்டும் முயற்சி செய்
          </button>
        </div>
      )}

      {/* Selected playlist detail view */}
      {activePlaylistId && currentPlaylist && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#14231E] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                தொகுப்பு விவரம் (Playlist Details)
              </span>
              <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif mt-1">
                {currentPlaylist.title}
              </h2>
              {currentPlaylist.description && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{currentPlaylist.description}</p>
              )}
            </div>
            <button
              onClick={() => {
                if (window.confirm('இந்த பிளேலிஸ்ட்டை நீக்க விரும்புகிறீர்களா?')) {
                  deleteMutation.mutate(currentPlaylist.id);
                }
              }}
              className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="பிளேலிஸ்ட்டை நீக்கு"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>

          {currentPlaylist.items && currentPlaylist.items.length > 0 ? (
            <div className="divide-y divide-emerald-50 dark:divide-emerald-900/30">
              {currentPlaylist.items.map((item: any) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        playEpisode(
                          {
                            episodeId: item.episode.id,
                            title: item.episode.title,
                            seriesId: item.episode.season?.series?.id,
                            seriesTitle: item.episode.season?.series?.title,
                            coverImage: item.episode.season?.series?.coverImage,
                          },
                          item.episode.season?.series?.id
                        )
                      }
                      className="p-2 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white transition-colors"
                    >
                      <Play className="h-4 w-4 fill-current ml-0.5" />
                    </button>
                    <div>
                      <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                        {item.episode.title}
                      </h4>
                      <p className="text-xs text-zinc-400">
                        {item.episode.season?.series?.title || 'கதைசொல்லி'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-400 text-xs">
              இந்த பிளேலிஸ்ட்டில் இன்னும் கதைகள் சேர்க்கப்படவில்லை.
            </div>
          )}
        </div>
      )}

      {/* Playlists Grid */}
      {!isLoading && !isError && (
        <>
          {playlists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {playlists.map((pl: any) => (
                <div
                  key={pl.id}
                  onClick={() => setSearchParams({ id: pl.id })}
                  className={`p-6 rounded-2xl bg-white dark:bg-[#14231E] border shadow-sm flex flex-col justify-between hover:shadow-md transition-all cursor-pointer ${
                    activePlaylistId === pl.id
                      ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                      : 'border-emerald-100 dark:border-emerald-900/40'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                      <ListMusic className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{pl.title}</h3>
                      {pl.description && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                          {pl.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-emerald-50 dark:border-emerald-900/30 flex items-center justify-between text-xs text-zinc-400">
                    <span>{pl._count?.items ?? pl.items?.length ?? 0} அத்தியாயங்கள்</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">திறக்க</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ListMusic}
              title="பிளேலிஸ்ட்கள் எதுவும் இல்லை"
              description="உங்களுக்கு பிடித்த கதைகளை ஒரு தொகுப்பாக உருவாக்க புதிய பிளேலிஸ்ட் பொத்தானை அழுத்தவும்."
              actionLabel="புதிய பிளேலிஸ்ட் உருவாக்கு"
              onAction={() => setShowModal(true)}
            />
          )}
        </>
      )}

      {/* Create Playlist Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#14231E] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-emerald-100 dark:border-emerald-900/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-serif">
                புதிய பிளேலிஸ்ட்
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  பிளேலிஸ்ட் பெயர் *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="எ.கா. இரவு நேர காவியங்கள்"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#101A16] text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  விளக்கம் (விருப்பப்பட்டால்)
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="இந்த பிளேலிஸ்ட்டைப் பற்றிய சுருக்கம்..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#101A16] text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
                >
                  ரத்து செய்க
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? 'உருவாக்குகிறது...' : 'உருவாக்குக'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
