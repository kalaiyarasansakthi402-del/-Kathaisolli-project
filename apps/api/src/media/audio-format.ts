import { BadRequestException } from '@nestjs/common';
import { extname } from 'node:path';

const supportedAudioFormats: Record<string, readonly string[]> = {
  '.mp3': ['audio/mpeg'],
  '.wav': ['audio/wav', 'audio/x-wav'],
  '.m4a': ['audio/mp4'],
  '.aac': ['audio/aac'],
  '.flac': ['audio/flac', 'audio/x-flac'],
};

export function validateAudioUpload(
  originalName: string,
  contentType: string,
  sizeBytes: number,
  maxBytes: number,
): { extension: string; contentType: string } {
  if (
    originalName.includes('/') ||
    originalName.includes('\\') ||
    /[\u0000-\u001f]/u.test(originalName)
  ) {
    throw new BadRequestException('The audio filename is invalid.');
  }

  const extension = extname(originalName).toLowerCase();
  const allowedTypes = supportedAudioFormats[extension];
  const normalizedType = contentType.toLowerCase();
  if (!allowedTypes || !allowedTypes.includes(normalizedType)) {
    throw new BadRequestException(
      'Supported audio files are MP3, WAV, M4A, AAC, and FLAC with a matching MIME type.',
    );
  }
  if (!Number.isSafeInteger(sizeBytes) || sizeBytes < 1 || sizeBytes > maxBytes) {
    throw new BadRequestException(
      `Audio file size must be between 1 byte and ${maxBytes} bytes.`,
    );
  }
  return { extension, contentType: normalizedType };
}
