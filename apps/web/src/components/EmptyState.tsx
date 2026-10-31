import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon, BookOpen } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  tamilTitle?: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = BookOpen,
  title,
  tamilTitle,
  description,
  actionLabel,
  actionHref,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border-2 border-dashed border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/20 my-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 mb-3">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
        {tamilTitle ? `${tamilTitle} (${title})` : title}
      </h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
        {description}
      </p>

      {actionLabel && (
        <div className="mt-5">
          {actionHref ? (
            <Link
              to={actionHref}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition-colors"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition-colors"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
