/**
 * Formats a stored media objectKey or URL into a valid public/API media URL.
 * Never returns Firebase Storage URLs.
 */
export function formatPublicMediaUrl(objectKey?: string | null): string {
  if (!objectKey) return '';
  const trimmed = objectKey.trim();
  if (!trimmed) return '';

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/api/') ||
    trimmed.startsWith('/images/') ||
    trimmed.startsWith('/audio/')
  ) {
    return trimmed;
  }

  return `/api/v1/media/file?key=${encodeURIComponent(trimmed)}`;
}

/**
 * Extracts the internal storage objectKey from a `/api/v1/media/file?key=...` URL,
 * or returns null if the URL is external/static.
 */
export function extractManagedObjectKey(urlOrKey?: string | null): string | null {
  if (!urlOrKey) return null;
  const trimmed = urlOrKey.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('/api/v1/media/file?')) {
    try {
      const parsed = new URL(trimmed, 'http://localhost');
      return parsed.searchParams.get('key');
    } catch {
      return null;
    }
  }

  if (
    !trimmed.startsWith('http://') &&
    !trimmed.startsWith('https://') &&
    !trimmed.startsWith('/')
  ) {
    return trimmed;
  }

  return null;
}

export function inferAudioContentType(fileNameOrKey: string, fallback = 'audio/mpeg'): string {
  const lower = fileNameOrKey.toLowerCase().split('?')[0];
  if (lower.endsWith('.mp3')) return 'audio/mpeg';
  if (lower.endsWith('.wav')) return 'audio/wav';
  if (lower.endsWith('.m4a')) return 'audio/mp4';
  if (lower.endsWith('.aac')) return 'audio/aac';
  if (lower.endsWith('.ogg')) return 'audio/ogg';
  if (lower.endsWith('.flac')) return 'audio/flac';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  return fallback;
}
