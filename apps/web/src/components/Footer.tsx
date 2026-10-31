import React from 'react';
import { Link } from 'react-router-dom';
import { Headphones, Heart, Leaf, ShieldCheck, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="border-t border-[#E3DCBA] dark:border-[#124835] bg-[#F3EFE0] dark:bg-[#022C22] mt-24 pt-16 pb-28 md:pb-16 text-[#173D2E] dark:text-[#E8F0E2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#064E3B] text-white flex items-center justify-center border-2 border-[#D6A83F]/40 shadow-sm">
                <Leaf className="w-5 h-5 text-[#A7F3D0] fill-current" />
              </div>
              <div>
                <span className="text-2xl font-black font-serif text-[#064E3B] dark:text-[#A7F3D0]">
                  Kathaisolli
                </span>
                <span className="block text-xs font-semibold uppercase tracking-wider text-[#166534] dark:text-[#E8F0E2]">
                  By Anzles
                </span>
              </div>
            </div>
            <p className="text-sm font-tamil text-[#173D2E]/80 dark:text-stone-300 max-w-md leading-relaxed">
              ஒவ்வொரு கதைக்கும் ஒரு குரல். தமிழ் கலாச்சாரம், வரலாறு, பஞ்சதந்திரம், நன்னெறி மற்றும் அறிவியலின் தலைசிறந்த ஆடியோ படைப்புகள். முற்றிலும் இலவசம்.
            </p>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F0E2] dark:bg-[#083325] border border-[#064E3B]/20 text-[#064E3B] dark:text-[#A7F3D0] text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-[#064E3B] dark:text-emerald-400" />
              <span>100% Free · No Subscriptions · Zero Paywalls</span>
            </div>
          </div>

          {/* Quick links */}
          <div id="about">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#064E3B] dark:text-[#A7F3D0] mb-4 font-serif">
              Explore Stories
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link to="/explore" className="hover:text-[#064E3B] dark:hover:text-[#A7F3D0] hover:underline transition-colors">
                  All Stories (அனைத்து கதைகள்)
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-[#064E3B] dark:hover:text-[#A7F3D0] hover:underline transition-colors">
                  Categories (பகுப்புகள்)
                </Link>
              </li>
              <li>
                <Link to="/search?q=Panchatantra" className="hover:text-[#064E3B] dark:hover:text-[#A7F3D0] hover:underline transition-colors">
                  Panchatantra (பஞ்சதந்திர கதைகள்)
                </Link>
              </li>
              <li>
                <Link to="/search?q=Folk" className="hover:text-[#064E3B] dark:hover:text-[#A7F3D0] hover:underline transition-colors">
                  Tamil Folk Tales (நாடோடிக் கதைகள்)
                </Link>
              </li>
              <li>
                <Link to="/search?q=Historical" className="hover:text-[#064E3B] dark:hover:text-[#A7F3D0] hover:underline transition-colors">
                  Historical Epics (வரலாற்று காவியங்கள்)
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform info */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#064E3B] dark:text-[#A7F3D0] mb-4 font-serif">
              Support & Legal
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link to="/help" className="hover:text-[#064E3B] dark:hover:text-[#A7F3D0] hover:underline transition-colors">
                  Help & Support (உதவி மையம்)
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[#064E3B] dark:hover:text-[#A7F3D0] hover:underline transition-colors">
                  Privacy Policy (தனியுரிமை)
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#064E3B] dark:hover:text-[#A7F3D0] hover:underline transition-colors">
                  Terms of Service (விதிமுறைகள்)
                </Link>
              </li>
              <li>
                <Link to="/creator/apply" className="hover:text-[#064E3B] dark:hover:text-[#A7F3D0] hover:underline transition-colors">
                  Become a Storyteller (கதைசொல்லியாக சேர)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#E3DCBA] dark:border-[#124835] flex flex-col sm:flex-row items-center justify-between text-xs text-[#173D2E]/70 dark:text-stone-400 gap-4">
          <p>© 2026 Kathaisolli. Crafted with pride by Anzles. All rights reserved.</p>
          <p className="flex items-center gap-1.5 font-tamil font-medium">
            <span>தமிழர்களின் பெருமைமிகு கதைக் கருவூலம்</span>
            <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
          </p>
        </div>
      </div>
    </footer>
  );
};
