import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Headphones, BookOpen, Star, Bookmark } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { isBookSaved, toggleSaveBook } from '../services/userLibrary';

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  motivation: '/images/story-motivational.jpg',
  'self help': '/images/story-motivational.jpg',
  'சுயமுன்னேற்றம்': '/images/story-motivational.jpg',
  history: '/images/story-historical.jpg',
  biography: '/images/story-historical.jpg',
  'வரலாறு': '/images/story-historical.jpg',
  mythology: '/images/krishna.jpg',
  'புராணங்கள்': '/images/krishna.jpg',
  literature: '/images/story-tamil-folk.jpg',
  'இலக்கியம்': '/images/story-tamil-folk.jpg',
  tamil: '/images/story-tamil-folk.jpg',
  english: '/images/story-books-stack.jpg',
  general: '/images/story-books-stack.jpg',
};

const getCategoryFallbackImage = (cat?: string): string => {
  if (!cat) return '/images/story-books-stack.jpg';
  const lower = cat.toLowerCase();
  for (const [key, val] of Object.entries(CATEGORY_FALLBACK_IMAGES)) {
    if (lower.includes(key)) return val;
  }
  return '/images/story-books-stack.jpg';
};

const sanitizeCoverUrl = (url?: string | null, fallback?: string): string => {
  if (!url || typeof url !== 'string') return fallback || '/images/story-books-stack.jpg';
  const trimmed = url.trim();
  if (
    trimmed === '' ||
    trimmed === 'null' ||
    trimmed === 'undefined' ||
    trimmed.startsWith('blob:') ||
    trimmed.includes('firebasestorage.googleapis.com')
  ) {
    return fallback || '/images/story-books-stack.jpg';
  }
  return trimmed;
};

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

  const fallbackSrc = getCategoryFallbackImage(categoryName);
  const initialCover = sanitizeCoverUrl(coverImage || coverImageUrl, fallbackSrc);
  const [imageSrc, setImageSrc] = useState<string>(initialCover);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(true);
  const [hasImageError, setHasImageError] = useState<boolean>(false);

  useEffect(() => {
    const nextCover = sanitizeCoverUrl(coverImage || coverImageUrl, fallbackSrc);
    setImageSrc(nextCover);
    setIsImageLoading(true);
    setHasImageError(false);
  }, [coverImage, coverImageUrl, fallbackSrc]);

  const handleImageError = () => {
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    } else {
      setIsImageLoading(false);
      setHasImageError(true);
    }
  };

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
    const episodeIdentifier = firstEpisodeId || id || slug;
    playEpisode(
      {
        id: episodeIdentifier,
        episodeId: episodeIdentifier,
        title,
        seriesId: id || slug,
        seriesTitle: categoryName || 'Kathaisolli Story',
        narratorName: authorName || 'By Anzles Studio',
        durationSec: totalDurationSeconds || 300,
        coverImage: imageSrc,
        coverImageUrl: imageSrc,
        audioUrl: audioUrl || undefined,
      },
      id || slug,
    );
  };

  const formattedDuration =
    totalDurationSeconds > 0
      ? `${Math.round(totalDurationSeconds / 60)} mins`
      : `${totalEpisodes} eps`;

  return (
    <div className="group relative flex flex-col justify-between h-full w-full rounded-2xl bg-white dark:bg-[#083325] border-2 border-[#E3DCBA] dark:border-[#124835] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Cover Image Banner with Loading State & Graceful Kathaisolli Fallback */}
      <div className="relative h-44 sm:h-48 w-full bg-[#EFE9D5] dark:bg-[#052E21] overflow-hidden flex-shrink-0 flex items-center justify-center">
        {isImageLoading && !hasImageError && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#E3DCBA]/60 to-[#D5CEBA]/40 dark:from-[#073829] dark:to-[#042419]" />
        )}
        {!hasImageError ? (
          <img
            src={imageSrc}
            alt={title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
              isImageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setIsImageLoading(false)}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#063826] via-[#064E3B] to-[#042419] text-[#FAF7EE]">
            <div className="w-12 h-12 rounded-2xl bg-[#A7F3D0]/15 border border-[#A7F3D0]/30 flex items-center justify-center mb-2">
              <BookOpen className="w-6 h-6 text-[#A7F3D0] stroke-[1.75]" />
            </div>
            <span className="text-xs font-serif font-bold line-clamp-1 px-2">{title}</span>
            <span className="text-[10px] text-[#A7F3D0]/85 font-tamil mt-0.5">{categoryName || 'கதைசொல்லி'}</span>
          </div>
        )}

        {/* Floating Bookmark Button on Cover Top-Right */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={handleToggleSave}
            aria-label={saved ? 'Remove from My Library' : 'Save to My Library'}
            title={saved ? 'சேமிக்கப்பட்டது (Saved to My Library)' : 'நூலகத்தில் சேமி (Save to My Library)'}
            className={`p-2 rounded-full border shadow-md backdrop-blur-md transition-all active:scale-95 ${
              saved
                ? 'bg-[#064E3B] text-[#A7F3D0] border-[#064E3B]'
                : 'bg-black/40 border-white/20 text-white hover:bg-black/60'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Card Content: Structured & Uniform */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-3.5">
        {/* Top Header: Category badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0E2] dark:bg-[#032419] px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0] border border-[#064E3B]/10 self-start">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="truncate max-w-[150px]">{categoryName || 'General'}</span>
          </span>
        </div>

        {/* Title & Author with Fixed Minimum Heights for Exact Row Alignment */}
        <div className="space-y-1.5 flex-1">
          <Link to={`/stories/${slug || id}`} className="block">
            <h3
              className="font-bold font-serif font-tamil text-base sm:text-lg leading-snug text-[#064E3B] dark:text-[#F8F5E9] group-hover:text-[#166534] transition-colors line-clamp-2 min-h-[2.8rem] sm:min-h-[3.25rem] flex items-start break-words"
              title={title}
            >
              {title}
            </h3>
          </Link>
          <p className="text-xs font-medium text-stone-600 dark:text-stone-300 truncate h-5 flex items-center font-tamil">
            எழுத்தாளர்:{' '}
            <span className="font-semibold text-[#173D2E] dark:text-stone-100 ml-1 truncate">
              {authorName || 'கதைசொல்லி ஆசிரியர்'}
            </span>
          </p>
        </div>

        {/* Meta: Duration, Rating */}
        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-2.5 border-t border-[#E3DCBA]/60 dark:border-[#124835]">
          <span className="flex items-center gap-1 font-medium font-tamil">
            <Headphones className="h-3.5 w-3.5 text-[#166534] dark:text-emerald-400" />
            {formattedDuration}
          </span>
          <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
            <Star className="h-3.5 w-3.5 fill-current" />
            {rating}
          </span>
        </div>

        {/* Bottom Action: Prominent Listen Button pinned to bottom */}
        <button
          onClick={handlePlayClick}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#064E3B] hover:bg-[#166534] text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-950/15 hover:scale-[1.01] active:scale-95 transition-all mt-auto"
        >
          <Play className="h-4 w-4 fill-current ml-0.5 text-[#A7F3D0]" />
          <span>▶ Listen (கேள்)</span>
        </button>
      </div>
    </div>
  );
};

export default StoryCard;
