import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Headphones,
  BookOpen,
  Star,
  ArrowRight,
  Infinity,
  Flame,
  Landmark,
  Layers,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { COMPLETE_LIBRARY_CATALOG } from '../data/libraryCatalog';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, api } = useAuth();
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
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAF7EE] dark:bg-[#03261C] text-[#173D2E] dark:text-[#F8F5E9] transition-colors py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-10">
        
        {/* ========================================================================= */}
        {/* VIEW 1: FIRST-TIME VISIT (GUEST VIEW) — WHEN USER IS NOT LOGGED IN         */}
        {/* ========================================================================= */}
        {!user ? (
          <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#064E3B] via-[#054433] to-[#02281D] border border-[#166534]/40 shadow-2xl text-white p-6 sm:p-10 lg:p-14">
            {/* Subtle Foliage / Leaves Accent Overlays */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
              
              {/* Left Column: Kathaisolli Branding & Hero Copy */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h1 className="text-4xl sm:text-6xl font-black font-serif tracking-tight text-white leading-tight">
                    Kathaisolli
                  </h1>
                  <p className="text-2xl sm:text-3xl font-bold font-tamil text-[#FDE047] mt-1">
                    கதைசொல்லி
                  </p>
                  <p className="text-base sm:text-xl font-medium text-[#A7F3D0] mt-2 tracking-wide">
                    Tamil Audiobooks for Every Reader
                  </p>
                </div>

                {/* 3 Value Proposition Bullets */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-3 text-sm sm:text-base text-stone-100">
                    <Headphones className="w-5 h-5 text-[#FDE047] flex-shrink-0" />
                    <span>Thousands of Tamil Stories</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm sm:text-base text-stone-100">
                    <BookOpen className="w-5 h-5 text-[#FDE047] flex-shrink-0" />
                    <span>Classical to Modern Literature</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm sm:text-base text-stone-100">
                    <Infinity className="w-5 h-5 text-[#FDE047] flex-shrink-0" />
                    <span>Listen Anytime, Anywhere</span>
                  </div>
                </div>

                {/* Guest Action CTA Buttons (Matching View 1) */}
                <div className="pt-3 flex flex-wrap items-center gap-3 sm:gap-4">
                  <Link
                    to="/signup"
                    className="px-6 sm:px-8 py-3 rounded-full bg-white text-[#064E3B] font-bold text-sm sm:text-base shadow-xl shadow-black/20 hover:bg-[#FAF7EE] hover:scale-[1.02] active:scale-95 transition-all text-center"
                  >
                    Sign Up — Create Free Account
                  </Link>
                  <Link
                    to="/login"
                    className="px-6 sm:px-8 py-3 rounded-full bg-transparent text-white border-2 border-white/80 hover:bg-white/10 font-bold text-sm sm:text-base hover:scale-[1.02] active:scale-95 transition-all text-center"
                  >
                    Login — Existing User
                  </Link>
                </div>
              </div>

              {/* Right Column: Joyful Mascot & Audio Visual (Matching View 1) */}
              <div className="lg:col-span-5 flex justify-center items-center">
                <div className="relative group">
                  <img
                    src="/3.png"
                    alt="Kathaisolli Storytelling Mascot"
                    className="w-full max-w-[340px] sm:max-w-[420px] h-auto object-contain drop-shadow-2xl rounded-2xl transform group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/mascot.png';
                    }}
                  />
                </div>
              </div>
            </div>
          </section>
        ) : (
          /* ========================================================================= */
          /* VIEW 4: AUTHENTICATED USER VIEW — HERO & 5 CATEGORY CARDS                  */
          /* ========================================================================= */
          <div className="space-y-8">
            {/* Authenticated Hero Section */}
            <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#064E3B] via-[#054433] to-[#02281D] border border-[#166534]/40 shadow-xl text-white p-6 sm:p-10 lg:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
                <div className="lg:col-span-7 space-y-4">
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-tamil text-white leading-tight">
                    ஆயிரக்கணக்கான தமிழ் கதைகள் ஒரே இடத்தில்
                  </h1>
                  <p className="text-sm sm:text-base text-[#A7F3D0] font-medium">
                    Explore, Listen and Enjoy Tamil Audiobooks
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/categories"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#064E3B] border border-[#A7F3D0]/40 text-white font-bold text-sm shadow-md hover:bg-[#166534] transition-all hover:scale-[1.02]"
                    >
                      <span>Explore Categories</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-center lg:justify-end">
                  <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                    <img
                      src="/images/story-books-stack.jpg"
                      alt="Tamil Audiobooks Stack"
                      className="w-full h-48 sm:h-56 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/3.png';
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 5 Distinct Category Cards Row (Matching View 4 Mockup) */}
            <section>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                
                {/* 1. Motivation */}
                <Link
                  to="/categories?category=motivation"
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#073224] border border-[#E3DCBA] dark:border-[#0F4738] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col items-center text-center group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#E8F0E2] dark:bg-[#032419] text-[#064E3B] dark:text-[#A7F3D0] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Flame className="w-6 h-6 text-[#166534] dark:text-[#A7F3D0]" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-[#064E3B] dark:text-white">
                    Motivation
                  </h3>
                  <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 font-tamil mt-0.5">
                    உந்துதல் கதைகள்
                  </p>
                </Link>

                {/* 2. Literature */}
                <Link
                  to="/categories?category=literature"
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#073224] border border-[#E3DCBA] dark:border-[#0F4738] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col items-center text-center group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#E8F0E2] dark:bg-[#032419] text-[#064E3B] dark:text-[#A7F3D0] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-[#166534] dark:text-[#A7F3D0]" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-[#064E3B] dark:text-white">
                    Literature
                  </h3>
                  <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 font-tamil mt-0.5">
                    இலக்கியம்
                  </p>
                </Link>

                {/* 3. History */}
                <Link
                  to="/categories?category=history"
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#073224] border border-[#E3DCBA] dark:border-[#0F4738] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col items-center text-center group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#E8F0E2] dark:bg-[#032419] text-[#064E3B] dark:text-[#A7F3D0] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Landmark className="w-6 h-6 text-[#166534] dark:text-[#A7F3D0]" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-[#064E3B] dark:text-white">
                    History
                  </h3>
                  <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 font-tamil mt-0.5">
                    வரலாற்றுக் கதைகள்
                  </p>
                </Link>

                {/* 4. Mythology */}
                <Link
                  to="/categories?category=mythology"
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#073224] border border-[#E3DCBA] dark:border-[#0F4738] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col items-center text-center group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#E8F0E2] dark:bg-[#032419] text-[#064E3B] dark:text-[#A7F3D0] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6 text-[#166534] dark:text-[#A7F3D0]" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-[#064E3B] dark:text-white">
                    Mythology
                  </h3>
                  <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 font-tamil mt-0.5">
                    புராணக் கதைகள்
                  </p>
                </Link>

                {/* 5. General */}
                <Link
                  to="/categories?category=general"
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#073224] border border-[#E3DCBA] dark:border-[#0F4738] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col items-center text-center group col-span-2 sm:col-span-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#E8F0E2] dark:bg-[#032419] text-[#064E3B] dark:text-[#A7F3D0] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Layers className="w-6 h-6 text-[#166534] dark:text-[#A7F3D0]" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-[#064E3B] dark:text-white">
                    General
                  </h3>
                  <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 font-tamil mt-0.5">
                    பல்வேறு கதைகள்
                  </p>
                </Link>
              </div>
            </section>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SHARED SECTION: FEATURED AUDIOBOOKS CATALOG                               */}
        {/* ========================================================================= */}
        <section className="pt-4 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E3DCBA] dark:border-[#0F4738] pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#166534] dark:text-[#A7F3D0]">
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Featured Audiobooks</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-serif text-[#064E3B] dark:text-[#F8F5E9]">
                சிறப்பு தமிழ் கதைகள் (Popular Audiobooks)
              </h2>
            </div>

            <form
              onSubmit={handleHomeSearch}
              className="flex items-center gap-2 w-full md:w-auto md:min-w-[280px]"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="search"
                  value={homeSearchQuery}
                  onChange={(e) => setHomeSearchQuery(e.target.value)}
                  placeholder="Search books..."
                  aria-label="Search featured stories"
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-full bg-white dark:bg-[#073224] border border-[#DDD5C0] dark:border-[#0E4738] focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] outline-none text-stone-800 dark:text-stone-100"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-full bg-[#064E3B] hover:bg-[#166534] text-white text-xs sm:text-sm font-bold transition-colors shrink-0"
              >
                Search
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {featuredStories.map((story) => (
              <Link
                key={story.id}
                to={`/stories/${story.slug}`}
                className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-[#083325] border border-[#E3DCBA] dark:border-[#124835] p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 space-y-4"
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
                  <h3 className="font-bold font-serif text-base sm:text-lg leading-snug text-[#064E3B] dark:text-[#F8F5E9] group-hover:text-[#166534] transition-colors line-clamp-2">
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

          <div className="flex justify-center pt-4">
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-full bg-[#064E3B] hover:bg-[#166534] text-white font-bold text-xs sm:text-sm shadow-md hover:scale-[1.02] transition-all"
            >
              <span>Explore All Categories & Stories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
