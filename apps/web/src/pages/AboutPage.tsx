import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, BookOpen, Globe2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [lang, setLang] = useState<'ta' | 'en'>('ta');

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF7EE] dark:bg-[#03261C] text-[#173D2E] dark:text-[#F8F5E9] transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header & Language Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F0E2] dark:bg-[#083325] border border-[#064E3B]/20 text-[#064E3B] dark:text-[#A7F3D0] text-xs font-bold tracking-wide self-start">
            <Leaf className="w-4 h-4 fill-current" />
            <span>{lang === 'ta' ? 'எங்களைப் பற்றி' : 'ABOUT US'}</span>
          </div>

          <div
            role="group"
            aria-label="Language toggle"
            className="inline-flex items-center gap-1 p-1 rounded-full bg-white dark:bg-[#083325] border border-[#E3DCBA] dark:border-[#124835] shadow-sm self-start sm:self-auto"
          >
            <Globe2 className="w-4 h-4 text-[#064E3B] dark:text-[#A7F3D0] ml-2 mr-1" />
            <button
              type="button"
              onClick={() => setLang('ta')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold font-tamil transition-all ${
                lang === 'ta'
                  ? 'bg-[#064E3B] text-white shadow'
                  : 'text-[#173D2E] dark:text-stone-300 hover:bg-[#E8F0E2] dark:hover:bg-[#0F4738]'
              }`}
            >
              தமிழ்
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                lang === 'en'
                  ? 'bg-[#064E3B] text-white shadow'
                  : 'text-[#173D2E] dark:text-stone-300 hover:bg-[#E8F0E2] dark:hover:bg-[#0F4738]'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white dark:bg-[#083325] rounded-[32px] p-6 sm:p-10 lg:p-12 border-2 border-[#E3DCBA] dark:border-[#124835] shadow-xl space-y-6 text-sm sm:text-base leading-relaxed">
          {lang === 'ta' ? (
            <div className="space-y-6 font-tamil">
              <h1 className="text-3xl sm:text-4xl font-black text-[#064E3B] dark:text-[#F8F5E9]">
                எங்களைப் பற்றி
              </h1>

              <section className="space-y-3">
                <h2 className="text-lg sm:text-xl font-bold text-[#064E3B] dark:text-[#A7F3D0]">
                  எங்கள் "கதைசொல்லி" எனும் ஒலிப்புத்தக நூலகத்திற்கு வரவேற்கிறோம்!
                </h2>
                <p className="text-[#173D2E]/90 dark:text-stone-200">
                  புத்தகங்கள் அறிவின் பொக்கிஷம். வாசிப்பு என்பது மனிதனின் சிந்தனையையும் அறிவையும் விரிவுபடுத்தும் ஓர் அற்புதமான பயணம். அந்தப் பயணத்தை அனைவருக்கும் எளிதாகவும் இனிமையாகவும் கொண்டு சேர்க்கும் நோக்கத்துடன் எங்கள் ஒலிப்புத்தக நூலகம் உருவாக்கப்பட்டுள்ளது.
                </p>
                <p className="text-[#173D2E]/90 dark:text-stone-200">
                  இன்றைய வேகமான உலகில் அனைவருக்கும் புத்தகங்களைப் படிப்பதற்கான நேரமும் வாய்ப்பும் கிடைப்பதில்லை. ஆனால், புத்தகங்களைக் கேட்பதன் மூலம் பயணத்தின்போதும், ஓய்வு நேரத்திலும், அன்றாடப் பணிகளுக்கு இடையிலும் அறிவைப் பெற முடியும்.
                </p>
                <p className="text-[#173D2E]/90 dark:text-stone-200">
                  இதனை அடிப்படையாகக் கொண்டு, பல்வேறு தலைப்புகளில் அமைந்த ஒலிப்புத்தகங்களை ஒரே இடத்தில் வழங்குவதே எங்கள் முக்கிய நோக்கமாகும்.
                </p>
              </section>

              <section className="space-y-2 pt-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#064E3B] dark:text-[#A7F3D0]">
                  எங்கள் நோக்கம்
                </h2>
                <p className="text-[#173D2E]/90 dark:text-stone-200">
                  அறிவையும் இலக்கியத்தையும் அனைவரிடமும் கொண்டு சேர்ப்பது எங்கள் முதன்மையான நோக்கமாகும்.
                </p>
                <p className="text-[#173D2E]/90 dark:text-stone-200">
                  புத்தக வாசிப்பை ஊக்குவிப்பதுடன், ஒலிப்புத்தகங்கள் மூலம் புதிய தலைமுறையினரிடமும் வாசிப்பு மற்றும் கேட்கும் பழக்கத்தை வளர்க்க விரும்புகிறோம்.
                </p>
              </section>

              <section className="space-y-2 pt-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#064E3B] dark:text-[#A7F3D0]">
                  எங்கள் சேவை
                </h2>
                <p className="text-[#173D2E]/90 dark:text-stone-200">
                  எங்கள் செயலி / இணையதளத்தில் பல்வேறு வகையான ஒலிப்புத்தகங்களைக் கேட்கும் வசதி வழங்கப்படுகிறது. அவற்றில்:
                </p>
                <ul className="list-disc pl-6 space-y-1.5 text-[#173D2E]/90 dark:text-stone-200">
                  <li>சிறுகதைகள் மற்றும் நாவல்கள்.</li>
                  <li>வரலாற்றுப் புத்தகங்கள்.</li>
                  <li>அறிவியல் மற்றும் தொழில்நுட்பம்.</li>
                  <li>சுயமுன்னேற்றப் புத்தகங்கள்.</li>
                  <li>வாழ்க்கை வரலாறுகள்.</li>
                  <li>குழந்தைகளுக்கான கதைகள்.</li>
                  <li>கல்வி மற்றும் பொது அறிவு.</li>
                  <li>ஆன்மீகம் மற்றும் இலக்கியம்.</li>
                </ul>
              </section>

              <section className="space-y-2 pt-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#064E3B] dark:text-[#A7F3D0]">
                  அனைவருக்கும் இலவசம்
                </h2>
                <p className="text-[#173D2E]/90 dark:text-stone-200">
                  எங்கள் ஒலிப்புத்தக நூலகம் அனைவரும் இலவசமாகப் பயன்படுத்தும் வகையில் உருவாக்கப்பட்டுள்ளது.
                </p>
                <p className="text-[#173D2E]/90 dark:text-stone-200">
                  உறுப்பினராகப் பதிவு செய்து உள்நுழைந்த பிறகு, செயலி / இணையதளத்தில் உள்ள ஒலிப்புத்தகங்களை இலவசமாகக் கேட்டு மகிழலாம்.
                </p>
                <p className="text-[#173D2E]/90 dark:text-stone-200">
                  எங்கள் தளம் ஒலிப்புத்தகங்களை ஆன்லைனில் கேட்பதற்காக மட்டுமே செயல்படுகிறது. புத்தக விற்பனை மற்றும் ஒலிப்புத்தகப் பதிவிறக்கம் எங்கள் சேவையின் ஒரு பகுதியாக இல்லை.
                </p>
              </section>

              <section className="space-y-2 pt-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#064E3B] dark:text-[#A7F3D0]">
                  எங்கள் உறுதிமொழி
                </h2>
                <p className="text-[#173D2E]/90 dark:text-stone-200">
                  அறிவைப் பகிர்வது, வாசிப்பை ஊக்குவிப்பது, எழுத்தாளர்களின் படைப்புகளை மதிப்பது மற்றும் அனைவருக்கும் எளிதில் அணுகக்கூடிய ஒலிப்புத்தக அனுபவத்தை வழங்குவது ஆகியவற்றில் நாங்கள் உறுதியாக இருக்கிறோம்.
                </p>
              </section>

              <section className="space-y-2 pt-2 border-t border-[#E3DCBA] dark:border-[#124835]">
                <h2 className="text-lg sm:text-xl font-bold text-[#064E3B] dark:text-[#A7F3D0] pt-4">
                  எங்கள் நம்பிக்கை:
                </h2>
                <p className="text-[#173D2E]/90 dark:text-stone-200">
                  ஒரு புத்தகம் ஒரு மனிதனின் சிந்தனையை மாற்றும். ஒரு நல்ல ஒலிப்புத்தகம் ஆயிரக்கணக்கான மனிதர்களிடம் அந்தச் சிந்தனையைக் கொண்டு சேர்க்கும்.
                </p>
                <p className="font-bold text-[#064E3B] dark:text-[#A7F3D0]">
                  கேளுங்கள்... கற்றுக்கொள்ளுங்கள்... அறிவைப் பகிருங்கள்!
                </p>
              </section>
            </div>
          ) : (
            <div className="space-y-6">
              <h1 className="text-3xl sm:text-4xl font-black font-serif text-[#064E3B] dark:text-[#F8F5E9]">
                ABOUT US
              </h1>

              <section className="space-y-3">
                <h2 className="text-lg sm:text-xl font-bold font-serif text-[#064E3B] dark:text-[#A7F3D0]">
                  Welcome to Our "Kadhaisolli" an Audiobook Library!
                </h2>
                <p className="text-[#173D2E]/90 dark:text-stone-200">
                  Books are treasures of knowledge. Reading is a wonderful journey that expands human thinking, imagination, and understanding. Our Audiobook Library was created with the vision of making this journey accessible, enjoyable, and convenient for everyone.
                </p>
                <p className="text-[#173D2E]/90 dark:text-stone-200">
                  In today's fast-paced world, not everyone has enough time or opportunities to sit down and read books. However, audiobooks make it possible to enjoy books and gain knowledge while travelling, relaxing, or performing everyday activities.
                </p>
                <p className="text-[#173D2E]/90 dark:text-stone-200">
                  With this vision, our primary goal is to bring a wide collection of audiobooks together on one convenient online platform.
                </p>
              </section>

              <section className="space-y-2 pt-2">
                <h2 className="text-lg sm:text-xl font-bold font-serif text-[#064E3B] dark:text-[#A7F3D0]">
                  Our Mission
                </h2>
                <p className="text-[#173D2E]/90 dark:text-stone-200">
                  Our mission is to make knowledge, literature, and learning accessible to everyone.
                </p>
                <p className="text-[#173D2E]/90 dark:text-stone-200">
                  We aim to encourage reading habits and introduce the joy of audiobooks to people of all ages, especially the younger generation.
                </p>
              </section>

              <section className="space-y-2 pt-2">
                <h2 className="text-lg sm:text-xl font-bold font-serif text-[#064E3B] dark:text-[#A7F3D0]">
                  Our Services
                </h2>
                <p className="text-[#173D2E]/90 dark:text-stone-200">
                  Our app/website provides online listening access to audiobooks across various categories, including:
                </p>
                <ul className="list-disc pl-6 space-y-1.5 text-[#173D2E]/90 dark:text-stone-200">
                  <li>Short Stories and Novels.</li>
                  <li>History and Historical Literature.</li>
                  <li>Science and Technology.</li>
                  <li>Self-Development and Personal Growth.</li>
                  <li>Biographies and Autobiographies.</li>
                  <li>Children's Stories.</li>
                  <li>Education and General Knowledge.</li>
                  <li>Spirituality and Literature.</li>
                </ul>
              </section>

              <section className="space-y-2 pt-2">
                <h2 className="text-lg sm:text-xl font-bold font-serif text-[#064E3B] dark:text-[#A7F3D0]">
                  Free for Everyone
                </h2>
                <p className="text-[#173D2E]/90 dark:text-stone-200">
                  Our Audiobook Library is designed as a free online listening platform.
                </p>
                <p className="text-[#173D2E]/90 dark:text-stone-200">
                  Users can create an account, log in, and enjoy available audiobooks without purchasing individual books or paying subscription fees.
                </p>
                <p className="text-[#173D2E]/90 dark:text-stone-200">
                  Our platform is exclusively intended for online audiobook listening. Selling and downloading audiobooks are not part of our services.
                </p>
              </section>

              <section className="space-y-2 pt-2">
                <h2 className="text-lg sm:text-xl font-bold font-serif text-[#064E3B] dark:text-[#A7F3D0]">
                  Our Commitment
                </h2>
                <p className="text-[#173D2E]/90 dark:text-stone-200">
                  We are committed to sharing knowledge, encouraging reading habits, respecting authors and their creative works, and providing an accessible audiobook listening experience for everyone.
                </p>
              </section>

              <section className="space-y-2 pt-2 border-t border-[#E3DCBA] dark:border-[#124835]">
                <h2 className="text-lg sm:text-xl font-bold font-serif text-[#064E3B] dark:text-[#A7F3D0] pt-4">
                  Our Belief
                </h2>
                <p className="text-[#173D2E]/90 dark:text-stone-200">
                  A book can change the way a person thinks. A good audiobook can bring that knowledge and inspiration to thousands of people.
                </p>
                <p className="font-bold text-[#064E3B] dark:text-[#A7F3D0]">
                  Listen... Learn... Share Knowledge!
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Call to action */}
        <div className="text-center pt-4">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#064E3B] hover:bg-[#166534] text-white font-bold text-sm shadow-xl shadow-emerald-950/20 transition-all hover:scale-105 active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            <span>{lang === 'ta' ? 'கதைகளைக் கேளுங்கள்' : 'Start Listening Now'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
