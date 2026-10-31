import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { ArrowRight, ArrowLeft } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface OnboardingScreen2Props {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export const OnboardingScreen2: React.FC<OnboardingScreen2Props> = ({
  onNext,
  onBack,
  onSkip,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Back and Skip Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={20} color="#D7B45A" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Title & Subtitle */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>A World of{'\n'}Knowledge</Text>
          <Text style={styles.subtitle}>
            Mythology, History, Self Help, Fiction and more.
          </Text>
        </View>

        {/* Illustrated Artwork */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/onboarding-2.jpg')}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Bottom Pagination & Next Button */}
        <View style={styles.bottomBar}>
          {/* 3-Dot Pagination */}
          <View style={styles.paginationDots}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
          </View>

          {/* Continue / Next Button */}
          <TouchableOpacity style={styles.nextButton} onPress={onNext} activeOpacity={0.8}>
            <ArrowRight size={22} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#063F30',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  },
  backButton: {
    padding: 6,
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skipText: {
    color: '#D7B45A',
    fontSize: 14,
    fontWeight: '700',
  },
  textContainer: {
    marginTop: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'serif',
    lineHeight: 40,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 10,
    lineHeight: 20,
    maxWidth: width * 0.8,
  },
  imageContainer: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(215, 180, 90, 0.25)',
    marginVertical: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  paginationDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeDot: {
    width: 24,
    backgroundColor: '#D7B45A',
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#075C45',
    borderWidth: 2,
    borderColor: '#D7B45A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
