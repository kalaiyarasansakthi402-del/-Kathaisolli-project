import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Sparkles,
  BarChart3,
  Users,
  CheckSquare,
  ShieldAlert,
  Radio,
  FolderOpen,
  FileAudio,
  LogOut,
  UploadCloud,
  Layers,
  Settings,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const Sidebar: React.FC = () => {
  const { user, activeMode, setActiveMode, logout } = useAdminAuth();
  const navigate = useNavigate();
  const isAdminUser = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 shrink-0 bg-[#06241C] text-emerald-100 flex flex-col justify-between border-r border-emerald-900/60 min-h-screen">
      {/* Top Branding & Mode Switcher */}
      <div className="p-5 space-y-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500 text-emerald-950 flex items-center justify-center font-bold text-lg font-serif">
              க
            </div>
            <div>
              <h2 className="font-bold text-base text-white tracking-wide">
                கதைசொல்லி
              </h2>
              <p className="text-[10px] text-emerald-400 font-medium">
                {activeMode === 'admin' ? 'நிர்வாக மையம் (Admin Panel)' : 'படைப்பாளர் ஸ்டுடியோ (Studio)'}
              </p>
            </div>
          </div>
        </div>

        {/* Mode Switcher for Admins */}
        {isAdminUser && (
          <div className="p-1 rounded-xl bg-[#031812] flex gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveMode('creator')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                activeMode === 'creator'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-emerald-300 hover:text-white'
              }`}
            >
              படைப்பாளர்
            </button>
            <button
              onClick={() => setActiveMode('admin')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                activeMode === 'admin'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-emerald-300 hover:text-white'
              }`}
            >
              நிர்வாகி
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1">
          {activeMode === 'creator' ? (
            <>
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider px-3 mb-2">
                படைப்பாளர் ஸ்டுடியோ
              </div>
              <NavLink
                to="/creator"
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive ? 'bg-emerald-800 text-white' : 'hover:bg-emerald-900/40 text-emerald-200'
                  }`
                }
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>மேலோட்டம் (Dashboard)</span>
              </NavLink>

              <NavLink
                to="/creator/series"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive ? 'bg-emerald-800 text-white' : 'hover:bg-emerald-900/40 text-emerald-200'
                  }`
                }
              >
                <BookOpen className="h-4 w-4" />
                <span>எனது கதைகள் (My Stories)</span>
              </NavLink>

              <NavLink
                to="/creator/series/new"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive ? 'bg-emerald-800 text-white' : 'hover:bg-emerald-900/40 text-emerald-200'
                  }`
                }
              >
                <PlusCircle className="h-4 w-4" />
                <span>புதிய தொடர் (New Series)</span>
              </NavLink>

              <NavLink
                to="/creator/ai-assistant"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive ? 'bg-emerald-800 text-white' : 'hover:bg-emerald-900/40 text-emerald-200'
                  }`
                }
              >
                <Sparkles className="h-4 w-4 text-emerald-300" />
                <span>AI கதை உதவி (AI Assistant)</span>
              </NavLink>

              <NavLink
                to="/creator/analytics"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive ? 'bg-emerald-800 text-white' : 'hover:bg-emerald-900/40 text-emerald-200'
                  }`
                }
              >
                <BarChart3 className="h-4 w-4" />
                <span>பகுப்பாய்வு (Analytics)</span>
              </NavLink>
            </>
          ) : (
            <>
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider px-3 mb-2">
                நிர்வாகக் கட்டுப்பாடுகள்
              </div>
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive ? 'bg-emerald-800 text-white' : 'hover:bg-emerald-900/40 text-emerald-200'
                  }`
                }
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>தள மேலோட்டம் (KPIs)</span>
              </NavLink>

              <NavLink
                to="/admin/books"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive ? 'bg-emerald-800 text-white' : 'hover:bg-emerald-900/40 text-emerald-200'
                  }`
                }
              >
                <BookOpen className="h-4 w-4" />
                <span>புத்தகங்கள் (Books)</span>
              </NavLink>

              <NavLink
                to="/admin/categories"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive ? 'bg-emerald-800 text-white' : 'hover:bg-emerald-900/40 text-emerald-200'
                  }`
                }
              >
                <Layers className="h-4 w-4" />
                <span>வகைப்பாடுகள் (Categories)</span>
              </NavLink>

              <NavLink
                to="/admin/analytics"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive ? 'bg-emerald-800 text-white' : 'hover:bg-emerald-900/40 text-emerald-200'
                  }`
                }
              >
                <BarChart3 className="h-4 w-4" />
                <span>தள பகுப்பாய்வு (Analytics)</span>
              </NavLink>

              <NavLink
                to="/admin/books/new"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive ? 'bg-emerald-800 text-white' : 'hover:bg-emerald-900/40 text-emerald-200'
                  }`
                }
              >
                <PlusCircle className="h-4 w-4" />
                <span>புதிய புத்தகம் (Add Book)</span>
              </NavLink>

              <NavLink
                to="/admin/audio-upload"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive ? 'bg-emerald-800 text-white' : 'hover:bg-emerald-900/40 text-emerald-200'
                  }`
                }
              >
                <FileAudio className="h-4 w-4" />
                <span>ஆடியோ பதிவேற்றம் (Audio Upload)</span>
              </NavLink>

              <div className="pt-2">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider px-3 mb-2">
                  அமைப்பு & பயனர்கள்
                </div>
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      isActive ? 'bg-emerald-800 text-white' : 'hover:bg-emerald-900/40 text-emerald-200'
                    }`
                  }
                >
                  <Users className="h-4 w-4" />
                  <span>பயனர்கள் (Users)</span>
                </NavLink>

                <NavLink
                  to="/admin/creators"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      isActive ? 'bg-emerald-800 text-white' : 'hover:bg-emerald-900/40 text-emerald-200'
                    }`
                  }
                >
                  <CheckSquare className="h-4 w-4" />
                  <span>படைப்பாளர் விண்ணப்பங்கள்</span>
                </NavLink>

                <NavLink
                  to="/admin/moderation"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      isActive ? 'bg-emerald-800 text-white' : 'hover:bg-emerald-900/40 text-emerald-200'
                    }`
                  }
                >
                  <ShieldAlert className="h-4 w-4" />
                  <span>உள்ளடக்க மதிப்பாய்வு</span>
                </NavLink>

                <NavLink
                  to="/admin/audio-queue"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      isActive ? 'bg-emerald-800 text-white' : 'hover:bg-emerald-900/40 text-emerald-200'
                    }`
                  }
                >
                  <Radio className="h-4 w-4" />
                  <span>ஆடியோ டிரான்ஸ்கோடிங் வரிசை</span>
                </NavLink>

                <NavLink
                  to="/admin/settings"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      isActive ? 'bg-emerald-800 text-white' : 'hover:bg-emerald-900/40 text-emerald-200'
                    }`
                  }
                >
                  <Settings className="h-4 w-4" />
                  <span>கணினி அமைப்புகள் (Settings)</span>
                </NavLink>
              </div>
            </>
          )}
        </nav>
      </div>

      {/* User info at bottom */}
      <div className="p-4 border-t border-emerald-900/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {user?.displayName?.charAt(0) || 'U'}
          </div>
          <div className="text-left overflow-hidden min-w-0">
            <p className="text-xs font-bold text-white truncate max-w-[110px]">
              {user?.displayName || 'பயனர்'}
            </p>
            <span className="text-[10px] text-emerald-400 block truncate">
              {user?.role}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="வெளியேறு (Logout)"
          className="p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-900/60 transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};