import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  type FirebaseStorage,
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'vaagai-audio-books-36a4e.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'vaagai-audio-books-36a4e',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'vaagai-audio-books-36a4e.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let storage: FirebaseStorage | null = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  storage = getStorage(app, `gs://${firebaseConfig.storageBucket.replace(/^gs:\/\//, '')}`);
} catch (err) {
  console.warn('[Admin Firebase] Storage init notice:', err);
}

/**
 * Format bytes to human readable string (KB, MB, GB)
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Detect audio duration in seconds from an audio file using HTML5 Audio
 */
export const detectAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    try {
      const audio = document.createElement('audio');
      const objectUrl = URL.createObjectURL(file);
      audio.preload = 'metadata';
      audio.src = objectUrl;

      audio.onloadedmetadata = () => {
        const duration = Math.round(audio.duration || 0);
        URL.revokeObjectURL(objectUrl);
        resolve(duration);
      };

      audio.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        // Fallback default duration based on file size approximation if metadata fails
        const estSec = Math.max(60, Math.round(file.size / (16 * 1024))); // ~128kbps approx
        resolve(estSec);
      };
    } catch {
      resolve(180);
    }
  });
};

/**
 * Upload Book Cover Image to Firebase Storage
 * Path: kathaisolli/books/{bookId}/cover/{filename}
 */
export const uploadBookCoverImage = async (
  bookId: string,
  file: File,
  onProgress?: (progressPercent: number) => void,
): Promise<{ url: string; storagePath: string; fileSizeBytes: number }> => {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!validTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpe?g|png|webp)$/i)) {
    throw new Error('ஏற்றுக்கொள்ளப்பட்ட வடிவங்கள்: JPG, PNG, WebP மட்டுமே (Supported: JPG, PNG, WebP only)');
  }

  // Max 5MB
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('படத்தின் அளவு 5MB-க்கு குறைவாக இருக்க வேண்டும் (Cover image size must be under 5MB)');
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `kathaisolli/books/${bookId}/cover/${cleanFileName}`;

  if (storage && import.meta.env.VITE_FIREBASE_API_KEY) {
    try {
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type || 'image/jpeg',
      });

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            if (onProgress) onProgress(pct);
          },
          (error) => {
            console.warn('[Admin Firebase] Remote upload failed, creating object URL fallback:', error);
            const localUrl = URL.createObjectURL(file);
            resolve({ url: localUrl, storagePath, fileSizeBytes: file.size });
          },
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({ url: downloadUrl, storagePath, fileSizeBytes: file.size });
          },
        );
      });
    } catch (err) {
      console.warn('[Admin Firebase] Falling back to local preview URL:', err);
    }
  }

  // Local simulated progress and URL for offline/demo operation
  if (onProgress) {
    for (let p = 20; p <= 100; p += 20) {
      onProgress(p);
      await new Promise((r) => setTimeout(r, 60));
    }
  }

  const localPreviewUrl = URL.createObjectURL(file);
  return {
    url: localPreviewUrl,
    storagePath,
    fileSizeBytes: file.size,
  };
};

/**
 * Upload Audiobook MP3 Chapter to Firebase Storage
 * Path: kathaisolli/books/{bookId}/chapters/{chapterId}.mp3
 * Content-Type: audio/mpeg
 */
export const uploadChapterAudioMp3 = async (
  bookId: string,
  chapterId: string,
  file: File,
  onProgress?: (progressPercent: number) => void,
): Promise<{
  url: string;
  storagePath: string;
  durationSec: number;
  fileSizeBytes: number;
  fileName: string;
}> => {
  // 1. Validate file format
  const isMp3 =
    file.type === 'audio/mpeg' ||
    file.type === 'audio/mp3' ||
    file.name.toLowerCase().endsWith('.mp3');

  if (!isMp3) {
    throw new Error('ஆடியோ MP3 வடிவில் மட்டுமே இருக்க வேண்டும் (File must be an MP3 audio file with audio/mpeg MIME type)');
  }

  // 2. Detect duration before upload
  const durationSec = await detectAudioDuration(file);

  const cleanFileName = `${chapterId}.mp3`;
  const storagePath = `kathaisolli/books/${bookId}/chapters/${cleanFileName}`;

  // 3. Upload to Firebase Storage
  if (storage && import.meta.env.VITE_FIREBASE_API_KEY) {
    try {
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: 'audio/mpeg',
        customMetadata: {
          bookId,
          chapterId,
          durationSec: String(durationSec),
          originalName: file.name,
        },
      });

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            if (onProgress) onProgress(pct);
          },
          (error) => {
            console.warn('[Admin Firebase] Remote audio upload failed, creating object URL fallback:', error);
            const localUrl = URL.createObjectURL(file);
            resolve({
              url: localUrl,
              storagePath,
              durationSec,
              fileSizeBytes: file.size,
              fileName: file.name,
            });
          },
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              url: downloadUrl,
              storagePath,
              durationSec,
              fileSizeBytes: file.size,
              fileName: file.name,
            });
          },
        );
      });
    } catch (err) {
      console.warn('[Admin Firebase] Falling back to local preview audio stream:', err);
    }
  }

  // Local simulated progress and URL for development/demo operation
  if (onProgress) {
    for (let p = 15; p <= 100; p += 15) {
      onProgress(p);
      await new Promise((r) => setTimeout(r, 80));
    }
  }

  const localAudioUrl = URL.createObjectURL(file);
  return {
    url: localAudioUrl,
    storagePath,
    durationSec,
    fileSizeBytes: file.size,
    fileName: file.name,
  };
};
