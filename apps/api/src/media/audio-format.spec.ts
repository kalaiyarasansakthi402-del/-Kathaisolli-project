import { BadRequestException } from '@nestjs/common';
import {
  AUDIO_EXTENSION_LIST,
  VIDEO_EXTENSION_LIST,
  validateAudioUpload,
  validateMediaMagicBytes,
  validateMediaUpload,
} from './audio-format';

describe('validateAudioUpload & validateMediaUpload (22 mandatory formats)', () => {
  it('defines exactly 9 mandatory audio extensions and 13 mandatory video extensions', () => {
    expect(AUDIO_EXTENSION_LIST).toEqual([
      '.mp3',
      '.wav',
      '.flac',
      '.aac',
      '.m4a',
      '.ogg',
      '.wma',
      '.aif',
      '.aiff',
    ]);
    expect(VIDEO_EXTENSION_LIST).toEqual([
      '.mp4',
      '.mov',
      '.mkv',
      '.avi',
      '.webm',
      '.wmv',
      '.flv',
      '.f4v',
      '.ts',
      '.mts',
      '.m2ts',
      '.3gp',
      '.mxf',
    ]);
  });

  it.each([
    ['episode.mp3', 'audio/mpeg'],
    ['episode.wav', 'audio/wav'],
    ['episode.flac', 'audio/flac'],
    ['episode.aac', 'audio/aac'],
    ['episode.m4a', 'audio/mp4'],
    ['episode.ogg', 'audio/ogg'],
    ['episode.wma', 'audio/x-ms-wma'],
    ['episode.aif', 'audio/aiff'],
    ['episode.aiff', 'audio/x-aiff'],
  ])('accepts mandatory audio format %s (%s)', (fileName, contentType) => {
    expect(
      validateAudioUpload(fileName, contentType, 1000, 2 * 1024 * 1024 * 1024),
    ).toMatchObject({ contentType, kind: 'audio' });
  });

  it.each([
    ['clip.mp4', 'video/mp4'],
    ['clip.mov', 'video/quicktime'],
    ['clip.mkv', 'video/x-matroska'],
    ['clip.avi', 'video/x-msvideo'],
    ['clip.webm', 'video/webm'],
    ['clip.wmv', 'video/x-ms-wmv'],
    ['clip.flv', 'video/x-flv'],
    ['clip.f4v', 'video/x-f4v'],
    ['clip.ts', 'video/mp2t'],
    ['clip.mts', 'video/mp2t'],
    ['clip.m2ts', 'video/mp2t'],
    ['clip.3gp', 'video/3gpp'],
    ['clip.mxf', 'application/mxf'],
  ])('accepts mandatory video format %s (%s)', (fileName, contentType) => {
    expect(
      validateMediaUpload(fileName, contentType, 1000, 2 * 1024 * 1024 * 1024, 'video'),
    ).toMatchObject({ contentType, kind: 'video' });
  });

  it('rejects video files in audio-only fields and audio files in video-only fields', () => {
    expect(() =>
      validateMediaUpload('video.mp4', 'video/mp4', 1000, 10_000, 'audio'),
    ).toThrow(BadRequestException);
    expect(() =>
      validateMediaUpload('audio.mp3', 'audio/mpeg', 1000, 10_000, 'video'),
    ).toThrow(BadRequestException);
  });

  it('rejects extension and MIME mismatches', () => {
    expect(() =>
      validateAudioUpload('episode.mp3', 'application/octet-stream', 1000, 10_000),
    ).toThrow(BadRequestException);
  });

  it('rejects traversal filenames and files outside the configured size range', () => {
    expect(() =>
      validateAudioUpload('../episode.mp3', 'audio/mpeg', 1000, 10_000),
    ).toThrow(BadRequestException);
    expect(() =>
      validateAudioUpload('episode.mp3', 'audio/mpeg', 10_001, 10_000),
    ).toThrow(BadRequestException);
  });

  it('rejects spoofed binary headers in validateMediaMagicBytes', () => {
    const fakeText = Buffer.from('<html>not audio</html>', 'utf8');
    expect(validateMediaMagicBytes(fakeText, '.mp3')).toBe(false);
    expect(validateMediaMagicBytes(fakeText, '.mp4')).toBe(false);
    expect(validateMediaMagicBytes(fakeText, '.mxf')).toBe(false);
    expect(validateMediaMagicBytes(Buffer.from('ID3\x03\x00\x00\x00'), '.mp3')).toBe(true);
    expect(validateMediaMagicBytes(Buffer.from('fLaC\x00\x00\x00'), '.flac')).toBe(true);
    expect(validateMediaMagicBytes(Buffer.from('OggS\x00\x02'), '.ogg')).toBe(true);
  });
});
