import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, usePathname } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const TABS: {
  href: '/' | '/catalogue' | '/ludotheque' | '/joueurs' | '/outils' | '/profil';
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
}[] = [
  { href: '/', label: 'Accueil', icon: 'home' },
  { href: '/catalogue', label: 'Catalogue', icon: 'game-controller' },
  { href: '/ludotheque', label: 'Ludothèque', icon: 'albums' },
  { href: '/joueurs', label: 'Joueurs', icon: 'people' },
  { href: '/outils', label: 'Outils', icon: 'dice' },
  { href: '/profil', label: 'Profil', icon: 'person-circle' },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomTabBar() {
  const pathname = usePathname();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={[styles.bar, { paddingBottom: insets.bottom || Spacing.two }]}>
      {TABS.map((tab) => {
        const active = isActive(pathname, tab.href);
        const color = active ? theme.text : theme.textSecondary;
        return (
          <Pressable key={tab.href} style={styles.tab} onPress={() => router.push(tab.href)}>
            <Ionicons name={tab.icon} size={22} color={color} />
            <ThemedText type="small" style={[styles.label, { color }]}>
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.3)',
    paddingTop: Spacing.two,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  label: { fontSize: 11 },
});
