import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  AlertCircle,
  RefreshCw,
  Globe,
  Leaf,
  Cloud,
  FolderOpen,
  X,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { StoryCard } from '../components/StoryCard';
import { EmptyState } from '../components/EmptyState';
import { StoryGridSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import {
  COMPLETE_LIBRARY_CATALOG,
  LIBRARY_CATEGORIES,
  type LibraryBook,
} from '../data/libraryCatalog';
import {
  listAudioFiles,
  type FirebaseAudioStory,
} from '../services/firebaseStorage';
import { isFirebaseConfigured, firebaseConfig } from '../services/firebase';

export const ExplorePage: React.FC = () => {
  const { api } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCat = searchParams.get('category') || 'all';
  const initialLang = searchParams.get('language') || 'all';
  const initialSource = searchParams.get('source') || 'all';
  const initialSearch = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [debouncedQuery, setDebouncedQuery] = useState<string>(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [language, setLanguage] = useState<string>(initialLang);
  const [sourceFilter, setSourceFilter] = useState<string>(initialSource);
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Sync state with URL params
  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    const lang = searchParams.get('language') || 'all';
    const src = searchParams.get('source') || 'all';
    const q = searchParams.get('q') || '';
    setSelectedCategory(cat);
    setLanguage(lang);
    setSourceFilter(src);
    if (q !== searchQuery) {
      setSearchQuery(q);
      setDebouncedQuery(q);
    }
  }, [searchParams]);

  // Debounce search query (250ms) to keep input super fast
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setVisibleCount(12);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset pagination when category or language changes
  useEffect(() => {
    setVisibleCount(12);
  }, [selectedCategory, language, sourceFilter]);

  // Fetch optional REST API categories (cached, non-blocking)
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

  // Fetch optional REST API languages (cached, non-blocking)
  const { data: apiLanguages = [] } = useQuery({
    queryKey: ['catalog', 'languages'],
    queryFn: async () => {
      try {
        const res = await api.catalog.getLanguages();
        return Array.isArray(res) ? res : [];
      } catch {
        return [];
      }
    },
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  // Fetch optional REST API stories (non-blocking with progressive fallback)
  const {
    data: seriesData,
    isLoading: isApiLoading,
    isError: isApiError,
    error: apiError,
    refetch: refetchApi,
  } = useQuery({
    queryKey: ['catalog', 'explore', selectedCategory, language],
    queryFn: async () => {
      try {
        return await api.catalog.search({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          language: language !== 'all' ? language : undefined,
          pageSize: 30,
        });
      } catch {
        return { items: [], total: 0, page: 1, pageSize: 30 };
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // Fetch Firebase Storage Audio Stories safely (only when Firebase source requested)
  const fbConfigured = isFirebaseConfigured();
  const {
    data: firebaseStories = [],
    isLoading: isFbLoading,
    isError: isFbError,
    error: fbError,
    refetch: refetchFirebase,
  } = useQuery({
    queryKey: ['firebase', 'stories', 'explore'],
    queryFn: () => listAudioFiles('', 18),
    enabled: fbConfigured && (sourceFilter === 'firebase' || sourceFilter === 'all'),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Map complete 62-book library catalog to standard format
  const completeMappedCatalog = useMemo(() => {
    return COMPLETE_LIBRARY_CATALOG.map((book: LibraryBook) => ({
      id: book.id,
      slug: book.slug,
      title: `${book.tamilTitle} (${book.title})`,
      rawTamil: book.tamilTitle,
      rawEnglish: book.title,
      authorName: book.authorName,
      coverImageUrl: book.coverImageUrl,
      categoryName: book.category,
      language: book.language === 'Tamil' ? 'தமிழ்' : book.language,
      totalEpisodes: book.totalEpisodes || book.chapters.length || 1,
      totalDurationSeconds: book.totalDurationSeconds,
      audioUrl: book.chapters[0]?.audioUrl,
      source: 'catalog',
    }));
  }, []);

  // Map API stories if available
  const apiMappedStories = useMemo(() => {
    if (!seriesData?.items || seriesData.items.length === 0) return [];
    return seriesData.items.map((s: any) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      rawTamil: s.title,
      rawEnglish: s.title,
      authorName: s.authorName || 'By Anzles Studio',
      coverImageUrl: s.coverImage || s.coverImageUrl || '/images/hero-art.jpg',
      categoryName: s.category?.name || s.categoryName || 'General',
      language: typeof s.language === 'string' ? s.language : (s.language?.name || 'தமிழ்'),
      totalEpisodes: s.totalEpisodes || 1,
      totalDurationSeconds: s.totalDurationSeconds || 600,
      audioUrl: s.audioUrl,
      source: 'api',
    }));
  }, [seriesData]);

  // Map Firebase Audio Stories
  const mappedFbStories = useMemo(() => {
    return firebaseStories.map((item: FirebaseAudioStory) => ({
      id: item.id,
      slug: item.id,
      title: item.title,
      rawTamil: item.title,
      rawEnglish: item.cleanName,
      authorName: 'Firebase Audio · ' + item.folder,
      coverImageUrl: item.coverImageUrl || '/images/covers/arthashastram.jpg',
      categoryName: 'Cloud Audio',
      language: 'தமிழ்',
      totalEpisodes: 1,
      totalDurationSeconds: item.durationSec || 300,
      audioUrl: item.downloadUrl,
      source: 'firebase',
      isFirebase: true,
    }));
  }, [firebaseStories]);

  // Base combined stories (Prioritize API + Complete Catalog)
  const baseStories = useMemo(() => {
    if (apiMappedStories.length > 0) {
      // Merge unique by slug/id
      const existingIds = new Set(apiMappedStories.map((s) => s.slug || s.id));
      const remainingCatalog = completeMappedCatalog.filter(
        (b) => !existingIds.has(b.slug) && !existingIds.has(b.id),
      );
      return [...apiMappedStories, ...remainingCatalog];
    }
    return completeMappedCatalog;
  }, [apiMappedStories, completeMappedCatalog]);

  // Filter stories based on category, language, source, and debounced search query
  const filteredStories = useMemo(() => {
    let pool: any[] = [];
    if (sourceFilter === 'firebase') {
      pool = mappedFbStories;
    } else if (sourceFilter === 'catalog') {
      pool = baseStories;
    } else {
      pool = [...mappedFbStories, ...baseStories];
    }

    return pool.filter((story) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const catLower = selectedCategory.toLowerCase();
        const storyCat = (story.categoryName || '').toLowerCase();
        if (!storyCat.includes(catLower) && storyCat !== catLower) {
          return false;
        }
      }

      // Language filter
      if (language !== 'all') {
        if (language === 'ta' || language === 'Tamil') {
          if (story.language !== 'தமிழ்' && story.language !== 'Tamil') return false;
        } else if (language === 'en' || language === 'English') {
          if (story.language !== 'English' && story.language !== 'ஆங்கிலம்') return false;
        }
      }

      // Search query filter (matches Tamil title, English title, author, category)
      if (debouncedQuery.trim()) {
        const q = debouncedQuery.toLowerCase().trim();
        const matchesTitle = (story.title || '').toLowerCase().includes(q);
        const matchesTamil = (story.rawTamil || '').toLowerCase().includes(q);
        const matchesEnglish = (story.rawEnglish || '').toLowerCase().includes(q);
        const matchesAuthor = (story.authorName || '').toLowerCase().includes(q);
        const matchesCategory = (story.categoryName || '').toLowerCase().includes(q);
        return matchesTitle || matchesTamil || matchesEnglish || matchesAuthor || matchesCategory;
      }

      return true;
    });
  }, [baseStories, mappedFbStories, sourceFilter, selectedCategory, language, debouncedQuery]);

  // Progressive visible items
  const visibleStories = useMemo(() => {
    return filteredStories.slice(0, visibleCount);
  }, [filteredStories, visibleCount]);

  const updateUrlParams = (cat: string, lang: string, src: string, q: string) => {
    const params: Record<string, string> = {};
    if (cat !== 'all') params.category = cat;
    if (lang !== 'all') params.language = lang;
    if (src !== 'all') params.source = src;
    if (q.trim()) params.q = q.trim();
    setSearchParams(params);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    updateUrlParams(cat, language, sourceFilter, searchQuery);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    updateUrlParams(selectedCategory, lang, sourceFilter, searchQuery);
  };

  const handleSourceChange = (src: string) => {
    setSourceFilter(src);
    updateUrlParams(selectedCategory, language, src, searchQuery);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    updateUrlParams(selectedCategory, language, sourceFilter, val);
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setLanguage('all');
    setSourceFilter('all');
    setSearchQuery('');
    setDebouncedQuery('');
    setSearchParams({});
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 bg-[#F8F5E9] dark:bg-[#033B2B] text-[#173D2E] dark:text-[#F8F5E9] transition-colors">
      {/* 1. Header with Botanical Branding */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E8F0E2] dark:bg-[#083325] text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0] uppercase tracking-wider">
            <Leaf className="w-3.5 h-3.5 fill-current" />
            <span>Explore All Tamil Stories & Audio · By Anzles</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-serif text-[#064E3B] dark:text-[#F8F5E9]">
            கதைகளை உலாவுங்கள்
          </h1>
          <p className="text-sm text-[#173D2E]/75 dark:text-stone-300 max-w-xl">
            60+ பாரம்பரிய மற்றும் சமகால தமிழ் ஆடியோ புத்தகங்களை உடனடியாகக் கேட்டு மகிழுங்கள்.
          </p>
        </div>

        {/* Source Pills (All, Catalog, Firebase) */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleSourceChange('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
              sourceFilter === 'all'
                ? 'bg-[#064E3B] text-white shadow-emerald-950/20'
                : 'bg-white dark:bg-[#083325] text-[#173D2E] dark:text-stone-200 border border-[#D5CEBA] dark:border-[#124835] hover:bg-[#E8F0E2]'
            }`}
          >
            அனைத்தும் ({filteredStories.length})
          </button>
          <button
            onClick={() => handleSourceChange('catalog')}
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              sourceFilter === 'catalog'
                ? 'bg-[#064E3B] text-white shadow-emerald-950/20'
                : 'bg-white dark:bg-[#083325] text-[#173D2E] dark:text-stone-200 border border-[#D5CEBA] dark:border-[#124835] hover:bg-[#E8F0E2]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>ஆடியோ நூலகம் ({baseStories.length})</span>
          </button>
          <button
            onClick={() => handleSourceChange('firebase')}
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              sourceFilter === 'firebase'
                ? 'bg-[#064E3B] text-white shadow-emerald-950/20'
                : 'bg-white dark:bg-[#083325] text-[#173D2E] dark:text-stone-200 border border-[#D5CEBA] dark:border-[#124835] hover:bg-[#E8F0E2]'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Firebase Cloud ({mappedFbStories.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar (Debounced, Immediate) */}
      <div className="space-y-4 p-5 rounded-3xl bg-white dark:bg-[#083325] border-2 border-[#E3DCBA] dark:border-[#124835] shadow-md">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#064E3B] dark:text-[#A7F3D0]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="கதைகள், எழுத்தாளர்கள் அல்லது தலைப்புகளைத் தேடுங்கள்... (Search stories, authors...)"
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-[#F8F5E9] dark:bg-[#032419] border border-[#D5CEBA] dark:border-[#124835] text-[#173D2E] dark:text-[#F8F5E9] placeholder-[#173D2E]/50 dark:placeholder-stone-400 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-[#E3DCBA]/60 dark:border-[#124835]">
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-[#064E3B] dark:text-[#A7F3D0] shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="text-xs sm:text-sm font-semibold rounded-full border border-[#D5CEBA] dark:border-[#124835] bg-[#F8F5E9] dark:bg-[#032419] px-4 py-2 text-[#173D2E] dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
              >
                <option value="all">அனைத்து வகைகள் (All Categories)</option>
                {LIBRARY_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                {Array.isArray(apiCategories) &&
                  apiCategories.map((cat: any) => (
                    <option key={cat.id || cat.slug} value={cat.slug || cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Language Filter */}
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#064E3B] dark:text-[#A7F3D0] shrink-0" />
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="text-xs sm:text-sm font-semibold rounded-full border border-[#D5CEBA] dark:border-[#124835] bg-[#F8F5E9] dark:bg-[#032419] px-4 py-2 text-[#173D2E] dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
              >
                <option value="all">அனைத்து மொழிகள் (All Languages)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="en">English</option>
                {Array.isArray(apiLanguages) &&
                  apiLanguages.map((lang: any) => (
                    <option key={lang.id || lang.code} value={lang.code}>
                      {lang.nativeName || lang.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Active filter clear */}
            {(selectedCategory !== 'all' || language !== 'all' || searchQuery || sourceFilter !== 'all') && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-[#064E3B] dark:text-[#A7F3D0] hover:underline font-bold px-2 py-1"
              >
                வடிகட்டிகளை நீக்கு (Reset)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Firebase Error Notice (Non-blocking banner) */}
      {isFbError && sourceFilter === 'firebase' && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start justify-between gap-3 text-amber-800 dark:text-amber-200 text-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Firebase Storage அறிவிப்பு:</span>
              <p>
                {(fbError as any)?.message ||
                  'Firebase Storage இல் கோப்புகளைப் பெறுவதில் தாமதம் ஏற்பட்டது. உள்ளூர் ஆடியோ நூலகம் பயன்படுத்தப்படுகிறது.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => refetchFirebase()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-700 text-white font-bold hover:bg-amber-800 transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>மீண்டும் முயற்சி</span>
          </button>
        </div>
      )}

      {/* 4. Loading Skeleton (Only when source is Firebase and waiting) */}
      {isFbLoading && sourceFilter === 'firebase' && filteredStories.length === 0 && (
        <StoryGridSkeleton count={8} />
      )}

      {/* 5. Empty State */}
      {filteredStories.length === 0 && !isFbLoading && (
        <EmptyState
          icon={FolderOpen}
          title="கதைகள் எதுவும் கிடைக்கவில்லை (No Stories Found)"
          description={
            debouncedQuery
              ? `"${debouncedQuery}" என்ற தேடலுக்கு பொருத்தமான கதைகள் கிடைக்கவில்லை.`
              : 'தேர்ந்தெடுக்கப்பட்ட வகைப்பாட்டில் அல்லது மொழியில் கதைகள் எதுவும் கிடைக்கவில்லை.'
          }
          actionLabel="அனைத்துக் கதைகளையும் காண்க"
          onAction={clearAllFilters}
        />
      )}

      {/* 6. Stories Grid (Instant & Progressive) */}
      {visibleStories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          {visibleStories.map((story: any) => (
            <StoryCard
              key={story.id || story.slug}
              id={story.id}
              slug={story.slug}
              title={story.title}
              authorName={story.authorName}
              coverImageUrl={story.coverImageUrl}
              categoryName={story.categoryName}
              language={story.language}
              totalEpisodes={story.totalEpisodes}
              totalDurationSeconds={story.totalDurationSeconds}
              audioUrl={story.audioUrl}
            />
          ))}
        </div>
      )}

      {/* 7. Progressive "Load More" Button */}
      {visibleStories.length < filteredStories.length && (
        <div className="pt-6 pb-2 text-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + 12)}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#064E3B] hover:bg-[#075C45] text-white font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#A7F3D0]" />
            <span>மேலும் கதைகளைக் காட்டு (Load More Stories)</span>
          </button>
        </div>
      )}
    </div>
  );
};
