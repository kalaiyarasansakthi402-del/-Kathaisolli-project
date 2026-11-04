import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Sparkles,
  Clock,
  UserCheck,
  Scroll,
  HeartHandshake,
  BookMarked,
  Leaf,
  Layers,
  AlertCircle,
  X,
  RefreshCw,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { StoryCard } from '../components/StoryCard';
import { EmptyState } from '../components/EmptyState';
import { StoryGridSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import {
  COMPLETE_LIBRARY_CATALOG,
  type LibraryBook,
} from '../data/libraryCatalog';

export interface CategoryTab {
  id: string;
  name: string;
  tamilName: string;
  icon: React.ReactNode;
}

export const CATALOG_CATEGORY_TABS: CategoryTab[] = [
  {
    id: 'all',
    name: 'All Stories',
    tamilName: 'அனைத்து கதைகள்',
    icon: <Layers className="w-4 h-4" />,
  },
  {
    id: 'General',
    name: 'General',
    tamilName: 'பொதுவானவை',
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    id: 'English',
    name: 'English Audiobooks',
    tamilName: 'ஆங்கில ஆடியோபுத்தகங்கள்',
    icon: <BookMarked className="w-4 h-4" />,
  },
  {
    id: 'Mythology',
    name: 'Mythology',
    tamilName: 'புராணங்கள்',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    id: 'Biography',
    name: 'Biography',
    tamilName: 'வாழ்க்கை வரலாறு',
    icon: <UserCheck className="w-4 h-4" />,
  },
  {
    id: 'Literature',
    name: 'Literature',
    tamilName: 'இலக்கியம்',
    icon: <Scroll className="w-4 h-4" />,
  },
  {
    id: 'Self Help',
    name: 'Self Help',
    tamilName: 'சுயமுன்னேற்றம்',
    icon: <HeartHandshake className="w-4 h-4" />,
  },
  {
    id: 'Recently Added',
    name: 'Recently Added',
    tamilName: 'புதிய வரவுகள்',
    icon: <Clock className="w-4 h-4" />,
  },
];

export const CategoriesPage: React.FC = () => {
  const { api } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlCategory = searchParams.get('category') || 'all';
  const urlSearch = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);
  const [searchQuery, setSearchQuery] = useState<string>(urlSearch);
  const [debouncedQuery, setDebouncedQuery] = useState<string>(urlSearch);
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Sync state when URL search params change (Back/Forward or direct navigation)
  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    const q = searchParams.get('q') || '';
    setSelectedCategory(cat);
    if (q !== searchQuery) {
      setSearchQuery(q);
      setDebouncedQuery(q);
    }
  }, [searchParams]);

  // Debounce search input (250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setVisibleCount(12);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL params when category or query changes
  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    setVisibleCount(12);
    const newParams: Record<string, string> = {};
    if (catId && catId !== 'all') {
      newParams.category = catId;
    }
    if (debouncedQuery.trim()) {
      newParams.q = debouncedQuery.trim();
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    const newParams: Record<string, string> = {};
    if (selectedCategory && selectedCategory !== 'all') {
      newParams.category = selectedCategory;
    }
    if (value.trim()) {
      newParams.q = value.trim();
    }
    setSearchParams(newParams);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    const newParams: Record<string, string> = {};
    if (selectedCategory && selectedCategory !== 'all') {
      newParams.category = selectedCategory;
    }
    setSearchParams(newParams);
  };

  // Fetch dynamic categories from API (cached) to merge admin-created categories
  const { data: apiCategories = [] } = useQuery({
    queryKey: ['catalog', 'categories'],
    queryFn: async () => {
      try {
        const res = await api.catalog.getCategories();
        return Array.isArray(res) ? res : [];
      } catch {
        return [];
      }
    },
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  // Merge static catalog tabs with dynamic categories from backend
  const categoryTabs = useMemo(() => {
    const tabs = [...CATALOG_CATEGORY_TABS];
    if (Array.isArray(apiCategories) && apiCategories.length > 0) {
      for (const cat of apiCategories) {
        const slugLower = (cat.slug || '').toLowerCase();
        const nameLower = (cat.name || '').toLowerCase();
        if (
          !tabs.some(
            (t) =>
              t.id.toLowerCase() === slugLower ||
              t.name.toLowerCase() === nameLower ||
              t.id.toLowerCase() === nameLower
          )
        ) {
          tabs.push({
            id: cat.slug || cat.name,
            name: cat.name,
            tamilName: cat.name,
            icon: <BookOpen className="w-4 h-4" />,
          });
        }
      }
    }
    return tabs;
  }, [apiCategories]);

  // Fetch API stories if available (progressive enhancement)
  const {
    data: apiStoriesData,
    isLoading: isApiLoading,
    isError: isApiError,
    error: apiError,
    refetch: refetchApi,
  } = useQuery({
    queryKey: ['catalog', 'categories-stories', selectedCategory],
    queryFn: async () => {
      try {
        const catFilter =
          selectedCategory !== 'all' && selectedCategory !== 'Recently Added'
            ? selectedCategory.toLowerCase()
            : undefined;
        return await api.catalog.search({
          category: catFilter,
          pageSize: 40,
        });
      } catch {
        return { items: [], total: 0, page: 1, pageSize: 40 };
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // Map complete database catalog
  const mappedCatalog = useMemo(() => {
    // 1. From API items if available
    const apiItems = (apiStoriesData?.items || []).map((s: any) => ({
      id: s.id,
      slug: s.slug || s.id,
      title: s.title,
      rawTamil: s.title,
      rawEnglish: s.title,
      authorName: s.authorName || 'By Anzles Studio',
      coverImageUrl: s.coverImage || s.coverImageUrl || '/images/hero-art.jpg',
      categoryName: s.category?.name || s.categoryName || 'General',
      language: typeof s.language === 'string' ? s.language : s.language?.name || 'Tamil',
      totalEpisodes: s.totalEpisodes || 1,
      totalDurationSeconds: s.totalDurationSeconds || 600,
      audioUrl: s.audioUrl,
      source: 'api',
      createdAt: s.createdAt || new Date().toISOString(),
    }));

    // 2. Curated standard library catalog
    const catalogItems = COMPLETE_LIBRARY_CATALOG.map((book: LibraryBook, idx: number) => ({
      id: book.id,
      slug: book.slug,
      title: book.tamilTitle ? `${book.tamilTitle} (${book.title})` : book.title,
      rawTamil: book.tamilTitle || book.title,
      rawEnglish: book.title,
      authorName: book.authorName,
      coverImageUrl: book.coverImageUrl,
      categoryName: book.category,
      language: book.language,
      totalEpisodes: book.totalEpisodes || book.chapters.length || 1,
      totalDurationSeconds: book.totalDurationSeconds,
      audioUrl: book.chapters[0]?.audioUrl,
      source: 'catalog',
      // Generate deterministic created date for sorting
      createdAt: new Date(Date.now() - (COMPLETE_LIBRARY_CATALOG.length - idx) * 86400000).toISOString(),
    }));

    // Merge without duplicates (by slug or id)
    const seen = new Set<string>();
    const merged = [];

    for (const item of [...apiItems, ...catalogItems]) {
      const key = item.slug || item.id;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(item);
      }
    }

    return merged;
  }, [apiStoriesData]);

  // Filter and sort according to selected category and search query
  const filteredStories = useMemo(() => {
    const normalizedCat = selectedCategory.trim().toLowerCase();
    const query = debouncedQuery.trim().toLowerCase();

    let list = mappedCatalog.filter((story) => {
      // Category filter matching
      if (normalizedCat && normalizedCat !== 'all') {
        const catName = (story.categoryName || '').toLowerCase();
        const lang = (story.language || '').toLowerCase();

        if (normalizedCat === 'general') {
          const isGeneral =
            catName === 'general' ||
            catName === 'பொது' ||
            catName === 'பொதுவானவை' ||
            (!catName && lang !== 'english');
          if (!isGeneral) return false;
        } else if (normalizedCat === 'english' || normalizedCat === 'english audiobooks') {
          const isEnglish =
            lang === 'english' ||
            catName.includes('english') ||
            catName === 'ஆங்கிலம்';
          if (!isEnglish) return false;
        } else if (normalizedCat === 'mythology' || normalizedCat === 'புராணங்கள்') {
          const isMythology = catName.includes('mythology') || catName.includes('புராண');
          if (!isMythology) return false;
        } else if (normalizedCat === 'biography' || normalizedCat === 'வாழ்க்கை வரலாறு') {
          const isBio = catName.includes('biography') || catName.includes('வரலாறு');
          if (!isBio) return false;
        } else if (normalizedCat === 'literature' || normalizedCat === 'இலக்கியம்') {
          const isLit = catName.includes('literature') || catName.includes('இலக்கிய');
          if (!isLit) return false;
        } else if (
          normalizedCat === 'self help' ||
          normalizedCat === 'சுயமுன்னேற்றம்' ||
          normalizedCat === 'motivation'
        ) {
          const isSelfHelp =
            catName.includes('self help') ||
            catName.includes('motivation') ||
            catName.includes('சுயமுன்னேற்றம்');
          if (!isSelfHelp) return false;
        } else if (normalizedCat === 'recently added' || normalizedCat === 'புதிய வரவுகள்') {
          // Handled in sorting below
        } else {
          // Custom category match
          if (!catName.includes(normalizedCat)) return false;
        }
      }

      // Search filter matching
      if (query) {
        const matchTitle = story.title.toLowerCase().includes(query);
        const matchTamil = story.rawTamil.toLowerCase().includes(query);
        const matchEnglish = story.rawEnglish.toLowerCase().includes(query);
        const matchAuthor = story.authorName.toLowerCase().includes(query);
        const matchCategory = story.categoryName.toLowerCase().includes(query);
        if (!matchTitle && !matchTamil && !matchEnglish && !matchAuthor && !matchCategory) {
          return false;
        }
      }

      return true;
    });

    // If Recently Added is selected, sort descending by latest
    if (normalizedCat === 'recently added' || normalizedCat === 'புதிய வரவுகள்') {
      list = [...list].reverse();
    }

    return list;
  }, [mappedCatalog, selectedCategory, debouncedQuery]);

  const visibleStories = filteredStories.slice(0, visibleCount);
  const hasMore = visibleCount < filteredStories.length;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 bg-[#FAF7EE] dark:bg-[#03261C] text-[#173D2E] dark:text-[#F8F5E9] transition-colors min-h-[80vh]">
      {/* Header section with Botanical Green badge */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E2EFE9] dark:bg-[#073829] border border-[#C5DDD1] dark:border-[#0E4738] text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0] uppercase tracking-wider">
          <Leaf className="w-3.5 h-3.5 fill-current" />
          <span>Curated Story Catalog</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black font-serif text-[#064E3B] dark:text-[#A7F3D0]">
              கதை வகைப்பாடுகள் (Categories)
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1 max-w-2xl font-tamil">
              அனைத்து தமிழ் மற்றும் ஆங்கில ஆடியோ கதைகளையும் வகை வாரியாகக் கேட்டு மகிழுங்கள்.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white dark:bg-[#073224] border border-[#E3DCBA] dark:border-[#0F4738] text-[#064E3B] dark:text-[#A7F3D0] self-start sm:self-auto shrink-0 shadow-sm">
            {filteredStories.length} கதைகள் உள்ளன
          </span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-md w-full">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#064E3B]/60 dark:text-emerald-300/60" />
        <input
          type="search"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="கதை தலைப்பு அல்லது எழுத்தாளர் பெயர் தேடுக..."
          className="w-full pl-10 pr-9 py-2.5 rounded-full bg-white dark:bg-[#073224] border border-[#DDD5C0] dark:border-[#0E4738] focus:border-[#064E3B] focus:ring-2 focus:ring-[#064E3B]/20 text-xs sm:text-sm text-stone-800 dark:text-stone-100 placeholder:text-stone-400 outline-none transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills Bar (Horizontal Scrollable) */}
      <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
        <div
          className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categoryTabs.map((tab) => {
            const isSelected =
              selectedCategory.toLowerCase() === tab.id.toLowerCase() ||
              (tab.id === 'all' && (!selectedCategory || selectedCategory === 'all'));

            return (
              <button
                key={tab.id}
                onClick={() => handleSelectCategory(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 shadow-sm ${
                  isSelected
                    ? 'bg-[#064E3B] text-white shadow-md shadow-emerald-950/20 scale-105'
                    : 'bg-white dark:bg-[#073224] border border-[#E3DCBA] dark:border-[#0F4738] text-stone-700 dark:text-stone-300 hover:border-[#064E3B] hover:text-[#064E3B]'
                }`}
              >
                <span className={isSelected ? 'text-[#A7F3D0]' : 'text-stone-500'}>
                  {tab.icon}
                </span>
                <span>{tab.name}</span>
                <span className={`text-[10px] font-tamil font-normal ${isSelected ? 'text-emerald-200' : 'text-stone-400'}`}>
                  ({tab.tamilName})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* API Notice / Fallback Status if needed */}
      {isApiError && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              உள்ளூர் பட்டியல் தற்காலிகமாக ஏற்றப்பட்டுள்ளது (Displaying curated local story catalog).
            </span>
          </div>
          <button
            onClick={() => refetchApi()}
            className="p-1 text-amber-700 hover:text-amber-900"
            title="Retry"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Story Cards Grid */}
      {isApiLoading && mappedCatalog.length === 0 ? (
        <StoryGridSkeleton count={8} />
      ) : filteredStories.length === 0 ? (
        <EmptyState
          title="கதைகள் எதுவும் கிடைக்கவில்லை (No Stories Found)"
          description={
            debouncedQuery
              ? `"${debouncedQuery}" என்ற தேடலுக்கு பொருத்தமான கதைகள் இல்லை.`
              : 'தேர்ந்தெடுக்கப்பட்ட வகைப்பாட்டில் கதைகள் எதுவும் இல்லை.'
          }
          actionLabel="அனைத்து கதைகளையும் பார்க்க (View All Stories)"
          onAction={() => handleSelectCategory('all')}
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {visibleStories.map((story) => (
              <StoryCard
                key={story.id}
                id={story.id}
                slug={story.slug}
                title={story.title}
                authorName={story.authorName}
                categoryName={story.categoryName}
                language={story.language}
                totalEpisodes={story.totalEpisodes}
                totalDurationSeconds={story.totalDurationSeconds}
                coverImageUrl={story.coverImageUrl}
                audioUrl={story.audioUrl}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setVisibleCount((prev) => prev + 12)}
                className="px-6 py-2.5 rounded-full bg-white dark:bg-[#073224] border-2 border-[#064E3B] text-[#064E3B] dark:text-[#A7F3D0] hover:bg-[#064E3B] hover:text-white font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                மேலும் கதைகளைக் காட்டு (Load More Stories - {filteredStories.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
