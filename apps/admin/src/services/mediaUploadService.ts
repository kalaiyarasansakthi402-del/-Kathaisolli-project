import type { KathaisolliApiClient } from '@kathaisolli/api-client';

/**
 * Format bytes to human readable string (B, KB, MB, GB)
 */
export const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes <= 0) return '0 B';
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
        const estSec = Math.max(60, Math.round(file.size / (16 * 1024)));
        resolve(estSec);
      };
    } catch {
      resolve(180);
    }
  });
};

/**
 * Upload Book Cover Image to Backend Persistent Storage
 */
export const uploadBookCoverImage = async (
  api: KathaisolliApiClient,
  bookId: string | undefined,
  file: File,
  onProgress?: (progressPercent: number) => void,
): Promise<{ url: string; storagePath: string; fileSizeBytes: number }> => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (
    !validTypes.includes(file.type.toLowerCase()) &&
    !file.name.match(/\.(jpe?g|png|webp)$/i)
  ) {
    throw new Error(
      'ஏற்றுக்கொள்ளப்பட்ட வடிவங்கள்: JPG, PNG, WebP மட்டுமே (Supported: JPG, PNG, WebP only)',
    );
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error(
      'படத்தின் அளவு 10MB-க்கு குறைவாக இருக்க வேண்டும் (Cover image size must be under 10MB)',
    );
  }

  const res = await api.admin.uploadCover(file, bookId, onProgress);
  return {
    url: res.url,
    storagePath: res.objectKey,
    fileSizeBytes: res.sizeBytes,
  };
};

/**
 * Upload Chapter Audio to Backend Persistent Storage
 */
export const uploadChapterAudio = async (
  api: KathaisolliApiClient,
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
  contentType: string;
}> => {
  const validExtensions = /\.(mp3|wav|m4a|aac|ogg|flac)$/i;
  if (!file.type.startsWith('audio/') && !validExtensions.test(file.name)) {
    throw new Error(
      'ஆடியோ கோப்புகள் மட்டுமே அனுமதிக்கப்படும் (MP3, WAV, M4A, AAC, OGG, FLAC).',
    );
  }

  if (file.size > 200 * 1024 * 1024) {
    throw new Error(
      'ஆடியோ கோப்பின் அளவு 200MB-க்கு குறைவாக இருக்க வேண்டும் (Max 200MB).',
    );
  }

  const [durationSec, uploadRes] = await Promise.all([
    detectAudioDuration(file),
    api.admin.uploadAudio(file, { storyId: bookId, chapterId, onProgress }),
  ]);

  return {
    url: uploadRes.url,
    storagePath: uploadRes.objectKey,
    durationSec,
    fileSizeBytes: uploadRes.sizeBytes,
    fileName: uploadRes.fileName,
    contentType: uploadRes.contentType,
  };
};
