import React, { useState } from 'react';
import { HelpCircle, Mail, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  {
    q: 'கதைசொல்லி உண்மையில் 100% இலவசமா?',
    a: 'ஆம், கதைசொல்லி முற்றிலும் இலவசம். எந்தவொரு கதைக்கும் அல்லது அத்தியாயத்திற்கும் சந்தா அல்லது கட்டணம் எதுவும் செலுத்தத் தேவையில்லை.',
  },
  {
    q: 'நான் எவ்வாறு கதைசொல்லியில் படைப்பாளராக இணையலாம்?',
    a: 'கதைசொல்லியில் கதை சொல்ல அல்லது படைப்பாளராக இணைய தள நிர்வாகியை (Admin) தொடர்பு கொள்ளவும். நிர்வாகி உங்களுக்கு கணக்கை உருவாக்கி வழங்குவார்.',
  },
  {
    q: 'தூக்க டைமர் (Sleep Timer) எவ்வாறு வேலை செய்கிறது?',
    a: 'ஆடியோ பிளேயரில் உள்ள நிலா ஐகானைக் கிளிக் செய்வதன் மூலம் 15, 30, 45, 60 நிமிடங்களுக்கு டைமர் வைக்கலாம். நேரம் முடிந்ததும் ஆடியோ தானாகவே நின்றுவிடும்.',
  },
];

export const HelpSupportPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
          உதவி & ஆதரவு (Help & Support)
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          அடிக்கடி கேட்கப்படும் கேள்விகள் மற்றும் தொடர்பு வழிகள்
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white dark:bg-[#14231E] p-6 sm:p-8 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-serif mb-4">
          அடிக்கடி கேட்கப்படும் கேள்விகள் (FAQs)
        </h2>

        <div className="divide-y divide-emerald-50 dark:divide-emerald-900/30">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="py-4">
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left font-semibold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base focus:outline-none"
              >
                <span>{faq.q}</span>
                {openIdx === idx ? (
                  <ChevronUp className="h-5 w-5 text-emerald-600 shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-zinc-400 shrink-0" />
                )}
              </button>
              {openIdx === idx && (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pr-6">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="p-6 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-center space-y-3">
        <Mail className="h-8 w-8 text-emerald-600 mx-auto" />
        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
          மேலும் உதவிகள் தேவையா?
        </h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
          உங்கள் கேள்விகள் அல்லது பின்னூட்டங்களை எங்களுக்கு மின்னஞ்சல் மூலம் அனுப்புங்கள்.
        </p>
        <div className="pt-2">
          <a
            href="mailto:support@kathaisolli.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <Mail className="h-4 w-4" />
            <span>support@kathaisolli.com</span>
          </a>
        </div>
      </div>
    </div>
  );
};
