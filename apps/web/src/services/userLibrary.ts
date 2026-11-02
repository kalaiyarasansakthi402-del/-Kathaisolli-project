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

  // 1. Store progress per episode
  try {
    const progressKey = `${PROGRESS_KEY_PREFIX}${episodeId || bookId}`;
    localStorage.setItem(
      progressKey,
      JSON.stringify({ positionSec, durationSec, timestamp: Date.now() }),
    );
  } catch {}

  // 2. Update progress in saved books collection if present
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
): { positionSec: number; durationSec: number; percent: number } | null => {
  try {
    const raw = localStorage.getItem(`${PROGRESS_KEY_PREFIX}${id}`);
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
