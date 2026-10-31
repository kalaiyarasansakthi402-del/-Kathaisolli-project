import React from 'react';
import { Link } from 'react-router-dom';
import { Headphones, Sparkles, ShieldCheck, HeartHandshake, Mic, Play, ChevronRight, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { StoryCard } from '../components/StoryCard';
import { StoryGridSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { api } = useAuth();

  const { data: homeData, isLoading } = useQuery({
    queryKey: ['catalog', 'home'],
    queryFn: () => api.catalog.getHome(),
  });

  const featuredStories = (homeData?.featured || homeData?.featuredSeries || []).slice(0, 4);
  const latestStories = (homeData?.latest || homeData?.trendingSeries || []).slice(0, 4);
  const displayStories = featuredStories.length > 0 ? featuredStories : latestStories;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-[#0A261D] to-[#101A16] text-white pt-16 pb-24 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Subtle decorative circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          {/* Free Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-800/60 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-medium backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>100% இலவசம் • No Subscriptions • No Hidden Paywalls</span>
          </div>

          {/* Master Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-serif text-emerald-50 leading-tight">
            ஒவ்வொரு கதைக்கும் <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-mint-200 to-emerald-400">
              ஒரு குரல்.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-xl text-emerald-100/80 font-light leading-relaxed">
            பொன்னியின் செல்வன் முதல் நவீன திகில் மற்றும் தன்னம்பிக்கை கதைகள் வரை, உங்களை மயக்கும் உயர்தர தமிழ் ஆடியோ கதைகளின் உன்னத தளம்.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/home"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-8 py-4 text-base sm:text-lg shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:scale-105"
            >
              <Play className="h-5 w-5 fill-current" />
              <span>கேட்கத் தொடங்குங்கள் (Start Listening)</span>
            </Link>

            <Link
              to="/explore"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-8 py-4 text-base sm:text-lg backdrop-blur-md transition-all duration-200"
            >
              <span>கதைகளைத் தேடுங்கள் (Explore Catalog)</span>
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-emerald-800/40 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300">100%</div>
              <div className="text-xs text-emerald-200/70 mt-1">என்றும் இலவசம் (Always Free)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300">10,000+</div>
              <div className="text-xs text-emerald-200/70 mt-1">கேட்கும் மணித்துளிகள்</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300">4.9 ★</div>
              <div className="text-xs text-emerald-200/70 mt-1">நேயர்கள் மதிப்பீடு</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300">HQ Audio</div>
              <div className="text-xs text-emerald-200/70 mt-1">தெளிவான தமிழ் குரல்</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 font-serif">
              பிரபலமான கதைகள் (Trending Stories)
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              நேயர்களால் அதிகம் விரும்பிக் கேட்கப்பட்ட தமிழ் காவியங்கள்
            </p>
          </div>
          <Link
            to="/explore"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            அனைத்தும் பார்க்க <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <StoryGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayStories.map((story) => (
              <StoryCard
                key={story.id}
                id={story.id}
                slug={story.slug}
                title={story.title}
                authorName={story.authorName || undefined}
                coverImage={story.coverImage}
                categoryName={story.category?.name}
              />
            ))}
          </div>
        )}
      </section>

      {/* Why Kathaisolli (Features) */}
      <section className="py-16 bg-emerald-50/50 dark:bg-emerald-950/20 border-y border-emerald-100 dark:border-emerald-900/30 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 font-serif">
              ஏன் கதைசொல்லி? (Why Kathaisolli?)
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-2">
              தமிழுக்கும் தமிழ் நேயர்களுக்கும் பிரத்யேகமாக உருவாக்கப்பட்ட சுதந்திரமான தளம்.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#14231E] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                முற்றிலும் இலவசம் (100% Free Forever)
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                எந்தவித சந்தாக்கட்டணமும் இல்லை. முதல் அத்தியாயம் முதல் இறுதி வரை அனைத்துக் கதைகளையும் வரம்பின்றி இலவசமாகக் கேட்கலாம்.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#14231E] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                <Mic className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                உயர்தர தமிழ் குரல் (Studio Quality Narration)
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                ஒவ்வொரு கதாபாத்திரத்தையும் கண்முன்னே நிறுத்தும் மெய்சிலிர்க்க வைக்கும் தமிழ் குரல் மற்றும் பின்னணி இசை வடிவமைப்பு.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#14231E] border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                படைப்பாளர்களுக்கான அரங்கம் (Creator Community)
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                தமிழ் எழுத்தாளர்களும் கதைசொல்லிகளும் தங்கள் திறமையை உலகெங்கும் வாழும் தமிழ் மக்களுக்குக் கொண்டு சேர்க்கும் களம்.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
          இப்போதே உங்கள் தமிழ் ஆடியோ பயணத்தைத் தொடங்குங்கள்
        </h2>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          கதைசொல்லி கணக்கு முற்றிலும் இலவசம். விளம்பர தொந்தரவின்றி சிறந்த கதைகளைக் கேட்டு மகிழுங்கள்.
        </p>
        <div className="pt-2">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-8 py-4 text-base shadow-lg shadow-emerald-900/20 transition-all duration-200 hover:scale-105"
          >
            <span>இலவச கணக்கு தொடங்கு (Sign Up Free)</span>
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};
