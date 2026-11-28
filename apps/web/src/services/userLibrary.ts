/**
 * Kathaisolli User Library Service
 * Handles saving/removing audiobooks to "My Library", tracking listening progress,
 * and synchronizing between local storage and Firebase / API client.
 */

export interface SavedBookItem {
  id: string;
  slug: string;
  title: string;
  tamilTitle?: string;
  authorName?: string;
  coverImageUrl?: string;
  categoryName?: string;
  language?: string;
  totalEpisodes?: number;
  totalDurationSeconds?: number;
  savedAt: number;
  lastPlayedAt?: number;
  progressSec?: number;
  durationSec?: number;
  lastEpisodeId?: string;
  lastEpisodeTitle?: string;
}

const STORAGE_KEY_PREFIX = 'kathaisolli_saved_books_';
const PROGRESS_KEY_PREFIX = 'kathaisolli_progress_';
const HISTORY_KEY_PREFIX = 'kathaisolli_listening_history_';

export interface ListeningHistoryEntry {
  bookId: string;
  episodeId: string;
  episodeTitle?: string;
  positionSec: number;
  durationSec: number;
  completed: boolean;
  lastPlayedAt: number;
}

const getStorageKey = (userId?: string | null): string => {
  return `${STORAGE_KEY_PREFIX}${userId ? userId : 'local_user'}`;
};

/**
 * Retrieve all saved audiobooks for the current user
 */
export const getSavedBooks = (userId?: string | null): SavedBookItem[] => {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[LibraryService] Failed to read saved books:', err);
    return [];
  }
};

/**
 * Check if a specific audiobook is in the user's saved library
 */
export const isBookSaved = (bookId: string, userId?: string | null): boolean => {
  if (!bookId) return false;
  const books = getSavedBooks(userId);
  return books.some((b) => b.id === bookId || b.slug === bookId);
};

/**
 * Save an audiobook to the user's library
 */
export const saveBook = (
  book: Partial<SavedBookItem> & { id: string },
  userId?: string | null,
  api?: any,
): SavedBookItem[] => {
  const books = getSavedBooks(userId);
  const exists = books.find((b) => b.id === book.id || b.slug === book.id);

  let updated: SavedBookItem[];
  if (exists) {
    updated = books.map((b) =>
      b.id === book.id || b.slug === book.id
        ? { ...b, ...book, savedAt: b.savedAt || Date.now() }
        : b,
    );
  } else {
    const newItem: SavedBookItem = {
      id: book.id,
      slug: book.slug || book.id,
      title: book.title || 'தமிழ் ஆடியோ புத்தகம்',
      tamilTitle: book.tamilTitle,
      authorName: book.authorName || 'கதைசொல்லி',
      coverImageUrl: book.coverImageUrl || '/images/temple-sunset.jpg',
      categoryName: book.categoryName || 'General',
      language: book.language || 'Tamil',
      totalEpisodes: book.totalEpisodes || 1,
      totalDurationSeconds: book.totalDurationSeconds || 0,
      savedAt: Date.now(),
      progressSec: 0,
      durationSec: book.totalDurationSeconds || 0,
    };
    updated = [newItem, ...books];
  }

  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kathaisolli:library-updated', { detail: { bookId: book.id, action: 'save' } }));
  } catch (err) {
    console.warn('[LibraryService] Failed to write saved books:', err);
  }

  // Sync to API backend if authenticated
  if (api?.library?.addFavorite && userId) {
    api.library.addFavorite(book.id).catch((syncErr: any) => {
      console.warn('[LibraryService] Background favorite sync notice:', syncErr);
    });
  }

  return updated;
};

/**
 * Remove an audiobook from the user's library
 */
export const removeBook = (
  bookId: string,
  userId?: string | null,
  api?: any,
): SavedBookItem[] => {
  const books = getSavedBooks(userId);
  const updated = books.filter((b) => b.id !== bookId && b.slug !== bookId);

  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kathaisolli:library-updated', { detail: { bookId, action: 'remove' } }));
  } catch (err) {
    console.warn('[LibraryService] Failed to remove saved book:', err);
  }

  // Sync deletion to API backend if authenticated
  if (api?.library?.removeFavorite && userId) {
    api.library.removeFavorite(bookId).catch((syncErr: any) => {
      console.warn('[LibraryService] Background favorite removal notice:', syncErr);
    });
  }

  return updated;
};

