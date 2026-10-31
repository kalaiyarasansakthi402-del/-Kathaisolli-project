import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';

interface WelcomeScreenProps {
  onExplore?: () => void;
  onLogin?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onExplore, onLogin }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F5E9" />
      <View style={styles.content}>
        {/* Top Logo and Botanical Icon */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🌿</Text>
          </View>
          <Text style={styles.title}>Kathaisolli</Text>
          <Text style={styles.tamilTitle}>கதைசொல்லி</Text>
          <Text style={styles.developerTag}>BY ANZLES · 100% FREE</Text>
        </View>

        {/* Center Tagline */}
        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>Stories for a Brighter Tomorrow</Text>
          <Text style={styles.description}>
            Step into the magical realm of Tamil folktales, inspiring fables, and cultural epics anytime, anywhere.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onExplore}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Explore Stories</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5E9',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#D6A83F',
  },
  logoEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#064E3B',
    letterSpacing: -0.5,
  },
  tamilTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginTop: 2,
  },
  developerTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#166534',
    opacity: 0.7,
    letterSpacing: 1.5,
    marginTop: 6,
  },
  taglineContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  tagline: {
    fontSize: 20,
    fontWeight: '800',
    color: '#173D2E',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#064E3B',
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#064E3B',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#064E3B',
    fontSize: 15,
    fontWeight: '700',
  },
});
