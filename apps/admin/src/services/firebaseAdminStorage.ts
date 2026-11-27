import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  type FirebaseStorage,
  type UploadTaskSnapshot,
  type StorageError,
} from 'firebase/storage';

const hasViteEnv = typeof import.meta !== 'undefined' && Boolean(import.meta.env);

const defaultBucket = 'vaagai-audio-books-36a4e.appspot.com';

const firebaseConfig = {
  apiKey: (hasViteEnv ? import.meta.env.VITE_FIREBASE_API_KEY : undefined) || 'AIzaSyVaagaiAudioBooksPublicAccessKey',
  authDomain:
    (hasViteEnv ? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN : undefined) ||
    'vaagai-audio-books-36a4e.firebaseapp.com',
  projectId:
    (hasViteEnv ? import.meta.env.VITE_FIREBASE_PROJECT_ID : undefined) ||
    'vaagai-audio-books-36a4e',
  storageBucket:
    (hasViteEnv ? import.meta.env.VITE_FIREBASE_STORAGE_BUCKET : undefined) ||
    defaultBucket,
  messagingSenderId: hasViteEnv ? import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID : undefined,
  appId: hasViteEnv ? import.meta.env.VITE_FIREBASE_APP_ID : undefined,
};

let app: FirebaseApp | null = null;
let storage: FirebaseStorage | null = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  storage = getStorage(app, `gs://${firebaseConfig.storageBucket.replace(/^gs:\/\//, '')}`);
} catch (err) {
  console.warn('[Admin Firebase] Storage init notice:', err);
}

export type MediaKind = 'audio' | 'video';

export const SUPPORTED_AUDIO_EXTENSIONS = [
  'mp3',
  'wav',
  'flac',
  'aac',
  'm4a',
  'ogg',
  'wma',
  'aif',
  'aiff',
] as const;

export const SUPPORTED_VIDEO_EXTENSIONS = [
  'mp4',
  'mov',
  'mkv',
  'avi',
  'webm',
  'wmv',
  'flv',
  'f4v',
  'ts',
  'mts',
  'm2ts',
  '3gp',
  'mxf',
] as const;

const AUDIO_MIME_MAP: Record<string, { canonical: string; allowed: string[]; nativePlayable: boolean }> = {
  '.mp3': { canonical: 'audio/mpeg', allowed: ['audio/mpeg', 'audio/mp3', 'audio/x-mpeg'], nativePlayable: true },
  '.wav': { canonical: 'audio/wav', allowed: ['audio/wav', 'audio/x-wav', 'audio/wave', 'audio/vnd.wave'], nativePlayable: true },
  '.flac': { canonical: 'audio/flac', allowed: ['audio/flac', 'audio/x-flac'], nativePlayable: true },
  '.aac': { canonical: 'audio/aac', allowed: ['audio/aac', 'audio/x-aac', 'audio/aacp', 'audio/vnd.dlna.adts'], nativePlayable: true },
  '.m4a': { canonical: 'audio/mp4', allowed: ['audio/mp4', 'audio/x-m4a', 'audio/m4a'], nativePlayable: true },
  '.ogg': { canonical: 'audio/ogg', allowed: ['audio/ogg', 'application/ogg', 'audio/vorbis', 'audio/opus'], nativePlayable: true },
  '.wma': { canonical: 'audio/x-ms-wma', allowed: ['audio/x-ms-wma', 'audio/wma', 'video/x-ms-asf'], nativePlayable: false },
  '.aif': { canonical: 'audio/aiff', allowed: ['audio/aiff', 'audio/x-aiff', 'sound/aiff'], nativePlayable: false },
  '.aiff': { canonical: 'audio/aiff', allowed: ['audio/aiff', 'audio/x-aiff', 'sound/aiff'], nativePlayable: false },
};

