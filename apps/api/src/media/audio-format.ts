import { BadRequestException } from '@nestjs/common';
import { extname } from 'node:path';

export type MediaKind = 'audio' | 'video';

export interface MediaFormatDescriptor {
  kind: MediaKind;
  extension: string;
  canonicalMime: string;
  allowedMimes: readonly string[];
  browserNativePlayable: boolean;
}

export const MANDATORY_AUDIO_FORMATS: Record<string, MediaFormatDescriptor> = {
  '.mp3': {
    kind: 'audio',
    extension: '.mp3',
    canonicalMime: 'audio/mpeg',
    allowedMimes: ['audio/mpeg', 'audio/mp3', 'audio/x-mpeg'],
    browserNativePlayable: true,
  },
  '.wav': {
    kind: 'audio',
    extension: '.wav',
    canonicalMime: 'audio/wav',
    allowedMimes: ['audio/wav', 'audio/x-wav', 'audio/wave', 'audio/vnd.wave'],
    browserNativePlayable: true,
  },
  '.flac': {
    kind: 'audio',
    extension: '.flac',
    canonicalMime: 'audio/flac',
    allowedMimes: ['audio/flac', 'audio/x-flac'],
    browserNativePlayable: true,
  },
  '.aac': {
    kind: 'audio',
    extension: '.aac',
    canonicalMime: 'audio/aac',
    allowedMimes: ['audio/aac', 'audio/x-aac', 'audio/aacp', 'audio/vnd.dlna.adts'],
    browserNativePlayable: true,
  },
  '.m4a': {
    kind: 'audio',
    extension: '.m4a',
    canonicalMime: 'audio/mp4',
    allowedMimes: ['audio/mp4', 'audio/x-m4a', 'audio/m4a'],
    browserNativePlayable: true,
  },
  '.ogg': {
    kind: 'audio',
    extension: '.ogg',
    canonicalMime: 'audio/ogg',
    allowedMimes: ['audio/ogg', 'application/ogg', 'audio/vorbis', 'audio/opus'],
    browserNativePlayable: true,
  },
  '.wma': {
    kind: 'audio',
    extension: '.wma',
    canonicalMime: 'audio/x-ms-wma',
    allowedMimes: ['audio/x-ms-wma', 'audio/wma', 'video/x-ms-asf'],
    browserNativePlayable: false,
  },
  '.aif': {
    kind: 'audio',
    extension: '.aif',
    canonicalMime: 'audio/aiff',
    allowedMimes: ['audio/aiff', 'audio/x-aiff', 'sound/aiff'],
    browserNativePlayable: false,
  },
  '.aiff': {
    kind: 'audio',
    extension: '.aiff',
    canonicalMime: 'audio/aiff',
    allowedMimes: ['audio/aiff', 'audio/x-aiff', 'sound/aiff'],
    browserNativePlayable: false,
  },
};

