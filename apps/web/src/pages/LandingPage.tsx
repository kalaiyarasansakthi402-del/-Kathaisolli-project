import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Headphones,
  Sparkles,
  Heart,
  ChevronRight,
  Play,
  Pause,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  Star,
  Compass,
  ArrowRight,
  Leaf,
  Volume2,
  Lock,
  Mail,
  User,
  Radio,
  Clock,
  Download,
  Share2,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { playEpisode, isPlaying, currentTrack, togglePlay } = usePlayer();

  // Local demo audio state for Clever Crow
  const isCleverCrowActive = currentTrack?.title === 'காக்கையின் தாகம் (The Clever Crow)';

  const handlePlayCleverCrow = () => {
    if (isCleverCrowActive) {
      togglePlay();
    } else {
      playEpisode({
        episodeId: 'ep-clever-crow',
        title: 'காக்கையின் தாகம் (The Clever Crow)',
        seriesTitle: 'பஞ்சதந்திரக் கதைகள் (Panchatantra)',
        coverImageUrl: '/images/story-clever-crow.jpg',
        narratorName: 'கதைசொல்லி குழு (Kathaisolli Studio)',
        durationSec: 360,
      });
    }
  };

  const handlePlayStory = (story: {
    id: string;
    title: string;
    seriesTitle: string;
    cover: string;
    durationSec: number;
  }) => {
    playEpisode({
      episodeId: story.id,
      title: story.title,
      seriesTitle: story.seriesTitle,
      coverImageUrl: story.cover,
      narratorName: 'By Anzles Studio',
      durationSec: story.durationSec,
    });
  };

  const popularStories = [
    {
      id: 'panchatantra-stories',
      title: 'Panchatantra Stories',
      tamilTitle: 'பஞ்சதந்திர கதைகள்',
      category: 'Moral Stories',
      categoryTamil: 'நீதிக்கதைகள்',
      cover: '/images/story-panchatantra.jpg',
      rating: '4.9',
      count: '18 Stories',
      durationSec: 420,
      description: 'Timeless animal fables of wit, wisdom, and friendship taught through enchanting jungle lore.',
    },
    {
      id: 'tamil-folk-tales',
      title: 'Tamil Folk Tales',
      tamilTitle: 'தமிழ் நாடோடிக் கதைகள்',
      category: 'Culture & Tradition',
      categoryTamil: 'பாரம்பரியம்',
      cover: '/images/story-tamil-folk.jpg',
      rating: '4.8',
      count: '24 Stories',
      durationSec: 510,
      description: 'Rich cultural legends, oral traditions, and heartwarming village fables passed down for generations.',
    },
    {
      id: 'bedtime-stories',
      title: 'Bedtime Stories',
      tamilTitle: 'தாலாட்டுக் கதைகள்',
      category: 'For Kids',
      categoryTamil: 'குழந்தைகளுக்கு',
      cover: '/images/story-bedtime.jpg',
      rating: '5.0',
      count: '32 Stories',
      durationSec: 380,
      description: 'Soothing bedtime tales designed with calm soothing narration to guide little ones to sweet dreams.',
    },
    {
      id: 'historical-stories',
      title: 'Historical Stories',
      tamilTitle: 'வரலாற்று கதைகள்',
      category: 'Tamil History',
      categoryTamil: 'சோழர் வரலாறு',
      cover: '/images/story-historical.jpg',
      rating: '4.9',
      count: '15 Epics',
      durationSec: 680,
      description: 'The monumental rise of the Cholas, Pandyas, and Cheras — kings, valor, and majestic temples.',
    },
    {
      id: 'motivational-stories',
      title: 'Motivational Stories',
      tamilTitle: 'தன்னம்பிக்கை கதைகள்',
      category: 'Life Lessons',
      categoryTamil: 'வாழ்வியல் நெறி',
      cover: '/images/story-motivational.jpg',
      rating: '4.9',
      count: '20 Stories',
      durationSec: 450,
      description: 'Inspiring life lessons from Thiruvalluvar, ancient sages, and modern conquerors to fuel your spirit.',
    },
  ];

  return (
    <div className="bg-[#F8F5E9] dark:bg-[#033B2B] text-[#173D2E] dark:text-[#F8F5E9] transition-colors duration-200">
      {/* ============================================================== */}
      {/* 1. HERO SECTION (Botanical Green, Storybook Hero Art) */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Heading, Subtitle & CTA */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F0E2] dark:bg-[#083325] border border-[#064E3B]/20 text-[#064E3B] dark:text-[#A7F3D0] text-xs font-bold tracking-wide uppercase shadow-sm">
              <Leaf className="w-4 h-4 fill-current text-[#064E3B] dark:text-emerald-400" />
              <span>By Anzles · 100% Free Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight text-[#064E3B] dark:text-[#F8F5E9] leading-[1.15]">
              Explore Stories <br />
              <span className="text-[#166534] dark:text-[#A7F3D0]">in Tamil</span>
            </h1>

            <p className="text-base sm:text-lg text-[#173D2E]/80 dark:text-stone-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
              Discover a magical world of timeless Tamil folktales, captivating bedtime fables, and inspiring cultural sagas. Immerse your family in reading or listening to original stories anytime, anywhere — completely free.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/categories"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#064E3B] hover:bg-[#166534] text-white font-bold text-base shadow-xl shadow-emerald-950/20 hover:scale-[1.02] transition-all"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/categories"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-[#E8F0E2] dark:bg-[#083325] hover:bg-[#D5E3CD] dark:hover:bg-[#0D4432] text-[#064E3B] dark:text-[#A7F3D0] font-bold text-base border border-[#064E3B]/20 transition-all"
              >
                <Compass className="w-5 h-5 text-[#064E3B] dark:text-[#A7F3D0]" />
                <span>Explore Catalog</span>
              </Link>
            </div>

            {/* Quick Guarantees */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#173D2E]/70 dark:text-stone-300 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#064E3B] dark:text-emerald-400" />
                <span>Zero Subscription Fees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#064E3B] dark:text-emerald-400" />
                <span>Original Storybook Art</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#064E3B] dark:text-emerald-400" />
                <span>Professional Tamil Audio</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Audio Showcase Card (Text & Audio Branding) */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative group max-w-md lg:max-w-none w-full">
              <div className="relative rounded-3xl overflow-hidden border-2 border-[#E3DCBA] dark:border-[#124835] bg-gradient-to-br from-[#064E3B] via-[#083325] to-[#032419] p-7 sm:p-10 text-white shadow-2xl flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-[#A7F3D0] border border-white/15">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>மாயம் நிறைந்த தமிழ் கதைகள்</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black font-serif text-[#F8F5E9] leading-snug">
                    "ஒவ்வொரு கதைக்கும் ஒரு குரல். ஒவ்வொரு குரலிலும் ஒரு புதிய உலகம்."
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A7F3D0]/80 leading-relaxed font-tamil">
                    செந்தமிழ் இலக்கியங்கள், வரலாற்றுப் புதினங்கள், தன்னம்பிக்கைப் பாடங்கள் மற்றும் குழந்தைகளின் நீதிக்கதைகள் — அனைத்தும் உங்கள் விரல் நுனியில் 100% இலவசம்.
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-[#E8F0E2]/80">
                  <span>By Anzles Studio</span>
                  <Link
                    to="/categories"
                    className="inline-flex items-center gap-1.5 font-bold text-[#A7F3D0] hover:underline"
                  >
                    <span>ஆடியோ கேட்க →</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. FOUR FEATURE CARDS SECTION */}
      {/* ============================================================== */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Read Stories */}
          <div className="p-7 rounded-2xl bg-[#FFFFFF] dark:bg-[#083325] border border-[#E3DCBA] dark:border-[#124835] shadow-sm hover:shadow-md transition-shadow group flex flex-col items-start">
            <div className="w-12 h-12 rounded-full bg-[#064E3B] text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm">
              <BookOpen className="w-6 h-6 text-[#A7F3D0]" />
            </div>
            <h3 className="text-xl font-bold font-serif text-[#064E3B] dark:text-[#F8F5E9] mb-2">
              Read Stories
            </h3>
            <p className="text-sm text-[#173D2E]/75 dark:text-stone-300 leading-relaxed font-sans">
              Enjoy beautifully formatted stories and articles in rich Tamil script with adjustable typography and reading comfort.
            </p>
          </div>

          {/* Card 2: Listen Stories */}
          <div className="p-7 rounded-2xl bg-[#FFFFFF] dark:bg-[#083325] border border-[#E3DCBA] dark:border-[#124835] shadow-sm hover:shadow-md transition-shadow group flex flex-col items-start">
            <div className="w-12 h-12 rounded-full bg-[#064E3B] text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm">
              <Headphones className="w-6 h-6 text-[#A7F3D0]" />
            </div>
            <h3 className="text-xl font-bold font-serif text-[#064E3B] dark:text-[#F8F5E9] mb-2">
              Listen Stories
            </h3>
            <p className="text-sm text-[#173D2E]/75 dark:text-stone-300 leading-relaxed font-sans">
              Experience expressive voice narrations accompanied by gentle ambient scores that bring characters alive.
            </p>
          </div>

          {/* Card 3: For All Ages */}
          <div className="p-7 rounded-2xl bg-[#FFFFFF] dark:bg-[#083325] border border-[#E3DCBA] dark:border-[#124835] shadow-sm hover:shadow-md transition-shadow group flex flex-col items-start">
            <div className="w-12 h-12 rounded-full bg-[#064E3B] text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm">
              <Heart className="w-6 h-6 text-[#A7F3D0]" />
            </div>
            <h3 className="text-xl font-bold font-serif text-[#064E3B] dark:text-[#F8F5E9] mb-2">
              For All Ages
            </h3>
            <p className="text-sm text-[#173D2E]/75 dark:text-stone-300 leading-relaxed font-sans">
              From bedtime fables for toddlers to deep philosophical Sangam epics for elders, stories for the whole family.
            </p>
          </div>

          {/* Card 4: Personalized */}
          <div className="p-7 rounded-2xl bg-[#FFFFFF] dark:bg-[#083325] border border-[#E3DCBA] dark:border-[#124835] shadow-sm hover:shadow-md transition-shadow group flex flex-col items-start">
            <div className="w-12 h-12 rounded-full bg-[#064E3B] text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm">
              <Sparkles className="w-6 h-6 text-[#A7F3D0]" />
            </div>
            <h3 className="text-xl font-bold font-serif text-[#064E3B] dark:text-[#F8F5E9] mb-2">
              Personalized
            </h3>
            <p className="text-sm text-[#173D2E]/75 dark:text-stone-300 leading-relaxed font-sans">
              Smart recommendations tailored to your taste, offline favorites, custom playlists, and synchronized progress.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. POPULAR STORIES SECTION (5 Illustrated Storybook Cards) */}
      {/* ============================================================== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#166534] dark:text-[#A7F3D0] mb-1">
              <Leaf className="w-3.5 h-3.5 fill-current" />
              <span>கதை வரிசை (Curated Catalog)</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-serif text-[#064E3B] dark:text-[#F8F5E9]">
              Popular Stories
            </h2>
          </div>
          <Link
            to="/categories?category=all"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#064E3B] dark:text-[#A7F3D0] hover:text-[#166534] hover:underline"
          >
            <span>View All Stories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 5 Story Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {popularStories.map((story) => (
            <div
              key={story.id}
              className="bg-white dark:bg-[#083325] rounded-2xl border border-[#E3DCBA] dark:border-[#124835] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
            >
              {/* Audio Card Header */}
              <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#064E3B] via-[#093A2D] to-[#032319] p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#032419]/90 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold text-[#A7F3D0] shadow-sm">
                    {story.category}
                  </span>
                </div>
                <div className="flex items-center justify-center my-auto">
                  <div className="w-12 h-12 rounded-full bg-[#042117]/80 border border-[#A7F3D0]/30 flex items-center justify-center shadow-lg">
                    <Headphones className="w-6 h-6 text-[#A7F3D0]" />
                  </div>
                </div>
                {/* Play Button Overlay */}
                <button
                  onClick={() =>
                    handlePlayStory({
                      id: story.id,
                      title: story.tamilTitle,
                      seriesTitle: story.title,
                      cover: story.cover,
                      durationSec: story.durationSec,
                    })
                  }
                  title="Listen to Story"
                  className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-[#064E3B] text-white flex items-center justify-center shadow-lg group-hover:scale-110 hover:bg-[#166534] transition-all"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>
                {/* Rating Badge */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-amber-300 text-xs font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{story.rating}</span>
                </div>
              </div>

              {/* Story Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#166534] dark:text-[#A7F3D0] mb-1">
                    {story.category}
                  </div>
                  <h3 className="font-bold font-serif text-[#064E3B] dark:text-[#F8F5E9] text-base line-clamp-1 group-hover:text-[#166534] transition-colors">
                    {story.title}
                  </h3>
                  <div className="text-xs font-semibold font-tamil text-stone-600 dark:text-stone-300 mb-2">
                    {story.tamilTitle}
                  </div>
                  <p className="text-xs text-[#173D2E]/75 dark:text-stone-300 line-clamp-2 leading-relaxed">
                    {story.description}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-[#E3DCBA]/60 dark:border-[#124835] flex items-center justify-between text-xs font-medium text-stone-500 dark:text-stone-400">
                  <span>{story.count}</span>
                  <Link
                    to={`/categories?category=${encodeURIComponent(story.category)}`}
                    className="text-[#064E3B] dark:text-[#A7F3D0] font-bold hover:underline"
                  >
                    Open →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. SMARTPHONE APP MOCKUP SHOWCASE (4 Mobile Screens) */}
      {/* ============================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8F0E2] dark:bg-[#083325] text-[#064E3B] dark:text-[#A7F3D0] text-xs font-bold uppercase tracking-wider">
            <Smartphone className="w-4 h-4" />
            <span>Mobile App Experience</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif text-[#064E3B] dark:text-[#F8F5E9]">
            Kathaisolli on Your Phone
          </h2>
          <p className="text-base text-[#173D2E]/80 dark:text-stone-300">
            Enjoy an intuitive, elegant mobile experience designed for storytelling on Android & iOS.
          </p>
        </div>

        {/* 4 Realistic Smartphone Frames */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* PHONE 1: Welcome Screen */}
          <div className="bg-[#1A2621] p-3 rounded-[40px] shadow-2xl border-4 border-[#334D40] max-w-xs mx-auto w-full">
            <div className="bg-[#F8F5E9] text-[#173D2E] rounded-[32px] overflow-hidden h-[540px] flex flex-col justify-between p-5 relative border border-stone-300">
              {/* Dynamic Island / Notch */}
              <div className="w-24 h-4 bg-black rounded-full mx-auto mb-4" />

              {/* Center Content */}
              <div className="my-auto text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#064E3B] text-white flex items-center justify-center mx-auto shadow-md">
                  <Leaf className="w-9 h-9 text-[#A7F3D0] fill-current" />
                </div>
                <div>
                  <h4 className="text-2xl font-black font-serif text-[#064E3B]">Kathaisolli</h4>
                  <p className="text-xs font-tamil font-semibold text-[#166534]">கதைசொல்லி</p>
                </div>
                <div className="px-2">
                  <p className="text-sm font-serif font-bold text-[#173D2E]">
                    Stories for a Brighter Tomorrow
                  </p>
                  <p className="text-[11px] text-stone-600 mt-1">
                    Discover the magical warmth of Tamil stories, folktales & wisdom anywhere.
                  </p>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="space-y-2 pt-4">
                <Link
                  to="/categories"
                  className="block w-full py-2.5 rounded-full bg-[#064E3B] text-white font-bold text-xs text-center shadow-md hover:bg-[#166534]"
                >
                  Explore Stories
                </Link>
                <Link
                  to="/login"
                  className="block w-full py-2.5 rounded-full border border-[#064E3B] text-[#064E3B] font-bold text-xs text-center hover:bg-[#E8F0E2]"
                >
                  Log In
                </Link>
              </div>
            </div>
          </div>

          {/* PHONE 2: Login Screen */}
          <div className="bg-[#1A2621] p-3 rounded-[40px] shadow-2xl border-4 border-[#334D40] max-w-xs mx-auto w-full">
            <div className="bg-[#F8F5E9] text-[#173D2E] rounded-[32px] overflow-hidden h-[540px] flex flex-col justify-between p-5 relative border border-stone-300">
              {/* Dynamic Island */}
              <div className="w-24 h-4 bg-black rounded-full mx-auto mb-3" />

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-[#064E3B] flex items-center justify-center text-white">
                    <Leaf className="w-4 h-4 text-[#A7F3D0] fill-current" />
                  </div>
                  <span className="font-bold font-serif text-sm text-[#064E3B]">Kathaisolli</span>
                </div>

                <h4 className="text-xl font-black font-serif text-[#064E3B] mb-1">Welcome Back</h4>
                <p className="text-[11px] text-stone-600 mb-5">
                  Sign in to access your saved library & listening history.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">
                      Email Address
                    </label>
                    <div className="flex items-center bg-white rounded-xl px-3 py-2 border border-stone-300 text-xs">
                      <Mail className="w-3.5 h-3.5 text-stone-400 mr-2" />
                      <span className="text-stone-500">listener@kathaisolli.com</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">
                      Password
                    </label>
                    <div className="flex items-center bg-white rounded-xl px-3 py-2 border border-stone-300 text-xs">
                      <Lock className="w-3.5 h-3.5 text-stone-400 mr-2" />
                      <span className="text-stone-400">••••••••••••</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-[#064E3B] hover:underline cursor-pointer">
                      Forgot Password?
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Link
                  to="/login"
                  className="block w-full py-2.5 rounded-full bg-[#064E3B] text-white font-bold text-xs text-center shadow-md hover:bg-[#166534]"
                >
                  Sign In
                </Link>
                <p className="text-center text-[10px] text-stone-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-bold text-[#064E3B] underline">
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* PHONE 3: Sign Up Screen */}
          <div className="bg-[#1A2621] p-3 rounded-[40px] shadow-2xl border-4 border-[#334D40] max-w-xs mx-auto w-full">
            <div className="bg-[#F8F5E9] text-[#173D2E] rounded-[32px] overflow-hidden h-[540px] flex flex-col justify-between p-5 relative border border-stone-300">
              {/* Dynamic Island */}
              <div className="w-24 h-4 bg-black rounded-full mx-auto mb-3" />

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-[#064E3B] flex items-center justify-center text-white">
                    <Leaf className="w-4 h-4 text-[#A7F3D0] fill-current" />
                  </div>
                  <span className="font-bold font-serif text-sm text-[#064E3B]">Kathaisolli</span>
                </div>

                <h4 className="text-xl font-black font-serif text-[#064E3B] mb-1">
                  Create Account
                </h4>
                <p className="text-[11px] text-stone-600 mb-4">
                  Join thousands of Tamil audio story lovers. 100% Free.
                </p>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-600 mb-0.5">
                      Full Name
                    </label>
                    <div className="flex items-center bg-white rounded-xl px-3 py-1.5 border border-stone-300 text-xs">
                      <User className="w-3.5 h-3.5 text-stone-400 mr-2" />
                      <span className="text-stone-500">Anzles Kumar</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-600 mb-0.5">
                      Email Address
                    </label>
                    <div className="flex items-center bg-white rounded-xl px-3 py-1.5 border border-stone-300 text-xs">
                      <Mail className="w-3.5 h-3.5 text-stone-400 mr-2" />
                      <span className="text-stone-500">anzles@gmail.com</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-600 mb-0.5">
                      Password
                    </label>
                    <div className="flex items-center bg-white rounded-xl px-3 py-1.5 border border-stone-300 text-xs">
                      <Lock className="w-3.5 h-3.5 text-stone-400 mr-2" />
                      <span className="text-stone-400">••••••••••••</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-3">
                <Link
                  to="/register"
                  className="block w-full py-2.5 rounded-full bg-[#064E3B] text-white font-bold text-xs text-center shadow-md hover:bg-[#166534]"
                >
                  Create Free Account
                </Link>
                <p className="text-center text-[10px] text-stone-600">
                  Already registered?{' '}
                  <Link to="/login" className="font-bold text-[#064E3B] underline">
                    Log In
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* PHONE 4: Story Player Screen ("The Clever Crow") */}
          <div className="bg-[#1A2621] p-3 rounded-[40px] shadow-2xl border-4 border-[#334D40] max-w-xs mx-auto w-full">
            <div className="bg-[#F8F5E9] text-[#173D2E] rounded-[32px] overflow-hidden h-[540px] flex flex-col justify-between p-5 relative border border-stone-300">
              {/* Dynamic Island */}
              <div className="w-24 h-4 bg-black rounded-full mx-auto mb-2" />

              {/* Story Player Header */}
              <div className="flex items-center justify-between text-xs font-semibold text-stone-500 mb-2">
                <span>Now Playing</span>
                <span className="text-[#064E3B] font-bold">1.0x</span>
              </div>

              {/* Story Audio Emblem */}
              <div className="rounded-2xl overflow-hidden aspect-square border-2 border-[#145642] shadow-md bg-gradient-to-br from-[#064E3B] via-[#093A2D] to-[#032319] flex flex-col items-center justify-center p-4 relative group">
                <div className="w-16 h-16 rounded-full bg-[#032419]/90 border border-[#A7F3D0]/30 flex items-center justify-center shadow-lg mb-2">
                  <Headphones className="w-8 h-8 text-[#A7F3D0]" />
                </div>
                <span className="text-[11px] font-bold text-[#A7F3D0]">The Clever Crow</span>
                <button
                  onClick={handlePlayCleverCrow}
                  className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="w-12 h-12 rounded-full bg-[#064E3B] text-white flex items-center justify-center shadow-xl">
                    {isCleverCrowActive && isPlaying ? (
                      <Pause className="w-6 h-6 fill-current" />
                    ) : (
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    )}
                  </div>
                </button>
              </div>

              {/* Title & Metadata */}
              <div className="text-center my-2">
                <h4 className="font-black font-serif text-base text-[#064E3B]">The Clever Crow</h4>
                <p className="text-xs font-tamil font-semibold text-[#166534]">
                  காக்கையின் தாகம் · Panchatantra
                </p>
              </div>

              {/* Audio Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-stone-300 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#064E3B] h-full w-[45%] rounded-full" />
                </div>
                <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                  <span>02:45</span>
                  <span>06:00</span>
                </div>
              </div>

              {/* Audio Controls */}
              <div className="flex items-center justify-center gap-4 py-1">
                <button
                  onClick={handlePlayCleverCrow}
                  className="w-12 h-12 rounded-full bg-[#064E3B] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                >
                  {isCleverCrowActive && isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>
              </div>

              {/* Bottom Quick Controls */}
              <div className="flex items-center justify-around pt-2 border-t border-stone-200 text-stone-500">
                <Clock className="w-4 h-4 hover:text-[#064E3B] cursor-pointer" />
                <Volume2 className="w-4 h-4 hover:text-[#064E3B] cursor-pointer" />
                <Download className="w-4 h-4 hover:text-[#064E3B] cursor-pointer" />
                <Share2 className="w-4 h-4 hover:text-[#064E3B] cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. DOWNLOAD SECTION (Google Play, App Store, 4 Feature Badges) */}
      {/* ============================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-[#E8F0E2] via-[#F3EFE0] to-[#E8F0E2] dark:from-[#083325] dark:via-[#042419] dark:to-[#083325] rounded-3xl p-8 sm:p-12 lg:p-16 border-2 border-[#D5CEBA] dark:border-[#124835] shadow-xl text-center space-y-8 relative overflow-hidden">
          {/* Decorative Leaf Motifs */}
          <div className="absolute top-4 left-4 text-[#064E3B]/10 dark:text-emerald-400/10 pointer-events-none">
            <Leaf className="w-24 h-24" />
          </div>
          <div className="absolute bottom-4 right-4 text-[#064E3B]/10 dark:text-emerald-400/10 pointer-events-none rotate-180">
            <Leaf className="w-24 h-24" />
          </div>

          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#064E3B] text-white text-xs font-bold uppercase tracking-wider">
              <Download className="w-4 h-4" />
              <span>Available for Android & iOS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black font-serif text-[#064E3B] dark:text-[#F8F5E9]">
              Download Kathaisolli
            </h2>
            <p className="text-base sm:text-lg text-[#173D2E]/80 dark:text-stone-300 leading-relaxed">
              Carry the treasure chest of Tamil stories in your pocket. Listen without internet, sync across all your phones, and never miss a tale.
            </p>
          </div>

          {/* Store Download Badges */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            {/* Direct Android APK Download Badge */}
            <a
              href="/downloads/kathaisolli-v1.0.0.apk"
              download="kathaisolli-v1.0.0.apk"
              className="w-full sm:w-auto inline-flex items-center gap-3.5 px-6 py-3.5 rounded-2xl bg-[#064E3B] text-white hover:bg-[#166534] shadow-xl transition-all hover:scale-105 border border-[#A7F3D0]/30 group"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Download className="w-5 h-5 text-[#A7F3D0] group-hover:translate-y-0.5 transition-transform" />
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wider text-[#A7F3D0] font-bold">
                  DIRECT APK DOWNLOAD
                </div>
                <div className="text-base font-bold leading-tight">Download Android APK</div>
                <div className="text-[10px] text-white/75 font-mono">v1.0.0 · Installable APK (81 MB)</div>
              </div>
            </a>

            {/* Apple App Store / TestFlight Badge */}
            <div className="relative group">
              <button
                type="button"
                onClick={() =>
                  alert(
                    'Kathaisolli iOS App is currently in TestFlight internal preview. Public App Store release coming soon! You can stream immediately on Safari or any mobile web browser.',
                  )
                }
                className="w-full sm:w-auto inline-flex items-center gap-3.5 px-6 py-3.5 rounded-2xl bg-black text-white hover:bg-stone-900 shadow-xl transition-all hover:scale-105 border border-stone-800 text-left"
              >
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.94-2.93-.93.04-2.06.62-2.73 1.4-.59.68-1.11 1.77-.97 2.83 1.04.08 2.13-.53 2.76-1.3" />
                </svg>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-stone-300">
                      APPLE TESTFLIGHT
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#D6A83F] text-black">
                      Coming Soon
                    </span>
                  </div>
                  <div className="text-base font-bold leading-tight">Join TestFlight</div>
                  <div className="text-[10px] text-stone-400">iOS 15.0+ · iPhone & iPad</div>
                </div>
              </button>
            </div>
          </div>

          {/* 4 Feature Badges with checkmarks */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 max-w-4xl mx-auto border-t border-[#064E3B]/15 dark:border-[#124835] relative z-10">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0]">
              <CheckCircle2 className="w-4 h-4 fill-[#064E3B] text-white dark:fill-emerald-400 dark:text-[#083325]" />
              <span>Offline Access</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0]">
              <CheckCircle2 className="w-4 h-4 fill-[#064E3B] text-white dark:fill-emerald-400 dark:text-[#083325]" />
              <span>Audio Stories</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0]">
              <CheckCircle2 className="w-4 h-4 fill-[#064E3B] text-white dark:fill-emerald-400 dark:text-[#083325]" />
              <span>Save Favorites</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0]">
              <CheckCircle2 className="w-4 h-4 fill-[#064E3B] text-white dark:fill-emerald-400 dark:text-[#083325]" />
              <span>Sync Across Devices</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
