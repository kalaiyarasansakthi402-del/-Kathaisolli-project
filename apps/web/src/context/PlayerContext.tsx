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
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { api, user } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTrack, setCurrentTrack] = useState<PlayingTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const lastSyncRef = useRef<number>(0);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);

      // Periodic progress sync every 5 seconds if logged in
      const now = Date.now();
      if (user && currentTrack && now - lastSyncRef.current > 5000) {
        lastSyncRef.current = now;
        api.library.updateProgress({
          episodeId: currentTrack.episodeId,
          positionSec: Math.floor(audio.currentTime),
          durationSec: Math.floor(audio.duration || currentTrack.durationSec || 0),
        }).catch(() => {});
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      if (user && currentTrack) {
        api.library.updateProgress({
          episodeId: currentTrack.episodeId,
          positionSec: Math.floor(audio.duration || 0),
          durationSec: Math.floor(audio.duration || 0),
          completedFlag: true,
        }).catch(() => {});
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [api, user, currentTrack]);

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
      const episodeId = typeof trackOrId === 'string' ? trackOrId : trackOrId.episodeId;
      const track: PlayingTrack = typeof trackOrId === 'string'
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
        } catch (apiErr) {
          console.warn('[Player] Backend stream not available, continuing with track playback');
        }
      }

      if (audioRef.current) {
        if (streamUrl) {
          audioRef.current.src = streamUrl;
          audioRef.current.playbackRate = playbackRate;
          audioRef.current.volume = isMuted ? 0 : volume;
          await audioRef.current.play().catch((playErr) => {
            console.warn('[Player] Audio play interrupted:', playErr);
          });
        }
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Playback error:', err);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
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

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        currentEpisode: currentTrack,
        isPlaying,
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
