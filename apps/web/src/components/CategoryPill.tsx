import React from 'react';

export interface CategoryPillProps {
  id: string;
  name: string;
  tamilName?: string;
  icon?: string;
  isActive?: boolean;
  onClick: (id: string) => void;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({
  id,
  name,
  tamilName,
  isActive = false,
  onClick,
}) => {
  return (
    <button
      onClick={() => onClick(id)}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
        isActive
          ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/20 scale-105'
          : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-900/60 border border-emerald-200/50 dark:border-emerald-800/40'
      }`}
    >
      <span>{tamilName || name}</span>
      {tamilName && name !== tamilName && (
        <span className="text-xs opacity-75 hidden sm:inline">({name})</span>
      )}
    </button>
  );
};
