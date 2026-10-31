import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

export interface PlayingTrack {
  id?: string;
  episodeId: string;
  title: string;
  seriesId?: string;
  seriesTitle?: string;
  coverImage?: string | null;
  coverImageUrl?: string | null;
  narratorName?: string;
  durationSec?: number | null;
  audioUrl?: string | null;
  downloadUrl?: string | null;
}

export interface PlayerContextType {
  currentTrack: PlayingTrack | null;
  currentEpisode: PlayingTrack | null;
  isPlaying: boolean;
  isBuffering: boolean;
  playbackError: string | null;
  currentTime: number;
  duration: number;
  playbackRate: number;
  sleepTimer: number | null;
  sleepTimerMinutes: number | null;
  isFullPlayerOpen: boolean;
  volume: number;
  isMuted: boolean;
  playEpisode: (trackOrId: PlayingTrack | string, seriesId?: string) => Promise<void>;
  play: () => void;
  resume: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  setSpeed: (rate: number) => void;
  setRate: (rate: number) => void;
  setSleepTimer: (minutes: number | null) => void;
  setSleepTimerMinutes: (minutes: number | null) => void;
  setPlayerVolume: (vol: number) => void;
  toggleMute: () => void;
  openFullPlayer: () => void;
  closeFullPlayer: () => void;
  clearError: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { api, user } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTrack, setCurrentTrack] = useState<PlayingTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // References for event listener handlers to avoid rebuilding audio element
  const currentTrackRef = useRef<PlayingTrack | null>(null);
  currentTrackRef.current = currentTrack;
  const userRef = useRef(user);
  userRef.current = user;
  const apiRef = useRef(api);
  apiRef.current = api;
  const lastSyncRef = useRef<number>(0);

  // Initialize Audio element ONCE on mount
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);

      const now = Date.now();
      const track = currentTrackRef.current;
      const currentUser = userRef.current;
      if (currentUser && track && now - lastSyncRef.current > 5000) {
        lastSyncRef.current = now;
        apiRef.current.library
          .updateProgress({
            episodeId: track.episodeId,
            positionSec: Math.floor(audio.currentTime),
            durationSec: Math.floor(audio.duration || track.durationSec || 0),
          })
          .catch(() => {});
      }
    };

    const onPlaying = () => {
      setIsPlaying(true);
      setIsBuffering(false);
      setPlaybackError(null);
    };

    const onWaiting = () => {
      setIsBuffering(true);
    };

    const onCanPlay = () => {
      setIsBuffering(false);
    };

    const onPause = () => {
      setIsPlaying(false);
      setIsBuffering(false);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setIsBuffering(false);
      const track = currentTrackRef.current;
      const currentUser = userRef.current;
      if (currentUser && track) {
        apiRef.current.library
          .updateProgress({
            episodeId: track.episodeId,
            positionSec: Math.floor(audio.duration || 0),
            durationSec: Math.floor(audio.duration || 0),
            completedFlag: true,
          })
          .catch(() => {});
      }
    };

    const onError = () => {
      setIsPlaying(false);
      setIsBuffering(false);
      const mediaErr = audio.error;
      let msg = 'ஆடியோ ஏற்றுவதில் பிழை (Audio stream error)';
      if (mediaErr) {
        if (mediaErr.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
          msg = 'ஆடியோ வடிவம் ஆதரிக்கப்படவில்லை அல்லது கோப்பு கிடைக்கவில்லை (Audio source unavailable or unsupported MIME type - expected audio/mpeg).';
        } else if (mediaErr.code === MediaError.MEDIA_ERR_NETWORK) {
          msg = 'இணைய இணைப்பு பிழை (Network error while streaming audio).';
        } else if (mediaErr.code === MediaError.MEDIA_ERR_DECODE) {
          msg = 'ஆடியோ டிகோடிங் பிழை (Audio decode error - invalid MP3 stream).';
        }
      }
      setPlaybackError(msg);
      console.warn('[Kathaisolli Audio]', msg, audio.src);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, []);

  // Sleep timer countdown
  useEffect(() => {
    if (!sleepTimer || sleepTimer <= 0) return;
    const timer = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setSleepTimer(null);
    }, sleepTimer * 60 * 1000);

    return () => clearTimeout(timer);
  }, [sleepTimer]);

  const playEpisode = async (trackOrId: PlayingTrack | string, seriesId?: string) => {
    try {
      setPlaybackError(null);
      const episodeId = typeof trackOrId === 'string' ? trackOrId : trackOrId.episodeId;
      const track: PlayingTrack =
        typeof trackOrId === 'string'
          ? {
              id: trackOrId,
              episodeId: trackOrId,
              title: `அத்தியாயம் (${episodeId})`,
              seriesId,
            }
          : {
              ...trackOrId,
              id: trackOrId.id || trackOrId.episodeId,
            };

      setCurrentTrack(track);

      // 1. Direct audio URL (Firebase Storage or direct cloud stream)
      let streamUrl = track.audioUrl || track.downloadUrl;

      // 2. If no direct streamUrl, fetch from backend playback authorization
      if (!streamUrl) {
        try {
          const authData = await api.playback.authorize(episodeId);
          streamUrl = authData.audioUrl;
        } catch {
          console.warn('[Player] Backend stream not available, checking fallback audio');
        }
      }

      // If streamUrl is still not provided, fallback to verified local sample MP3
      if (!streamUrl) {
        streamUrl = '/audio/sample-story.mp3';
      }

      const audio = audioRef.current;
      if (audio) {
        setIsBuffering(true);
        audio.pause();
        audio.currentTime = 0;
        audio.src = streamUrl;
        audio.playbackRate = playbackRate;
        audio.volume = isMuted ? 0 : volume;
        audio.load();

        await audio.play().catch((playErr) => {
          setIsBuffering(false);
          setIsPlaying(false);
          if (playErr.name !== 'AbortError') {
            console.warn('[Player] Audio play interrupted:', playErr.message);
          }
        });
      }
    } catch (err) {
      console.error('Playback error:', err);
      setIsBuffering(false);
      setIsPlaying(false);
      setPlaybackError('ஆடியோ இயக்க முடியவில்லை (Could not play audio).');
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.error('[Player] Toggle play error:', err);
      });
    }
  };

  const pause = () => audioRef.current?.pause();
  const resume = () => audioRef.current?.play().catch(console.error);
  const play = resume;

  const seek = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const skipForward = (seconds = 10) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.duration || Infinity,
        audioRef.current.currentTime + seconds,
      );
    }
  };

  const skipBackward = (seconds = 10) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - seconds);
    }
  };

  const setSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };
  const setRate = setSpeed;

  const setSleepTimerMinutes = (minutes: number | null) => {
    setSleepTimer(minutes);
  };

  const setPlayerVolume = (vol: number) => {
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const nextMuted = !isMuted;
      setIsMuted(nextMuted);
      audioRef.current.muted = nextMuted;
    }
  };

  const openFullPlayer = () => setIsFullPlayerOpen(true);
  const closeFullPlayer = () => setIsFullPlayerOpen(false);
  const clearError = () => setPlaybackError(null);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        currentEpisode: currentTrack,
        isPlaying,
        isBuffering,
        playbackError,
        currentTime,
        duration,
        playbackRate,
        sleepTimer,
        sleepTimerMinutes: sleepTimer,
        isFullPlayerOpen,
        volume,
        isMuted,
        playEpisode,
        play,
        resume,
        pause,
        togglePlay,
        seek,
        skipForward,
        skipBackward,
        setSpeed,
        setRate,
        setSleepTimer,
        setSleepTimerMinutes,
        setPlayerVolume,
        toggleMute,
        openFullPlayer,
        closeFullPlayer,
        clearError,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};
