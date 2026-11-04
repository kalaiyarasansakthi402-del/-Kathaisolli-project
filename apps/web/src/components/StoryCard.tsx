import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Headphones, BookOpen, Star, Bookmark } from 'lucide-react';
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
    <div className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-[#083325] border-2 border-[#E3DCBA] dark:border-[#124835] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 space-y-4">
      {/* Top Header: Category & Save Bookmark */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0E2] dark:bg-[#032419] px-3 py-1 text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0] border border-[#064E3B]/10">
          <BookOpen className="w-3.5 h-3.5" />
          <span className="truncate max-w-[130px]">{categoryName || 'General'}</span>
        </span>

        <button
          onClick={handleToggleSave}
          aria-label={saved ? 'Remove from My Library' : 'Save to My Library'}
          title={saved ? 'சேமிக்கப்பட்டது (Saved to My Library)' : 'நூலகத்தில் சேமி (Save to My Library)'}
          className={`p-2 rounded-full border transition-all active:scale-95 ${
            saved
              ? 'bg-[#064E3B] text-[#A7F3D0] border-[#064E3B]'
              : 'border-[#E3DCBA] dark:border-[#124835] text-stone-400 hover:text-[#064E3B] hover:border-[#064E3B]'
          }`}
        >
          <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Title & Author */}
      <div className="space-y-1.5 flex-1">
        <Link to={`/stories/${slug || id}`}>
          <h3 className="font-bold font-serif text-lg leading-snug text-[#064E3B] dark:text-[#F8F5E9] group-hover:text-[#166534] transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>
        {authorName && (
          <p className="text-xs font-medium text-stone-600 dark:text-stone-300 line-clamp-1">
            எழுத்தாளர்: <span className="font-semibold text-[#173D2E] dark:text-stone-100">{authorName}</span>
          </p>
        )}
      </div>

      {/* Meta: Duration, Rating & Free Badge */}
      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-2 border-t border-[#E3DCBA]/60 dark:border-[#124835]">
        <span className="flex items-center gap-1 font-medium">
          <Headphones className="h-3.5 w-3.5 text-[#166534] dark:text-emerald-400" />
          {formattedDuration}
        </span>
        <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
          <Star className="h-3.5 w-3.5 fill-current" />
          {rating}
        </span>
      </div>

      {/* Bottom Action: Prominent Listen Button */}
      <button
        onClick={handlePlayClick}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#064E3B] hover:bg-[#166534] text-white font-bold text-xs shadow-md shadow-emerald-950/15 hover:scale-[1.02] active:scale-95 transition-all"
      >
        <Play className="h-4 w-4 fill-current ml-0.5 text-[#A7F3D0]" />
        <span>▶ Listen (கேள்)</span>
      </button>
    </div>
  );
};