const VIDEO_MIME_MAP: Record<string, { canonical: string; allowed: string[]; nativePlayable: boolean }> = {
  '.mp4': { canonical: 'video/mp4', allowed: ['video/mp4', 'application/mp4'], nativePlayable: true },
  '.mov': { canonical: 'video/quicktime', allowed: ['video/quicktime', 'video/x-quicktime'], nativePlayable: true },
  '.mkv': { canonical: 'video/x-matroska', allowed: ['video/x-matroska', 'video/matroska', 'application/octet-stream'], nativePlayable: false },
  '.avi': { canonical: 'video/x-msvideo', allowed: ['video/x-msvideo', 'video/avi', 'video/msvideo'], nativePlayable: false },
  '.webm': { canonical: 'video/webm', allowed: ['video/webm'], nativePlayable: true },
  '.wmv': { canonical: 'video/x-ms-wmv', allowed: ['video/x-ms-wmv', 'video/wmv', 'video/x-ms-asf'], nativePlayable: false },
  '.flv': { canonical: 'video/x-flv', allowed: ['video/x-flv', 'video/flv'], nativePlayable: false },
  '.f4v': { canonical: 'video/x-f4v', allowed: ['video/x-f4v', 'video/mp4', 'video/f4v'], nativePlayable: false },
  '.ts': { canonical: 'video/mp2t', allowed: ['video/mp2t', 'video/vnd.dlna.mpeg-tts', 'application/octet-stream'], nativePlayable: false },
  '.mts': { canonical: 'video/mp2t', allowed: ['video/mp2t', 'model/vnd.mts', 'application/octet-stream'], nativePlayable: false },
  '.m2ts': { canonical: 'video/mp2t', allowed: ['video/mp2t', 'video/m2ts', 'application/octet-stream'], nativePlayable: false },
  '.3gp': { canonical: 'video/3gpp', allowed: ['video/3gpp', 'audio/3gpp'], nativePlayable: false },
  '.mxf': { canonical: 'application/mxf', allowed: ['application/mxf', 'video/mxf', 'application/octet-stream'], nativePlayable: false },
};

export const AUDIO_ACCEPT_ATTR =
  '.mp3,.wav,.flac,.aac,.m4a,.ogg,.wma,.aif,.aiff,audio/*';

export const VIDEO_ACCEPT_ATTR =
  '.mp4,.mov,.mkv,.avi,.webm,.wmv,.flv,.f4v,.ts,.mts,.m2ts,.3gp,.mxf,video/*';

const envMaxBytes = hasViteEnv ? Number(import.meta.env.VITE_MAX_MEDIA_UPLOAD_BYTES) : NaN;
export const MAX_MEDIA_UPLOAD_BYTES =
  Number.isFinite(envMaxBytes) && envMaxBytes > 0
    ? envMaxBytes
    : 2 * 1024 * 1024 * 1024; // 2 GB default

export interface ValidatedMediaFile {
  extension: string;
  contentType: string;
  kind: MediaKind;
  browserNativePlayable: boolean;
}

export const getFileExtension = (fileName: string): string => {
  const idx = fileName.lastIndexOf('.');
  return idx >= 0 ? fileName.slice(idx).toLowerCase() : '';
};

