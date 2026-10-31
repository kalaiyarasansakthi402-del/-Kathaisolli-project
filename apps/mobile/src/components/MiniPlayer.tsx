import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Play, Pause, ChevronUp } from 'lucide-react-native';
import { useMobilePlayer } from '../context/MobilePlayerContext';

export const MiniPlayer: React.FC = () => {
  const { currentTrack, isPlaying, togglePlay, openFullPlayer, positionSec, durationSec } = useMobilePlayer();

  if (!currentTrack) return null;

  const progress = durationSec > 0 ? (positionSec / durationSec) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Progress line */}
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>

      <TouchableOpacity
        style={styles.contentRow}
        activeOpacity={0.8}
        onPress={openFullPlayer}
      >
        <Image
          source={{
            uri:
              currentTrack.coverImageUrl ||
              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
          }}
          style={styles.coverImage}
        />

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrack.tamilTitle || currentTrack.title}
          </Text>
          <Text style={styles.series} numberOfLines={1}>
            {currentTrack.seriesTitle || 'கதைசொல்லி • 100% இலவசம்'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.playButton}
          onPress={togglePlay}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {isPlaying ? (
            <Pause size={20} color="#FFFFFF" />
          ) : (
            <Play size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60,
    left: 10,
    right: 10,
    backgroundColor: '#064E3B',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: '#022C22',
    width: '100%',
  },
  progressBarFill: {
    height: 3,
    backgroundColor: '#A7F3D0',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  coverImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#022C22',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  series: {
    color: '#A7F3D0',
    fontSize: 11,
    marginTop: 2,
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#047857',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
});
