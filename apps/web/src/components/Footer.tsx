import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="border-t border-[#E3DCBA] dark:border-[#124835] bg-[#F3EFE0] dark:bg-[#022C22] mt-24 pt-16 pb-32 sm:pb-28 md:pb-28 text-[#173D2E] dark:text-[#E8F0E2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 mb-12">
          {/* Brand info */}
          <div className="space-y-4 max-w-lg">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <img
                src="/mascot.png"
                alt="Kathaisolli Mascot"
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain flex-shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="min-w-0">
                <span className="text-2xl font-black font-serif text-[#064E3B] dark:text-[#A7F3D0] block leading-tight">
                  Kathaisolli
                </span>
                <span className="block text-xs font-semibold font-tamil text-[#166534] dark:text-[#E8F0E2] mt-0.5">
                  கற்றலின் கேட்டலே நன்று
                </span>
              </div>
            </Link>
            <p className="text-sm font-tamil text-[#173D2E]/80 dark:text-stone-300 max-w-md leading-relaxed">
              ஒவ்வொரு கதைக்கும் ஒரு குரல். தமிழ் கலாச்சாரம், வரலாறு, பஞ்சதந்திரம், நன்னெறி மற்றும் அறிவியலின் தலைசிறந்த ஆடியோ படைப்புகள். முற்றிலும் இலவசம்.
            </p>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F0E2] dark:bg-[#083325] border border-[#064E3B]/20 text-[#064E3B] dark:text-[#A7F3D0] text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-[#064E3B] dark:text-emerald-400" />
              <span>100% Free · No Subscriptions · Zero Paywalls</span>
            </div>
          </div>

          {/* Platform info */}
          <div id="about" className="md:min-w-[220px]">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#064E3B] dark:text-[#A7F3D0] mb-4 font-serif">
              Support & Legal
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link to="/about" className="hover:text-[#064E3B] dark:hover:text-[#A7F3D0] hover:underline transition-colors">
                  About Us (எங்களை பற்றி)
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#064E3B] dark:hover:text-[#A7F3D0] hover:underline transition-colors">
                  Contact Us (தொடர்புக்கு)
                </Link>
              </li>
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
