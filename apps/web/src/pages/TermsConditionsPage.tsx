import React from 'react';
import { BookOpen } from 'lucide-react';

export const TermsConditionsPage: React.FC = () => {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-8 w-8 text-emerald-600" />
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
          விதிமுறைகள் & நிபந்தனைகள் (Terms & Conditions)
        </h1>
      </div>

      <div className="bg-white dark:bg-[#14231E] p-6 sm:p-8 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-4 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
          1. தள பயன்பாடு (Platform Usage)
        </h3>
        <p>
          கதைசொல்லி தளம் தமிழ் இலக்கியம் மற்றும் ஆடியோ கதைகளை நேயர்களுக்கு இலவசமாக கொண்டு சேர்ப்பதை நோக்கமாகக் கொண்டது. நேயர்கள் எவ்வித வணிக நோக்கமின்றி தனிப்பட்ட முறையில் மட்டுமே கதைகளைக் கேட்கலாம்.
        </p>

        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 pt-2">
          2. படைப்பாளர் உரிமைகள் (Creator Intellectual Property)
        </h3>
        <p>
          படைப்பாளர்கள் பதிவேற்றும் ஆடியோ மற்றும் கதைகள் அவர்களின் அறிவுசார் சொத்தாகும். கதைசொல்லி தளத்தில் வெளியிடப்படும் அனைத்து கதைகளும் நேயர்களுக்கு இலவச அணுகலுக்கு மட்டுமே உட்பட்டவை.
        </p>

        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 pt-2">
          3. உள்ளடக்க மதிப்பாய்வு (Content Moderation)
        </h3>
        <p>
          சமூக அமைதிக்கு குந்தகம் விளைவிக்கும் அல்லது பதிப்புரிமை மீறல் கொண்ட ஆடியோக்களை முடக்குவதற்கு அல்லது நீக்குவதற்கு தள நிர்வாகத்திற்கு முழு உரிமை உண்டு.
        </p>
      </div>
    </div>
  );
};
