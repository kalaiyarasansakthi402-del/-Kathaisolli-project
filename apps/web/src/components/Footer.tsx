import React from 'react';
import { Link } from 'react-router-dom';
import { Headphones, Heart, ShieldCheck, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-[#23382F] bg-white dark:bg-[#101A16] mt-20 pt-12 pb-24 md:pb-16 text-slate-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#064E3B] to-[#10B981] flex items-center justify-center text-white">
                <Headphones className="w-5 h-5 text-[#A7F3D0]" />
              </div>
              <span className="text-2xl font-bold font-tamil text-[#064E3B] dark:text-[#A7F3D0]">
                கதைசொல்லி
              </span>
            </div>
            <p className="text-sm font-tamil text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              ஒவ்வொரு கதைக்கும் ஒரு குரல். தமிழ் கலாச்சாரம், வரலாறு, திகில், காதல் மற்றும் அறிவியலின் தலைசிறந்த ஆடியோ படைப்புகள். முற்றிலும் இலவசம்.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>100% இலவசம் · எந்த சந்தாவும் இல்லை (Zero Subscription)</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-4 font-tamil">
              பகுப்புகள் & உலாவு
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/explore" className="hover:text-[#10B981] transition-colors">
                  அனைத்து கதைகள்
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-[#10B981] transition-colors">
                  முக்கிய பகுப்புகள்
                </Link>
              </li>
              <li>
                <Link to="/search?q=பொன்னியின்" className="hover:text-[#10B981] transition-colors">
                  வரலாற்றுப் புதினங்கள்
                </Link>
              </li>
              <li>
                <Link to="/search?q=திகில்" className="hover:text-[#10B981] transition-colors">
                  திகில் கதைகள்
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform info */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-4 font-tamil">
              உதவி & கொள்கைகள்
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="hover:text-[#10B981] transition-colors">
                  உதவி & ஆதரவு (Help)
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[#10B981] transition-colors">
                  தனியுரிமைக் கொள்கை (Privacy)
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#10B981] transition-colors">
                  பயன்பாட்டு விதிமுறைகள் (Terms)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 dark:border-[#1E3027] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 கதைசொல்லி (Kathaisolli). அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.</p>
          <p className="flex items-center gap-1">
            <span>தமிழர்களின் இதயங்களுக்காக அன்புடன் உருவாக்கப்பட்டது</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
