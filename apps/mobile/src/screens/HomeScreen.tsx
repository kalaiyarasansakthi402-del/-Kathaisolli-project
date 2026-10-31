import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Sparkles, Flame, BookMarked, Play } from 'lucide-react-native';
import { StoryCard } from '../components/StoryCard';
import { CategoryChip } from '../components/CategoryChip';
import { useMobilePlayer } from '../context/MobilePlayerContext';
import { useMobileAuth } from '../context/MobileAuthContext';

const MOCK_CATEGORIES = [
  { id: 'all', name: 'All', tamilName: 'அனைத்தும்' },
  { id: 'history', name: 'History', tamilName: 'வரலாறு' },
  { id: 'thriller', name: 'Thriller', tamilName: 'திகில்' },
  { id: 'romance', name: 'Romance', tamilName: 'காதல்' },
  { id: 'motivation', name: 'Motivation', tamilName: 'தன்னம்பிக்கை' },
  { id: 'kids', name: 'Kids', tamilName: 'சிறுவர் கதைகள்' },
];

const MOCK_STORIES = [
  {
    id: '1',
    title: 'பொன்னியின் செல்வன்',
    authorName: 'கல்கி கிருஷ்ணமூர்த்தி',
    categoryTamil: 'வரலாற்று புதினம்',
    totalEpisodes: 5,
    rating: 4.9,
    coverImageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80',
    firstEpisode: {
      id: 'ep-1',
      episodeId: 'ep-1',
      title: 'ஆடித் திருநாள் - வந்தியத்தேவன் வருகை',
      tamilTitle: 'ஆடித் திருநாள் - வந்தியத்தேவன் வருகை',
      seriesTitle: 'பொன்னியின் செல்வன்',
      durationSec: 1440,
    },
  },
  {
    id: '2',
    title: 'சிவகாமியின் சபதம்',
    authorName: 'கல்கி கிருஷ்ணமூர்த்தி',
    categoryTamil: 'வரலாற்று புதினம்',
    totalEpisodes: 4,
    rating: 4.8,
    coverImageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    firstEpisode: {
      id: 'ep-2',
      episodeId: 'ep-2',
      title: 'பரஞ்சோதி யாத்திரை',
      tamilTitle: 'பரஞ்சோதி யாத்திரை',
      seriesTitle: 'சிவகாமியின் சபதம்',
      durationSec: 1350,
    },
  },
  {
    id: '3',
    title: 'இரவின் நிழல்கள் (திகில்)',
    authorName: 'கார்த்திக் சுப்புராஜ்',
    categoryTamil: 'திகில் & மர்மம்',
    totalEpisodes: 3,
    rating: 4.8,
    coverImageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    firstEpisode: {
      id: 'ep-3',
      episodeId: 'ep-3',
      title: 'மூடுபனி பங்களா',
      tamilTitle: 'மூடுபனி பங்களா',
      seriesTitle: 'இரவின் நிழல்கள்',
      durationSec: 1200,
    },
  },
  {
    id: '4',
    title: 'வெற்றியின் பாதை',
    authorName: 'டாக்டர். கலாம் சிந்தனைகள்',
    categoryTamil: 'தன்னம்பிக்கை',
    totalEpisodes: 3,
    rating: 4.9,
    coverImageUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=600&q=80',
    firstEpisode: {
      id: 'ep-4',
      episodeId: 'ep-4',
      title: 'கனவு காணுங்கள்',
      tamilTitle: 'கனவு காணுங்கள்',
      seriesTitle: 'வெற்றியின் பாதை',
      durationSec: 1000,
    },
  },
];

export const HomeScreen: React.FC<{ onSelectStory: (id: string) => void }> = ({ onSelectStory }) => {
  const { user } = useMobileAuth();
  const { playEpisode, currentTrack, isPlaying } = useMobilePlayer();
  const [selectedCat, setSelectedCat] = useState('all');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Welcome Header */}
        <View style={styles.headerBanner}>
          <View style={styles.freeBadge}>
            <Sparkles size={12} color="#A7F3D0" />
            <Text style={styles.freeBadgeText}>100% இலவச ஆடியோ தளம்</Text>
          </View>
          <Text style={styles.greeting}>
            {user ? `வணக்கம், ${user.displayName}!` : 'வணக்கம்! கதைசொல்லி'}
          </Text>
          <Text style={styles.subGreeting}>
            உங்களுக்குப் பிடித்த தமிழ் கதைகளைக் கேட்கத் தொடங்குங்கள்
          </Text>
        </View>

        {/* Categories Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {MOCK_CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat.id}
              id={cat.id}
              name={cat.name}
              tamilName={cat.tamilName}
              isSelected={selectedCat === cat.id}
              onPress={setSelectedCat}
            />
          ))}
        </ScrollView>

        {/* Continue Listening */}
        {currentTrack && (
          <View style={styles.continueSection}>
            <Text style={styles.sectionTitle}>தொடர்ந்து கேட்க</Text>
            <TouchableOpacity
              style={styles.continueCard}
              onPress={() => playEpisode(currentTrack)}
              activeOpacity={0.8}
            >
              <View style={styles.continueIcon}>
                <Play size={18} color="#FFFFFF" />
              </View>
              <View style={styles.continueInfo}>
                <Text style={styles.continueTitle} numberOfLines={1}>
                  {currentTrack.tamilTitle || currentTrack.title}
                </Text>
                <Text style={styles.continueSubtitle} numberOfLines={1}>
                  {currentTrack.seriesTitle || 'கதைசொல்லி'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Trending Stories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Flame size={18} color="#F59E0B" />
              <Text style={styles.sectionTitle}>முன்னணி கதைகள் (Trending)</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {MOCK_STORIES.map((s) => (
              <StoryCard
                key={s.id}
                id={s.id}
                title={s.title}
                authorName={s.authorName}
                categoryTamil={s.categoryTamil}
                totalEpisodes={s.totalEpisodes}
                rating={s.rating}
                coverImageUrl={s.coverImageUrl}
                onPress={() => onSelectStory(s.id)}
                onPlayPress={() => playEpisode(s.firstEpisode as any)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Tamil Classics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <BookMarked size={18} color="#059669" />
              <Text style={styles.sectionTitle}>கல்கியின் வரலாற்று காவியங்கள்</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {MOCK_STORIES.slice(0, 2).map((s) => (
              <StoryCard
                key={s.id}
                id={s.id}
                title={s.title}
                authorName={s.authorName}
                categoryTamil={s.categoryTamil}
                totalEpisodes={s.totalEpisodes}
                rating={s.rating}
                coverImageUrl={s.coverImageUrl}
                onPress={() => onSelectStory(s.id)}
                onPlayPress={() => playEpisode(s.firstEpisode as any)}
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAF7',
  },
  container: {
    paddingBottom: 100,
  },
  headerBanner: {
    backgroundColor: '#064E3B',
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  freeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#022C22',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  freeBadgeText: {
    color: '#A7F3D0',
    fontSize: 10,
    fontWeight: '700',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subGreeting: {
    fontSize: 12,
    color: '#A7F3D0',
    marginTop: 4,
  },
  categoriesRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  continueSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
    elevation: 2,
  },
  continueIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueInfo: {
    marginLeft: 12,
    flex: 1,
  },
  continueTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  continueSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  horizontalList: {
    paddingHorizontal: 16,
  },
});