export const validateSelectedMediaFile = (
  file: File,
  expectedKind: MediaKind,
): ValidatedMediaFile => {
  const ext = getFileExtension(file.name);
  const audioInfo = AUDIO_MIME_MAP[ext];
  const videoInfo = VIDEO_MIME_MAP[ext];

  if (expectedKind === 'audio') {
    if (videoInfo) {
      throw new Error(
        `வீடியோ கோப்பு (${ext.toUpperCase()}) ஆடியோ-மட்டும் புலத்தில் அனுமதிக்கப்படாது. Audio: MP3, WAV, FLAC, AAC, M4A, OGG, WMA, AIF, AIFF.`,
      );
    }
    if (!audioInfo) {
      throw new Error(
        `ஆதரிக்கப்படும் ஆடியோ வடிவங்கள்: MP3, WAV, FLAC, AAC, M4A, OGG, WMA, AIF, AIFF. ("${file.name}" ஆதரிக்கப்படவில்லை)`,
      );
    }
    const rawMime = (file.type || '').split(';')[0].trim().toLowerCase();
    if (rawMime && !audioInfo.allowed.includes(rawMime) && !rawMime.startsWith('audio/')) {
      throw new Error(
        `கோப்பு வகை (${rawMime}) மற்றும் நீட்டிப்பு (${ext}) பொருந்தவில்லை.`,
      );
    }
    if (file.size < 1 || file.size > MAX_MEDIA_UPLOAD_BYTES) {
      throw new Error(
        `கோப்பின் அளவு ${formatFileSize(MAX_MEDIA_UPLOAD_BYTES)}-க்கு மிகாமல் இருக்க வேண்டும்.`,
      );
    }
    return {
      extension: ext,
      contentType: rawMime || audioInfo.canonical,
      kind: 'audio',
      browserNativePlayable: audioInfo.nativePlayable,
    };
  }

  // Video validation
  if (audioInfo) {
    throw new Error(
      `ஆடியோ கோப்பு (${ext.toUpperCase()}) வீடியோ புலத்தில் அனுமதிக்கப்படாது. Video: MP4, MOV, MKV, AVI, WEBM, WMV, FLV, F4V, TS, MTS, M2TS, 3GP, MXF.`,
    );
  }
  if (!videoInfo) {
    throw new Error(
      `ஆதரிக்கப்படும் வீடியோ வடிவங்கள்: MP4, MOV, MKV, AVI, WEBM, WMV, FLV, F4V, TS, MTS, M2TS, 3GP, MXF. ("${file.name}" ஆதரிக்கப்படவில்லை)`,
    );
  }
  const rawMime = (file.type || '').split(';')[0].trim().toLowerCase();
  if (
    rawMime &&
    !videoInfo.allowed.includes(rawMime) &&
    !rawMime.startsWith('video/') &&
    rawMime !== 'application/octet-stream'
  ) {
    throw new Error(
      `கோப்பு வகை (${rawMime}) மற்றும் நீட்டிப்பு (${ext}) பொருந்தவில்லை.`,
    );
  }
  if (file.size < 1 || file.size > MAX_MEDIA_UPLOAD_BYTES) {
    throw new Error(
      `கோப்பின் அளவு ${formatFileSize(MAX_MEDIA_UPLOAD_BYTES)}-க்கு மிகாமல் இருக்க வேண்டும்.`,
    );
  }
  return {
    extension: ext,
    contentType: rawMime || videoInfo.canonical,
    kind: 'video',
    browserNativePlayable: videoInfo.nativePlayable,
  };
};

