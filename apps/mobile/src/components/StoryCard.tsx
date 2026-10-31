import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, Star, Headphones } from 'lucide-react-native';

export interface MobileStoryCardProps {
  id: string;
  title: string;
  authorName?: string;
  coverImageUrl?: string | null;
  categoryTamil?: string;
  totalEpisodes?: number;
  rating?: number;
  onPress: () => void;
  onPlayPress?: () => void;
}

export const StoryCard: React.FC<MobileStoryCardProps> = ({
  title,
  authorName,
  coverImageUrl,
  categoryTamil,
  totalEpisodes = 1,
  rating = 4.8,
  onPress,
  onPlayPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              coverImageUrl ||
              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
          }}
          style={styles.coverImage}
        />
        {/* Free Tag */}
        <View style={styles.freeBadge}>
          <Text style={styles.freeText}>இலவசம்</Text>
        </View>

        {onPlayPress && (
          <TouchableOpacity style={styles.playButton} onPress={onPlayPress}>
            <Play size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {authorName && (
          <Text style={styles.author} numberOfLines={1}>
            {authorName}
          </Text>
        )}

        <View style={styles.metaRow}>
          <View style={styles.episodesRow}>
            <Headphones size={12} color="#059669" />
            <Text style={styles.episodesText}>{totalEpisodes} பகுதிகள்</Text>
          </View>
          <View style={styles.ratingRow}>
            <Star size={12} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  imageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#022C22',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  freeBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(6, 78, 59, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  freeText: {
    color: '#A7F3D0',
    fontSize: 10,
    fontWeight: '700',
  },
  playButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  info: {
    padding: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  author: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  episodesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  episodesText: {
    fontSize: 10,
    color: '#64748B',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F59E0B',
  },
});
