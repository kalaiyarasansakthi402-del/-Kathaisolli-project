import React from 'react';
import { LogOut, ExternalLink, Sparkles } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const Header: React.FC = () => {
  const { user, logout, activeMode } = useAdminAuth();

  return (
    <header className="h-16 px-6 bg-white dark:bg-[#0A1612] border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>
            {activeMode === 'creator' ? 'படைப்பாளர் ஸ்டுடியோ' : 'தலைமை நிர்வாக மையம்'} • 100% Free Architecture
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Link to public website */}
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
        >
          <span>நேயர் தளம் (Live Website)</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>

        {/* User logout */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>வெளியேறு (Logout)</span>
        </button>
      </div>
    </header>
  );
};
