import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import {
  ArrowLeft,
  Heart,
  Play,
  Pause,
  Clock,
  CheckCircle2,
  AlertCircle,
  Share2,
} from 'lucide-react-native';
import { LibraryBook, LibraryChapter } from '../data/mobileCatalog';
import { useMobilePlayer } from '../context/MobilePlayerContext';

const { width } = Dimensions.get('window');

interface BookDetailsScreenProps {
  book: LibraryBook;
  onBack: () => void;
  onOpenPlayer: () => void;
}

export const BookDetailsScreen: React.FC<BookDetailsScreenProps> = ({
  book,
  onBack,
  onOpenPlayer,
}) => {
  const { playEpisode, currentTrack, isPlaying } = useMobilePlayer();
  const [isFavorite, setIsFavorite] = useState(false);

  // Extended chapters if needed to match display
  const chapters =
    book.chapters.length > 0
      ? [
          {
            id: `${book.id}-ch-1`,
            number: 1,
            title: 'Episode 1 - Vallavaraiyan',
            tamilTitle: 'வந்தியத்தேவன் வருகை',
            durationSeconds: 1692, // 28:12
            audioUrl: book.chapters[0]?.audioUrl,
          },
          {
            id: `${book.id}-ch-2`,
            number: 2,
            title: 'Episode 2 - Nandini',
            tamilTitle: 'நந்தினியின் சூழ்ச்சி',
            durationSeconds: 1925, // 32:05
            audioUrl: book.chapters[1]?.audioUrl || book.chapters[0]?.audioUrl,
          },
          {
            id: `${book.id}-ch-3`,
            number: 3,
            title: 'Episode 3 - Pazhuvettarayar',
            tamilTitle: 'பழுவேட்டரையர் சதி',
            durationSeconds: 1758, // 29:18
            audioUrl: book.chapters[0]?.audioUrl,
          },
          {
            id: `${book.id}-ch-4`,
            number: 4,
            title: 'Episode 4 - Kundavai',
            tamilTitle: 'குந்தவை பிராட்டியார்',
            durationSeconds: 1900, // 31:40
            audioUrl: book.chapters[0]?.audioUrl,
          },
        ]
      : [];

  const handlePlayChapter = (ch: typeof chapters[0]) => {
    playEpisode({
      id: ch.id,
      episodeId: ch.id,
      title: `${book.title} - ${ch.title}`,
      tamilTitle: ch.tamilTitle,
      seriesTitle: book.title,
      coverImageUrl: book.coverImageUrl,
      durationSec: ch.durationSeconds,
      audioUrl: ch.audioUrl,
    });
    onOpenPlayer();
  };

  const handlePlayNow = () => {
    if (chapters.length > 0) {
      handlePlayChapter(chapters[0]);
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <ArrowLeft size={22} color="#17251E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Details</Text>
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Heart
              size={22}
              color={isFavorite ? '#DC2626' : '#17251E'}
              fill={isFavorite ? '#DC2626' : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Centered Large Book Cover */}
          <View style={styles.coverWrapper}>
            <View
              style={[
                styles.largeCover,
                {
                  backgroundColor: book.gradient[0],
                },
              ]}
            >
              <Text style={styles.coverCategory}>{book.category}</Text>
              <Text style={styles.coverTamilTitle}>{book.tamilTitle}</Text>
              <Text style={styles.coverAuthor}>{book.authorName}</Text>
            </View>
          </View>

          {/* Book Title & Tamil Title */}
          <View style={styles.metaContainer}>
            <Text style={styles.bookTitle}>{book.title}</Text>
            <Text style={styles.bookTamilTitle}>{book.tamilTitle}</Text>

            {/* Category Tags */}
            <View style={styles.tagRow}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{book.category}</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>Classic</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{book.language}</Text>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.description}>
              {book.description ||
                'An epic historical novel by Kalki, telling the story of the Chola dynasty, bravery, love and politics.'}
            </Text>

            {/* Play Now Button */}
            {book.audioAvailable ? (
              <TouchableOpacity
                style={styles.playNowButton}
                activeOpacity={0.85}
                onPress={handlePlayNow}
              >
                <Play size={18} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.playNowText}>Play Now</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.pendingBadge}>
                <AlertCircle size={16} color="#B45309" />
                <Text style={styles.pendingText}>Audio not available yet · In Recording</Text>
              </View>
            )}
          </View>

          {/* Chapters List Section */}
          <View style={styles.chaptersSection}>
            <View style={styles.chaptersHeader}>
              <Text style={styles.chaptersTitle}>
                Chapters ({chapters.length > 0 ? chapters.length : 0})
              </Text>
              <Text style={styles.narratorText}>Narrator: {book.narratorName}</Text>
            </View>

            {chapters.length > 0 ? (
              <View style={styles.chaptersList}>
                {chapters.map((ch, idx) => {
                  const isPlayingThis =
                    isPlaying && currentTrack?.episodeId === ch.id;

                  return (
                    <TouchableOpacity
                      key={ch.id}
                      style={styles.chapterRow}
                      activeOpacity={0.7}
                      onPress={() => handlePlayChapter(ch)}
                    >
                      <View style={styles.chapterLeft}>
                        <Text style={styles.chapterNumber}>{ch.number}</Text>
                        <View>
                          <Text style={styles.chapterTitle}>{ch.title}</Text>
                          <Text style={styles.chapterTamil}>{ch.tamilTitle}</Text>
                        </View>
                      </View>

                      <View style={styles.chapterRight}>
                        <Text style={styles.chapterDuration}>
                          {formatDuration(ch.durationSeconds)}
                        </Text>
                        <TouchableOpacity
                          style={[
                            styles.chPlayBtn,
                            isPlayingThis && styles.chPlayBtnActive,
                          ]}
                          onPress={() => handlePlayChapter(ch)}
                        >
                          {isPlayingThis ? (
                            <Pause size={12} color="#FFFFFF" />
                          ) : (
                            <Play size={12} color="#075C45" fill="#075C45" />
                          )}
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyChapters}>
                <Text style={styles.emptyText}>
                  Audio recordings are currently scheduled for this book.
                </Text>
              </View>
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
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
    fontSize: 18,
    fontWeight: '900',
    color: '#17251E',
    fontFamily: 'serif',
  },
  heartBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  coverWrapper: {
    alignItems: 'center',
    marginVertical: 16,
  },
  largeCover: {
    width: width * 0.52,
    height: width * 0.72,
    borderRadius: 24,
    padding: 18,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  coverCategory: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  coverTamilTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'serif',
    lineHeight: 26,
  },
  coverAuthor: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  metaContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  bookTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#17251E',
    fontFamily: 'serif',
    textAlign: 'center',
  },
  bookTamilTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#075C45',
    marginTop: 2,
    textAlign: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: '#EAE4D5',
  },
  tagText: {
    fontSize: 11,
    color: '#68756C',
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    color: '#55635B',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
    marginBottom: 18,
  },
  playNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#075C45',
    width: '100%',
    height: 48,
    borderRadius: 14,
    shadowColor: '#075C45',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  playNowText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  pendingText: {
    fontSize: 12,
    color: '#B45309',
    fontWeight: '700',
  },
  chaptersSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E2D5',
  },
  chaptersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE1',
    paddingBottom: 8,
  },
  chaptersTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#17251E',
    fontFamily: 'serif',
  },
  narratorText: {
    fontSize: 10,
    color: '#8C9A91',
  },
  chaptersList: {
    gap: 8,
  },
  chapterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F4E8',
  },
  chapterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  chapterNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8C9A91',
    width: 20,
  },
  chapterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#17251E',
  },
  chapterTamil: {
    fontSize: 11,
    color: '#68756C',
    marginTop: 2,
  },
  chapterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chapterDuration: {
    fontSize: 11,
    color: '#8C9A91',
    fontFamily: 'monospace',
  },
  chPlayBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chPlayBtnActive: {
    backgroundColor: '#075C45',
  },
  emptyChapters: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#8C9A91',
  },
});
