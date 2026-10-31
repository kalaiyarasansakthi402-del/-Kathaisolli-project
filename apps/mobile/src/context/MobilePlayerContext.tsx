import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import { useMobileAuth } from './MobileAuthContext';

export interface MobileTrack {
  id: string;
  episodeId: string;
  title: string;
  tamilTitle: string;
  seriesTitle?: string;
  coverImageUrl?: string;
  durationSec?: number;
  audioUrl?: string;
}

interface MobilePlayerContextType {
  currentTrack: MobileTrack | null;
  isPlaying: boolean;
  positionSec: number;
  durationSec: number;
  playbackRate: number;
  sleepTimer: number | null;
  isFullPlayerVisible: boolean;
  playEpisode: (track: MobileTrack) => Promise<void>;
  togglePlay: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  seekTo: (sec: number) => Promise<void>;
  setRate: (rate: number) => Promise<void>;
  setSleepTimerMinutes: (min: number | null) => void;
  openFullPlayer: () => void;
  closeFullPlayer: () => void;
}

const MobilePlayerContext = createContext<MobilePlayerContextType | undefined>(undefined);

export const MobilePlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { api } = useMobileAuth();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentTrack, setCurrentTrack] = useState<MobileTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionSec, setPositionSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [isFullPlayerVisible, setIsFullPlayerVisible] = useState(false);

  useEffect(() => {
    // Configure Expo audio for background playback
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    }).catch(() => {});

    return () => {
      sound?.unloadAsync().catch(() => {});
    };
  }, [sound]);

  // Sleep timer
  useEffect(() => {
    if (!sleepTimer || sleepTimer <= 0) return;
    const t = setTimeout(() => {
      pause();
      setSleepTimer(null);
    }, sleepTimer * 60 * 1000);
    return () => clearTimeout(t);
  }, [sleepTimer]);

  const playEpisode = async (track: MobileTrack) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      setCurrentTrack(track);

      let streamUrl = track.audioUrl;
      try {
        const authRes = await api.playback.authorize(track.episodeId);
        if (authRes.audioUrl) {
          streamUrl = authRes.audioUrl;
        }
      } catch {
        // Fallback for offline demo
      }

      if (streamUrl) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: streamUrl },
          { shouldPlay: true, rate: playbackRate },
          (status) => {
            if (status.isLoaded) {
              setPositionSec(Math.floor(status.positionMillis / 1000));
              setDurationSec(Math.floor((status.durationMillis || 0) / 1000));
              setIsPlaying(status.isPlaying);
            }
          }
        );
        setSound(newSound);
        setIsPlaying(true);
      } else {
        setIsPlaying(true);
        setDurationSec(track.durationSec || 1200);
      }
    } catch (err) {
      console.warn('Mobile play error:', err);
    }
  };

  const togglePlay = async () => {
    if (!sound) {
      setIsPlaying(!isPlaying);
      return;
    }
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const pause = async () => {
    if (sound) await sound.pauseAsync();
    setIsPlaying(false);
  };

  const resume = async () => {
    if (sound) await sound.playAsync();
    setIsPlaying(true);
  };

  const seekTo = async (sec: number) => {
    if (sound) {
      await sound.setPositionAsync(sec * 1000);
    }
    setPositionSec(sec);
  };

  const setRate = async (rate: number) => {
    setPlaybackRate(rate);
    if (sound) {
      await sound.setRateAsync(rate, true);
    }
  };

  const setSleepTimerMinutes = (min: number | null) => {
    setSleepTimer(min);
  };

  const openFullPlayer = () => setIsFullPlayerVisible(true);
  const closeFullPlayer = () => setIsFullPlayerVisible(false);

  return (
    <MobilePlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        positionSec,
        durationSec,
        playbackRate,
        sleepTimer,
        isFullPlayerVisible,
        playEpisode,
        togglePlay,
        pause,
        resume,
        seekTo,
        setRate,
        setSleepTimerMinutes,
        openFullPlayer,
        closeFullPlayer,
      }}
    >
      {children}
    </MobilePlayerContext.Provider>
  );
};

export const useMobilePlayer = () => {
  const ctx = useContext(MobilePlayerContext);
  if (!ctx) throw new Error('useMobilePlayer must be used within MobilePlayerProvider');
  return ctx;
};
