import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import {
  ArrowLeft,
  Sun,
  Moon,
  Smartphone,
  ChevronRight,
  CheckCircle2,
  Trash2,
  Info,
} from 'lucide-react-native';

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [wifiOnly, setWifiOnly] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [skipForwardSec, setSkipForwardSec] = useState(10);
  const [skipBackwardSec, setSkipBackwardSec] = useState(10);
  const [cacheSize, setCacheSize] = useState('24 MB');

  const handleClearCache = () => {
    setCacheSize('0 KB');
    alert('Cache cleared successfully!');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <ArrowLeft size={22} color="#17251E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Theme Selection Section */}
          <Text style={styles.sectionTitle}>Theme</Text>
          <View style={styles.themeRow}>
            {/* Light */}
            <TouchableOpacity
              style={[styles.themeBox, theme === 'light' && styles.themeBoxActive]}
              onPress={() => setTheme('light')}
              activeOpacity={0.8}
            >
              <Sun size={20} color={theme === 'light' ? '#075C45' : '#8C9A91'} />
              <Text style={[styles.themeLabel, theme === 'light' && styles.themeLabelActive]}>
                Light
              </Text>
            </TouchableOpacity>

            {/* Dark */}
            <TouchableOpacity
              style={[styles.themeBox, theme === 'dark' && styles.themeBoxActive]}
              onPress={() => setTheme('dark')}
              activeOpacity={0.8}
            >
              <Moon size={20} color={theme === 'dark' ? '#075C45' : '#8C9A91'} />
              <Text style={[styles.themeLabel, theme === 'dark' && styles.themeLabelActive]}>
                Dark
              </Text>
            </TouchableOpacity>

            {/* System */}
            <TouchableOpacity
              style={[styles.themeBox, theme === 'system' && styles.themeBoxActive]}
              onPress={() => setTheme('system')}
              activeOpacity={0.8}
            >
              <Smartphone size={20} color={theme === 'system' ? '#075C45' : '#8C9A91'} />
              <Text style={[styles.themeLabel, theme === 'system' && styles.themeLabelActive]}>
                System
              </Text>
              {theme === 'system' && (
                <View style={styles.themeCheck}>
                  <CheckCircle2 size={12} color="#075C45" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Preferences Group */}
          <View style={styles.cardGroup}>
            {/* Audio Quality */}
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Audio Quality</Text>
                <Text style={styles.settingSub}>Auto (Recommended)</Text>
              </View>
              <ChevronRight size={18} color="#8C9A91" />
            </View>

            {/* Download over Wi-Fi only */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Download over Wi-Fi only</Text>
              <Switch
                value={wifiOnly}
                onValueChange={setWifiOnly}
                trackColor={{ false: '#E2DBD0', true: '#075C45' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Auto-play next episode */}
            <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.settingLabel}>Auto-play next episode</Text>
              <Switch
                value={autoPlay}
                onValueChange={setAutoPlay}
                trackColor={{ false: '#E2DBD0', true: '#075C45' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Playback Settings Group */}
          <View style={styles.cardGroup}>
            {/* Skip forward */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setSkipForwardSec(skipForwardSec === 10 ? 15 : 10)}
            >
              <Text style={styles.settingLabel}>Skip forward</Text>
              <View style={styles.rowRight}>
                <Text style={styles.settingValue}>{skipForwardSec} seconds</Text>
                <ChevronRight size={18} color="#8C9A91" />
              </View>
            </TouchableOpacity>

            {/* Skip backward */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setSkipBackwardSec(skipBackwardSec === 10 ? 15 : 10)}
            >
              <Text style={styles.settingLabel}>Skip backward</Text>
              <View style={styles.rowRight}>
                <Text style={styles.settingValue}>{skipBackwardSec} seconds</Text>
                <ChevronRight size={18} color="#8C9A91" />
              </View>
            </TouchableOpacity>

            {/* Language */}
            <TouchableOpacity
              style={[styles.settingRow, { borderBottomWidth: 0 }]}
              onPress={() => alert('Language selection: English & Tamil supported')}
            >
              <Text style={styles.settingLabel}>Language</Text>
              <View style={styles.rowRight}>
                <Text style={styles.settingValue}>English</Text>
                <ChevronRight size={18} color="#8C9A91" />
              </View>
            </TouchableOpacity>
          </View>

          {/* App Info & Cache Group */}
          <View style={styles.cardGroup}>
            {/* Clear Cache */}
            <TouchableOpacity style={styles.settingRow} onPress={handleClearCache}>
              <Text style={styles.settingLabel}>Clear Cache</Text>
              <View style={styles.rowRight}>
                <Text style={styles.settingValue}>{cacheSize}</Text>
                <ChevronRight size={18} color="#8C9A91" />
              </View>
            </TouchableOpacity>

            {/* About Kathaisolli */}
            <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.settingLabel}>About Kathaisolli</Text>
              <Text style={styles.settingValue}>v1.0.0</Text>
            </View>
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
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#17251E',
    marginBottom: 10,
    marginTop: 6,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  themeBox: {
    flex: 1,
    height: 72,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E8E2D5',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    position: 'relative',
  },
  themeBoxActive: {
    borderColor: '#075C45',
    backgroundColor: '#E8F5EE',
  },
  themeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#68756C',
  },
  themeLabelActive: {
    color: '#075C45',
    fontWeight: '800',
  },
  themeCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  cardGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E8E2D5',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE1',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#17251E',
  },
  settingSub: {
    fontSize: 11,
    color: '#8C9A91',
    marginTop: 2,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingValue: {
    fontSize: 13,
    color: '#68756C',
    fontWeight: '600',
  },
});
