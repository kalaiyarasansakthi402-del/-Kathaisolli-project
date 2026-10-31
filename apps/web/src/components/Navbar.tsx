import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Headphones,
  Home,
  LayoutGrid,
  Library,
  LogOut,
  Moon,
  Search,
  Sun,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  );

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 dark:bg-[#101A16]/85 border-b border-slate-200 dark:border-[#23382F] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#064E3B] to-[#10B981] flex items-center justify-center text-white shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform">
            <Headphones className="w-5 h-5 text-[#A7F3D0]" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight font-tamil text-[#064E3B] dark:text-[#A7F3D0]">
              கதைசொல்லி
            </span>
            <span className="block text-[10px] tracking-widest uppercase font-semibold text-slate-500 dark:text-slate-400">
              KATHAISOLLI · 100% FREE
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <Link
            to="/"
            className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-[#182620] flex items-center gap-2 text-slate-700 dark:text-slate-200"
          >
            <Home className="w-4 h-4 text-[#10B981]" />
            <span>முகப்பு</span>
          </Link>
          <Link
            to="/explore"
            className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-[#182620] flex items-center gap-2 text-slate-700 dark:text-slate-200"
          >
            <Compass className="w-4 h-4 text-[#10B981]" />
            <span>உலாவு</span>
          </Link>
          <Link
            to="/categories"
            className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-[#182620] flex items-center gap-2 text-slate-700 dark:text-slate-200"
          >
            <LayoutGrid className="w-4 h-4 text-[#10B981]" />
            <span>பகுப்புகள்</span>
          </Link>
          <Link
            to="/library"
            className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-[#182620] flex items-center gap-2 text-slate-700 dark:text-slate-200"
          >
            <Library className="w-4 h-4 text-[#10B981]" />
            <span>நூலகம்</span>
          </Link>
        </nav>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden sm:flex relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="கதைகள், எழுத்தாளர்கள் தேடுக..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm rounded-full bg-slate-100 dark:bg-[#182620] border border-transparent focus:border-[#10B981] focus:bg-white dark:focus:bg-[#101A16] outline-none transition-all placeholder:text-slate-400"
          />
        </form>

        {/* Actions & Profile */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#182620] text-slate-600 dark:text-slate-300"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#182620] hover:ring-2 hover:ring-[#10B981] transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-[#064E3B] text-[#A7F3D0] flex items-center justify-center text-xs font-bold uppercase">
                  {user.displayName.slice(0, 1)}
                </div>
                <span className="text-xs font-semibold max-w-[90px] truncate">
                  {user.displayName}
                </span>
              </Link>
              <button
                onClick={logout}
                title="வெளியேறு (Logout)"
                className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-[#064E3B] dark:text-[#A7F3D0] hover:bg-emerald-50 dark:hover:bg-[#182620]"
              >
                உள்நுழை
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-full text-sm font-semibold bg-[#064E3B] text-[#A7F3D0] hover:bg-[#022C22] shadow-sm transition-all"
              >
                இலவச பதிவு
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
