import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, AlertCircle, Headphones } from 'lucide-react';
import { formatDuration } from '@kathaisolli/shared-utils';

interface AudioPreviewPlayerProps {
  src: string;
  title?: string;
  durationSec?: number;
  autoPlay?: boolean;
  onDurationDetected?: (duration: number) => void;
}

export const AudioPreviewPlayer: React.FC<AudioPreviewPlayerProps> = ({
  src,
  title,
  durationSec,
  autoPlay = false,
  onDurationDetected,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSec || 0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    setIsPlaying(false);
    setCurrentTime(0);
    setError(null);
    audio.src = src;
    audio.load();

    if (autoPlay) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [src, autoPlay]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        console.warn('[AudioPreview] Playback interrupted:', err);
        setError('ஆடியோ இயக்க முடியவில்லை. சரியான MP3 கோப்பை சரிபார்க்கவும்.');
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && isFinite(audioRef.current.duration) && audioRef.current.duration > 0) {
      const dur = Math.round(audioRef.current.duration);
      setDuration(dur);
      if (onDurationDetected) {
        onDurationDetected(dur);
      }
    }
    setIsBuffering(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const next = !isMuted;
      setIsMuted(next);
      audioRef.current.muted = next;
    }
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="p-4 rounded-2xl bg-[#032016] border border-emerald-800/80 text-white shadow-inner space-y-3">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlaying={() => {
          setIsPlaying(true);
          setIsBuffering(false);
          setError(null);
        }}
        onWaiting={() => setIsBuffering(true)}
        onCanPlay={() => setIsBuffering(false)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onError={() => {
          setIsPlaying(false);
          setIsBuffering(false);
          setError('ஆடியோ கோப்பை ஏற்றுவதில் பிழை (Failed to load audio stream).');
        }}
      />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center shrink-0">
            <Headphones className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-emerald-100 truncate">
              {title || 'ஆடியோ முன்னோட்டம் (Audio Preview)'}
            </p>
            <span className="text-[10px] text-emerald-400 font-mono">
              MP3 / audio/mpeg • 128kbps+
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleMute}
            className="text-emerald-300 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>
      </div>

      {error && (
        <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Controls & Scrubber */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="w-9 h-9 rounded-full bg-emerald-400 hover:bg-emerald-300 text-emerald-950 flex items-center justify-center shrink-0 shadow-md transition-transform active:scale-95"
        >
          {isBuffering ? (
            <div className="w-3.5 h-3.5 border-2 border-emerald-950 border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        <div className="flex-1 space-y-1">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-[#063828] rounded-full appearance-none cursor-pointer accent-emerald-400"
          />
          <div className="flex justify-between text-[10px] font-mono text-emerald-400/80">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
