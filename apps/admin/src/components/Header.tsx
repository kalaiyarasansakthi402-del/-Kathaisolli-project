import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  ExternalLink,
  ChevronRight,
  Shield,
  Clock,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const ROUTE_LABELS: Record<string, string> = {
  admin: 'மேலோட்டம் (Dashboard)',
  dashboard: 'மேலோட்டம் (Dashboard)',
  'audio-upload': 'ஆடியோ பதிவேற்றம் (Audiobook Upload)',
  stories: 'கதைகள் மேலாண்மை (Story Management)',
  books: 'கதைகள் மேலாண்மை (Story Management)',
  new: 'புதிய கதை சேர் (Add Story)',
  chapters: 'அத்தியாயங்கள் மேலாண்மை (Chapters)',
  categories: 'வகைப்பாடுகள் (Category Management)',
  storage: 'ஆடியோ சேமிப்பகம் (Audio Storage)',
  reports: 'அறிக்கைகள் & பகுப்பாய்வு (Reports & Analytics)',
  analytics: 'அறிக்கைகள் & பகுப்பாய்வு (Reports & Analytics)',
  roles: 'நிர்வாகப் பொறுப்புகள் (Admin Roles & Permissions)',
  settings: 'அமைப்புகள் & பாதுகாப்பு (Settings & Security)',
};

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, api } = useAdminAuth();
  const location = useLocation();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch recent activities for notifications
  useEffect(() => {
    let mounted = true;
    const fetchActivities = async () => {
      try {
        const stats = await api.admin.getDashboard();
        if (mounted && Array.isArray(stats?.recentAdminActivities)) {
          setActivities(stats.recentAdminActivities);
        }
      } catch {
        // quiet fallback
      }
    };
    fetchActivities();
    return () => {
      mounted = false;
    };
  }, [api]);

  // Generate breadcrumbs from path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, idx) => {
    const url = `/${pathSegments.slice(0, idx + 1).join('/')}`;
    const label = ROUTE_LABELS[segment] || segment;
    const isLast = idx === pathSegments.length - 1;
    return { url, label, isLast };
  });

  return (
    <header className="h-16 px-4 sm:px-6 bg-white border-b border-gray-200 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
          className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-[#064E3B] hover:bg-emerald-50 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumbs */}
        <nav className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 overflow-hidden">
          <Link
            to="/admin"
            className="text-[#064E3B] hover:underline font-bold flex items-center gap-1 shrink-0"
          >
            <span>கதைசொல்லி</span>
          </Link>
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.url}>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              {crumb.isLast ? (
                <span className="font-semibold text-gray-800 truncate">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.url}
                  className="hover:text-[#064E3B] transition-colors truncate"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right: Actions, Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* Link to Live Public Website */}
        <a
          href={import.meta.env.PROD ? '/' : 'http://localhost:5173'}
          target="_blank"
          rel="noreferrer"
          title="நேயர் தளம் காண்க (Live Listener Website)"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-[#064E3B] border border-emerald-200 transition-colors"
        >
          <span>நேயர் தளம் (Live Website)</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl text-gray-600 hover:text-[#064E3B] hover:bg-emerald-50 transition-colors"
            title="நிர்வாக அறிவிப்புகள் (Admin Activities)"
          >
            <Bell className="w-5 h-5" />
            {activities.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#064E3B]" />
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    சமீபத்திய நிர்வாக நடவடிக்கைகள்
                  </h4>
                </div>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {activities.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400">
                    புதிய நடவடிக்கைகள் எதுவும் இல்லை.
                  </div>
                ) : (
                  activities.map((act) => (
                    <div key={act.id} className="p-3 hover:bg-gray-50 transition-colors text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-[#064E3B]">
                          {act.action.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          {new Date(act.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-gray-600 text-[11px] mt-0.5">
                        {act.actorName} ({act.targetType} {act.targetId ? `#${act.targetId.slice(0, 8)}` : ''})
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Current Admin Profile Chip */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
          <div className="h-8 w-8 rounded-xl bg-[#064E3B] text-emerald-200 flex items-center justify-center font-bold text-xs shadow-sm">
            {user?.displayName?.charAt(0) || 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-gray-800 leading-tight">
              {user?.displayName || 'தலைமை நிர்வாகி'}
            </p>
            <p className="text-[10px] font-semibold text-[#047857]">
              {user?.role === 'SUPER_ADMIN'
                ? 'Super Admin'
                : user?.role === 'ADMIN'
                ? 'Admin'
                : 'Editor'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
