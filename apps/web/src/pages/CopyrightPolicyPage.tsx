import React, { useState } from 'react';
import { ShieldCheck, Globe2 } from 'lucide-react';

export const CopyrightPolicyPage: React.FC = () => {
  const [lang, setLang] = useState<'ta' | 'en'>('ta');

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF7EE] dark:bg-[#03261C] text-[#173D2E] dark:text-[#F8F5E9] transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header & Language Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F0E2] dark:bg-[#083325] border border-[#064E3B]/20 text-[#064E3B] dark:text-[#A7F3D0] text-xs font-bold tracking-wide self-start">
            <ShieldCheck className="w-4 h-4" />
            <span>{lang === 'ta' ? 'பதிப்புரிமைக் கொள்கை' : 'COPYRIGHT POLICY'}</span>
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

        <div className="bg-white dark:bg-[#083325] rounded-[32px] p-6 sm:p-10 lg:p-12 border-2 border-[#E3DCBA] dark:border-[#124835] shadow-xl space-y-6 text-sm sm:text-base leading-relaxed">
          {lang === 'ta' ? (
            <div className="space-y-6 font-tamil">
              <h1 className="text-3xl sm:text-4xl font-black text-[#064E3B] dark:text-[#F8F5E9]">
                பதிப்புரிமைக் கொள்கை
              </h1>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-[#064E3B] dark:text-[#A7F3D0]">1. அறிமுகம்</h2>
                <p>எங்கள் "கதைசொல்லி" எனும் இந்த ஒலிப்புத்தக நூலகத்திற்கு வரவேற்கிறோம்.</p>
                <p>இந்த செயலி / இணையதளம் வாசகர்கள், மாணவர்கள் மற்றும் அறிவைத் தேடும் அனைவரும் இலவசமாக இணையவழியில் ஒலிப்புத்தகங்களைக் கேட்பதற்காக உருவாக்கப்பட்டுள்ளது.</p>
                <p>இந்தத் தளத்தில் இடம்பெறும் புத்தகங்கள், கதைகள், கவிதைகள், கட்டுரைகள், ஒலிப்பதிவுகள் மற்றும் பிற படைப்புகளின் பதிப்புரிமையை நாங்கள் மதிக்கிறோம்.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-[#064E3B] dark:text-[#A7F3D0]">2. பதிப்புரிமை உரிமை</h2>
                <p>இந்த செயலி / இணையதளத்தில் இடம்பெறும் ஒலிப்புத்தகங்கள் மற்றும் இலக்கியப் படைப்புகளின் பதிப்புரிமை அந்தந்த எழுத்தாளர்கள், பதிப்பாளர்கள், குரல் பதிவாளர்கள் அல்லது உரிமம் பெற்ற உரிமையாளர்களுக்குச் சொந்தமானது.</p>
                <p>எந்தவொரு படைப்பின் மீதும் எங்களுக்கு உரிமை இருப்பதாகக் கூறப்படுவதில்லை; உரிய அனுமதி அல்லது உரிமம் பெற்றிருக்கும் படைப்புகளைத் தவிர.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-[#064E3B] dark:text-[#A7F3D0]">3. ஒலிப்புத்தகங்களின் பயன்பாடு</h2>
                <p>இந்த செயலி / இணையதளத்தில் உள்ள ஒலிப்புத்தகங்கள் வாசகர்கள் ஆன்லைனில் கேட்பதற்காக மட்டுமே வழங்கப்படுகின்றன.</p>
                <p>பின்வரும் செயல்பாடுகள் அனுமதிக்கப்படுவதில்லை:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>ஒலிப்புத்தகங்களைப் பதிவிறக்கம் செய்தல்.</li>
                  <li>அனுமதியின்றி ஒலிப்பதிவுகளை நகலெடுத்தல்.</li>
                  <li>பிற செயலி / இணையதளங்களில் பதிவேற்றுதல்.</li>
                  <li>அனுமதியின்றி மறுபதிப்பு செய்தல்.</li>
                  <li>ஒலிப்பதிவுகளை விற்பனை செய்தல்.</li>
                  <li>வணிக நோக்கத்திற்காகப் பயன்படுத்துதல்.</li>
                  <li>ஒலிப்புத்தகங்களைத் திருத்தி வேறு பெயரில் வெளியிடுதல்.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-[#064E3B] dark:text-[#A7F3D0]">4. மூன்றாம் தரப்பு படைப்புகள்</h2>
                <p>இந்த செயலி / இணையதளத்தில் எழுத்தாளர்கள், பதிப்பாளர்கள் அல்லது பிற படைப்பாளர்களின் படைப்புகள் இடம்பெறலாம்.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-[#064E3B] dark:text-[#A7F3D0]">5. பதிப்புரிமை மீறல் புகார்</h2>
                <p>எங்கள் செயலி / இணையதளத்தில் உங்கள் பதிப்புரிமைக்கு உட்பட்ட படைப்பு அனுமதியின்றி இடம்பெற்றுள்ளதாக நீங்கள் கருதினால், எங்களைத் தொடர்புகொண்டு புகார் அளிக்கலாம்.</p>
                <p>புகாரில் பின்வரும் விவரங்களை வழங்க வேண்டும்:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>புகார் அளிப்பவரின் முழுப்பெயர்.</li>
                  <li>மின்னஞ்சல் முகவரி மற்றும் தொடர்பு எண்.</li>
                  <li>பதிப்புரிமை பெற்ற படைப்பின் பெயர்.</li>
                  <li>சம்பந்தப்பட்ட ஒலிப்புத்தகத்தின் செயலி / இணையதள இணைப்பு.</li>
                  <li>அந்தப் படைப்பின் மீதான உங்கள் உரிமையை நிரூபிக்கும் விவரங்கள்.</li>
                  <li>புகாரின் தன்மை மற்றும் தேவையான ஆதாரங்கள்.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-[#064E3B] dark:text-[#A7F3D0]">6. புகார்களை ஆய்வு செய்தல்</h2>
                <p>பெறப்படும் பதிப்புரிமை புகார்கள் உரிய முறையில் ஆய்வு செய்யப்படும்.</p>
                <p>புகார் நியாயமானதாகவும் ஆதாரங்களுடன் இருப்பதாகவும் கண்டறியப்பட்டால், சம்பந்தப்பட்ட உள்ளடக்கத்தைத் தற்காலிகமாக முடக்கவோ அல்லது செயலி / இணையதளத்திலிருந்து நீக்கவோ உரிய நடவடிக்கை எடுக்கப்படும்.</p>
                <p>தேவையான சூழ்நிலைகளில் சம்பந்தப்பட்ட உரிமையாளரிடமிருந்து கூடுதல் தகவல்கள் பெறப்படலாம்.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-[#064E3B] dark:text-[#A7F3D0]">7. பதிப்புரிமை உரிமையாளர்களின் உரிமைகள்</h2>
                <p>படைப்பாளர்கள் மற்றும் பதிப்புரிமை உரிமையாளர்கள் தங்களுடைய படைப்புகள் தொடர்பாகப் புகார் அளிக்கவும், அனுமதியற்ற பயன்பாட்டை எதிர்க்கவும் உரிமை பெற்றவர்கள்.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-[#064E3B] dark:text-[#A7F3D0]">8. கொள்கையில் மாற்றங்கள்</h2>
                <p>இந்தப் பதிப்புரிமைக் கொள்கையைத் தேவைக்கேற்ப மாற்றவோ புதுப்பிக்கவோ எங்களுக்கு உரிமை உண்டு.</p>
              </section>
            </div>
          ) : (
            <div className="space-y-6">
              <h1 className="text-3xl sm:text-4xl font-black font-serif text-[#064E3B] dark:text-[#F8F5E9]">
                COPYRIGHT POLICY
              </h1>

              <section className="space-y-2">
                <h2 className="text-lg font-bold font-serif text-[#064E3B] dark:text-[#A7F3D0]">1. Introduction</h2>
                <p>Welcome to our "Kadhaisolli" an Audiobook Library.</p>
                <p>Our app/website is designed to provide free online audiobook listening facilities for readers, students, and knowledge seekers.</p>
                <p>We respect the copyrights and intellectual property rights of authors, publishers, narrators, and other content creators.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold font-serif text-[#064E3B] dark:text-[#A7F3D0]">2. Copyright Ownership</h2>
                <p>All audiobooks, literary works, stories, poems, articles, audio recordings, and other creative materials available on this app/website belong to their respective authors, publishers, copyright owners, or authorized licensors.</p>
                <p>We do not claim ownership of any third-party copyrighted material unless such ownership has been legally transferred to us.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold font-serif text-[#064E3B] dark:text-[#A7F3D0]">3. Permitted Use of Audiobooks</h2>
                <p>All audiobooks available on this app/website are provided exclusively for online listening.</p>
                <p>Users are strictly prohibited from:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Downloading audiobooks.</li>
                  <li>Copying audio recordings without authorization.</li>
                  <li>Uploading content to other apps/websites.</li>
                  <li>Republishing copyrighted materials.</li>
                  <li>Selling or commercially distributing audio content.</li>
                  <li>Using recordings for unauthorized commercial purposes.</li>
                  <li>Editing or modifying audiobooks and publishing them under another name.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold font-serif text-[#064E3B] dark:text-[#A7F3D0]">4. Third-Party Content</h2>
                <p>Our app/website may feature literary works and audiobooks created by third-party authors, publishers, narrators, or contributors.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold font-serif text-[#064E3B] dark:text-[#A7F3D0]">5. Copyright Infringement Complaints</h2>
                <p>If you believe that any content available on our app/website infringes your copyright, you may submit a formal complaint to us.</p>
                <p>Your complaint should include:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Full name of the complainant.</li>
                  <li>Email address and contact number.</li>
                  <li>Title of the copyrighted work.</li>
                  <li>App/website URL of the allegedly infringing audiobook.</li>
                  <li>Evidence establishing your copyright ownership or authority to represent the owner.</li>
                  <li>Details of the alleged infringement and supporting evidence.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold font-serif text-[#064E3B] dark:text-[#A7F3D0]">6. Review and Removal of Content</h2>
                <p>All copyright complaints will be reviewed appropriately.</p>
                <p>If a complaint is found to be valid and supported by sufficient evidence, we may temporarily disable access to or remove the relevant content from our app/website.</p>
                <p>We may request additional information from the complainant or relevant rights holder when necessary.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold font-serif text-[#064E3B] dark:text-[#A7F3D0]">7. Rights of Copyright Owners</h2>
                <p>Authors, publishers, and copyright owners retain their legal rights over their respective works.</p>
                <p>They may contact us to report unauthorized use or request appropriate action concerning their copyrighted materials.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold font-serif text-[#064E3B] dark:text-[#A7F3D0]">8. Changes to This Policy</h2>
                <p>We reserve the right to modify or update this Copyright Policy whenever necessary.</p>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CopyrightPolicyPage;
