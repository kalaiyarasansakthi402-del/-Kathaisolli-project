import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import {
  Bell,
  Search,
  BookOpen,
  Play,
  Flame,
  Sparkles,
  Compass,
  Headphones,
} from 'lucide-react-native';
import { BottomTabBar, TabName } from '../components/BottomTabBar';
import { MiniPlayer } from '../components/MiniPlayer';
import { useMobilePlayer } from '../context/MobilePlayerContext';
import { useMobileAuth } from '../context/MobileAuthContext';
import { COMPLETE_LIBRARY_CATALOG, LibraryBook } from '../data/mobileCatalog';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  onTabChange: (tab: TabName) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, onTabChange }) => {
  const { user } = useMobileAuth();
  const { playEpisode, currentTrack, isPlaying } = useMobilePlayer();
  const [searchQuery, setSearchQuery] = useState('');

  // Sample Featured and Trending stories from catalog
  const ponniyinSelvan = COMPLETE_LIBRARY_CATALOG.find((b) => b.slug.includes('ponniyin')) || COMPLETE_LIBRARY_CATALOG[36];
  const trendingBooks = COMPLETE_LIBRARY_CATALOG.slice(0, 8);

  const handlePlayContinue = () => {
    if (ponniyinSelvan && ponniyinSelvan.chapters[0]) {
      const ch = ponniyinSelvan.chapters[0];
      playEpisode({
        id: ch.id,
        episodeId: ch.id,
        title: `${ponniyinSelvan.title} - ${ch.title}`,
        tamilTitle: ponniyinSelvan.tamilTitle,
        seriesTitle: ponniyinSelvan.title,
        coverImageUrl: ponniyinSelvan.coverImageUrl,
        durationSec: ch.durationSeconds,
        audioUrl: ch.audioUrl,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.brandTitle}>Kathaisolli</Text>
              <Text style={styles.brandSubtitle}>Stories • Knowledge • Life</Text>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.bellButton}
                onPress={() => onNavigate('notifications')}
              >
                <Bell size={20} color="#17251E" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.avatarButton}
                onPress={() => onTabChange('profile')}
              >
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {user?.displayName ? user.displayName[0].toUpperCase() : 'K'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Input Bar */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.searchBar}
            onPress={() => onTabChange('library')}
          >
            <Search size={18} color="#68756C" />
            <Text style={styles.searchPlaceholder}>Search for books, stories...</Text>
          </TouchableOpacity>

          {/* Featured Hero Banner */}
          <View style={styles.heroBanner}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Discover{'\n'}Tamil Stories{'\n'}That Inspire</Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => onTabChange('library')}
                activeOpacity={0.85}
              >
                <Text style={styles.exploreButtonText}>Explore Now</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.heroImageWrapper}>
              <Image
                source={require('../../assets/onboarding-1.jpg')}
                style={styles.heroImage}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Categories Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={() => onNavigate('categories')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoriesRow}>
            {/* Mythology */}
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => onNavigate('categories')}
            >
              <View style={[styles.categoryCircle, { backgroundColor: '#FEF3C7' }]}>
                <Sparkles size={22} color="#D97706" />
              </View>
              <Text style={styles.categoryLabel}>Mythology</Text>
            </TouchableOpacity>

            {/* History */}
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => onNavigate('categories')}
            >
              <View style={[styles.categoryCircle, { backgroundColor: '#CCFBF1' }]}>
                <BookOpen size={22} color="#0F766E" />
              </View>
              <Text style={styles.categoryLabel}>History</Text>
            </TouchableOpacity>

            {/* Self Help */}
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => onNavigate('categories')}
            >
              <View style={[styles.categoryCircle, { backgroundColor: '#DCFCE7' }]}>
                <Compass size={22} color="#15803D" />
              </View>
              <Text style={styles.categoryLabel}>Self Help</Text>
            </TouchableOpacity>

            {/* Fiction */}
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => onNavigate('categories')}
            >
              <View style={[styles.categoryCircle, { backgroundColor: '#F3E8FF' }]}>
                <Flame size={22} color="#9333EA" />
              </View>
              <Text style={styles.categoryLabel}>Fiction</Text>
            </TouchableOpacity>
          </View>

          {/* Continue Listening Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continue Listening</Text>
            <TouchableOpacity onPress={() => onTabChange('library')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.continueCard}
            activeOpacity={0.85}
            onPress={() => onNavigate('bookDetails', { book: ponniyinSelvan })}
          >
            <View
              style={[
                styles.continueThumb,
                {
                  backgroundColor: ponniyinSelvan?.gradient[0] || '#78350F',
                },
              ]}
            >
              <Text style={styles.continueThumbText} numberOfLines={2}>
                {ponniyinSelvan?.tamilTitle || 'பொன்னியின் செல்வன்'}
              </Text>
            </View>

            <View style={styles.continueInfo}>
              <Text style={styles.continueTitle} numberOfLines={1}>
                {ponniyinSelvan?.title || 'Ponniyin Selvan'}
              </Text>
              <Text style={styles.continueSubtitle}>
                Episode 3 • 28 min left
              </Text>
            </View>

            <TouchableOpacity
              style={styles.continuePlayBtn}
              onPress={handlePlayContinue}
            >
              <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Trending Stories Grid */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Stories</Text>
            <TouchableOpacity onPress={() => onTabChange('library')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendingRow}
          >
            {trendingBooks.map((b) => (
              <TouchableOpacity
                key={b.id}
                style={styles.trendingCard}
                activeOpacity={0.85}
                onPress={() => onNavigate('bookDetails', { book: b })}
              >
                <View
                  style={[
                    styles.trendingThumb,
                    {
                      backgroundColor: b.gradient[0],
                    },
                  ]}
                >
                  <Text style={styles.trendingCat}>{b.category}</Text>
                  <Text style={styles.trendingTamilTitle} numberOfLines={2}>
                    {b.tamilTitle}
                  </Text>
                </View>
                <Text style={styles.trendingTitle} numberOfLines={1}>
                  {b.title}
                </Text>
                <Text style={styles.trendingAuthor} numberOfLines={1}>
                  {b.authorName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Docked Mini Player */}
        <MiniPlayer />

        {/* Bottom Tab Bar */}
        <BottomTabBar activeTab="home" onTabChange={onTabChange} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F4E8',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#075C45',
    fontFamily: 'serif',
  },
  brandSubtitle: {
    fontSize: 10,
    color: '#68756C',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E2D5',
  },
  avatarButton: {},
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#075C45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E2D5',
    paddingHorizontal: 14,
    height: 46,
    gap: 10,
    marginBottom: 20,
  },
  searchPlaceholder: {
    fontSize: 13,
    color: '#8C9A91',
  },
  heroBanner: {
    flexDirection: 'row',
    backgroundColor: '#063F30',
    borderRadius: 22,
    overflow: 'hidden',
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 10,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'serif',
    lineHeight: 26,
    marginBottom: 14,
  },
  exploreButton: {
    backgroundColor: '#D7B45A',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  exploreButtonText: {
    color: '#063F30',
    fontSize: 12,
    fontWeight: '800',
  },
  heroImageWrapper: {
    width: 100,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(215, 180, 90, 0.4)',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#17251E',
    fontFamily: 'serif',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#075C45',
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  categoryItem: {
    alignItems: 'center',
    width: (width - 64) / 4,
  },
  categoryCircle: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#17251E',
  },
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8E2D5',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  continueThumb: {
    width: 48,
    height: 58,
    borderRadius: 10,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueThumbText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  continueInfo: {
    flex: 1,
    marginLeft: 14,
  },
  continueTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#17251E',
  },
  continueSubtitle: {
    fontSize: 11,
    color: '#68756C',
    marginTop: 2,
  },
  continuePlayBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#075C45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendingRow: {
    gap: 14,
    paddingBottom: 8,
  },
  trendingCard: {
    width: 120,
  },
  trendingThumb: {
    width: 120,
    height: 150,
    borderRadius: 14,
    padding: 10,
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  trendingCat: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  trendingTamilTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  trendingTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#17251E',
  },
  trendingAuthor: {
    fontSize: 10,
    color: '#68756C',
    marginTop: 1,
  },
});
