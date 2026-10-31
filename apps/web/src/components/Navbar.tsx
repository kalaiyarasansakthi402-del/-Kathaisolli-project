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
  Leaf,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#F8F5E9]/90 dark:bg-[#033B2B]/90 border-b border-[#E3DCBA] dark:border-[#124835] transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo with Botanical Leaf Icon */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-full bg-[#064E3B] text-white flex items-center justify-center shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform border-2 border-[#D6A83F]/40">
            <Leaf className="w-6 h-6 text-[#A7F3D0] fill-current" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-serif tracking-tight text-[#064E3B] dark:text-[#A7F3D0]">
                Kathaisolli
              </span>
              <span className="text-sm font-semibold font-tamil text-[#166534] dark:text-[#E8F0E2]">
                (கதைசொல்லி)
              </span>
            </div>
            <span className="block text-[11px] font-medium tracking-wider uppercase text-[#166534]/70 dark:text-[#A7F3D0]/70">
              By Anzles · 100% Free
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <Link
            to="/"
            className="px-3.5 py-2 rounded-full text-sm font-semibold text-[#173D2E] dark:text-[#F8F5E9] hover:bg-[#E8F0E2] dark:hover:bg-[#083325] transition-colors"
          >
            Home
          </Link>
          <Link
            to="/explore"
            className="px-3.5 py-2 rounded-full text-sm font-semibold text-[#173D2E] dark:text-[#F8F5E9] hover:bg-[#E8F0E2] dark:hover:bg-[#083325] transition-colors"
          >
            Stories
          </Link>
          <Link
            to="/categories"
            className="px-3.5 py-2 rounded-full text-sm font-semibold text-[#173D2E] dark:text-[#F8F5E9] hover:bg-[#E8F0E2] dark:hover:bg-[#083325] transition-colors"
          >
            Categories
          </Link>
          <Link
            to="/library"
            className="px-3.5 py-2 rounded-full text-sm font-semibold text-[#173D2E] dark:text-[#F8F5E9] hover:bg-[#E8F0E2] dark:hover:bg-[#083325] transition-colors"
          >
            Library
          </Link>
          <a
            href="#about"
            className="px-3.5 py-2 rounded-full text-sm font-semibold text-[#173D2E] dark:text-[#F8F5E9] hover:bg-[#E8F0E2] dark:hover:bg-[#083325] transition-colors"
          >
            About
          </a>
          <a
            href="#contact"
            className="px-3.5 py-2 rounded-full text-sm font-semibold text-[#173D2E] dark:text-[#F8F5E9] hover:bg-[#E8F0E2] dark:hover:bg-[#083325] transition-colors"
          >
            Contact
          </a>
        </nav>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#166534]/60 dark:text-emerald-300/60" />
          <input
            type="search"
            placeholder="Search Tamil stories, authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-full bg-white/80 dark:bg-[#083325] border border-[#D5CEBA] dark:border-[#124835] focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] outline-none transition-all placeholder:text-stone-400 text-[#173D2E] dark:text-stone-100"
          />
        </form>

        {/* Action Buttons & Profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-full hover:bg-[#E8F0E2] dark:hover:bg-[#083325] text-[#173D2E] dark:text-[#F8F5E9] transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white dark:bg-[#083325] border border-[#D5CEBA] dark:border-[#124835] hover:border-[#064E3B] transition-all shadow-sm"
              >
                <div className="w-7 h-7 rounded-full bg-[#064E3B] text-[#A7F3D0] flex items-center justify-center text-xs font-bold uppercase">
                  {user.displayName.slice(0, 1)}
                </div>
                <span className="text-xs font-semibold max-w-[100px] truncate text-[#173D2E] dark:text-[#F8F5E9]">
                  {user.displayName}
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
            <div className="hidden sm:flex items-center gap-2.5">
              <Link
                to="/login"
                className="px-4 py-2 rounded-full text-sm font-semibold text-[#064E3B] dark:text-[#A7F3D0] hover:bg-[#E8F0E2] dark:hover:bg-[#083325] transition-all"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 rounded-full text-sm font-bold bg-[#064E3B] text-white hover:bg-[#166534] shadow-md shadow-emerald-950/20 hover:scale-105 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-[#173D2E] dark:text-[#F8F5E9] hover:bg-[#E8F0E2] dark:hover:bg-[#083325]"
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
            <Link
              to="/library"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl font-semibold text-[#173D2E] dark:text-[#F8F5E9] hover:bg-[#E8F0E2] dark:hover:bg-[#083325]"
            >
              My Library (நூலகம்)
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
