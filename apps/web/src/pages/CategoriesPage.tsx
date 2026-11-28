import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { StoryCard } from '../components/StoryCard';
import { EmptyState } from '../components/EmptyState';
import { StoryGridSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
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

/** Matches a story against a category tab id/name consistently. */
function doesStoryMatchCategory(
  story: { categoryName?: string; language?: string },
  categoryId: string,
): boolean {
  const normalizedCat = categoryId.trim().toLowerCase();
  if (!normalizedCat || normalizedCat === 'all') return true;
  if (normalizedCat === 'recently added' || normalizedCat === 'புதிய வரவுகள்') return true;

  const catName = (story.categoryName || '').toLowerCase();
  const lang = (story.language || '').toLowerCase();

  if (normalizedCat === 'general') {
    return (
      catName === 'general' ||
      catName === 'பொது' ||
      catName === 'பொதுவானவை' ||
      (!catName && lang !== 'english')
    );
  }
  if (normalizedCat === 'english' || normalizedCat === 'english audiobooks') {
    return lang === 'english' || catName.includes('english') || catName === 'ஆங்கிலம்';
  }
  if (normalizedCat === 'mythology' || normalizedCat === 'புராணங்கள்') {
    return catName.includes('mythology') || catName.includes('புராண');
  }
  if (normalizedCat === 'biography' || normalizedCat === 'வாழ்க்கை வரலாறு') {
    return catName.includes('biography') || catName.includes('வரலாறு');
  }
  if (normalizedCat === 'literature' || normalizedCat === 'இலக்கியம்') {
    return catName.includes('literature') || catName.includes('இலக்கிய');
  }
  if (
    normalizedCat === 'self help' ||
    normalizedCat === 'சுயமுன்னேற்றம்' ||
    normalizedCat === 'motivation'
  ) {
    return (
      catName.includes('self help') ||
      catName.includes('motivation') ||
      catName.includes('சுயமுன்னேற்றம்')
    );
  }
  return catName.includes(normalizedCat);
}

/** Normalizes DOM wheel delta values across pixel, line, and page modes. */
const normalizeWheelDelta = (delta: number, deltaMode: number, pageSize: number): number => {
  if (deltaMode === 1) return delta * 32;
  if (deltaMode === 2) return delta * pageSize;
  return delta;
};

interface CategoryScrollButtonProps {
  direction: 'left' | 'right';
  disabled: boolean;
  onClick: () => void;
}

/** Accessible circular arrow control for scrolling the horizontal category bar. */
const CategoryScrollButton: React.FC<CategoryScrollButtonProps> = ({
  direction,
  disabled,
  onClick,
}) => {
  const label = direction === 'left' ? 'Scroll categories left' : 'Scroll categories right';
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`shrink-0 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#064E3B] dark:focus-visible:ring-[#A7F3D0] ${
        disabled
          ? 'bg-white/60 dark:bg-[#073224]/40 border-[#E3DCBA]/70 dark:border-[#0F4738]/50 text-stone-300 dark:text-stone-600 cursor-not-allowed opacity-50 shadow-none'
          : 'bg-white dark:bg-[#073224] border-[#DDD5C0] dark:border-[#0F4738] text-[#064E3B] dark:text-[#A7F3D0] hover:bg-[#064E3B] hover:text-white hover:border-[#064E3B] dark:hover:bg-[#10B981] dark:hover:text-[#03261C] dark:hover:border-[#10B981] shadow-sm hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer'
      }`}
    >
      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>
  );
};

