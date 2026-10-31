import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Headphones, BookOpen, Star } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

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
  rating = 4.8,
}) => {
  const { playEpisode } = usePlayer();
  const image = coverImageUrl || coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (firstEpisodeId) {
      playEpisode(firstEpisodeId, id);
    }
  };

  const formattedDuration = totalDurationSeconds > 0
    ? `${Math.round(totalDurationSeconds / 60)} நிமிடங்கள்`
    : `${totalEpisodes} அத்தியாயங்கள்`;

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-[#14231E] border border-emerald-100 dark:border-emerald-900/40 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Cover Image & Overlay */}
      <Link to={`/stories/${slug || id}`} className="relative aspect-square w-full overflow-hidden bg-emerald-950/20">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* 100% Free Badge */}
        <span className="absolute top-2 left-2 rounded-full bg-emerald-700/90 backdrop-blur-md px-2.5 py-0.5 text-xs font-semibold text-emerald-100 shadow-sm">
          இலவசம் (100% Free)
        </span>

        {/* Category Pill */}
        {categoryName && (
          <span className="absolute top-2 right-2 rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-xs text-white">
            {categoryName}
          </span>
        )}

        {/* Floating Play Button */}
        <button
          onClick={handlePlayClick}
          aria-label={`Play ${title}`}
          className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 group-hover:translate-y-0 translate-y-1 opacity-90 group-hover:opacity-100"
        >
          <Play className="h-5 w-5 fill-current ml-0.5" />
        </button>
      </Link>

      {/* Content Info */}
      <div className="flex flex-1 flex-col p-3.5">
        <Link to={`/stories/${slug || id}`}>
          <h3 className="line-clamp-1 font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
            {title}
          </h3>
        </Link>

        {authorName && (
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
            {authorName}
          </p>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 border-t border-emerald-50 dark:border-emerald-900/30">
          <span className="flex items-center gap-1">
            <Headphones className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            {formattedDuration}
          </span>
          <span className="flex items-center gap-1 font-medium text-amber-500">
            <Star className="h-3.5 w-3.5 fill-current" />
            {rating.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
};
