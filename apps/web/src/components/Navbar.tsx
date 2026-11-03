import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Headphones,
  LayoutGrid,
  Info,
  Mail,
  Search,
  Moon,
  Sun,
  Leaf,
  Menu,
  X,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      setMobileMenuOpen(false);
    }
  };

  const isHomeActive = location.pathname === '/' || location.pathname === '/home';
  const isStoriesActive = location.pathname.startsWith('/explore') || location.pathname.startsWith('/stories');
  const isCategoriesActive = location.pathname.startsWith('/categories');

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#FAF7EE]/95 dark:bg-[#04281E]/95 border-b border-[#E8E1CE] dark:border-[#0F4738] transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3 lg:gap-6">
        {/* Brand Logo with Leaf Badge */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-11 h-11 rounded-full bg-[#064E3B] text-white flex items-center justify-center shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform border border-[#166534]">
            <Leaf className="w-6 h-6 text-[#A7F3D0] fill-current" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-serif tracking-tight text-[#064E3B] dark:text-[#A7F3D0]">
                Kathaisolli
              </span>
              <span className="text-base font-bold font-tamil text-[#064E3B] dark:text-[#E8F0E2]">
                கதைசொல்லி
              </span>
            </div>
            <span className="block text-[10px] font-bold tracking-widest uppercase text-[#166534]/70 dark:text-[#A7F3D0]/70">
              BY ANZLES · 100% FREE
            </span>
          </div>
        </Link>

        {/* Center Desktop Navigation Links with Icons */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              isHomeActive
                ? 'text-[#064E3B] dark:text-[#A7F3D0] font-bold border-b-2 border-[#064E3B] dark:border-[#A7F3D0] rounded-b-none pb-1'
                : 'text-stone-700 dark:text-stone-300 hover:text-[#064E3B] dark:hover:text-[#A7F3D0]'
            }`}
          >
            <Home className={`w-4 h-4 ${isHomeActive ? 'text-[#064E3B] dark:text-[#A7F3D0]' : 'text-stone-500 dark:text-stone-400'}`} />
            <span>Home</span>
          </Link>

          <Link
            to="/explore"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              isStoriesActive
                ? 'text-[#064E3B] dark:text-[#A7F3D0] font-bold border-b-2 border-[#064E3B] dark:border-[#A7F3D0] rounded-b-none pb-1'
                : 'text-stone-700 dark:text-stone-300 hover:text-[#064E3B] dark:hover:text-[#A7F3D0]'
            }`}
          >
            <Headphones className={`w-4 h-4 ${isStoriesActive ? 'text-[#064E3B] dark:text-[#A7F3D0]' : 'text-stone-500 dark:text-stone-400'}`} />
            <span>Stories</span>
          </Link>

          <Link
            to="/categories"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              isCategoriesActive
                ? 'text-[#064E3B] dark:text-[#A7F3D0] font-bold border-b-2 border-[#064E3B] dark:border-[#A7F3D0] rounded-b-none pb-1'
                : 'text-stone-700 dark:text-stone-300 hover:text-[#064E3B] dark:hover:text-[#A7F3D0]'
            }`}
          >
            <LayoutGrid className={`w-4 h-4 ${isCategoriesActive ? 'text-[#064E3B] dark:text-[#A7F3D0]' : 'text-stone-500 dark:text-stone-400'}`} />
            <span>Categories</span>
          </Link>

          <Link
            to="/terms"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-[#064E3B] dark:hover:text-[#A7F3D0] transition-colors"
          >
            <Info className="w-4 h-4 text-stone-500 dark:text-stone-400" />
            <span>About</span>
          </Link>

          <Link
            to="/help"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-[#064E3B] dark:hover:text-[#A7F3D0] transition-colors"
          >
            <Mail className="w-4 h-4 text-stone-500 dark:text-stone-400" />
            <span>Contact</span>
          </Link>
        </nav>

        {/* Search Bar matching screenshot */}
        <form onSubmit={handleSearch} className="hidden md:flex relative flex-1 max-w-[260px] xl:max-w-xs">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            placeholder="Search Tamil Stories, Books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs xl:text-sm rounded-full bg-white/90 dark:bg-[#073224] border border-[#DDD5C0] dark:border-[#0E4738] focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] outline-none transition-all placeholder:text-stone-400 text-stone-800 dark:text-stone-100 shadow-inner"
          />
        </form>

        {/* Action Buttons & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-full hover:bg-stone-200/60 dark:hover:bg-[#073224] text-stone-700 dark:text-stone-200 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-stone-700" />}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#073224] border border-[#DDD5C0] dark:border-[#0E4738] hover:border-[#064E3B] transition-all shadow-sm"
              >
                <div className="w-7 h-7 rounded-full bg-[#064E3B] text-[#A7F3D0] flex items-center justify-center text-xs font-bold uppercase">
                  {user.displayName?.slice(0, 1) || 'K'}
                </div>
                <span className="text-xs font-semibold max-w-[90px] truncate text-stone-800 dark:text-stone-100">
                  {user.displayName || 'Profile'}
                </span>
              </Link>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-950/40 text-stone-500 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-semibold text-stone-800 dark:text-stone-200 hover:text-[#064E3B] dark:hover:text-[#A7F3D0] transition-colors px-2 py-1"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 rounded-full text-sm font-bold bg-[#064E3B] text-white hover:bg-[#166534] shadow-md shadow-emerald-950/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-stone-700 dark:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-[#073224]"
            aria-label="Open mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E3DCBA] dark:border-[#124835] bg-[#F8F5E9] dark:bg-[#033B2B] px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#166534]" />
            <input
              type="search"
              placeholder="Search Tamil stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-full bg-white dark:bg-[#083325] border border-[#D5CEBA] dark:border-[#124835] text-[#173D2E] dark:text-stone-100"
            />
          </form>

          <nav className="flex flex-col space-y-1 pt-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl font-semibold text-[#173D2E] dark:text-[#F8F5E9] hover:bg-[#E8F0E2] dark:hover:bg-[#083325]"
            >
              Home (முகப்பு)
            </Link>
            <Link
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl font-semibold text-[#173D2E] dark:text-[#F8F5E9] hover:bg-[#E8F0E2] dark:hover:bg-[#083325]"
            >
              Stories (கதைகள்)
            </Link>
            <Link
              to="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl font-semibold text-[#173D2E] dark:text-[#F8F5E9] hover:bg-[#E8F0E2] dark:hover:bg-[#083325]"
            >
              Categories (வகைகள்)
            </Link>
          </nav>

          {!user && (
            <div className="flex gap-2 pt-2 border-t border-[#E3DCBA] dark:border-[#124835]">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-full text-sm font-semibold border border-[#064E3B] text-[#064E3B] dark:text-[#A7F3D0]"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-full text-sm font-bold bg-[#064E3B] text-white"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
