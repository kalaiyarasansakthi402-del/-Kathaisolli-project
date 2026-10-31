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
import {
  ArrowLeft,
  Heart,
  Clock,
  Download,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import { BottomTabBar, TabName } from '../components/BottomTabBar';
import { MiniPlayer } from '../components/MiniPlayer';
import { useMobileAuth } from '../context/MobileAuthContext';

interface ProfileScreenProps {
  onBack: () => void;
  onTabChange: (tab: TabName) => void;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onBack,
  onTabChange,
  onNavigate,
  onLogout,
}) => {
  const { user } = useMobileAuth();

  const menuItems = [
    {
      id: 'favorites',
      label: 'My Favorites',
      icon: Heart,
      action: () => onNavigate('favorites'),
    },
    {
      id: 'history',
      label: 'Listening History',
      icon: Clock,
      action: () => alert('Listening History: 14 Tamil stories listened this month.'),
    },
    {
      id: 'downloads',
      label: 'Downloads',
      icon: Download,
      action: () => onTabChange('downloads'),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      action: () => alert('No new notifications. You are up to date!'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      action: () => onNavigate('settings'),
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      action: () => alert('Support contact: support@kathaisolli.com'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <ArrowLeft size={22} color="#17251E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* User Profile Card */}
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.displayName ? user.displayName[0].toUpperCase() : 'K'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.displayName || 'Kalai'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'kalai@example.com'}</Text>
            </View>
          </View>

          {/* Go Premium Gold Banner */}
          <TouchableOpacity
            style={styles.premiumBanner}
            activeOpacity={0.85}
            onPress={() => alert('Kathaisolli is 100% free by Anzles! All stories, downloads, and audio are completely unlocked.')}
          >
            <View style={styles.premiumLeft}>
              <View style={styles.premiumIconBadge}>
                <Sparkles size={20} color="#D7B45A" />
              </View>
              <View style={styles.premiumTextWrapper}>
                <Text style={styles.premiumTitle}>Go Premium</Text>
                <Text style={styles.premiumSubtitle}>
                  Unlock offline downloads, more stories and exclusive content.
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#D7B45A" />
          </TouchableOpacity>

          {/* Menu Items List */}
          <View style={styles.menuContainer}>
            {menuItems.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuRow,
                    idx < menuItems.length - 1 && styles.menuRowBorder,
                  ]}
                  activeOpacity={0.7}
                  onPress={item.action}
                >
                  <View style={styles.menuLeft}>
                    <IconComp size={20} color="#075C45" />
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  <ChevronRight size={18} color="#8C9A91" />
                </TouchableOpacity>
              );
            })}

            {/* Logout Row */}
            <TouchableOpacity
              style={[styles.menuRow, styles.logoutRow]}
              activeOpacity={0.7}
              onPress={onLogout}
            >
              <View style={styles.menuLeft}>
                <LogOut size={20} color="#DC2626" />
                <Text style={styles.logoutLabel}>Logout</Text>
              </View>
              <ChevronRight size={18} color="#DC2626" />
            </TouchableOpacity>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Docked Mini Player */}
        <MiniPlayer />

        {/* Bottom Tab Bar */}
        <BottomTabBar activeTab="profile" onTabChange={onTabChange} />
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
    paddingTop: 10,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E2D5',
    marginBottom: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#075C45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  userInfo: {
    marginLeft: 14,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#17251E',
  },
  userEmail: {
    fontSize: 12,
    color: '#68756C',
    marginTop: 2,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#063F30',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#D7B45A',
  },
  premiumLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  premiumIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(215, 180, 90, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumTextWrapper: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#D7B45A',
  },
  premiumSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    lineHeight: 15,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E8E2D5',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE1',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#17251E',
  },
  logoutRow: {
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
    marginTop: 4,
  },
  logoutLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
});
