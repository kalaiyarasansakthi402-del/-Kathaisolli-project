import React from 'react';

export const StoryCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col justify-between h-full w-full rounded-2xl bg-white dark:bg-[#083325] border-2 border-[#E3DCBA] dark:border-[#124835] shadow-sm overflow-hidden animate-pulse">
      {/* Cover Skeleton */}
      <div className="h-44 sm:h-48 w-full bg-emerald-950/20 dark:bg-emerald-900/30" />

      {/* Body Skeleton */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-3.5">
        {/* Category Pill */}
        <div className="h-5 w-20 rounded-full bg-emerald-100/60 dark:bg-emerald-900/40" />

        {/* Title & Author */}
        <div className="space-y-2 min-h-[2.8rem] sm:min-h-[3.25rem]">
          <div className="h-4 bg-emerald-100 dark:bg-emerald-900/50 rounded w-4/5" />
          <div className="h-4 bg-emerald-100 dark:bg-emerald-900/50 rounded w-1/2" />
        </div>
        <div className="h-3 bg-emerald-50 dark:bg-emerald-950 rounded w-1/3" />

        {/* Meta */}
        <div className="pt-2.5 border-t border-[#E3DCBA]/60 dark:border-[#124835] flex justify-between items-center">
          <div className="h-3 bg-emerald-50 dark:bg-emerald-950 rounded w-1/4" />
          <div className="h-3 bg-emerald-50 dark:bg-emerald-950 rounded w-1/6" />
        </div>

        {/* Listen Button Skeleton */}
        <div className="h-10 w-full rounded-xl bg-emerald-100/60 dark:bg-emerald-900/40" />
      </div>
    </div>
  );
};

export const StoryGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <StoryCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default StoryGridSkeleton;
