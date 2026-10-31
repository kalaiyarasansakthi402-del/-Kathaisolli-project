import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import {
  ArrowLeft,
  Search,
  Play,
  Pause,
  MoreVertical,
  CheckCircle2,
  Trash2,
  HardDrive,
} from 'lucide-react-native';
import { BottomTabBar, TabName } from '../components/BottomTabBar';
import { MiniPlayer } from '../components/MiniPlayer';
import { useMobilePlayer } from '../context/MobilePlayerContext';
import { COMPLETE_LIBRARY_CATALOG } from '../data/mobileCatalog';

interface DownloadsScreenProps {
  onBack: () => void;
  onTabChange: (tab: TabName) => void;
  onOpenPlayer: () => void;
}

const SAMPLE_DOWNLOADS = [
  {
    id: 'dl-1',
    title: 'Ponniyin Selvan',
    tamilTitle: 'பொன்னியின் செல்வன்',
    episodesCount: 4,
    sizeMb: 120,
    gradient: ['#78350F', '#D97706'],
    audioUrl: 'https://storage.googleapis.com/vaagai-audio-books-36a4e.appspot.com/stories/Ponniyin%20Selvan_%E0%AE%AA%E0%AF%8 contamination%20Selvan/chapter1.mp3',
  },
  {
    id: 'dl-2',
    title: 'Bhagavad gita',
    tamilTitle: 'பகவத் கீதை',
    episodesCount: 12,
    sizeMb: 320,
    gradient: ['#1E3A8A', '#2563EB'],
    audioUrl: 'https://storage.googleapis.com/vaagai-audio-books-36a4e.appspot.com/stories/Bhagavad%20gita_Cho/chapter1.mp3',
  },
  {
    id: 'dl-3',
    title: 'Manase Relax Please',
    tamilTitle: 'மனசே ரிலாக்ஸ் ப்ளீஸ்',
    episodesCount: 6,
    sizeMb: 85,
    gradient: ['#0C4A6E', '#0284C7'],
    audioUrl: 'https://storage.googleapis.com/vaagai-audio-books-36a4e.appspot.com/stories/Manase%20Relax%20Please/chapter1.mp3',
  },
  {
    id: 'dl-4',
    title: 'Arthashastram',
    tamilTitle: 'அர்த்தசாஸ்திரம்',
    episodesCount: 10,
    sizeMb: 210,
    gradient: ['#713F12', '#CA8A04'],
    audioUrl: 'https://storage.googleapis.com/vaagai-audio-books-36a4e.appspot.com/stories/Arthashastram/chapter1.mp3',
  },
];

export const DownloadsScreen: React.FC<DownloadsScreenProps> = ({
  onBack,
  onTabChange,
  onOpenPlayer,
}) => {
  const [activeTab, setActiveTab] = useState<'downloaded' | 'downloading'>('downloaded');
  const [items, setItems] = useState(SAMPLE_DOWNLOADS);
  const { playEpisode, currentTrack, isPlaying } = useMobilePlayer();

  const handlePlayDownloaded = (item: typeof SAMPLE_DOWNLOADS[0]) => {
    playEpisode({
      id: item.id,
      episodeId: item.id,
      title: `${item.title} - Offline Mode`,
      tamilTitle: item.tamilTitle,
      seriesTitle: item.title,
      durationSec: 1800,
      audioUrl: item.audioUrl,
    });
    onOpenPlayer();
  };

  const handleDelete = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <ArrowLeft size={22} color="#17251E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Downloads</Text>
          <TouchableOpacity style={styles.searchBtn}>
            <Search size={20} color="#17251E" />
          </TouchableOpacity>
        </View>

        {/* Tabs: Downloaded vs Downloading */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'downloaded' && styles.tabButtonActive]}
            onPress={() => setActiveTab('downloaded')}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'downloaded' && styles.tabButtonTextActive,
              ]}
            >
              Downloaded
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'downloading' && styles.tabButtonActive]}
            onPress={() => setActiveTab('downloading')}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'downloading' && styles.tabButtonTextActive,
              ]}
            >
              Downloading (0)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content List */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'downloaded' ? (
            <View style={styles.list}>
              {items.map((item) => {
                const isPlayingThis =
                  isPlaying && currentTrack?.seriesTitle === item.title;

                return (
                  <View key={item.id} style={styles.downloadCard}>
                    {/* Cover Art */}
                    <View
                      style={[
                        styles.thumb,
                        {
                          backgroundColor: item.gradient[0],
                        },
                      ]}
                    >
                      <Text style={styles.thumbTamil} numberOfLines={2}>
                        {item.tamilTitle}
                      </Text>
                    </View>

                    {/* Metadata */}
                    <View style={styles.meta}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemSubtitle}>
                        {item.episodesCount} Episodes • {item.sizeMb} MB
                      </Text>
                      <View style={styles.offlineBadge}>
                        <CheckCircle2 size={10} color="#075C45" />
                        <Text style={styles.offlineText}>Saved Offline</Text>
                      </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[
                          styles.playButton,
                          isPlayingThis && styles.playButtonActive,
                        ]}
                        onPress={() => handlePlayDownloaded(item)}
                      >
                        {isPlayingThis ? (
                          <Pause size={14} color="#FFFFFF" />
                        ) : (
                          <Play size={14} color="#075C45" fill="#075C45" />
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.moreButton}
                        onPress={() => handleDelete(item.id)}
                      >
                        <Trash2 size={16} color="#8C9A91" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <HardDrive size={40} color="#8C9A91" />
              <Text style={styles.emptyTitle}>No active downloads</Text>
              <Text style={styles.emptySubtitle}>
                When you tap download on an episode, it will appear here.
              </Text>
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Docked Mini Player */}
        <MiniPlayer />

        {/* Bottom Tab Bar */}
        <BottomTabBar activeTab="downloads" onTabChange={onTabChange} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#17251E',
    fontFamily: 'serif',
  },
  searchBtn: {
    padding: 6,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 12,
    backgroundColor: '#E8E2D5',
    borderRadius: 22,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 18,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#075C45',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#68756C',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  list: {
    gap: 12,
  },
  downloadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8E2D5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  thumb: {
    width: 56,
    height: 70,
    borderRadius: 12,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbTamil: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  meta: {
    flex: 1,
    marginLeft: 14,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#17251E',
  },
  itemSubtitle: {
    fontSize: 11,
    color: '#68756C',
    marginTop: 2,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  offlineText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#075C45',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonActive: {
    backgroundColor: '#075C45',
  },
  moreButton: {
    padding: 4,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#17251E',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#8C9A91',
    textAlign: 'center',
    maxWidth: 240,
  },
});
