import React, { useState } from 'react';
import { Bell, Sparkles, Check, CheckCheck } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: string;
}

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'புதிய அத்தியாயம் வெளியானது!',
      message: 'பொன்னியின் செல்வன் அத்தியாயம் 5 இப்போது கதைசொல்லியில் இலவசமாகக் கேட்கக் கிடைக்கிறது.',
      createdAt: '10 நிமிடங்களுக்கு முன்',
      isRead: false,
      type: 'EPISODE_RELEASE',
    },
    {
      id: 'notif-2',
      title: 'கதைசொல்லிக்கு நல்வரவு!',
      message: '100% கட்டணமில்லா தமிழ் ஆடியோ கதை அனுபவத்திற்கு உங்களை அன்போடு வரவேற்கிறோம்.',
      createdAt: 'நேற்று',
      isRead: true,
      type: 'WELCOME',
    },
    {
      id: 'notif-3',
      title: 'புதிய தொடர்: சிவகாமியின் சபதம்',
      message: 'கல்கியின் மாபெரும் வரலாற்றுப் புதினம் சிவகாமியின் சபதம் முழு ஆடியோ வடிவில் சேர்க்கப்பட்டுள்ளது.',
      createdAt: '3 நாட்களுக்கு முன்',
      isRead: true,
      type: 'STORY_RELEASE',
    },
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
            அறிவிப்புகள் (Notifications)
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            புதிய கதை வெளியீடுகள் மற்றும் தள புதுப்பிப்புகள்
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            <CheckCheck className="h-4 w-4" />
            <span>அனைத்தையும் படித்ததாகக் குறிக்கவும்</span>
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="divide-y divide-emerald-50 dark:divide-emerald-900/30 bg-white dark:bg-[#14231E] rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 flex items-start gap-4 transition-colors ${
                !n.isRead ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''
              }`}
            >
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                  !n.isRead
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-100 dark:bg-emerald-950/50 text-zinc-400'
                }`}
              >
                <Bell className="h-5 w-5" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {n.title}
                  </h4>
                  <span className="text-xs text-zinc-400">{n.createdAt}</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {n.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="அறிவிப்புகள் எதுவும் இல்லை"
          tamilTitle="No Notifications"
          description="புதிய கதைகள் வெளியாகும் போது உங்களுக்கு இங்கு அறிவிக்கப்படும்."
        />
      )}
    </div>
  );
};
