import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Headphones, ShieldCheck, Heart, Sparkles, BookOpen, Mic, Globe2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF7EE] dark:bg-[#03261C] text-[#173D2E] dark:text-[#F8F5E9] transition-colors">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F0E2] dark:bg-[#083325] border border-[#064E3B]/20 text-[#064E3B] dark:text-[#A7F3D0] text-xs font-bold tracking-wide">
            <Leaf className="w-4 h-4 fill-current" />
            <span>எங்கள் கதை · About Kathaisolli</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black font-serif text-[#064E3B] dark:text-[#F8F5E9] tracking-tight leading-tight">
            ஒவ்வொரு கதைக்கும் ஒரு குரல்.
          </h1>

          <p className="text-lg sm:text-xl font-tamil text-[#166534] dark:text-[#A7F3D0] font-semibold max-w-2xl mx-auto leading-relaxed">
            தமிழ் கலாச்சாரம், தொன்மை இலக்கியம் மற்றும் வரலாற்றுப் புதையல்களை அடுத்த தலைமுறைக்கு ஒலிவடிவில் கொண்டு சேர்க்கும் அர்ப்பணிப்பு.
          </p>
        </div>

        {/* Narrative Section */}
        <div className="bg-white dark:bg-[#083325] rounded-[32px] p-8 sm:p-12 border-2 border-[#E3DCBA] dark:border-[#124835] shadow-xl space-y-6 text-sm sm:text-base leading-relaxed">
          <h2 className="text-2xl font-black font-serif text-[#064E3B] dark:text-[#F8F5E9]">
            The Kathaisolli Vision (கதைசொல்லியின் நோக்கம்)
          </h2>
          <p className="text-[#173D2E]/90 dark:text-stone-200">
            Kathaisolli (கதைசொல்லி) was founded with a single pure intention: to revive the rich, ancient oral storytelling tradition of Tamil Nadu and make it universally accessible to Tamils worldwide—completely free, without subscriptions, paywalls, or barriers.
          </p>
          <p className="text-[#173D2E]/90 dark:text-stone-200 font-tamil leading-loose">
            பஞ்சதந்திர கதைகள், விக்கிரமாதித்தன் புதிர்கள், தெனாலிராமன் நகைச்சுவை, சங்க இலக்கிய மாண்புகள், கம்பராமாயண வரலாற்றுத் துளிகள் முதல் அறிவியல் புனைகதைகள் வரை அனைத்தையும் உயர்தர ஆடியோ வடிவில் வழங்கி வருகிறோம்.
          </p>
        </div>

        {/* Pillars / Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#083325] p-6 rounded-3xl border border-[#E3DCBA] dark:border-[#124835] shadow-md space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-[#064E3B] dark:text-[#A7F3D0] flex items-center justify-center">
              <Headphones className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-serif text-[#064E3B] dark:text-[#F8F5E9]">
              High-Fidelity Audio
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              Crystal-clear narration, rich ambient soundscapes, and professional background scoring crafted for deep immersion.
            </p>
          </div>

          <div className="bg-white dark:bg-[#083325] p-6 rounded-3xl border border-[#E3DCBA] dark:border-[#124835] shadow-md space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-serif text-[#064E3B] dark:text-[#F8F5E9]">
              100% Free & Open
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              Knowledge and heritage belong to all. No paid tiers, no gated episodes, and no intrusive commercial interruptions.
            </p>
          </div>

          <div className="bg-white dark:bg-[#083325] p-6 rounded-3xl border border-[#E3DCBA] dark:border-[#124835] shadow-md space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-serif text-[#064E3B] dark:text-[#F8F5E9]">
              Global Tamil Diaspora
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              Connecting children and adults from Tamil Nadu, Sri Lanka, Malaysia, Singapore, and worldwide back to their roots.
            </p>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center pt-8 space-y-4">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#064E3B] hover:bg-[#166534] text-white font-bold text-sm shadow-xl shadow-emerald-950/20 transition-all hover:scale-105 active:scale-95"
          >
            <BookOpen className="w-4 h-4" /> Start Listening Now (கதைகளை கேளுங்கள்)
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
