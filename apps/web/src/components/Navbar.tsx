import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  LayoutGrid,
  Info,
  Mail,
  Search,
  Moon,
  Sun,
  Menu,
  X,
  Bookmark,
} from 'lucide-react';

export const Navbar: React.FC = () => {
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
  const isCategoriesActive = location.pathname.startsWith('/categories');
  const isLibraryActive = location.pathname.startsWith('/my-library');
  const isAboutActive = location.pathname === '/about';
  const isContactActive = location.pathname === '/contact';

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#FAF7EE]/95 dark:bg-[#04281E]/95 border-b border-[#E8E1CE] dark:border-[#0F4738] transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3 lg:gap-6">
        {/* Brand Logo with App Icon */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <img
            src="/app-icon.png"
            alt="Kathaisolli Logo"
            className="w-11 h-11 rounded-xl object-contain shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform bg-[#F8F5E9] p-0.5 border border-[#166534]/30"
          />
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
            <Home
              className={`w-4 h-4 ${
                isHomeActive ? 'text-[#064E3B] dark:text-[#A7F3D0]' : 'text-stone-500 dark:text-stone-400'
              }`}
            />
            <span>Home</span>
          </Link>

          <Link
            to="/categories"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              isCategoriesActive
                ? 'text-[#064E3B] dark:text-[#A7F3D0] font-bold border-b-2 border-[#064E3B] dark:border-[#A7F3D0] rounded-b-none pb-1'
                : 'text-stone-700 dark:text-stone-300 hover:text-[#064E3B] dark:hover:text-[#A7F3D0]'
            }`}
          >
            <LayoutGrid
              className={`w-4 h-4 ${
                isCategoriesActive
                  ? 'text-[#064E3B] dark:text-[#A7F3D0]'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            />
            <span>Categories</span>
          </Link>

          <Link
            to="/my-library"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              isLibraryActive
                ? 'text-[#064E3B] dark:text-[#A7F3D0] font-bold border-b-2 border-[#064E3B] dark:border-[#A7F3D0] rounded-b-none pb-1'
                : 'text-stone-700 dark:text-stone-300 hover:text-[#064E3B] dark:hover:text-[#A7F3D0]'
            }`}
          >
            <Bookmark
              className={`w-4 h-4 ${
                isLibraryActive
                  ? 'text-[#064E3B] dark:text-[#A7F3D0]'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            />
            <span>Library</span>
          </Link>

          <Link
            to="/about"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              isAboutActive
                ? 'text-[#064E3B] dark:text-[#A7F3D0] font-bold border-b-2 border-[#064E3B] dark:border-[#A7F3D0] rounded-b-none pb-1'
                : 'text-stone-700 dark:text-stone-300 hover:text-[#064E3B] dark:hover:text-[#A7F3D0]'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>About</span>
          </Link>

          <Link
            to="/contact"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              isContactActive
                ? 'text-[#064E3B] dark:text-[#A7F3D0] font-bold border-b-2 border-[#064E3B] dark:border-[#A7F3D0] rounded-b-none pb-1'
                : 'text-stone-700 dark:text-stone-300 hover:text-[#064E3B] dark:hover:text-[#A7F3D0]'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Contact</span>
          </Link>
        </nav>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex relative flex-1 max-w-[260px] xl:max-w-xs"
        >
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            placeholder="Search Tamil Stories, Books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs xl:text-sm rounded-full bg-white/90 dark:bg-[#073224] border border-[#DDD5C0] dark:border-[#0E4738] focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] outline-none transition-all placeholder:text-stone-400 text-stone-800 dark:text-stone-100 shadow-inner"
          />
        </form>

        {/* Action Buttons: Theme Toggle & Quick Library Button */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-full hover:bg-stone-200/60 dark:hover:bg-[#073224] text-stone-700 dark:text-stone-200 transition-colors"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-stone-700" />
            )}
          </button>

          <Link
            to="/my-library"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-[#E8F0E2] dark:bg-[#083325] text-[#064E3B] dark:text-[#A7F3D0] border border-[#064E3B]/20 hover:bg-[#064E3B] hover:text-white transition-all shadow-sm"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>எனது நூலகம் (My Library)</span>
          </Link>

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
              to="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl font-semibold text-[#173D2E] dark:text-[#F8F5E9] hover:bg-[#E8F0E2] dark:hover:bg-[#083325]"
            >
              Categories (வகைகள்)
            </Link>
            <Link
              to="/my-library"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl font-semibold text-[#173D2E] dark:text-[#F8F5E9] hover:bg-[#E8F0E2] dark:hover:bg-[#083325]"
            >
              My Library (எனது நூலகம்)
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl font-semibold text-[#173D2E] dark:text-[#F8F5E9] hover:bg-[#E8F0E2] dark:hover:bg-[#083325]"
            >
              About (எங்களை பற்றி)
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl font-semibold text-[#173D2E] dark:text-[#F8F5E9] hover:bg-[#E8F0E2] dark:hover:bg-[#083325]"
            >
              Contact (தொடர்புக்கு)
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
