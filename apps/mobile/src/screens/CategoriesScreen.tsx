import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { ArrowLeft, Sparkles, BookOpen, Compass, Flame, Heart, Atom, User, MoreHorizontal } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface CategoriesScreenProps {
  onBack: () => void;
  onSelectCategory: (categoryName: string) => void;
}

const CATEGORY_ITEMS = [
  {
    name: 'Mythology',
    tamilName: 'புராணம் & இதிகாசம்',
    count: '120+ Stories',
    icon: Sparkles,
    color: '#D97706',
    bgColor: '#FEF3C7',
    gradient: ['#78350F', '#B45309'],
  },
  {
    name: 'History',
    tamilName: 'வரலாறு',
    count: '80+ Stories',
    icon: BookOpen,
    color: '#0F766E',
    bgColor: '#CCFBF1',
    gradient: ['#134E4A', '#0F766E'],
  },
  {
    name: 'Self Help',
    tamilName: 'தன்னம்பிக்கை',
    count: '60+ Stories',
    icon: Compass,
    color: '#15803D',
    bgColor: '#DCFCE7',
    gradient: ['#14532D', '#15803D'],
  },
  {
    name: 'Fiction',
    tamilName: 'புதினம் & இலக்கியம்',
    count: '100+ Stories',
    icon: Flame,
    color: '#9333EA',
    bgColor: '#F3E8FF',
    gradient: ['#581C87', '#7E22CE'],
  },
  {
    name: 'Spirituality',
    tamilName: 'ஆன்மீகம்',
    count: '70+ Stories',
    icon: Heart,
    color: '#BE123C',
    bgColor: '#FFE4E6',
    gradient: ['#881337', '#BE123C'],
  },
  {
    name: 'Science',
    tamilName: 'அறிவியல் புனைவு',
    count: '30+ Stories',
    icon: Atom,
    color: '#0284C7',
    bgColor: '#E0F2FE',
    gradient: ['#075985', '#0284C7'],
  },
  {
    name: 'Biography',
    tamilName: 'வாழ்க்கை வரலாறு',
    count: '50+ Stories',
    icon: User,
    color: '#4338CA',
    bgColor: '#E0E7FF',
    gradient: ['#312E81', '#4338CA'],
  },
  {
    name: 'Others',
    tamilName: 'மற்றவை',
    count: '40+ Stories',
    icon: MoreHorizontal,
    color: '#4B5563',
    bgColor: '#F3F4F6',
    gradient: ['#1F2937', '#374151'],
  },
];

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({
  onBack,
  onSelectCategory,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <ArrowLeft size={22} color="#17251E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Categories</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* 2-Column Categories Grid */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {CATEGORY_ITEMS.map((item) => {
              const IconComp = item.icon;
              return (
                <TouchableOpacity
                  key={item.name}
                  style={styles.card}
                  activeOpacity={0.85}
                  onPress={() => onSelectCategory(item.name)}
                >
                  <View
                    style={[
                      styles.cardArt,
                      {
                        backgroundColor: item.gradient[0],
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.iconBadge,
                        {
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        },
                      ]}
                    >
                      <IconComp size={24} color="#FFFFFF" />
                    </View>

                    <View>
                      <Text style={styles.cardTamil}>{item.tamilName}</Text>
                      <Text style={styles.cardTitle}>{item.name}</Text>
                      <Text style={styles.cardCount}>{item.count}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
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
  cardArt: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.15,
    borderRadius: 20,
    padding: 14,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTamil: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'serif',
    marginTop: 2,
  },
  cardCount: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
    fontWeight: '600',
  },
});
