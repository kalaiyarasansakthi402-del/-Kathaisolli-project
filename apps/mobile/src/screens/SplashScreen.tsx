import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { BookOpen } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2400);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <TouchableOpacity activeOpacity={0.95} onPress={onFinish} style={styles.container}>
      {/* Background Glow */}
      <View style={styles.glowBackdrop} />

      {/* Top Header Logo */}
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <BookOpen size={28} color="#D7B45A" strokeWidth={2.5} />
        </View>
        <Text style={styles.brandTitle}>Kathaisolli</Text>
        <Text style={styles.brandSubtitle}>Stories • Knowledge • Life</Text>
      </View>

      {/* Center Temple & Glowing Book Artwork */}
      <View style={styles.artContainer}>
        <Image
          source={require('../../assets/onboarding-2.jpg')}
          style={styles.artImage}
          resizeMode="cover"
        />
        {/* Soft dark vignette */}
        <View style={styles.artOverlay} />
      </View>

      {/* Bottom Branding */}
      <View style={styles.footer}>
        <Text style={styles.byAnzles}>By Anzles</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#063F30',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 48,
  },
  glowBackdrop: {
    position: 'absolute',
    top: height * 0.2,
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    backgroundColor: 'rgba(215, 180, 90, 0.08)',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    zIndex: 10,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(215, 180, 90, 0.15)',
    borderWidth: 1.5,
    borderColor: '#D7B45A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#D7B45A',
    marginTop: 4,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  artContainer: {
    width: width * 0.88,
    height: height * 0.5,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(215, 180, 90, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  artImage: {
    width: '100%',
    height: '100%',
  },
  artOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 63, 48, 0.25)',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 10,
    zIndex: 10,
  },
  byAnzles: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D7B45A',
    letterSpacing: 1,
  },
});
