import React, { useEffect } from 'react';
import { LogOut, X, Loader2, AlertCircle } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  isLoading = false,
  onClose,
  onConfirm,
}) => {
  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-[#FAF7EE] dark:bg-[#072F22] border-2 border-[#E3DCBA] dark:border-[#104434] rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200 z-10 overflow-hidden">
        {/* Subtle decorative background gradient accent */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-rose-500/10 dark:bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full hover:bg-stone-200/50 dark:hover:bg-[#0B3D2E] transition-colors disabled:opacity-40"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header & Icon */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center flex-shrink-0 text-rose-600 dark:text-rose-400 shadow-sm">
            <LogOut className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3
              id="logout-modal-title"
              className="text-lg sm:text-xl font-bold font-serif text-[#064E3B] dark:text-[#F8F5E9]"
            >
              Sign Out (வெளியேறு)
            </h3>
            <p className="text-xs font-tamil text-[#166534] dark:text-[#A7F3D0] font-semibold">
              நீங்கள் நிச்சயமாக வெளியேற விரும்புகிறீர்களா?
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 text-xs sm:text-sm text-stone-600 dark:text-stone-300 bg-white/70 dark:bg-[#0B3D2E]/70 p-4 rounded-2xl border border-[#E8E1CE] dark:border-[#104434]">
          <p className="font-medium text-[#173D2E] dark:text-stone-100">
            Are you sure you want to sign out?
          </p>
          <p className="text-stone-500 dark:text-stone-400 text-xs">
            Your ongoing audio session will pause, and you will need to sign in again to access your
            saved library and personalized playlists.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold border border-[#D5CEBA] dark:border-[#124835] bg-white dark:bg-[#04281E] text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#083325] transition-all disabled:opacity-50"
          >
            Cancel (ரத்து செய்)
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 active:scale-95 text-white shadow-lg shadow-rose-950/20 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>வெளியேறுகிறது...</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
