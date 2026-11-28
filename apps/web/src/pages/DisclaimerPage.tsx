import React, { useState } from 'react';
import { AlertTriangle, Globe2 } from 'lucide-react';

export const DisclaimerPage: React.FC = () => {
  const [lang, setLang] = useState<'ta' | 'en'>('ta');

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF7EE] dark:bg-[#03261C] text-[#173D2E] dark:text-[#F8F5E9] transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F0E2] dark:bg-[#083325] border border-[#064E3B]/20 text-[#064E3B] dark:text-[#A7F3D0] text-xs font-bold tracking-wide self-start">
            <AlertTriangle className="w-4 h-4" />
            <span>{lang === 'ta' ? 'பொறுப்பு துறப்பு' : 'DISCLAIMER'}</span>
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
            <div className="space-y-5 font-tamil">
              <h1 className="text-3xl sm:text-4xl font-black text-[#064E3B] dark:text-[#F8F5E9]">
                பொறுப்பு துறப்பு (Disclaimer)
              </h1>
              <p>
                “கதைசொல்லி” ஒலிப்புத்தக நூலகத்தில் வழங்கப்படும் அனைத்து ஒலிப்புத்தகங்கள், கதைகள் மற்றும் இலக்கியப் படைப்புகள் கல்வி, இலக்கியம் மற்றும் பொது அறிவு நோக்கங்களுக்காக மட்டுமே ஆன்லைனில் கேட்பதற்கு வழங்கப்படுகின்றன.
              </p>
              <p>
                இத்தளத்தில் இடம்பெறும் படைப்புகளில் வெளிப்படுத்தப்படும் கருத்துக்கள் அந்தந்த எழுத்தாளர்கள் மற்றும் படைப்பாளர்களின் சொந்தக் கருத்துக்களாகும். அவற்றிற்கு கதைசொல்லி தளம் பொறுப்பேற்காது.
              </p>
              <p>
                தளத்தில் உள்ள தகவல்களின் துல்லியம் அல்லது முழுமை குறித்து எந்தவொரு வெளிப்படையான அல்லது மறைமுகமான உத்தரவாதமும் வழங்கப்படவில்லை.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <h1 className="text-3xl sm:text-4xl font-black font-serif text-[#064E3B] dark:text-[#F8F5E9]">
                Disclaimer
              </h1>
              <p>
                All audiobooks, stories, and literary materials provided on the "Kadhaisolli" Audiobook Library are intended solely for educational, literary, and informational online listening purposes.
              </p>
              <p>
                The views and opinions expressed in any audiobook or literary work belong strictly to the respective authors, narrators, or creators and do not necessarily reflect the official policy or position of Kadhaisolli.
              </p>
              <p>
                We make no representations or warranties of any kind, express or implied, regarding the completeness, accuracy, reliability, or availability of any content on this platform.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisclaimerPage;
