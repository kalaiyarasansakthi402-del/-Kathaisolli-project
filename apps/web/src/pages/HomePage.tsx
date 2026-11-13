import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Search,
  Headphones,
  BookOpen,
  Star,
  ArrowRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { COMPLETE_LIBRARY_CATALOG } from '../data/libraryCatalog';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [homeSearchQuery, setHomeSearchQuery] = useState('');

  const { data: apiHome } = useQuery({
    queryKey: ['catalog', 'home-preview'],
    queryFn: async () => {
      try {
        return await api.catalog.getHome();
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const featuredStories = useMemo(() => {
    const apiFeatured = (apiHome as any)?.featured || (apiHome as any)?.collections?.[0]?.items || [];
    if (Array.isArray(apiFeatured) && apiFeatured.length >= 3) {
      return apiFeatured.slice(0, 6).map((s: any) => ({
        id: s.id,
        slug: s.slug || s.id,
        title: s.title,
        authorName: s.authorName || 'கதைசொல்லி குழு',
        category: s.category?.name || 'தமிழ் கதைகள்',
        durationMinutes: Math.max(5, Math.round((s.totalDurationSeconds || 600) / 60)),
      }));
    }

    return COMPLETE_LIBRARY_CATALOG.slice(0, 6).map((book) => ({
      id: book.id,
      slug: book.slug,
      title: book.tamilTitle ? `${book.tamilTitle} (${book.title})` : book.title,
      authorName: book.authorName,
      category: book.category,
      durationMinutes: Math.max(5, Math.round((book.totalDurationSeconds || 600) / 60)),
    }));
  }, [apiHome]);

  const handleHomeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = homeSearchQuery.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/categories');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAF7EE] dark:bg-[#03261C] text-[#173D2E] dark:text-[#F8F5E9] transition-colors relative overflow-hidden flex flex-col justify-center py-10 sm:py-16">
      {/* Subtle Decorative Botanical Sprigs in Background */}
      <div className="absolute top-24 left-0 w-32 h-64 opacity-20 pointer-events-none -translate-x-12 hidden lg:block">
        <svg viewBox="0 0 100 200" fill="none" stroke="#064E3B" strokeWidth="2" className="w-full h-full">
          <path d="M10,200 Q40,120 20,40" />
          <path d="M20,160 Q60,150 70,130 Q50,140 20,160" fill="#064E3B" opacity="0.4" />
          <path d="M25,120 Q65,100 80,80 Q55,100 25,120" fill="#064E3B" opacity="0.4" />
          <path d="M20,70 Q55,50 65,30 Q45,50 20,70" fill="#064E3B" opacity="0.4" />
        </svg>
      </div>

      <div className="absolute top-24 right-0 w-32 h-64 opacity-20 pointer-events-none translate-x-12 hidden lg:block scale-x-[-1]">
        <svg viewBox="0 0 100 200" fill="none" stroke="#064E3B" strokeWidth="2" className="w-full h-full">
          <path d="M10,200 Q40,120 20,40" />
          <path d="M20,160 Q60,150 70,130 Q50,140 20,160" fill="#064E3B" opacity="0.4" />
          <path d="M25,120 Q65,100 80,80 Q55,100 25,120" fill="#064E3B" opacity="0.4" />
          <path d="M20,70 Q55,50 65,30 Q45,50 20,70" fill="#064E3B" opacity="0.4" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* ================= HERO SECTION ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E2EFE9] dark:bg-[#073829] border border-[#C5DDD1] dark:border-[#0E4738] text-[#064E3B] dark:text-[#A7F3D0] text-xs font-bold uppercase tracking-wider">
              <span className="text-base leading-none">🌱</span>
              <span>BY ANZLES · 100% FREE PLATFORM</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black font-serif tracking-tight text-[#064E3B] dark:text-[#A7F3D0] leading-[1.12]">
              Explore Stories <br />
              <span className="text-[#064E3B] dark:text-white">in Tamil</span>
            </h1>

            {/* Description */}
            <p className="text-stone-700 dark:text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Discover a magical world of timeless Tamil folktales, captivating bedtime fables, and inspiring cultural sagas. Immerse your family in reading or listening to original stories anytime, anywhere — completely free.
            </p>

            {/* 3 Benefit Checkmarks */}
            <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-semibold text-[#064E3B] dark:text-[#A7F3D0]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Zero Subscription Fees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Original Storybook Art</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Professional Tamil Audio</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Audio Showcase Card (Matching Attached Screenshot) */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-lg lg:max-w-none rounded-[32px] overflow-hidden border-2 border-[#E3DCBA] dark:border-[#0F4738] shadow-2xl bg-white dark:bg-[#073224]">
              <img
                src="/images/hero-art.jpg"
                alt="மாயம் நிறைந்த தமிழ் கதைகள்"
                className="w-full h-auto object-cover max-h-[460px] block"
              />
              <Link
                to="/categories"
                className="absolute bottom-4 left-4 right-4 p-3.5 sm:p-4 rounded-2xl bg-white/95 dark:bg-[#063324]/95 backdrop-blur-md border border-[#E3DCBA] dark:border-[#0F4738] shadow-lg flex items-center justify-between hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#064E3B] text-[#A7F3D0] flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
                    <Sparkles className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <p className="font-bold text-sm font-tamil text-[#064E3B] dark:text-[#A7F3D0] leading-tight">
                      மாயம் நிறைந்த தமிழ் கதைகள்
                    </p>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300">
                      A magical world of stories awaits you
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#E8F0E2] dark:bg-[#073224] text-[#064E3B] dark:text-[#A7F3D0] flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ================= QUICK SEARCH & FEATURED STORIES CATALOG ================= */}
        <section className="mt-14 pt-10 border-t border-[#E3DCBA]/80 dark:border-[#0F4738] space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#166534] dark:text-[#A7F3D0]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Featured Audiobooks</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-serif text-[#064E3B] dark:text-[#F8F5E9]">
                சிறப்பு தமிழ் கதைகள் (Featured Stories)
              </h2>
            </div>

            <form
              onSubmit={handleHomeSearch}
              className="flex items-center gap-2 w-full md:w-auto md:min-w-[320px]"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="search"
                  value={homeSearchQuery}
                  onChange={(e) => setHomeSearchQuery(e.target.value)}
                  placeholder="Search Tamil stories, authors..."
                  aria-label="Search featured stories"
                  className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm rounded-full bg-white dark:bg-[#073224] border border-[#DDD5C0] dark:border-[#0E4738] focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] outline-none text-stone-800 dark:text-stone-100"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-full bg-[#064E3B] hover:bg-[#166534] text-white text-xs sm:text-sm font-bold transition-colors shrink-0"
              >
                Search
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredStories.map((story) => (
              <Link
                key={story.id}
                to={`/stories/${story.slug}`}
                className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-[#083325] border-2 border-[#E3DCBA] dark:border-[#124835] p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0E2] dark:bg-[#032419] px-3 py-1 text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0]">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[140px]">{story.category}</span>
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      4.9
                    </span>
                  </div>
                  <h3 className="font-bold font-serif text-lg leading-snug text-[#064E3B] dark:text-[#F8F5E9] group-hover:text-[#166534] transition-colors line-clamp-2">
                    {story.title}
                  </h3>
                  <p className="text-xs font-medium text-stone-600 dark:text-stone-300 line-clamp-1">
                    {story.authorName}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E3DCBA]/60 dark:border-[#124835] flex items-center justify-between text-xs font-semibold text-[#064E3B] dark:text-[#A7F3D0]">
                  <span className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                    <Headphones className="w-3.5 h-3.5 text-[#166534] dark:text-emerald-400" />
                    {story.durationMinutes} mins · Free
                  </span>
                  <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Listen Now <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex justify-center pt-2">
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#064E3B] hover:bg-[#166534] text-white font-bold text-sm shadow-lg shadow-emerald-950/20 hover:scale-[1.02] transition-all"
            >
              <span>அனைத்து கதைகளையும் காண்க (Explore Full Story Catalog)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