export const CategoriesPage: React.FC = () => {
  const { api } = useAuth();
  const { currentTrack } = usePlayer();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlCategory = searchParams.get('category') || 'all';
  const urlSearch = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);
  const [searchQuery, setSearchQuery] = useState<string>(urlSearch);
  const [debouncedQuery, setDebouncedQuery] = useState<string>(urlSearch);
  const [visibleCount, setVisibleCount] = useState<number>(12);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tabButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const wheelTargetRef = useRef<{ target: number; ts: number } | null>(null);
  const arrowTargetRef = useRef<{ target: number; ts: number } | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);

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
  const rawCategoryTabs = useMemo(() => {
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

  const updateScrollButtons = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const tolerance = 2; // Tolerates subpixel fractional DPI scaling
    const nextCanScrollLeft = scrollLeft > tolerance;
    const nextCanScrollRight = scrollLeft + clientWidth < scrollWidth - tolerance;

    setCanScrollLeft((prev) => (prev !== nextCanScrollLeft ? nextCanScrollLeft : prev));
    setCanScrollRight((prev) => (prev !== nextCanScrollRight ? nextCanScrollRight : prev));
  }, []);

  // Single passive scroll + non-passive wheel + resize/font observation with proper cleanup
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    let isMounted = true;
    updateScrollButtons();

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (isMounted) updateScrollButtons();
      });
    }

    const handleWheel = (e: WheelEvent) => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 1) return;

      const dx = normalizeWheelDelta(e.deltaX, e.deltaMode, el.clientWidth);
      const dy = normalizeWheelDelta(e.deltaY, e.deltaMode, el.clientWidth);
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      // Horizontal trackpad swipe (or Shift + wheel): lock axis so slight vertical delta never scrolls the page
      if (absX > 0 && absX >= absY) {
        e.preventDefault();
        arrowTargetRef.current = null;
        wheelTargetRef.current = null;
        el.scrollLeft += dx;
        return;
      }

      // Mouse wheel over category bar: convert vertical wheel into horizontal scrolling while scrollable
      if (absY > 0) {
        const hasRight = el.scrollLeft < maxScroll - 2;
        const hasLeft = el.scrollLeft > 2;
        if (!((dy > 0 && hasRight) || (dy < 0 && hasLeft))) return;

        e.preventDefault();
        arrowTargetRef.current = null;

        if (absY < 35) {
          wheelTargetRef.current = null;
          el.scrollLeft += dy;
          return;
        }

        const now = Date.now();
        const baseLeft =
          wheelTargetRef.current && now - wheelTargetRef.current.ts < 200
            ? wheelTargetRef.current.target
            : el.scrollLeft;
        let nextTarget = Math.max(0, Math.min(maxScroll, baseLeft + dy));
        if (nextTarget <= 8) nextTarget = 0;
        if (nextTarget >= maxScroll - 8) nextTarget = maxScroll;
        wheelTargetRef.current = { target: nextTarget, ts: now };
        el.scrollTo({ left: nextTarget, behavior: 'smooth' });
      }
    };

    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    el.addEventListener('wheel', handleWheel, { passive: false });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateScrollButtons);
      resizeObserver.observe(el);
    } else {
      window.addEventListener('resize', updateScrollButtons);
    }

    return () => {
      isMounted = false;
      el.removeEventListener('scroll', updateScrollButtons);
      el.removeEventListener('wheel', handleWheel);
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', updateScrollButtons);
      }
    };
  }, [updateScrollButtons]);

  const scrollCategories = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    const step = Math.max(180, Math.round(el.clientWidth * 0.7));
    const now = Date.now();
    const baseLeft =
      arrowTargetRef.current && now - arrowTargetRef.current.ts < 450
        ? arrowTargetRef.current.target
        : el.scrollLeft;

    let targetLeft = direction === 'left' ? baseLeft - step : baseLeft + step;
    if (targetLeft <= 12) targetLeft = 0;
    if (targetLeft >= maxScroll - 12) targetLeft = maxScroll;

    wheelTargetRef.current = null;
    arrowTargetRef.current = { target: targetLeft, ts: now };
    el.scrollTo({ left: targetLeft, behavior: 'smooth' });
  };

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
          pageSize: 100,
        });
      } catch {
        return { items: [], total: 0, page: 1, pageSize: 100 };
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // Helper to filter out unwanted test/draft cards from public Categories display
  const isExcludedFromPublicCatalog = (item: any) => {
    const titleLower = (item.title || '').toLowerCase();
    const slugLower = (item.slug || '').toLowerCase();
    const rawTamil = (item.rawTamil || '').toLowerCase();
    return (
      titleLower.includes('kalaiyarasan') ||
      slugLower.includes('kalai') ||
      rawTamil.includes('கலை') ||
      titleLower.includes('periya puranam') ||
      slugLower.includes('periya') ||
      rawTamil.includes('பெரியபுராணம்')
    );
  };

  // Map complete database catalog
  const mappedCatalog = useMemo(() => {
    // 1. From API items if available (excluding marked unwanted public cards)
    const apiItems = (apiStoriesData?.items || [])
      .filter((s: any) => !isExcludedFromPublicCatalog(s))
      .map((s: any) => ({
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
        totalDurationSeconds: s.totalDurationSeconds || s.durationSec || 600,
        firstEpisodeId: s.firstEpisodeId || s.seasons?.[0]?.episodes?.[0]?.id,
        audioUrl:
          s.audioUrl ||
          (s.seasons?.[0]?.episodes?.[0]?.mediaAsset?.objectKey
            ? `https://firebasestorage.googleapis.com/v0/b/vaagai-audio-books-36a4e.appspot.com/o/${encodeURIComponent(
                s.seasons[0].episodes[0].mediaAsset.objectKey,
              )}?alt=media`
            : undefined),
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
      firstEpisodeId: book.chapters[0]?.id,
      audioUrl: book.chapters[0]?.audioUrl,
      source: 'catalog',
      // Generate deterministic created date for sorting
      createdAt: new Date(Date.now() - (COMPLETE_LIBRARY_CATALOG.length - idx) * 86400000).toISOString(),
    }));

    // Merge without duplicates (by slug or id)
    const seen = new Set<string>();
    const merged = [];

    for (const item of [...apiItems, ...catalogItems]) {
      if (isExcludedFromPublicCatalog(item)) continue;
      const key = item.slug || item.id;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(item);
      }
    }

    return merged;
  }, [apiStoriesData]);

  // Filter category tabs to show ONLY available categories that have >= 1 book
  const categoryTabs = useMemo(() => {
    if (mappedCatalog.length === 0) return [];
    return rawCategoryTabs.filter((tab) => {
      if (tab.id === 'all' || tab.id === 'Recently Added') return true;
      return mappedCatalog.some((story) => doesStoryMatchCategory(story, tab.id));
    });
  }, [rawCategoryTabs, mappedCatalog]);

  // Recalculate button states when merged category tabs change
  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      updateScrollButtons();
    });
    return () => cancelAnimationFrame(rafId);
  }, [categoryTabs, updateScrollButtons]);

  // Smoothly scroll the selected category pill horizontally into view without vertical page scrolling
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const activeTab = categoryTabs.find(
      (tab) =>
        selectedCategory.toLowerCase() === tab.id.toLowerCase() ||
        selectedCategory.toLowerCase() === tab.name.toLowerCase() ||
        (tab.id === 'all' && (!selectedCategory || selectedCategory === 'all'))
    );
    if (!activeTab) return;

    const activeEl = tabButtonRefs.current.get(activeTab.id);
    if (!activeEl) return;

    const containerRect = container.getBoundingClientRect();
    const buttonRect = activeEl.getBoundingClientRect();
    const edgePadding = 16;

    if (buttonRect.left < containerRect.left + edgePadding) {
      const nextLeft = Math.max(
        0,
        container.scrollLeft + (buttonRect.left - (containerRect.left + edgePadding))
      );
      arrowTargetRef.current = null;
      container.scrollTo({ left: nextLeft, behavior: 'smooth' });
    } else if (buttonRect.right > containerRect.right - edgePadding) {
      const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
      const nextLeft = Math.min(
        maxScroll,
        container.scrollLeft + (buttonRect.right - (containerRect.right - edgePadding))
      );
      arrowTargetRef.current = null;
      container.scrollTo({ left: nextLeft, behavior: 'smooth' });
    }
  }, [selectedCategory, categoryTabs]);

  // Filter and sort according to selected category and search query
  const filteredStories = useMemo(() => {
    const normalizedCat = selectedCategory.trim().toLowerCase();
    const query = debouncedQuery.trim().toLowerCase();

    let list = mappedCatalog.filter((story) => {
      // Never display marked unwanted cards on the public Categories page
      if (isExcludedFromPublicCatalog(story)) {
        return false;
      }

      // Category filter matching
      if (!doesStoryMatchCategory(story, normalizedCat)) {
        return false;
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
    <div
      className={`w-full overflow-x-clip py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 bg-[#FAF7EE] dark:bg-[#03261C] text-[#173D2E] dark:text-[#F8F5E9] transition-colors min-h-[80vh] ${
        currentTrack ? 'pb-36 sm:pb-40' : 'pb-16 sm:pb-20'
      }`}
    >
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

      {/* Category Pills Bar (Horizontal Scrollable with Left/Right Arrows) */}
      <div
        role="region"
        aria-label="Category filters navigation"
        className="relative flex items-center gap-1.5 sm:gap-2.5 w-full min-w-0"
      >
        <CategoryScrollButton
          direction="left"
          disabled={!canScrollLeft}
          onClick={() => scrollCategories('left')}
        />

        <div className="relative flex-1 min-w-0 overflow-hidden">
          {/* Left scroll fade indicator */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 left-0 w-6 z-10 bg-gradient-to-r from-[#FAF7EE] dark:from-[#03261C] to-transparent transition-opacity duration-200 ${
              canScrollLeft ? 'opacity-100' : 'opacity-0'
            }`}
          />

          <div
            ref={scrollContainerRef}
            onPointerDown={() => {
              arrowTargetRef.current = null;
              wheelTargetRef.current = null;
            }}
            className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto py-2 px-1.5 scrollbar-none overscroll-x-contain scroll-px-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-x',
            }}
          >
            {categoryTabs.map((tab) => {
              const isSelected =
                selectedCategory.toLowerCase() === tab.id.toLowerCase() ||
                selectedCategory.toLowerCase() === tab.name.toLowerCase() ||
                (tab.id === 'all' && (!selectedCategory || selectedCategory === 'all'));

              return (
                <button
                  key={tab.id}
                  type="button"
                  ref={(node) => {
                    if (node) {
                      tabButtonRefs.current.set(tab.id, node);
                    } else {
                      tabButtonRefs.current.delete(tab.id);
                    }
                  }}
                  aria-pressed={isSelected}
                  onClick={() => handleSelectCategory(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all duration-200 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#064E3B] dark:focus-visible:ring-[#A7F3D0] focus-visible:ring-offset-1 ${
                    isSelected
                      ? 'bg-[#064E3B] border-[#064E3B] dark:border-[#10B981] text-white shadow-md shadow-emerald-950/20 scale-[1.03]'
                      : 'bg-white dark:bg-[#073224] border-[#E3DCBA] dark:border-[#0F4738] text-stone-700 dark:text-stone-300 shadow-sm hover:border-[#064E3B] hover:text-[#064E3B] dark:hover:border-[#A7F3D0] dark:hover:text-[#A7F3D0] hover:-translate-y-0.5 active:scale-95'
                  }`}
                >
                  <span className={isSelected ? 'text-[#A7F3D0]' : 'text-stone-500 dark:text-stone-400'}>
                    {tab.icon}
                  </span>
                  <span>{tab.name}</span>
                  {tab.tamilName && tab.tamilName !== tab.name && (
                    <span className={`text-[10px] font-tamil font-normal ${isSelected ? 'text-emerald-200' : 'text-stone-400 dark:text-stone-400'}`}>
                      ({tab.tamilName})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right scroll fade indicator */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 right-0 w-6 z-10 bg-gradient-to-l from-[#FAF7EE] dark:from-[#03261C] to-transparent transition-opacity duration-200 ${
              canScrollRight ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>

        <CategoryScrollButton
          direction="right"
          disabled={!canScrollRight}
          onClick={() => scrollCategories('right')}
        />
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
                firstEpisodeId={story.firstEpisodeId}
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
