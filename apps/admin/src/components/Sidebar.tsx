import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Library,
  FileText,
  Headphones,
  Image as ImageIcon,
  Layers,
  Users,
  Settings,
  LogOut,
  X,
  PlusCircle,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { user, logout, permissions } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleImageFallback = (e: React.SyntheticEvent<HTMLImageElement, Event>, fallbackSrc: string) => {
    const el = e.currentTarget;
    if (!el.dataset.fallbackApplied) {
      el.dataset.fallbackApplied = 'true';
      el.src = fallbackSrc;
    }
  };

  const navItems = [
    {
      to: '/admin',
      label: 'Dashboard',
      sublabel: 'மேலோட்டம்',
      icon: Home,
      allowed: true,
      end: true,
    },
    {
      to: '/admin/books/new',
      label: 'Upload Book',
      sublabel: 'புதிய கதை',
      icon: BookOpen,
      allowed: permissions.canManageStories,
      end: true,
    },
    {
      to: '/admin/stories',
      label: 'Manage Books',
      sublabel: 'கதைகள் மேலாண்மை',
      icon: Library,
      allowed: permissions.canManageStories,
      end: true,
    },
    {
      to: '/admin/books',
      label: 'Chapters',
      sublabel: 'அத்தியாயங்கள்',
      icon: FileText,
      allowed: permissions.canManageStories,
      end: true,
    },
    {
      to: '/admin/stories/new',
      label: 'Create Story',
      sublabel: 'புதிய கதை & ஆடியோ',
      icon: PlusCircle,
      isAction: true,
      allowed: permissions.canManageStories,
      end: true,
    },
    {
      to: '/admin/audio-upload',
      label: 'Audio Files',
      sublabel: 'ஆடியோ பதிவேற்றம்',
      icon: Headphones,
      allowed: permissions.canUploadAudio,
      end: true,
    },
    {
      to: '/admin/storage',
      label: 'Images',
      sublabel: 'படங்கள் & சேமிப்பகம்',
      icon: ImageIcon,
      allowed: permissions.canManageStorage,
      end: true,
    },
    {
      to: '/admin/categories',
      label: 'Categories',
      sublabel: 'வகைப்பாடுகள்',
      icon: Layers,
      allowed: permissions.canManageCategories,
      end: true,
    },
    {
      to: '/admin/users',
      label: 'Users',
      sublabel: 'பயனர்கள்',
      icon: Users,
      allowed: permissions.canManageUsers,
      end: true,
    },
    {
      to: '/admin/settings',
      label: 'Settings',
      sublabel: 'அமைப்புகள்',
      icon: Settings,
      allowed: permissions.canManageSettings,
      end: true,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: Fixed full height on desktop, slide-over drawer on mobile/tablet */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#063826] text-emerald-100 flex flex-col justify-between border-r border-emerald-800/40 shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Pinned Brand Header (Fixed at top, never scrolls away) */}
        <div className="shrink-0 h-16 px-4 sm:px-5 border-b border-emerald-800/40 flex items-center justify-between bg-[#053222]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-emerald-400/40 p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
              <img
                src="/admin/app-icon.png"
                onError={(e) => handleImageFallback(e, '/app-icon.png')}
                alt="Kathaisolli Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h2 className="font-black text-sm text-white tracking-wide font-sans truncate">
                Kathaisolli Admin
              </h2>
              <p className="text-[10px] text-emerald-300 font-tamil font-semibold truncate">
                கதைசொல்லி நிர்வாகம்
              </p>
            </div>
          </div>

          {/* Mobile Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900/60 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation Items with Consistent Layout & Heights */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 scrollbar-thin scrollbar-thumb-emerald-800/60">
          {navItems.map((item) => {
            if (!item.allowed) return null;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all duration-200 select-none ${
                    isActive
                      ? 'bg-[#0E5C3F] text-white font-bold shadow-sm border border-emerald-400/40'
                      : item.isAction
                      ? 'bg-emerald-900/35 text-emerald-100 hover:bg-emerald-900/60 hover:text-white border border-emerald-500/30'
                      : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active Left Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#34D399]" />
                    )}

                    {/* Icon - Uniform size and alignment */}
                    <Icon
                      className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                        isActive
                          ? 'text-[#A7F3D0]'
                          : item.isAction
                          ? 'text-[#A7F3D0] group-hover:text-white'
                          : 'text-[#A7F3D0]/80 group-hover:text-emerald-200'
                      }`}
                    />

                    {/* Uniform Text Container: Primary English Label + Tamil Subtitle */}
                    <div className="min-w-0 flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate font-bold text-xs leading-tight">
                          {item.label}
                        </span>
                        {item.isAction && !isActive && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-[#A7F3D0] border border-emerald-400/30 leading-none">
                            + New
                          </span>
                        )}
                      </div>
                      <span
                        className={`block text-[10px] font-tamil truncate leading-tight mt-0.5 transition-colors ${
                          isActive
                            ? 'text-emerald-200'
                            : 'text-emerald-300/70 group-hover:text-emerald-200/90'
                        }`}
                      >
                        {item.sublabel}
                      </span>
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Pinned User Profile Card & Logout (Fixed at bottom, never scrolls away) */}
        <div className="shrink-0 p-3.5 px-4 border-t border-emerald-800/40 bg-[#04281e]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 rounded-xl bg-[#047857] text-[#A7F3D0] flex items-center justify-center font-bold text-sm shrink-0 shadow-sm border border-emerald-400/30">
                {user?.displayName?.charAt(0) || 'A'}
              </div>
              <div className="text-left overflow-hidden min-w-0">
                <p className="text-xs font-bold text-white truncate max-w-[120px]">
                  {user?.displayName || 'Admin'}
                </p>
                <span className="text-[10px] text-emerald-300 block truncate">
                  {user?.role === 'SUPER_ADMIN'
                    ? 'Super Admin'
                    : user?.role === 'ADMIN'
                    ? 'Admin'
                    : 'Editor'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="வெளியேறு (Logout)"
              className="p-2 rounded-xl text-emerald-300 hover:text-white hover:bg-rose-900/50 transition-colors shrink-0 flex items-center gap-1.5"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
