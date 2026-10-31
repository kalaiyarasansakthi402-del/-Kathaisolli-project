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
 * List all audio files inside a specific story folder or prefix.
 */
export async function listAudioFiles(folderPath = ''): Promise<FirebaseAudioStory[]> {
  if (!storage) {
    return [];
  }

  const targetPath = folderPath || import.meta.env.VITE_FIREBASE_STORIES_PATH || 'stories';

  try {
    const folderRef = ref(storage, targetPath);
    const res = await listAll(folderRef);

    // Also look for cover images in the same folder
    const imageFiles = res.items.filter((item) =>
      /\.(jpe?g|png|webp|avif)$/i.test(item.name),
    );
    let defaultCoverUrl: string | undefined = undefined;

    if (imageFiles.length > 0) {
      try {
        const coverItem =
          imageFiles.find((f) => /cover|thumbnail|poster/i.test(f.name)) || imageFiles[0];
        defaultCoverUrl = await getDownloadURL(coverItem);
      } catch {
        // Non-critical if cover download fails
      }
    }

    // Filter audio items (.mp3, .m4a, .wav, .aac, .ogg)
    const audioItems = res.items.filter((item) =>
      /\.(mp3|m4a|wav|aac|ogg|flac|opus)$/i.test(item.name),
    );

    // If no audio files in current folder, check immediate subfolders (one level deep)
    if (audioItems.length === 0 && res.prefixes.length > 0) {
      const nestedPromises = res.prefixes.map(async (subPrefix) => {
        return listAudioFiles(subPrefix.fullPath);
      });
      const nestedResults = await Promise.all(nestedPromises);
      return nestedResults.flat();
    }

    // Resolve download URLs and metadata for audio files
    const stories: FirebaseAudioStory[] = await Promise.all(
      audioItems.map(async (item) => {
        let downloadUrl = '';
        let metadata: FullMetadata | null = null;

        try {
          downloadUrl = await getDownloadURL(item);
        } catch (e) {
          console.warn(`Failed to get download URL for ${item.fullPath}:`, e);
        }

        try {
          metadata = await getMetadata(item);
        } catch {
          // Metadata is optional
        }

        // Try pairing with an exact cover image matching base name if available
        let itemCover = defaultCoverUrl;
        const baseName = item.name.replace(/\.[^/.]+$/, '');
        const matchingImage = imageFiles.find((img) =>
          img.name.toLowerCase().startsWith(baseName.toLowerCase()),
        );
        if (matchingImage) {
          try {
            itemCover = await getDownloadURL(matchingImage);
          } catch {
            // Fall back to default folder cover
          }
        }

        // Approximate duration based on standard 128kbps bitrate if size is known
        const sizeBytes = metadata?.size;
        let estimatedDurationSec: number | undefined = undefined;
        if (sizeBytes) {
          // 128 kbps = 16,000 bytes per second
          estimatedDurationSec = Math.max(30, Math.round(sizeBytes / 16000));
        }

        return {
          id: `fb-${item.name.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
          title: formatAudioTitle(item.name),
          cleanName: item.name,
          folder: targetPath,
          fullPath: item.fullPath,
          downloadUrl,
          coverImageUrl: itemCover,
          sizeBytes,
          durationSec: estimatedDurationSec,
          contentType: metadata?.contentType || 'audio/mpeg',
          timeCreated: metadata?.timeCreated,
        };
      }),
    );

    return stories.filter((s) => s.downloadUrl.length > 0);
  } catch (err: any) {
    if (err?.code === 'storage/unauthorized') {
      throw new Error(
        'Firebase Storage Unauthorized: Please check your Firebase Storage security rules for bucket gs://' +
          firebaseConfig.storageBucket,
      );
    }
    if (err?.code === 'storage/object-not-found') {
      return [];
    }
    console.warn(`[Firebase Storage] Query error for path "${targetPath}":`, err?.message || err);
    throw err;
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