export const MANDATORY_VIDEO_FORMATS: Record<string, MediaFormatDescriptor> = {
  '.mp4': {
    kind: 'video',
    extension: '.mp4',
    canonicalMime: 'video/mp4',
    allowedMimes: ['video/mp4', 'application/mp4'],
    browserNativePlayable: true,
  },
  '.mov': {
    kind: 'video',
    extension: '.mov',
    canonicalMime: 'video/quicktime',
    allowedMimes: ['video/quicktime', 'video/x-quicktime'],
    browserNativePlayable: true,
  },
  '.mkv': {
    kind: 'video',
    extension: '.mkv',
    canonicalMime: 'video/x-matroska',
    allowedMimes: ['video/x-matroska', 'video/matroska', 'application/octet-stream'],
    browserNativePlayable: false,
  },
  '.avi': {
    kind: 'video',
    extension: '.avi',
    canonicalMime: 'video/x-msvideo',
    allowedMimes: ['video/x-msvideo', 'video/avi', 'video/msvideo'],
    browserNativePlayable: false,
  },
  '.webm': {
    kind: 'video',
    extension: '.webm',
    canonicalMime: 'video/webm',
    allowedMimes: ['video/webm'],
    browserNativePlayable: true,
  },
  '.wmv': {
    kind: 'video',
    extension: '.wmv',
    canonicalMime: 'video/x-ms-wmv',
    allowedMimes: ['video/x-ms-wmv', 'video/wmv', 'video/x-ms-asf'],
    browserNativePlayable: false,
  },
  '.flv': {
    kind: 'video',
    extension: '.flv',
    canonicalMime: 'video/x-flv',
    allowedMimes: ['video/x-flv', 'video/flv'],
    browserNativePlayable: false,
  },
  '.f4v': {
    kind: 'video',
    extension: '.f4v',
    canonicalMime: 'video/x-f4v',
    allowedMimes: ['video/x-f4v', 'video/mp4', 'video/f4v'],
    browserNativePlayable: false,
  },
  '.ts': {
    kind: 'video',
    extension: '.ts',
    canonicalMime: 'video/mp2t',
    allowedMimes: ['video/mp2t', 'video/vnd.dlna.mpeg-tts', 'application/octet-stream'],
    browserNativePlayable: false,
  },
  '.mts': {
    kind: 'video',
    extension: '.mts',
    canonicalMime: 'video/mp2t',
    allowedMimes: ['video/mp2t', 'model/vnd.mts', 'application/octet-stream'],
    browserNativePlayable: false,
  },
  '.m2ts': {
    kind: 'video',
    extension: '.m2ts',
    canonicalMime: 'video/mp2t',
    allowedMimes: ['video/mp2t', 'video/m2ts', 'application/octet-stream'],
    browserNativePlayable: false,
  },
  '.3gp': {
    kind: 'video',
    extension: '.3gp',
    canonicalMime: 'video/3gpp',
    allowedMimes: ['video/3gpp', 'audio/3gpp'],
    browserNativePlayable: false,
  },
  '.mxf': {
    kind: 'video',
    extension: '.mxf',
    canonicalMime: 'application/mxf',
    allowedMimes: ['application/mxf', 'video/mxf', 'application/octet-stream'],
    browserNativePlayable: false,
  },
};

export const ALL_MEDIA_FORMATS: Record<string, MediaFormatDescriptor> = {
  ...MANDATORY_AUDIO_FORMATS,
  ...MANDATORY_VIDEO_FORMATS,
};

export const AUDIO_EXTENSION_LIST = Object.keys(MANDATORY_AUDIO_FORMATS);
export const VIDEO_EXTENSION_LIST = Object.keys(MANDATORY_VIDEO_FORMATS);

export function validateAudioUpload(
  originalName: string,
  contentType: string,
  sizeBytes: number,
  maxBytes: number,
): { extension: string; contentType: string; kind: MediaKind; browserNativePlayable: boolean } {
  return validateMediaUpload(originalName, contentType, sizeBytes, maxBytes, 'audio');
}

export function validateMediaUpload(
  originalName: string,
  contentType: string,
  sizeBytes: number,
  maxBytes: number,
  expectedKind: MediaKind | 'any' = 'any',
): { extension: string; contentType: string; kind: MediaKind; browserNativePlayable: boolean } {
  if (
    !originalName ||
    originalName.includes('/') ||
    originalName.includes('\\') ||
    /[\u0000-\u001f]/u.test(originalName)
  ) {
    throw new BadRequestException('The media filename is invalid.');
  }

  const extension = extname(originalName).toLowerCase();
  const descriptor = ALL_MEDIA_FORMATS[extension];
  if (!descriptor) {
    throw new BadRequestException(
      'Supported audio: MP3, WAV, FLAC, AAC, M4A, OGG, WMA, AIF, AIFF. Supported video: MP4, MOV, MKV, AVI, WEBM, WMV, FLV, F4V, TS, MTS, M2TS, 3GP, MXF.',
    );
  }

  if (expectedKind !== 'any' && descriptor.kind !== expectedKind) {
    throw new BadRequestException(
      expectedKind === 'audio'
        ? `Video or non-audio file "${originalName}" cannot be uploaded to an audio-only field. Supported audio: MP3, WAV, FLAC, AAC, M4A, OGG, WMA, AIF, AIFF.`
        : `Audio or non-video file "${originalName}" cannot be uploaded to a video field. Supported video: MP4, MOV, MKV, AVI, WEBM, WMV, FLV, F4V, TS, MTS, M2TS, 3GP, MXF.`,
    );
  }

  const normalizedType = (contentType || '').split(';')[0].trim().toLowerCase();
  if (!normalizedType || !descriptor.allowedMimes.includes(normalizedType)) {
    throw new BadRequestException(
      `Unsupported or mismatched MIME type "${contentType}" for extension ${extension}.`,
    );
  }

  if (!Number.isSafeInteger(sizeBytes) || sizeBytes < 1 || sizeBytes > maxBytes) {
    throw new BadRequestException(
      `Media file size must be between 1 byte and ${maxBytes} bytes.`,
    );
  }

  return {
    extension: descriptor.extension,
    contentType: normalizedType,
    kind: descriptor.kind,
    browserNativePlayable: descriptor.browserNativePlayable,
  };
}