/**
 * Toggle save status
 */
export const toggleSaveBook = (
  book: Partial<SavedBookItem> & { id: string },
  userId?: string | null,
  api?: any,
): { isSaved: boolean; books: SavedBookItem[] } => {
  const saved = isBookSaved(book.id, userId);
  if (saved) {
    const books = removeBook(book.id, userId, api);
    return { isSaved: false, books };
  } else {
    const books = saveBook(book, userId, api);
    return { isSaved: true, books };
  }
};

/**
 * Update listening progress for a book
 */
export const updateListeningProgress = (
  bookId: string,
  episodeId: string,
  positionSec: number,
  durationSec: number,
  episodeTitle?: string,
  userId?: string | null,
): void => {
  if (!bookId) return;

  // 1. Store progress per episode (user-scoped when userId is provided)
  try {
    const progressKey = userId
      ? `${PROGRESS_KEY_PREFIX}${userId}_${episodeId || bookId}`
      : `${PROGRESS_KEY_PREFIX}${episodeId || bookId}`;
    localStorage.setItem(
      progressKey,
      JSON.stringify({ positionSec, durationSec, timestamp: Date.now() }),
    );
  } catch {}

  // 2. Store user-specific listening history for "Last 5 Uncompleted Books"
  if (userId) {
    try {
      const historyKey = `${HISTORY_KEY_PREFIX}${userId}`;
      const raw = localStorage.getItem(historyKey);
      const list: ListeningHistoryEntry[] = raw ? JSON.parse(raw) : [];
      const isCompleted =
        durationSec > 0 && positionSec >= durationSec * 0.95;
      const filtered = Array.isArray(list)
        ? list.filter((item) => item.bookId !== bookId)
        : [];
      const updatedHistory: ListeningHistoryEntry[] = [
        {
          bookId,
          episodeId,
          episodeTitle,
          positionSec: Math.floor(positionSec),
          durationSec: Math.floor(durationSec),
          completed: isCompleted,
          lastPlayedAt: Date.now(),
        },
        ...filtered,
      ].slice(0, 30);
      localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
      window.dispatchEvent(new CustomEvent('kathaisolli:history-updated'));
    } catch {}
  }

  // 3. Update progress in saved books collection if present
  const books = getSavedBooks(userId);
  const target = books.find((b) => b.id === bookId || b.slug === bookId);
  if (target) {
    const updated = books.map((b) => {
      if (b.id === bookId || b.slug === bookId) {
        return {
          ...b,
          progressSec: Math.floor(positionSec),
          durationSec: Math.floor(durationSec || b.durationSec || 0),
          lastEpisodeId: episodeId,
          lastEpisodeTitle: episodeTitle || b.lastEpisodeTitle,
          lastPlayedAt: Date.now(),
        };
      }
      return b;
    });

    try {
      localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
    } catch {}
  }
};

/**
 * Retrieve progress for a book or episode
 */
export const getProgress = (
  id: string,
  userId?: string | null,
): { positionSec: number; durationSec: number; percent: number } | null => {
  try {
    const raw =
      (userId && localStorage.getItem(`${PROGRESS_KEY_PREFIX}${userId}_${id}`)) ||
      localStorage.getItem(`${PROGRESS_KEY_PREFIX}${id}`);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const pos = data.positionSec || 0;
    const dur = data.durationSec || 0;
    const percent = dur > 0 ? Math.min(100, Math.round((pos / dur) * 100)) : 0;
    return { positionSec: pos, durationSec: dur, percent };
  } catch {
    return null;
  }
};

/**
 * Retrieve the user's most recent uncompleted books (sorted by lastPlayedAt desc)
 */
export const getUncompletedListeningHistory = (
  userId?: string | null,
  limit = 5,
): ListeningHistoryEntry[] => {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(`${HISTORY_KEY_PREFIX}${userId}`);
    if (!raw) return [];
    const parsed: ListeningHistoryEntry[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry) => !entry.completed && entry.positionSec > 0)
      .sort((a, b) => (b.lastPlayedAt || 0) - (a.lastPlayedAt || 0))
      .slice(0, limit);
  } catch {
    return [];
  }
};
