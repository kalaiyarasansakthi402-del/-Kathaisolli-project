import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Home, BookOpen, Download, User } from 'lucide-react-native';

export type TabName = 'home' | 'library' | 'downloads' | 'profile';

interface BottomTabBarProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home' as TabName, label: 'Home', icon: Home },
    { id: 'library' as TabName, label: 'Library', icon: BookOpen },
    { id: 'downloads' as TabName, label: 'Downloads', icon: Download },
    { id: 'profile' as TabName, label: 'Profile', icon: User },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const IconComponent = tab.icon;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => onTabChange(tab.id)}
          >
            <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
              <IconComponent
                size={22}
                color={isActive ? '#075C45' : '#8C9A91'}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </View>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 76 : 64,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EBE5D8',
    paddingBottom: Platform.OS === 'ios' ? 16 : 6,
    paddingTop: 6,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 36,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  activeIconWrapper: {
    backgroundColor: '#E8F5EE',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8C9A91',
    marginTop: 2,
  },
  activeLabel: {
    color: '#075C45',
    fontWeight: '800',
  },
});
