import React from 'react';

export const StoryCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col rounded-2xl bg-white dark:bg-[#14231E] border border-emerald-100/60 dark:border-emerald-900/40 shadow-sm overflow-hidden animate-pulse">
      <div className="aspect-square w-full bg-emerald-100/50 dark:bg-emerald-900/30" />
      <div className="p-3.5 space-y-2">
        <div className="h-4 bg-emerald-100 dark:bg-emerald-900/50 rounded w-3/4" />
        <div className="h-3 bg-emerald-50 dark:bg-emerald-950 rounded w-1/2" />
        <div className="pt-2 flex justify-between">
          <div className="h-3 bg-emerald-50 dark:bg-emerald-950 rounded w-1/4" />
          <div className="h-3 bg-emerald-50 dark:bg-emerald-950 rounded w-1/6" />
        </div>
      </div>
    </div>
  );
};

export const StoryGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <StoryCardSkeleton key={i} />
      ))}
    </div>
  );
};
