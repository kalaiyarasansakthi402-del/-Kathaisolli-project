import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export interface AudioMetadata {
  durationSeconds: number;
  codec: string;
  sampleRate: number | null;
  channels: number | null;
}

interface ProbeOutput {
  format?: { duration?: string };
  streams?: Array<{
    codec_type?: string;
    codec_name?: string;
    sample_rate?: string;
    channels?: number;
  }>;
}

@Injectable()
export class FfmpegService {
  private readonly ffprobePath: string;
  private readonly ffmpegPath: string;

  constructor(config: ConfigService) {
    this.ffprobePath = config.get<string>('FFPROBE_PATH', 'ffprobe');
    this.ffmpegPath = config.get<string>('FFMPEG_PATH', 'ffmpeg');
  }

  async inspect(inputPath: string): Promise<AudioMetadata> {
    const output = await this.run(this.ffprobePath, [
      '-v',
      'error',
      '-show_entries',
      'format=duration:stream=codec_type,codec_name,sample_rate,channels',
      '-of',
      'json',
      inputPath,
    ]);

    let probe: ProbeOutput;
    try {
      probe = JSON.parse(output.stdout) as ProbeOutput;
    } catch (error) {
      throw new Error('FFprobe returned invalid metadata JSON.', { cause: error });
    }

    const audioStream = probe.streams?.find(
      (stream) => stream.codec_type === 'audio',
    );
    const durationSeconds = Number(probe.format?.duration);
    if (
      !audioStream?.codec_name ||
      !Number.isFinite(durationSeconds) ||
      durationSeconds <= 0
    ) {
      throw new Error('The uploaded file does not contain a valid audio stream.');
    }

    return {
      durationSeconds,
      codec: audioStream.codec_name,
      sampleRate: audioStream.sample_rate
        ? Number(audioStream.sample_rate)
        : null,
      channels: audioStream.channels ?? null,
    };
  }

  async createHls(inputPath: string, outputDirectory: string): Promise<void> {
    await mkdir(outputDirectory, { recursive: true });
    const playlistPath = join(outputDirectory, 'playlist.m3u8');
    const segmentPattern = join(outputDirectory, 'segment_%05d.ts');
    await this.run(
      this.ffmpegPath,
      [
        '-hide_banner',
        '-nostdin',
        '-y',
        '-i',
        inputPath,
        '-map',
        '0:a:0',
        '-vn',
        '-ac',
        '2',
        '-ar',
        '48000',
        '-c:a',
        'aac',
        '-b:a',
        '128k',
        '-f',
        'hls',
        '-hls_time',
        '6',
        '-hls_playlist_type',
        'vod',
        '-hls_segment_filename',
        segmentPattern,
        playlistPath,
      ],
      60 * 60 * 1000,
    );
  }

  private run(
    executable: string,
    args: string[],
    timeoutMs = 120_000,
  ): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const child = spawn(executable, args, {
        shell: false,
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      const stdout: Buffer[] = [];
      const stderr: Buffer[] = [];
      let outputBytes = 0;
      const maxOutputBytes = 2 * 1024 * 1024;
      let settled = false;
      const timeout = setTimeout(() => {
        child.kill();
        finish(new Error(`${executable} exceeded its processing timeout.`));
      }, timeoutMs);

      const collect = (target: Buffer[], chunk: Buffer) => {
        outputBytes += chunk.length;
        if (outputBytes > maxOutputBytes) {
          child.kill();
          finish(new Error(`${executable} produced excessive diagnostic output.`));
          return;
        }
        target.push(chunk);
      };

      child.stdout.on('data', (chunk: Buffer) => collect(stdout, chunk));
      child.stderr.on('data', (chunk: Buffer) => collect(stderr, chunk));
      child.once('error', (error) => finish(error));
      child.once('close', (code, signal) => {
        if (code === 0) {
          finish(undefined, {
            stdout: Buffer.concat(stdout).toString('utf8'),
            stderr: Buffer.concat(stderr).toString('utf8'),
          });
          return;
        }
        finish(
          new Error(
            `${executable} failed (${signal ?? `exit ${code}`}): ${Buffer.concat(stderr).toString('utf8').slice(-4000)}`,
          ),
        );
      });

      function finish(
        error?: Error,
        result?: { stdout: string; stderr: string },
      ) {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        if (error) reject(error);
        else if (result) resolve(result);
        else reject(new Error(`${executable} failed without a result.`));
      }
    });
  }
}