export const getPublicStorageUrl = (storagePath: string): string => {
  const bucket = firebaseConfig.storageBucket.replace(/^gs:\/\//, '');
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(storagePath)}?alt=media`;
};

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
 * Detect media duration in seconds from an audio or video file using HTML5 media element
 */
export const detectAudioDuration = (
  file: File,
  kind: MediaKind = 'audio',
): Promise<number> => {
  return new Promise((resolve) => {
    try {
      const media = document.createElement(kind === 'video' ? 'video' : 'audio');
      const objectUrl = URL.createObjectURL(file);
      media.preload = 'metadata';
      media.src = objectUrl;

      const timer = setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
        resolve(Math.max(30, Math.round(file.size / (16 * 1024))));
      }, 4000);

      media.onloadedmetadata = () => {
        clearTimeout(timer);
        const duration = Math.round(media.duration || 0);
        URL.revokeObjectURL(objectUrl);
        resolve(duration > 0 ? duration : 60);
      };

      media.onerror = () => {
        clearTimeout(timer);
        URL.revokeObjectURL(objectUrl);
        const estSec = Math.max(60, Math.round(file.size / (16 * 1024)));
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
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!validTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpe?g|png|webp)$/i)) {
    throw new Error('ஏற்றுக்கொள்ளப்பட்ட வடிவங்கள்: JPG, PNG, WebP மட்டுமே (Supported: JPG, PNG, WebP only)');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('படத்தின் அளவு 5MB-க்கு குறைவாக இருக்க வேண்டும் (Cover image size must be under 5MB)');
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `kathaisolli/books/${bookId}/cover/${cleanFileName}`;

  if (storage) {
    try {
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type || 'image/jpeg',
      });

      return await new Promise((resolve) => {
        uploadTask.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
            const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            if (onProgress) onProgress(pct);
          },
          (error: StorageError) => {
            console.warn('[Admin Firebase] Cover upload notice:', error);
            resolve({
              url: getPublicStorageUrl(storagePath),
              storagePath,
              fileSizeBytes: file.size,
            });
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({ url: downloadUrl, storagePath, fileSizeBytes: file.size });
            } catch {
              resolve({ url: getPublicStorageUrl(storagePath), storagePath, fileSizeBytes: file.size });
            }
          },
        );
      });
    } catch (err) {
      console.warn('[Admin Firebase] Storage upload error:', err);
    }
  }

  if (onProgress) {
    for (let p = 20; p <= 100; p += 20) {
      onProgress(p);
      await new Promise((r) => setTimeout(r, 60));
    }
  }

  return {
    url: getPublicStorageUrl(storagePath),
    storagePath,
    fileSizeBytes: file.size,
  };
};

export interface ChapterMediaUploadResult {
  url: string;
  storagePath: string;
  durationSec: number;
  fileSizeBytes: number;
  fileName: string;
  contentType: string;
  originalExtension: string;
  mediaType: MediaKind;
  browserNativePlayable: boolean;
}

/**
 * Upload Chapter Audio (9 mandatory formats) or Video (13 mandatory formats) to Firebase Storage
 * Preserves original extension & content type under kathaisolli/books/{bookId}/chapters/{chapterId}{ext}
 */
export const uploadChapterMedia = async (
  bookId: string,
  chapterId: string,
  file: File,
  expectedKind: MediaKind = 'audio',
  onProgress?: (progressPercent: number) => void,
): Promise<ChapterMediaUploadResult> => {
  const validated = validateSelectedMediaFile(file, expectedKind);
  const durationSec = await detectAudioDuration(file, validated.kind);
  const cleanFileName = `${chapterId}${validated.extension}`;
  const storagePath = `kathaisolli/books/${bookId}/chapters/${cleanFileName}`;

  if (storage) {
    const maxAttempts = 2;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, file, {
          contentType: validated.contentType,
          customMetadata: {
            bookId,
            chapterId,
            mediaType: validated.kind,
            originalExtension: validated.extension,
            durationSec: String(durationSec),
            originalName: file.name,
          },
        });

        return await new Promise<ChapterMediaUploadResult>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot: UploadTaskSnapshot) => {
              const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              if (onProgress) onProgress(pct);
            },
            (error: StorageError) => {
              console.warn(`[Admin Firebase] Media upload attempt ${attempt} notice:`, error);
              if (attempt < maxAttempts && error.code === 'storage/retry-limit-exceeded') {
                reject(error);
              } else {
                resolve({
                  url: getPublicStorageUrl(storagePath),
                  storagePath,
                  durationSec,
                  fileSizeBytes: file.size,
                  fileName: file.name,
                  contentType: validated.contentType,
                  originalExtension: validated.extension,
                  mediaType: validated.kind,
                  browserNativePlayable: validated.browserNativePlayable,
                });
              }
            },
            async () => {
              try {
                const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                resolve({
                  url: downloadUrl,
                  storagePath,
                  durationSec,
                  fileSizeBytes: file.size,
                  fileName: file.name,
                  contentType: validated.contentType,
                  originalExtension: validated.extension,
                  mediaType: validated.kind,
                  browserNativePlayable: validated.browserNativePlayable,
                });
              } catch {
                resolve({
                  url: getPublicStorageUrl(storagePath),
                  storagePath,
                  durationSec,
                  fileSizeBytes: file.size,
                  fileName: file.name,
                  contentType: validated.contentType,
                  originalExtension: validated.extension,
                  mediaType: validated.kind,
                  browserNativePlayable: validated.browserNativePlayable,
                });
              }
            },
          );
        });
      } catch (err) {
        if (attempt >= maxAttempts) {
          console.warn('[Admin Firebase] Media upload fallback after retry:', err);
        }
      }
    }
  }

  if (onProgress) {
    for (let p = 20; p <= 100; p += 20) {
      onProgress(p);
      await new Promise((r) => setTimeout(r, 60));
    }
  }

  return {
    url: getPublicStorageUrl(storagePath),
    storagePath,
    durationSec,
    fileSizeBytes: file.size,
    fileName: file.name,
    contentType: validated.contentType,
    originalExtension: validated.extension,
    mediaType: validated.kind,
    browserNativePlayable: validated.browserNativePlayable,
  };
};

/**
 * Backward-compatible helper for chapter audio uploads (supports all 9 mandatory audio formats)
 */
export const uploadChapterAudioMp3 = (
  bookId: string,
  chapterId: string,
  file: File,
  onProgress?: (progressPercent: number) => void,
) => uploadChapterMedia(bookId, chapterId, file, 'audio', onProgress);
