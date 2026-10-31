import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { ArrowLeft, Heart, Play, Headphones } from 'lucide-react-native';
import { COMPLETE_LIBRARY_CATALOG, LibraryBook } from '../data/mobileCatalog';

interface FavoritesScreenProps {
  onBack: () => void;
  onSelectBook: (book: LibraryBook) => void;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  onBack,
  onSelectBook,
}) => {
  // Find the exact favorite books from reference Screen 12
  const kannagi = COMPLETE_LIBRARY_CATALOG.find((b) => b.title === 'Kannagi') || COMPLETE_LIBRARY_CATALOG[19];
  const silappathikaram = COMPLETE_LIBRARY_CATALOG.find((b) => b.title === 'Silappathikaram') || COMPLETE_LIBRARY_CATALOG[42];
  const richDad = COMPLETE_LIBRARY_CATALOG.find((b) => b.title.includes('Rich Dad')) || COMPLETE_LIBRARY_CATALOG[38];
  const secretNagas = COMPLETE_LIBRARY_CATALOG.find((b) => b.title.includes('Secret of the Nagas')) || COMPLETE_LIBRARY_CATALOG[49];

  const [favorites, setFavorites] = useState([
    { book: kannagi, episodesCount: 12 },
    { book: silappathikaram, episodesCount: 18 },
    { book: richDad, episodesCount: 15 },
    { book: secretNagas, episodesCount: 10 },
  ]);

  const handleRemove = (id: string) => {
    setFavorites(favorites.filter((f) => f.book.id !== id));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <ArrowLeft size={22} color="#17251E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Favorites</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Favorites List */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.list}>
            {favorites.map(({ book, episodesCount }) => (
              <TouchableOpacity
                key={book.id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => onSelectBook(book)}
              >
                {/* Book Cover */}
                <View
                  style={[
                    styles.cover,
                    {
                      backgroundColor: book.gradient[0],
                    },
                  ]}
                >
                  <Text style={styles.coverTamil} numberOfLines={2}>
                    {book.tamilTitle}
                  </Text>
                </View>

                {/* Metadata */}
                <View style={styles.meta}>
                  <Text style={styles.title}>{book.title}</Text>
                  <Text style={styles.subtitle}>{episodesCount} Episodes</Text>
                  <Text style={styles.category}>{book.category} • {book.language}</Text>
                </View>

                {/* Heart Button */}
                <TouchableOpacity
                  style={styles.heartBtn}
                  onPress={() => handleRemove(book.id)}
                >
                  <Heart size={20} color="#DC2626" fill="#DC2626" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
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
    fontSize: 20,
    fontWeight: '900',
    color: '#17251E',
    fontFamily: 'serif',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  list: {
    gap: 12,
  },
  card: {
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
  cover: {
    width: 60,
    height: 76,
    borderRadius: 12,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverTamil: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  meta: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#17251E',
  },
  subtitle: {
    fontSize: 12,
    color: '#68756C',
    marginTop: 2,
  },
  category: {
    fontSize: 10,
    color: '#8C9A91',
    marginTop: 2,
  },
  heartBtn: {
    padding: 8,
  },
});
