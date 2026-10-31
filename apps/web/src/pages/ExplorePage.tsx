import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  SlidersHorizontal,
  AlertCircle,
  RefreshCw,
  Globe,
  Leaf,
  Cloud,
  CheckCircle2,
  FolderOpen,
  Info,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { StoryCard } from '../components/StoryCard';
import { EmptyState } from '../components/EmptyState';
import { StoryGridSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import {
  listAudioFiles,
  type FirebaseAudioStory,
} from '../services/firebaseStorage';
import { isFirebaseConfigured, firebaseConfig } from '../services/firebase';

const DEFAULT_STORIES = [
  {
    id: 'panchatantra-stories',
    slug: 'panchatantra-stories',
    title: 'பஞ்சதந்திரக் கதைகள் (Panchatantra)',
    authorName: 'விஷ்ணு சர்மா (Vishnu Sharma)',
    coverImageUrl: '/images/story-panchatantra.jpg',
    categoryName: 'Moral Stories',
    language: 'தமிழ் (Tamil)',
    totalEpisodes: 18,
    totalDurationSeconds: 4200,
  },
  {
    id: 'tamil-folk-tales',
    slug: 'tamil-folk-tales',
    title: 'தமிழ் நாடோடிக் கதைகள் (Tamil Folk Tales)',
    authorName: 'நாட்டுப்புறப் பாடகர் குழு',
    coverImageUrl: '/images/story-tamil-folk.jpg',
    categoryName: 'Culture & Tradition',
    language: 'தமிழ் (Tamil)',
    totalEpisodes: 24,
    totalDurationSeconds: 5100,
  },
  {
    id: 'bedtime-stories',
    slug: 'bedtime-stories',
    title: 'தாலாட்டுக் கதைகள் (Bedtime Stories)',
    authorName: 'அம்மா சொல்லும் கதைகள்',
    coverImageUrl: '/images/story-bedtime.jpg',
    categoryName: 'For Kids',
    language: 'தமிழ் (Tamil)',
    totalEpisodes: 32,
    totalDurationSeconds: 6400,
  },
  {
    id: 'historical-stories',
    slug: 'historical-stories',
    title: 'சோழர் வரலாற்று காவியங்கள் (Chola Epics)',
    authorName: 'கல்கி கிருஷ்ணமூர்த்தி',
    coverImageUrl: '/images/story-historical.jpg',
    categoryName: 'Tamil History',
    language: 'தமிழ் (Tamil)',
    totalEpisodes: 15,
    totalDurationSeconds: 7800,
  },
  {
    id: 'motivational-stories',
    slug: 'motivational-stories',
    title: 'திருவள்ளுவர் தன்னம்பிக்கைக் கதைகள்',
    authorName: 'தமிழ்த்தென்றல் திரு.வி.க',
    coverImageUrl: '/images/story-motivational.jpg',
    categoryName: 'Life Lessons',
    language: 'தமிழ் (Tamil)',
    totalEpisodes: 20,
    totalDurationSeconds: 4500,
  },
  {
    id: 'clever-crow',
    slug: 'clever-crow',
    title: 'காக்கையின் தாகம் (The Clever Crow)',
    authorName: 'ஈசாப் & பஞ்சதந்திரம்',
    coverImageUrl: '/images/story-clever-crow.jpg',
    categoryName: 'Moral Stories',
    language: 'தமிழ் (Tamil)',
    totalEpisodes: 1,
    totalDurationSeconds: 360,
  },
];

export const ExplorePage: React.FC = () => {
  const { api } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get('category') || 'all';
  const initialLang = searchParams.get('language') || 'all';
  const initialSource = searchParams.get('source') || 'all';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [language, setLanguage] = useState<string>(initialLang);
  const [sourceFilter, setSourceFilter] = useState<string>(initialSource);

  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    const lang = searchParams.get('language') || 'all';
    const src = searchParams.get('source') || 'all';
    setSelectedCategory(cat);
    setLanguage(lang);
    setSourceFilter(src);
  }, [searchParams]);

  // Fetch REST API categories
  const { data: categories = [] } = useQuery({
    queryKey: ['catalog', 'categories'],
    queryFn: () => api.catalog.getCategories(),
  });

  // Fetch REST API languages
  const { data: languages = [] } = useQuery({
    queryKey: ['catalog', 'languages'],
    queryFn: () => api.catalog.getLanguages(),
  });

  // Fetch REST API stories
  const {
    data: seriesData,
    isLoading: isApiLoading,
  } = useQuery({
    queryKey: ['catalog', 'explore', selectedCategory, language],
    queryFn: () =>
      api.catalog.search({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        language: language !== 'all' ? language : undefined,
        pageSize: 30,
      }),
  });

  // Fetch Firebase Storage Audio Stories
  const fbConfigured = isFirebaseConfigured();
  const {
    data: firebaseStories = [],
    isLoading: isFbLoading,
    isError: isFbError,
    error: fbError,
    refetch: refetchFirebase,
  } = useQuery({
    queryKey: ['firebase', 'stories', import.meta.env.VITE_FIREBASE_STORIES_PATH || 'stories'],
    queryFn: () => listAudioFiles(),
    enabled: fbConfigured,
    retry: 1,
  });

  const apiStories = seriesData?.items || [];
  const baseStories = apiStories.length > 0 ? apiStories : DEFAULT_STORIES;

  // Convert Firebase Audio Stories to standard format
  const mappedFbStories = firebaseStories.map((item) => ({
    id: item.id,
    slug: item.id,
    title: item.title,
    authorName: 'Firebase Audio · ' + item.folder,
    coverImageUrl: item.coverImageUrl || '/images/story-clever-crow.jpg',
    categoryName: 'Cloud Audio',
    language: 'தமிழ்',
    totalEpisodes: 1,
    totalDurationSeconds: item.durationSec || 300,
    audioUrl: item.downloadUrl,
    isFirebase: true,
  }));

  let displayStories: any[] = [];
  if (sourceFilter === 'firebase') {
    displayStories = mappedFbStories;
  } else if (sourceFilter === 'local') {
    displayStories = baseStories;
  } else {
    displayStories = [...mappedFbStories, ...baseStories];
  }

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const newParams: Record<string, string> = {};
    if (cat !== 'all') newParams.category = cat;
    if (language !== 'all') newParams.language = language;
    if (sourceFilter !== 'all') newParams.source = sourceFilter;
    setSearchParams(newParams);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    const newParams: Record<string, string> = {};
    if (selectedCategory !== 'all') newParams.category = selectedCategory;
    if (lang !== 'all') newParams.language = lang;
    if (sourceFilter !== 'all') newParams.source = sourceFilter;
    setSearchParams(newParams);
  };

  const handleSourceChange = (src: string) => {
    setSourceFilter(src);
    const newParams: Record<string, string> = {};
    if (selectedCategory !== 'all') newParams.category = selectedCategory;
    if (language !== 'all') newParams.language = language;
    if (src !== 'all') newParams.source = src;
    setSearchParams(newParams);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 bg-[#F8F5E9] dark:bg-[#033B2B] text-[#173D2E] dark:text-[#F8F5E9] transition-colors">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E8F0E2] dark:bg-[#083325] text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0] uppercase tracking-wider">
          <Leaf className="w-3.5 h-3.5 fill-current" />
          <span>Explore All Tamil Stories & Audio</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-serif text-[#064E3B] dark:text-[#F8F5E9]">
          கதைகளை உலாவுங்கள்
        </h1>
        <p className="text-sm text-[#173D2E]/75 dark:text-stone-300 max-w-xl">
          நூற்றுக்கணக்கான பாரம்பரிய மற்றும் சமகால தமிழ் ஆடியோ கதைகளை எளிதாகக் கண்டறியுங்கள்.
        </p>
      </div>

      {/* Firebase Status Badge Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#083325] border-2 border-[#E3DCBA] dark:border-[#124835] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#064E3B] text-white flex items-center justify-center shrink-0">
            <Cloud className="w-5 h-5 text-[#A7F3D0]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold font-serif text-sm text-[#064E3B] dark:text-[#F8F5E9]">
                Firebase Storage: {firebaseConfig.projectId}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  fbConfigured
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                {fbConfigured ? 'Connected' : 'Config Ready'}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-300">
              Bucket: <code className="font-mono text-xs text-[#064E3B] dark:text-[#A7F3D0]">gs://{firebaseConfig.storageBucket}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleSourceChange('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              sourceFilter === 'all'
                ? 'bg-[#064E3B] text-white'
                : 'bg-[#F8F5E9] dark:bg-[#033B2B] text-[#173D2E] dark:text-stone-200 border border-[#D5CEBA] dark:border-[#124835]'
            }`}
          >
            All Stories ({displayStories.length})
          </button>
          <button
            onClick={() => handleSourceChange('firebase')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
              sourceFilter === 'firebase'
                ? 'bg-[#064E3B] text-white'
                : 'bg-[#F8F5E9] dark:bg-[#033B2B] text-[#173D2E] dark:text-stone-200 border border-[#D5CEBA] dark:border-[#124835]'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Firebase Audio ({mappedFbStories.length})</span>
          </button>
        </div>
      </div>

      {/* Firebase Error Notice if applicable */}
      {isFbError && sourceFilter === 'firebase' && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3 text-amber-800 dark:text-amber-200 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Firebase Storage Notice:</span>
            <p>
              {(fbError as any)?.message ||
                'Unable to list files from Firebase Storage. Please verify Firebase Storage Rules allow read access to your bucket.'}
            </p>
            <p className="text-[11px] opacity-80">
              Ensure you have created a <code className="font-mono">stories/</code> folder in bucket <code className="font-mono">vaagai-audio-books-36a4e.appspot.com</code>.
            </p>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#083325] border border-[#E3DCBA] dark:border-[#124835] shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-[#064E3B] dark:text-[#A7F3D0] shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full sm:w-auto text-xs sm:text-sm font-semibold rounded-full border border-[#D5CEBA] dark:border-[#124835] bg-[#F8F5E9] dark:bg-[#033B2B] px-3.5 py-2 text-[#173D2E] dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
            >
              <option value="all">அனைத்து வகைகள் (All Categories)</option>
              <option value="Moral Stories">Panchatantra (நீதிக்கதைகள்)</option>
              <option value="Culture & Tradition">Folk Tales (நாடோடிக் கதைகள்)</option>
              <option value="For Kids">Bedtime (குழந்தைகளுக்கு)</option>
              <option value="Tamil History">Historical (வரலாற்று காவியங்கள்)</option>
              <option value="Life Lessons">Motivational (தன்னம்பிக்கை)</option>
              {categories.map((cat) => (
                <option key={cat.id || cat.slug} value={cat.slug || cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Language Dropdown */}
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-[#064E3B] dark:text-[#A7F3D0] shrink-0" />
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full sm:w-auto text-xs sm:text-sm font-semibold rounded-full border border-[#D5CEBA] dark:border-[#124835] bg-[#F8F5E9] dark:bg-[#033B2B] px-3.5 py-2 text-[#173D2E] dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
            >
              <option value="all">அனைத்து மொழிகள் (All Languages)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              {languages.map((lang) => (
                <option key={lang.id || lang.code} value={lang.code}>
                  {lang.nativeName || lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stories Count */}
        <div className="text-xs text-stone-500 dark:text-stone-300 font-bold">
          {displayStories.length} கதைகள் கண்டறியப்பட்டன (Found)
        </div>
      </div>

      {/* Loading Skeleton */}
      {(isApiLoading || (isFbLoading && sourceFilter === 'firebase')) && (
        <StoryGridSkeleton count={6} />
      )}

      {/* Empty State */}
      {displayStories.length === 0 && !isApiLoading && !isFbLoading && (
        <EmptyState
          icon={FolderOpen}
          title="கதைகள் எதுவும் இல்லை (No Stories Found)"
          description={
            sourceFilter === 'firebase'
              ? 'Firebase Storage பக்கெட்டில் ஆடியோ கோப்புகள் எதுவும் இல்லை. vaagai-audio-books-36a4e.appspot.com பக்கெட்டில் stories/ கோப்புறையில் MP3 கோப்புகளைப் பதிவேற்றவும்.'
              : 'தேர்ந்தெடுக்கப்பட்ட வகைப்பாட்டில் அல்லது மொழியில் கதைகள் எதுவும் கிடைக்கவில்லை.'
          }
          actionLabel="அனைத்துக் கதைகளையும் காண்க"
          onAction={() => {
            setSelectedCategory('all');
            setLanguage('all');
            setSourceFilter('all');
            setSearchParams({});
          }}
        />
      )}

      {/* Stories Grid */}
      {displayStories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {displayStories.map((story: any) => (
            <StoryCard
              key={story.id}
              id={story.id}
              slug={story.slug}
              title={story.title}
              authorName={story.authorName || undefined}
              coverImageUrl={story.coverImageUrl || story.coverImage}
              categoryName={story.categoryName || story.category?.name}
              language={typeof story.language === 'string' ? story.language : story.language?.name}
              totalEpisodes={story.totalEpisodes || 1}
              totalDurationSeconds={story.totalDurationSeconds}
              audioUrl={story.audioUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
};
