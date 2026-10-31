import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Headphones } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-16 px-4 text-center space-y-6">
      <div className="h-24 w-24 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
        <Compass className="h-12 w-12" />
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
          404 — பக்கம் காணப்படவில்லை
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
          நீங்கள் தேடும் பக்கம் இடம் மாற்றப்பட்டிருக்கலாம் அல்லது நீக்கப்பட்டிருக்கலாம்.
        </p>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors shadow-md"
        >
          <Home className="h-4 w-4" />
          <span>முகப்புப் பக்கம்</span>
        </Link>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Headphones className="h-4 w-4" />
          <span>கதைகளை உலாவு</span>
        </Link>
      </div>
    </div>
  );
};
