import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

interface StoryPlayerScreenProps {
  onBack?: () => void;
  onTogglePlay?: () => void;
  isPlaying?: boolean;
}

export const StoryPlayerScreen: React.FC<StoryPlayerScreenProps> = ({
  onBack,
  onTogglePlay,
  isPlaying: externalIsPlaying,
}) => {
  const [internalPlaying, setInternalPlaying] = useState(false);
  const isPlaying = externalIsPlaying !== undefined ? externalIsPlaying : internalPlaying;

  const togglePlay = () => {
    if (onTogglePlay) {
      onTogglePlay();
    } else {
      setInternalPlaying(!internalPlaying);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F5E9" />
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTag}>NOW PLAYING</Text>
            <Text style={styles.headerTitle}>பஞ்சதந்திரக் கதைகள்</Text>
          </View>
          <View style={styles.speedBadge}>
            <Text style={styles.speedBadgeText}>1.0x</Text>
          </View>
        </View>

        {/* Story Cover Artwork (The Clever Crow) */}
        <View style={styles.artworkContainer}>
          <View style={styles.artFrame}>
            <Text style={styles.fallbackArtEmoji}>🦅</Text>
          </View>
        </View>

        {/* Title & Metadata */}
        <View style={styles.metaContainer}>
          <Text style={styles.storyTitle}>The Clever Crow</Text>
          <Text style={styles.tamilStoryTitle}>காக்கையின் தாகம்</Text>
          <Text style={styles.authorText}>குரல்: கதைசொல்லி குழு · By Anzles</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarTrack}>
            <View style={styles.progressBarFill} />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>02:45</Text>
            <Text style={styles.timeText}>06:00</Text>
          </View>
        </View>

        {/* Playback Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.secondaryControl}>
            <Text style={styles.controlIconText}>⏪ 10</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playButton}
            onPress={togglePlay}
            activeOpacity={0.8}
          >
            <Text style={styles.playButtonText}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryControl}>
            <Text style={styles.controlIconText}>10 ⏩</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Utility Actions */}
        <View style={styles.utilityRow}>
          <TouchableOpacity style={styles.utilityButton}>
            <Text style={styles.utilityEmoji}>⏱️</Text>
            <Text style={styles.utilityLabel}>Timer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.utilityButton}>
            <Text style={styles.utilityEmoji}>🔊</Text>
            <Text style={styles.utilityLabel}>Audio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.utilityButton}>
            <Text style={styles.utilityEmoji}>⬇️</Text>
            <Text style={styles.utilityLabel}>Offline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.utilityButton}>
            <Text style={styles.utilityEmoji}>🔖</Text>
            <Text style={styles.utilityLabel}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5E9',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  backButtonText: {
    fontSize: 18,
    color: '#064E3B',
    fontWeight: 'bold',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#064E3B',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  speedBadge: {
    backgroundColor: '#E8F0E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  speedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#064E3B',
  },
  artworkContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  artFrame: {
    width: 240,
    height: 240,
    borderRadius: 28,
    backgroundColor: '#E8F0E2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  fallbackArtEmoji: {
    fontSize: 80,
  },
  metaContainer: {
    alignItems: 'center',
    gap: 4,
  },
  storyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#064E3B',
    textAlign: 'center',
  },
  tamilStoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#166534',
  },
  authorText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  progressContainer: {
    gap: 6,
  },
  progressBarTrack: {
    width: '100%',
    height: 5,
    backgroundColor: '#D1D5DB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '45%',
    height: '100%',
    backgroundColor: '#064E3B',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#6B7280',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  secondaryControl: {
    padding: 10,
  },
  controlIconText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#064E3B',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  playButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  utilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  utilityButton: {
    alignItems: 'center',
    gap: 2,
  },
  utilityEmoji: {
    fontSize: 16,
  },
  utilityLabel: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: '600',
  },
});
