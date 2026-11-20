import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Headphones,
  BookOpen,
  ArrowRight,
  Infinity,
  Flame,
  Landmark,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAF7EE] dark:bg-[#03261C] text-[#173D2E] dark:text-[#F8F5E9] transition-colors py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
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
                  <p className="text-base sm:text-xl font-medium text-[#A7F3D0] mt-2 tracking-wide flex items-center gap-2">
                    <span>Tamil Audiobooks for Every Reader</span>
                    <span className="inline-flex items-center gap-0.5 text-[#34D399]" aria-hidden="true">
                      <span className="w-0.5 h-2.5 bg-current rounded-full animate-pulse" />
                      <span className="w-0.5 h-4 bg-current rounded-full" />
                      <span className="w-0.5 h-2 bg-current rounded-full" />
                      <span className="w-0.5 h-3 bg-current rounded-full animate-pulse" />
                    </span>
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

              {/* Right Column: Cartoon Child Reading Magical Storybook */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end items-center w-full">
                <div className="relative w-full max-w-[380px] sm:max-w-[440px] lg:max-w-[480px] group">
                  <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 border-white/90 bg-[#064E3B] transition-transform duration-300 group-hover:scale-[1.02]">
                    <img
                      src="/images/hero-storybook-child.png"
                      alt="Child reading magical Tamil audiobook storybook with enchanted castle and forest"
                      className="w-full h-auto object-contain block drop-shadow-md"
                      loading="eager"
                      fetchPriority="high"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.dataset.fallback) {
                          target.dataset.fallback = '1';
                          target.src = '/hero-storybook-child.png';
                        }
                      }}
                    />
                  </div>
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

                <div className="lg:col-span-5 flex justify-center lg:justify-end items-center w-full">
                  <div className="relative w-full max-w-[360px] sm:max-w-[420px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 border-white/80 bg-[#064E3B] transition-transform duration-300 hover:scale-[1.02]">
                    <img
                      src="/images/hero-storybook-child.png"
                      alt="Child reading magical Tamil audiobook storybook"
                      className="w-full h-auto object-contain block drop-shadow-md"
                      loading="eager"
                      fetchPriority="high"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.dataset.fallback) {
                          target.dataset.fallback = '1';
                          target.src = '/hero-storybook-child.png';
                        }
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
      </div>
    </div>
  );
};

export default HomePage;
