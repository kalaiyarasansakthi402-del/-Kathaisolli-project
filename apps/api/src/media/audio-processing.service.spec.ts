import { Test } from '@nestjs/testing';
import { UploadStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AudioProcessingService } from './audio-processing.service';
import { FfmpegService } from './ffmpeg.service';
import { OBJECT_STORAGE } from './media.constants';

describe('AudioProcessingService', () => {
  const prisma = {
    uploadJob: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };
  const ffmpeg = { inspect: jest.fn(), createHls: jest.fn() };
  const storage = { downloadToFile: jest.fn() };
  let processing: AudioProcessingService;

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.uploadJob.findUnique.mockResolvedValue({
      id: 'upload-id',
      objectKey: 'private/original.mp3',
      contentType: 'audio/mpeg',
      sizeBytes: BigInt(1000),
      episodeId: 'episode-id',
      status: UploadStatus.QUEUED,
    });
    prisma.uploadJob.update.mockResolvedValue({});
    prisma.uploadJob.updateMany.mockResolvedValue({ count: 1 });
    storage.downloadToFile.mockRejectedValue(
      new Error('test object storage outage'),
    );
    const module = await Test.createTestingModule({
      providers: [
        AudioProcessingService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: {} },
        { provide: FfmpegService, useValue: ffmpeg },
        { provide: OBJECT_STORAGE, useValue: storage },
      ],
    }).compile();
    processing = module.get(AudioProcessingService);
  });

  it('records a failed processing state and rethrows the storage/processor error', async () => {
    await expect(processing.process('upload-id')).rejects.toThrow(
      'test object storage outage',
    );
    expect(prisma.uploadJob.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'upload-id' }),
        data: expect.objectContaining({
          status: UploadStatus.FAILED,
        }),
      }),
    );
    expect(ffmpeg.inspect).not.toHaveBeenCalled();
  });
});
