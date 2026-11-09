import React, { useState, useEffect, useRef } from 'react';
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
  User as UserIcon,
  LogOut,
  ChevronDown,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const player = usePlayer();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  );

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);

    try {
      if (player?.stop) {
        player.stop();
      }
      await logout();
      navigate('/login', {
        replace: true,
        state: {
          successMessage: 'வெற்றிகரமாக வெளியேறிவிட்டீர்கள் (Signed out successfully).',
        },
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
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
          className="hidden md:flex relative flex-1 max-w-[240px] xl:max-w-xs"
        >
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            placeholder="Search Tamil Stories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs xl:text-sm rounded-full bg-white/90 dark:bg-[#073224] border border-[#DDD5C0] dark:border-[#0E4738] focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] outline-none transition-all placeholder:text-stone-400 text-stone-800 dark:text-stone-100 shadow-inner"
          />
        </form>

        {/* Right Section: Theme Toggle & User Auth */}
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

          {/* User Logged In: Profile Menu */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#073224] border border-[#DDD5C0] dark:border-[#0E4738] hover:border-[#064E3B] dark:hover:border-[#A7F3D0] transition-all shadow-sm"
              >
                <div className="w-7 h-7 rounded-full bg-[#064E3B] text-[#A7F3D0] flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                  {user.displayName?.slice(0, 1) || user.email?.slice(0, 1)?.toUpperCase() || 'K'}
                </div>
                <span className="text-xs font-semibold max-w-[100px] truncate text-stone-800 dark:text-stone-100 hidden sm:inline">
                  {user.displayName || 'கதை நேயர்'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-stone-500 transition-transform ${
                    profileDropdownOpen ? 'rotate-180 text-[#064E3B] dark:text-[#A7F3D0]' : ''
                  }`}
                />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#FAF7EE] dark:bg-[#083325] border-2 border-[#E3DCBA] dark:border-[#124835] shadow-2xl p-2 space-y-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-[#03261C]/80 border border-[#E8E1CE] dark:border-[#104434]">
                    <p className="text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0] truncate">
                      {user.displayName || 'கதை நேயர்'}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                      {user.email}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <Link
                      to="/my-library"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-[#E8F0E2] dark:hover:bg-[#033B2B] hover:text-[#064E3B] dark:hover:text-[#A7F3D0] transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-[#166534] dark:text-[#A7F3D0]" />
                      <span>Saved Library (எனது நூலகம்)</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-[#E8F0E2] dark:hover:bg-[#033B2B] hover:text-[#064E3B] dark:hover:text-[#A7F3D0] transition-colors"
                    >
                      <Settings className="w-4 h-4 text-[#166534] dark:text-[#A7F3D0]" />
                      <span>Settings (அமைப்புகள்)</span>
                    </Link>
                  </div>

                  <div className="border-t border-[#E8E1CE] dark:border-[#104434] pt-1">
                    <button
                      type="button"
                      disabled={isLoggingOut}
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{isLoggingOut ? 'வெளியேறுகிறது...' : 'Sign Out (வெளியேறு)'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* User NOT Logged In: Login & Sign Up Buttons */
            <div className="hidden sm:flex items-center gap-2 sm:gap-3">
              <Link
                to="/login"
                className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200 hover:text-[#064E3B] dark:hover:text-[#A7F3D0] px-3 py-1.5 rounded-full transition-colors"
              >
                Login (உள்நுழை)
              </Link>
              <Link
                to="/register"
                className="px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold bg-[#064E3B] text-white hover:bg-[#166534] shadow-md shadow-emerald-950/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Sign Up (பதிவு செய்)
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
              to="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl font-semibold text-[#173D2E] dark:text-[#F8F5E9] hover:bg-[#E8F0E2] dark:hover:bg-[#083325]"
            >
              Categories (வகைகள்)
            </Link>
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl font-semibold text-[#173D2E] dark:text-[#F8F5E9] hover:bg-[#E8F0E2] dark:hover:bg-[#083325]"
            >
              Profile (சுயவிவரம்)
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

          {/* User Actions in Mobile Drawer */}
          {user ? (
            <div className="pt-2 border-t border-[#E3DCBA] dark:border-[#124835] space-y-2">
              <div className="flex items-center gap-3 px-2 py-1">
                <div className="w-8 h-8 rounded-full bg-[#064E3B] text-[#A7F3D0] flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                  {user.displayName?.slice(0, 1) || user.email?.slice(0, 1)?.toUpperCase() || 'K'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-[#173D2E] dark:text-[#F8F5E9] truncate">
                    {user.displayName || 'Profile'}
                  </p>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400"
              >
                <LogOut className="w-4 h-4" />
                <span>{isLoggingOut ? 'வெளியேறுகிறது...' : 'Sign Out (வெளியேறு)'}</span>
              </button>
            </div>
          ) : (
            <div className="flex gap-2 pt-2 border-t border-[#E3DCBA] dark:border-[#124835]">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-full text-xs font-bold border border-[#064E3B] text-[#064E3B] dark:text-[#A7F3D0]"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-full text-xs font-bold bg-[#064E3B] text-white"
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

export default Navbar;
