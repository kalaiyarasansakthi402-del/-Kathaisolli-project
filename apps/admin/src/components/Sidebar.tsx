import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  BookOpen,
  Layers,
  HardDrive,
  BarChart3,
  ShieldCheck,
  Users,
  Settings,
  LogOut,
  X,
  Sparkles,
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

  const navItems = [
    {
      to: '/admin',
      label: 'மேலோட்டம் (Dashboard)',
      icon: LayoutDashboard,
      allowed: true,
      end: true,
    },
    {
      to: '/admin/audio-upload',
      label: 'ஆடியோ பதிவேற்றம் (Audiobook Upload)',
      icon: UploadCloud,
      allowed: permissions.canUploadAudio,
    },
    {
      to: '/admin/stories',
      label: 'கதைகள் மேலாண்மை (Story Management)',
      icon: BookOpen,
      allowed: permissions.canManageStories,
    },
    {
      to: '/admin/categories',
      label: 'வகைப்பாடுகள் (Category Management)',
      icon: Layers,
      allowed: permissions.canManageCategories,
    },
    {
      to: '/admin/storage',
      label: 'ஆடியோ சேமிப்பகம் (Audio Storage)',
      icon: HardDrive,
      allowed: permissions.canManageStorage,
    },
    {
      to: '/admin/reports',
      label: 'அறிக்கைகள் & பகுப்பாய்வு (Reports & Analytics)',
      icon: BarChart3,
      allowed: permissions.canViewReports,
    },
    {
      to: '/admin/roles',
      label: 'நிர்வாகப் பொறுப்புகள் (Admin Roles & Permissions)',
      icon: ShieldCheck,
      allowed: permissions.canManageStaff,
    },
    {
      to: '/admin/users',
      label: 'பயனர் மேலாண்மை (User Management)',
      icon: Users,
      allowed: permissions.canManageUsers,
    },
    {
      to: '/admin/settings',
      label: 'அமைப்புகள் & பாதுகாப்பு (Settings & Security)',
      icon: Settings,
      allowed: permissions.canManageSettings,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-full w-72 shrink-0 bg-[#064E3B] text-emerald-100 flex flex-col justify-between border-r border-[#047857]/40 shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Brand */}
        <div className="p-5 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/admin/app-icon.png"
                alt="Kathaisolli Logo"
                className="h-10 w-10 rounded-2xl object-contain bg-white/10 p-0.5 border border-[#10B981]/40 shadow-md shadow-emerald-950/40"
              />
              <div>
                <h2 className="font-extrabold text-base text-white tracking-wide font-serif">
                  Kathaisolli
                </h2>
                <p className="text-[11px] text-[#A7F3D0] font-tamil font-semibold">
                  கதைசொல்லி நிர்வாக மையம்
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900/60"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Section Title */}
          <div>
            <div className="text-[10px] font-bold text-[#A7F3D0] uppercase tracking-wider px-3 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#34D399]" />
              <span>முதன்மை நிர்வாகம் (Admin Navigation)</span>
            </div>

            <nav className="space-y-1">
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
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#047857] text-white shadow-sm font-bold'
                          : 'text-emerald-100/90 hover:bg-[#033A2C] hover:text-white'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0 text-[#A7F3D0]" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom User Profile Card & Logout */}
        <div className="p-4 border-t border-[#047857]/40 bg-[#043E2F]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 rounded-xl bg-[#047857] text-[#A7F3D0] flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                {user?.displayName?.charAt(0) || 'A'}
              </div>
              <div className="text-left overflow-hidden min-w-0">
                <p className="text-xs font-bold text-white truncate max-w-[130px]">
                  {user?.displayName || 'நிர்வாகி'}
                </p>
                <span className="text-[10px] text-[#A7F3D0] block truncate">
                  {user?.role === 'SUPER_ADMIN'
                    ? 'தலைமை நிர்வாகி'
                    : user?.role === 'ADMIN'
                    ? 'நிர்வாகி'
                    : 'உள்ளடக்க ஆசிரியர்'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="வெளியேறு (Logout)"
              className="p-2 rounded-xl text-emerald-300 hover:text-white hover:bg-rose-900/40 transition-colors shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
