import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Headphones, Sparkles } from 'lucide-react-native';

export const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 1500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Headphones size={44} color="#A7F3D0" />
      </View>

      <Text style={styles.title}>கதைசொல்லி</Text>
      <Text style={styles.tagline}>ஒவ்வொரு கதைக்கும் ஒரு குரல்</Text>

      <View style={styles.freeBadge}>
        <Sparkles size={12} color="#A7F3D0" />
        <Text style={styles.freeText}>100% இலவச ஆடியோ தளம்</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#022C22',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#059669',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: '#A7F3D0',
    marginTop: 6,
    fontWeight: '500',
  },
  freeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(2, 44, 34, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 32,
    borderWidth: 1,
    borderColor: '#059669',
  },
  freeText: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '700',
  },
});
