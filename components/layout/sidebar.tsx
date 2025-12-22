import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { usePathname, router } from 'expo-router';
import { Drawer } from '../ui/Drawer';

// Sidebar dimensions will be handled by Drawer component

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
}

interface SidebarItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  isActive?: boolean;
}

function SidebarItem({ icon, label, onPress, isActive }: SidebarItemProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      style={[
        styles.sidebarItem,
        {
          backgroundColor: isActive ? theme.primary + '20' : 'transparent',
        },
      ]}
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      <Ionicons
        name={icon}
        size={24}
        color={isActive ? theme.primary : theme.textSecondary}
      />
      <Text
        style={[
          styles.sidebarItemText,
          {
            color: isActive ? theme.primary : theme.textPrimary,
            fontWeight: isActive ? '600' : '400',
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function Sidebar({ isVisible, onClose }: SidebarProps) {
  const { theme } = useTheme();
  const pathname = usePathname();

  const navigationItems = [
    {
      icon: 'home' as const,
      label: 'Home',
      route: '/(tabs)',
      isActive: pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index',
    },
    {
      icon: 'apps' as const,
      label: 'UI Components',
      route: '/(tabs)/showcase',
      isActive: pathname === '/(tabs)/showcase' || pathname === '/showcase',
    },
    {
      icon: 'camera' as const,
      label: 'Camera Test',
      route: '/(tabs)/camera-test',
      isActive: pathname === '/(tabs)/camera-test' || pathname === '/camera-test',
    },
    {
      icon: 'library' as const,
      label: 'Media Library',
      route: '/(tabs)/media-library',
      isActive: pathname === '/(tabs)/media-library' || pathname === '/media-library',
    },
    {
      icon: 'person' as const,
      label: 'Profile',
      route: '/(tabs)/profile',
      isActive: pathname === '/(tabs)/profile' || pathname === '/profile',
    },
    {
      icon: 'settings' as const,
      label: 'Settings',
      route: '/(tabs)/settings',
      isActive: pathname === '/(tabs)/settings' || pathname === '/settings',
    },
    {
      icon: 'help-circle' as const,
      label: 'Help & Support',
      route: '/(tabs)/help',
      isActive: pathname === '/(tabs)/help' || pathname === '/help',
    },
  ];

  const handleNavigation = (route: string) => {
    router.push(route as any);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Drawer
      visible={isVisible}
      onClose={handleClose}
      position="left"
      size="lg"
    >
      {/* Header */}
      <View style={styles.sidebarHeader}>
        <View style={styles.logoContainer}>
          <Ionicons name="logo-react" size={32} color={theme.primary} />
          <Text style={[styles.logoText, { color: theme.primary }]}>
            Apex Mobile
          </Text>
        </View>
        <Pressable
          style={[styles.closeButton]}
          onPress={handleClose}
          accessibilityLabel="Close sidebar"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={24} color={theme.textSecondary} />
        </Pressable>
      </View>

      {/* Navigation Items */}
      <ScrollView style={styles.navigationContainer} showsVerticalScrollIndicator={false}>
        {navigationItems.map((item, index) => (
          <SidebarItem
            key={index}
            icon={item.icon}
            label={item.label}
            onPress={() => handleNavigation(item.route)}
            isActive={item.isActive}
          />
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.sidebarFooter, { borderTopColor: theme.borderPrimary }]}>
        <Text style={[styles.versionText, { color: theme.textTertiary }]}>
          Version 1.0.0
        </Text>
      </View>
    </Drawer>
  );
}

const styles = StyleSheet.create({
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationContainer: {
    flex: 1,
    paddingVertical: 8,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 12,
  },
  sidebarItemText: {
    fontSize: 16,
    marginLeft: 16,
  },
  sidebarFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
  },
});
