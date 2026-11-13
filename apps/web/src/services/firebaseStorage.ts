import {
  ref,
  listAll,
  getDownloadURL,
  getMetadata,
  type StorageReference,
  type FullMetadata,
} from 'firebase/storage';
import { storage, isFirebaseConfigured, firebaseConfig } from './firebase';

export interface FirebaseAudioStory {
  id: string;
  title: string;
  cleanName: string;
  folder: string;
  fullPath: string;
  downloadUrl: string;
  coverImageUrl?: string;
  sizeBytes?: number;
  durationSec?: number;
  contentType?: string;
  timeCreated?: string;
}

export interface FirebaseStorageState {
  stories: FirebaseAudioStory[];
  isLoading: boolean;
  error: string | null;
  isConfigured: boolean;
}

/**
 * Format raw audio file name into clean, human-readable title
 * E.g., "01_panchatantra_lion_and_hare.mp3" -> "Panchatantra Lion And Hare"
 */
export function formatAudioTitle(fileName: string): string {
  const withoutExt = fileName.replace(/\.[^/.]+$/, '');
  const clean = withoutExt
    .replace(/^\d+[-_.\s]*/, '') // Strip leading track numbers like "01-", "1_"
    .replace(/[-_]+/g, ' ')
    .trim();

  // Capitalize words
  return clean
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Retrieve audio download URL for any given path in Firebase Storage.
 */
export async function getAudioDownloadUrl(path: string): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized.');
  }
  const fileRef = ref(storage, path);
  return await getDownloadURL(fileRef);
}

/**
 * List subfolder names inside a given Firebase Storage directory.
 */
export async function listStoryFolders(basePath = ''): Promise<string[]> {
  if (!storage) return [];
  try {
    const baseRef = ref(storage, basePath);
    const res = await listAll(baseRef);
    return res.prefixes.map((prefix) => prefix.name);
  } catch (err: any) {
    console.warn(`[Firebase Storage] Error listing folders at "${basePath}":`, err?.message || err);
    return [];
  }
}

/**
 * List audio files inside a specific story folder or prefix safely.
 * Optimized with direct media URLs and bounded prefix scanning to prevent network saturation.
 */
export async function listAudioFiles(folderPath = '', maxItems = 24): Promise<FirebaseAudioStory[]> {
  if (!storage) {
    return [];
  }

  const configuredStoriesPath =
    typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env.VITE_FIREBASE_STORIES_PATH
      : undefined;
  const targetPath = folderPath || configuredStoriesPath || 'stories';

  try {
    // Add timeout protection so Firebase queries never block UI indefinitely
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firebase Storage listing timeout (3.5s limit exceeded)')), 3500),
    );

    const listPromise = (async () => {
      const folderRef = ref(storage!, targetPath);
      const res = await listAll(folderRef);

      // Filter audio items (.mp3, .m4a, .wav, .aac, .ogg)
      const audioItems = res.items.filter((item) =>
        /\.(mp3|m4a|wav|aac|ogg|flac|opus)$/i.test(item.name),
      );

      // If no direct audio files in target folder, inspect up to 3 immediate subfolders only
      if (audioItems.length === 0 && res.prefixes.length > 0) {
        const topPrefixes = res.prefixes.slice(0, 3);
        const subLists = await Promise.all(
          topPrefixes.map(async (prefix) => {
            try {
              const subRes = await listAll(prefix);
              return subRes.items.filter((item) =>
                /\.(mp3|m4a|wav|aac|ogg|flac|opus)$/i.test(item.name),
              );
            } catch {
              return [];
            }
          }),
        );
        audioItems.push(...subLists.flat());
      }

      // Limit to maxItems to keep rendering fast and lightweight
      const boundedItems = audioItems.slice(0, maxItems);

      const stories: FirebaseAudioStory[] = boundedItems.map((item) => {
        // Construct standard Firebase download URL directly without extra network request
        const bucketName = firebaseConfig.storageBucket.replace(/^gs:\/\//, '');
        const directUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(
          item.fullPath,
        )}?alt=media`;

        return {
          id: `fb-${item.name.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
          title: formatAudioTitle(item.name),
          cleanName: item.name,
          folder: item.parent?.name || targetPath,
          fullPath: item.fullPath,
          downloadUrl: directUrl,
          coverImageUrl: '/images/covers/arthashastram.jpg',
          durationSec: 300,
          contentType: item.name.endsWith('.mp3') ? 'audio/mpeg' : 'audio/ogg',
        };
      });

      return stories;
    })();

    return await Promise.race([listPromise, timeoutPromise]);
  } catch (err: any) {
    if (err?.code === 'storage/unauthorized') {
      console.warn('[Firebase Storage] Unauthorized read access:', err.message);
      return [];
    }
    if (err?.code === 'storage/object-not-found') {
      return [];
    }
    console.warn(`[Firebase Storage] Query error for path "${targetPath}":`, err?.message || err);
    return [];
  }
}

/**
 * Get all available Firebase audio tracks with graceful error handling.
 */
export async function getStoryAudioTracks(): Promise<FirebaseAudioStory[]> {
  const configured = isFirebaseConfigured();
  if (!configured) {
    return [];
  }
  return await listAudioFiles();
}
