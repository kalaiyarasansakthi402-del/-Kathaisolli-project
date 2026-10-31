import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import {
  ChevronDown,
  Heart,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  ListMusic,
  Clock,
  Download,
  CheckCircle2,
} from 'lucide-react-native';
import { useMobilePlayer } from '../context/MobilePlayerContext';

const { width } = Dimensions.get('window');

interface StoryPlayerScreenProps {
  onBack?: () => void;
}

export const StoryPlayerScreen: React.FC<StoryPlayerScreenProps> = ({ onBack }) => {
  const {
    currentTrack,
    isPlaying,
    positionSec,
    durationSec,
    playbackRate,
    sleepTimer,
    togglePlay,
    seekTo,
    setRate,
    setSleepTimerMinutes,
  } = useMobilePlayer();

  const [isFavorite, setIsFavorite] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  // Fallback defaults matching Screen 9 reference if no track active
  const displayTitle = currentTrack?.seriesTitle || 'Ponniyin Selvan';
  const displayEpisode = currentTrack?.title || 'Episode 3 - Pazhuvettarayar';
  const totalDuration = durationSec > 0 ? durationSec : 1758; // 29:18
  const currentPosition = durationSec > 0 ? positionSec : 756; // 12:36

  const progressPercent = totalDuration > 0 ? (currentPosition / totalDuration) * 100 : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSkipBackward = () => {
    seekTo(Math.max(0, currentPosition - 10));
  };

  const handleSkipForward = () => {
    seekTo(Math.min(totalDuration, currentPosition + 10));
  };

  const handleCycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    setRate(speeds[nextIdx]);
  };

  const handleCycleTimer = () => {
    const timers = [null, 15, 30, 60];
    const nextIdx = (timers.indexOf(sleepTimer) + 1) % timers.length;
    setSleepTimerMinutes(timers[nextIdx]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#063F30" />
      <View style={styles.content}>
        {/* Top Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
            <ChevronDown size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerSeriesTitle} numberOfLines={1}>
              {displayTitle}
            </Text>
            <Text style={styles.headerEpisodeTitle} numberOfLines={1}>
              {displayEpisode}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setIsFavorite(!isFavorite)}
            style={styles.iconBtn}
          >
            <Heart
              size={24}
              color={isFavorite ? '#EF4444' : '#FFFFFF'}
              fill={isFavorite ? '#EF4444' : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        {/* Large Square Cover Artwork */}
        <View style={styles.artworkWrapper}>
          <View style={styles.artworkFrame}>
            <Image
              source={
                currentTrack?.coverImageUrl
                  ? { uri: currentTrack.coverImageUrl }
                  : require('../../assets/onboarding-1.jpg')
              }
              style={styles.artworkImage}
              resizeMode="cover"
            />
            {/* Center Floating Title Badge on Artwork */}
            <View style={styles.artFloatingBadge}>
              <Text style={styles.artBadgeSeries}>{displayTitle}</Text>
              <Text style={styles.artBadgeSub}>{displayEpisode}</Text>
            </View>
          </View>
        </View>

        {/* Playback Progress Slider */}
        <View style={styles.progressSection}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.progressBarTrack}
            onPress={(e) => {
              const clickX = e.nativeEvent.locationX;
              const trackWidth = width - 48;
              const pct = Math.max(0, Math.min(1, clickX / trackWidth));
              seekTo(Math.floor(pct * totalDuration));
            }}
          >
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            <View style={[styles.progressThumb, { left: `${Math.max(0, progressPercent - 2)}%` }]} />
          </TouchableOpacity>

          <View style={styles.timestampRow}>
            <Text style={styles.timestampText}>{formatTime(currentPosition)}</Text>
            <Text style={styles.timestampText}>{formatTime(totalDuration)}</Text>
          </View>
        </View>

        {/* Player Controls (10s Back, Play/Pause, 10s Forward) */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={handleSkipBackward}
            activeOpacity={0.7}
          >
            <RotateCcw size={28} color="#FFFFFF" />
            <Text style={styles.skipNumber}>10</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playPauseBtn}
            onPress={togglePlay}
            activeOpacity={0.85}
          >
            {isPlaying ? (
              <Pause size={36} color="#063F30" fill="#063F30" />
            ) : (
              <Play size={36} color="#063F30" fill="#063F30" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipBtn}
            onPress={handleSkipForward}
            activeOpacity={0.7}
          >
            <RotateCw size={28} color="#FFFFFF" />
            <Text style={styles.skipNumber}>10</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Actions Row (Speed, Chapters, Sleep Timer, Download) */}
        <View style={styles.bottomActionsRow}>
          <TouchableOpacity style={styles.actionItem} onPress={handleCycleSpeed}>
            <Text style={styles.speedLabel}>{playbackRate}x</Text>
            <Text style={styles.actionText}>Speed</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={onBack}>
            <ListMusic size={22} color="#FFFFFF" />
            <Text style={styles.actionText}>Chapters</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleCycleTimer}>
            <Clock size={22} color={sleepTimer ? '#D7B45A' : '#FFFFFF'} />
            <Text style={[styles.actionText, sleepTimer ? { color: '#D7B45A' } : null]}>
              {sleepTimer ? `${sleepTimer}m` : 'Sleep Timer'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => setIsDownloaded(!isDownloaded)}
          >
            {isDownloaded ? (
              <CheckCircle2 size={22} color="#A7F3D0" />
            ) : (
              <Download size={22} color="#FFFFFF" />
            )}
            <Text style={[styles.actionText, isDownloaded ? { color: '#A7F3D0' } : null]}>
              {isDownloaded ? 'Downloaded' : 'Download'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#063F30',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'ios' ? 12 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  iconBtn: {
    padding: 6,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  headerSeriesTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'serif',
  },
  headerEpisodeTitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  artworkWrapper: {
    alignItems: 'center',
    marginVertical: 12,
  },
  artworkFrame: {
    width: width * 0.76,
    height: width * 0.76,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 2,
    borderColor: 'rgba(215, 180, 90, 0.3)',
    position: 'relative',
  },
  artworkImage: {
    width: '100%',
    height: '100%',
  },
  artFloatingBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(6, 63, 48, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(215, 180, 90, 0.4)',
    alignItems: 'center',
  },
  artBadgeSeries: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'serif',
  },
  artBadgeSub: {
    fontSize: 10,
    color: '#D7B45A',
    fontWeight: '600',
    marginTop: 2,
  },
  progressSection: {
    marginVertical: 8,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    position: 'relative',
    justifyContent: 'center',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#A7F3D0',
    borderRadius: 3,
  },
  progressThumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    top: -4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  timestampRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timestampText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
    marginVertical: 12,
  },
  skipBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 48,
    height: 48,
  },
  skipNumber: {
    position: 'absolute',
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    top: 17,
  },
  playPauseBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionItem: {
    alignItems: 'center',
    gap: 4,
    minWidth: 60,
  },
  speedLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    height: 22,
    textAlign: 'center',
  },
  actionText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
});
