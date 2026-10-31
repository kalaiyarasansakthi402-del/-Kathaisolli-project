import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-8 w-8 text-emerald-600" />
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
          தனியுரிமைக் கொள்கை (Privacy Policy)
        </h1>
      </div>

      <div className="bg-white dark:bg-[#14231E] p-6 sm:p-8 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-4 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
        <p className="font-semibold text-emerald-800 dark:text-emerald-300">
          கடைசியாக புதுப்பிக்கப்பட்டது: அக்டோபர் 2026
        </p>

        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 pt-2">
          1. 100% இலவச தளம் & கட்டணத் தரவு சேகரிப்பின்மை
        </h3>
        <p>
          கதைசொல்லி ஒரு முழுமையான கட்டணமில்லா தளமாகும். நாங்கள் பயனர்களின் கிரெடிட் கார்டு, டெபிட் கார்டு, வங்கி விவரங்கள் அல்லது எந்தவித கட்டணத் தரவுகளையும் ஒருபோதும் சேகரிப்பதில்லை.
        </p>

        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 pt-2">
          2. நாங்கள் சேகரிக்கும் தகவல்கள்
        </h3>
        <p>
          நீங்கள் கணக்கு உருவாக்கும் போது வழங்கும் மின்னஞ்சல் முகவரி மற்றும் பெயர் மட்டுமே சேகரிக்கப்படுகிறது. உங்கள் கேட்கும் வரலாறு மற்றும் விருப்பங்கள் உங்கள் பயன்பாட்டை எளிதாக்க மட்டுமே பயன்படுத்தப்படுகின்றன.
        </p>

        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 pt-2">
          3. தரவுப் பாதுகாப்பு & கணக்கு நீக்கம்
        </h3>
        <p>
          உங்கள் தரவுகள் மிகவும் பாதுகாப்பாக சேமிக்கப்படுகின்றன. உங்கள் சுயவிவரப் பக்கத்தின் வாயிலாக எந்த நேரத்திலும் உங்கள் கணக்கையும் தொடர்புடைய அனைத்து தரவுகளையும் நிரந்தரமாக நீக்கிக்கொள்ளலாம்.
        </p>
      </div>
    </div>
  );
};
