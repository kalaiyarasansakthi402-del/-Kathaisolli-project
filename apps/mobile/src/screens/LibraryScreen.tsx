import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Dimensions,
} from 'react-native';
import {
  ArrowLeft,
  Search,
  Filter,
  Headphones,
  Play,
  X,
} from 'lucide-react-native';
import { BottomTabBar, TabName } from '../components/BottomTabBar';
import { MiniPlayer } from '../components/MiniPlayer';
import {
  COMPLETE_LIBRARY_CATALOG,
  LIBRARY_CATEGORIES,
  LibraryBook,
} from '../data/mobileCatalog';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface LibraryScreenProps {
  onBack: () => void;
  onSelectBook: (book: LibraryBook) => void;
  onTabChange: (tab: TabName) => void;
  initialCategory?: string;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  onBack,
  onSelectBook,
  onTabChange,
  initialCategory = 'All',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>(initialCategory);

  const filteredBooks = useMemo(() => {
    return COMPLETE_LIBRARY_CATALOG.filter((book) => {
      // Category filter
      if (selectedCat === 'Tamil' && book.language !== 'Tamil') return false;
      if (selectedCat === 'English' && book.language !== 'English') return false;
      if (
        selectedCat !== 'All' &&
        selectedCat !== 'Tamil' &&
        selectedCat !== 'English' &&
        book.category !== selectedCat
      ) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          book.title.toLowerCase().includes(q) ||
          book.tamilTitle.toLowerCase().includes(q) ||
          book.authorName.toLowerCase().includes(q) ||
          book.folderName.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [selectedCat, searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <ArrowLeft size={22} color="#17251E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Library</Text>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setSelectedCat('All')}
          >
            <Filter size={18} color="#075C45" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <Search size={18} color="#8C9A91" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search books..."
            placeholderTextColor="#8C9A91"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color="#8C9A91" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Category Pills Bar */}
        <View style={styles.pillsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsScroll}
          >
            {LIBRARY_CATEGORIES.map((cat) => {
              const isActive = selectedCat === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.pill, isActive && styles.activePill]}
                  onPress={() => setSelectedCat(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pillText, isActive && styles.activePillText]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Count Header */}
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            Showing {filteredBooks.length} of {COMPLETE_LIBRARY_CATALOG.length} books
          </Text>
        </View>

        {/* 62-Book Catalog Grid */}
        <ScrollView
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {filteredBooks.map((book) => (
              <TouchableOpacity
                key={book.id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => onSelectBook(book)}
              >
                {/* Book Cover Container */}
                <View
                  style={[
                    styles.cover,
                    {
                      backgroundColor: book.gradient[0],
                    },
                  ]}
                >
                  <Text style={styles.cardCat}>{book.category}</Text>
                  <Text style={styles.cardTamilTitle} numberOfLines={2}>
                    {book.tamilTitle}
                  </Text>
                  <Text style={styles.cardAuthor} numberOfLines={1}>
                    {book.authorName}
                  </Text>
                </View>

                {/* Book Title */}
                <Text style={styles.bookTitle} numberOfLines={1}>
                  {book.title}
                </Text>

                {/* Audio Status */}
                <View style={styles.statusRow}>
                  <Headphones
                    size={12}
                    color={book.audioAvailable ? '#075C45' : '#9EA8A1'}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: book.audioAvailable ? '#075C45' : '#9EA8A1' },
                    ]}
                  >
                    {book.audioAvailable ? 'Audio Available' : 'Audio not available yet'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Docked Mini Player */}
        <MiniPlayer />

        {/* Bottom Tab Bar */}
        <BottomTabBar activeTab="library" onTabChange={onTabChange} />
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
  filterBtn: {
    padding: 6,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E2D5',
    marginHorizontal: 20,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#17251E',
  },
  pillsWrapper: {
    marginBottom: 10,
  },
  pillsScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D5',
  },
  activePill: {
    backgroundColor: '#063F30',
    borderColor: '#063F30',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#68756C',
  },
  activePillText: {
    color: '#FFFFFF',
  },
  countRow: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  countText: {
    fontSize: 11,
    color: '#8C9A91',
    fontWeight: '600',
  },
  gridContent: {
    paddingHorizontal: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  card: {
    width: CARD_WIDTH,
    marginBottom: 6,
  },
  cover: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.3,
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-between',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardCat: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardTamilTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  cardAuthor: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  bookTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#17251E',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
