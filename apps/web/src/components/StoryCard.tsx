import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Headphones, BookOpen, Star, Sparkles, Bookmark } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { isBookSaved, toggleSaveBook } from '../services/userLibrary';

export interface StoryCardProps {
  id: string;
  slug: string;
  title: string;
  authorName?: string;
  coverImage?: string | null;
  coverImageUrl?: string | null;
  categoryName?: string;
  language?: string;
  totalEpisodes?: number;
  totalDurationSeconds?: number;
  firstEpisodeId?: string;
  rating?: number;
  audioUrl?: string | null;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  id,
  slug,
  title,
  authorName,
  coverImage,
  coverImageUrl,
  categoryName,
  language,
  totalEpisodes = 1,
  totalDurationSeconds = 0,
  firstEpisodeId,
  rating = 4.9,
  audioUrl,
}) => {
  const { playEpisode } = usePlayer();
  const { user, api } = useAuth();
  const [saved, setSaved] = useState(() => isBookSaved(id || slug, user?.id));

  useEffect(() => {
    const handleUpdate = () => {
      setSaved(isBookSaved(id || slug, user?.id));
    };
    window.addEventListener('kathaisolli:library-updated', handleUpdate);
    return () => window.removeEventListener('kathaisolli:library-updated', handleUpdate);
  }, [id, slug, user?.id]);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = toggleSaveBook(
      {
        id: id || slug,
        slug: slug || id,
        title,
        authorName,
        coverImageUrl: image,
        categoryName,
        language,
        totalEpisodes,
        totalDurationSeconds,
      },
      user?.id,
      api,
    );
    setSaved(result.isSaved);
  };

  const image =
    coverImageUrl ||
    coverImage ||
    '/images/story-panchatantra.jpg';

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (firstEpisodeId) {
      playEpisode(firstEpisodeId, id);
    } else {
      playEpisode(
        {
          id: id || slug,
          episodeId: id || slug,
          title,
          seriesId: id || slug,
          seriesTitle: categoryName || 'Kathaisolli Story',
          coverImageUrl: image,
          narratorName: authorName || 'By Anzles Studio',
          durationSec: totalDurationSeconds || 300,
          audioUrl,
        },
        id || slug,
      );
    }
  };

  const formattedDuration =
    totalDurationSeconds > 0
      ? `${Math.round(totalDurationSeconds / 60)} mins`
      : `${totalEpisodes} eps`;

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-[#083325] border border-[#E3DCBA] dark:border-[#124835] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Cover Image & Overlay */}
      <Link to={`/stories/${slug || id}`} className="relative aspect-square w-full overflow-hidden bg-stone-100 dark:bg-stone-900">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== window.location.origin + '/images/story-panchatantra.jpg') {
              target.src = '/images/story-panchatantra.jpg';
            }
          }}
        />

        {/* 100% Free Badge */}
        <span className="absolute top-2 left-2 rounded-full bg-[#064E3B]/90 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold text-[#A7F3D0] shadow-sm">
          100% Free
        </span>

        {/* Category Pill */}
        {categoryName && (
          <span className="absolute top-2 right-2 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-semibold text-white">
            {categoryName}
          </span>
        )}

        {/* Save to My Library Button */}
        <button
          onClick={handleToggleSave}
          aria-label={saved ? 'Remove from My Library' : 'Save to My Library'}
          title={saved ? 'சேமிக்கப்பட்டது (Saved to My Library)' : 'நூலகத்தில் சேமி (Save to My Library)'}
          className={`absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur-md transition-all shadow-md active:scale-95 z-10 ${
            saved
              ? 'bg-[#064E3B] text-[#A7F3D0] border border-[#A7F3D0]/60'
              : 'bg-black/60 hover:bg-black/80 text-white'
          }`}
        >
          <Bookmark className={`h-3.5 w-3.5 ${saved ? 'fill-current text-[#A7F3D0]' : 'text-white'}`} />
          <span>{saved ? 'Saved' : 'Save'}</span>
        </button>

        {/* Floating Play Button */}
        <button
          onClick={handlePlayClick}
          aria-label={`Play ${title}`}
          className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#064E3B] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-[#166534] focus:outline-none focus:ring-2 focus:ring-[#A7F3D0] group-hover:translate-y-0 translate-y-1 opacity-90 group-hover:opacity-100"
        >
          <Play className="h-5 w-5 fill-current ml-0.5" />
        </button>
      </Link>

      {/* Content Info */}
      <div className="flex flex-1 flex-col p-4 justify-between">
        <div>
          <Link to={`/stories/${slug || id}`}>
            <h3 className="line-clamp-1 font-bold font-serif text-base text-[#064E3B] dark:text-[#F8F5E9] group-hover:text-[#166534] transition-colors">
              {title}
            </h3>
          </Link>

          {authorName && (
            <p className="mt-1 text-xs text-[#173D2E]/70 dark:text-stone-300 line-clamp-1">
              {authorName}
            </p>
          )}
        </div>

        <div className="mt-3 pt-3 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 border-t border-[#E3DCBA]/60 dark:border-[#124835]">
          <span className="flex items-center gap-1 font-medium">
            <Headphones className="h-3.5 w-3.5 text-[#166534] dark:text-emerald-400" />
            {formattedDuration}
          </span>

          <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
            <Star className="h-3.5 w-3.5 fill-current" />
            {rating}
          </span>
        </div>
      </div>
    </div>
  );
};
