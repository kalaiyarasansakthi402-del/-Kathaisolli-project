import { BadRequestException } from '@nestjs/common';
import { validateAudioUpload } from './audio-format';

describe('validateAudioUpload', () => {
  it.each([
    ['episode.mp3', 'audio/mpeg'],
    ['episode.wav', 'audio/wav'],
    ['episode.m4a', 'audio/mp4'],
    ['episode.aac', 'audio/aac'],
    ['episode.flac', 'audio/flac'],
  ])('accepts supported format %s', (fileName, contentType) => {
    expect(
      validateAudioUpload(fileName, contentType, 1000, 10_000),
    ).toMatchObject({ contentType });
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
});