/**
 * Validates actual binary magic bytes of a file header against the claimed media extension.
 * Prevents extension/MIME spoofing (e.g. a renamed text/HTML/executable file).
 */
export function validateMediaMagicBytes(header: Buffer, extension: string): boolean {
  const ext = extension.toLowerCase();
  if (!header || header.length < 4) return false;

  const ascii = (start: number, len: number) =>
    header.subarray(start, start + len).toString('ascii');

  switch (ext) {
    case '.mp3':
      return (
        ascii(0, 3) === 'ID3' ||
        (header[0] === 0xff && (header[1] & 0xe0) === 0xe0)
      );
    case '.wav':
      return header.length >= 12 && ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WAVE';
    case '.flac':
      return ascii(0, 4) === 'fLaC';
    case '.aac':
      return (
        ascii(0, 4) === 'ADIF' ||
        (header[0] === 0xff && (header[1] & 0xf0) === 0xf0)
      );
    case '.m4a':
    case '.mp4':
    case '.mov':
    case '.f4v':
    case '.3gp':
      return (
        header.length >= 8 &&
        (ascii(4, 4) === 'ftyp' ||
          ascii(4, 4) === 'moov' ||
          ascii(4, 4) === 'mdat' ||
          ascii(4, 4) === 'wide' ||
          ascii(4, 4) === 'free')
      );
    case '.ogg':
      return ascii(0, 4) === 'OggS';
    case '.wma':
    case '.wmv':
      // ASF Header Object GUID: 30 26 B2 75 8E 66 CF 11 A6 D9 00 AA 00 62 CE 6C
      return (
        header.length >= 16 &&
        header[0] === 0x30 &&
        header[1] === 0x26 &&
        header[2] === 0xb2 &&
        header[3] === 0x75
      );
    case '.aif':
    case '.aiff':
      return (
        header.length >= 12 &&
        ascii(0, 4) === 'FORM' &&
        (ascii(8, 4) === 'AIFF' || ascii(8, 4) === 'AIFC')
      );
    case '.mkv':
    case '.webm':
      // EBML magic bytes: 1A 45 DF A3
      return (
        header[0] === 0x1a &&
        header[1] === 0x45 &&
        header[2] === 0xdf &&
        header[3] === 0xa3
      );
    case '.avi':
      return header.length >= 12 && ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'AVI ';
    case '.flv':
      return ascii(0, 3) === 'FLV';
    case '.ts':
    case '.mts':
    case '.m2ts':
      // Standard MPEG-TS packet sync byte 0x47 at offset 0 (188-byte) or offset 4 (192-byte M2TS/BDAV)
      return (
        header[0] === 0x47 ||
        (header.length >= 5 && header[4] === 0x47)
      );
    case '.mxf':
      // SMPTE KLV Partition Pack key starts with 06 0E 2B 34
      return (
        header[0] === 0x06 &&
        header[1] === 0x0e &&
        header[2] === 0x2b &&
        header[3] === 0x34
      );
    default:
      return false;
  }
}
