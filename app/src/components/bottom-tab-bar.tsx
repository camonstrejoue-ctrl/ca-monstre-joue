import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TabHref = '/' | '/mon-univers' | '/agenda' | '/outils';

const TABS: {
  href: TabHref;
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  // Autres routes qui doivent aussi surligner cet onglet.
  matchAlso?: string[];
}[] = [
  { href: '/', label: 'Accueil', icon: 'home' },
  { href: '/mon-univers', label: 'Mon univers', icon: 'planet', matchAlso: ['/ludotheque', '/outils/souvenirs'] },
  { href: '/agenda', label: 'Agenda', icon: 'calendar' },
  { href: '/outils', label: 'Outils', icon: 'dice' },
];

const MENU_ITEMS: {
  href: '/catalogue' | '/joueurs' | '/profil';
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
}[] = [
  { href: '/catalogue', label: 'Blog', icon: 'newspaper' },
  { href: '/joueurs', label: 'Joueurs', icon: 'people' },
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
  const [menuOpen, setMenuOpen] = useState(false);

  const menuActive = MENU_ITEMS.some((item) => isActive(pathname, item.href));

  return (
    <>
      <ThemedView style={[styles.bar, { paddingBottom: insets.bottom || Spacing.two }]}>
        {TABS.map((tab) => {
          const active = isActive(pathname, tab.href) || tab.matchAlso?.some((h) => isActive(pathname, h));
          const color = active ? theme.text : theme.textSecondary;
          return (
            <Pressable key={tab.href} style={styles.tab} onPress={() => router.push(tab.href)}>
              <Ionicons name={tab.icon} size={20} color={color} />
              <ThemedText type="small" style={[styles.label, { color }]} numberOfLines={1}>
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
        <Pressable style={styles.tab} onPress={() => setMenuOpen(true)}>
          <Ionicons name="menu" size={20} color={menuActive ? theme.text : theme.textSecondary} />
          <ThemedText
            type="small"
            style={[styles.label, { color: menuActive ? theme.text : theme.textSecondary }]}
            numberOfLines={1}>
            Plus
          </ThemedText>
        </Pressable>
      </ThemedView>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
          <ThemedView
            style={[styles.sheet, { paddingBottom: (insets.bottom || Spacing.two) + Spacing.three }]}>
            {MENU_ITEMS.map((item) => (
              <Pressable
                key={item.href}
                style={styles.menuRow}
                onPress={() => {
                  setMenuOpen(false);
                  router.push(item.href);
                }}>
                <Ionicons name={item.icon} size={22} color={theme.text} />
                <ThemedText type="smallBold">{item.label}</ThemedText>
              </Pressable>
            ))}
          </ThemedView>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.3)',
    paddingTop: Spacing.two,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2, paddingHorizontal: 2 },
  label: { fontSize: 9.5 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,26,26,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    borderWidth: 3,
    borderColor: Brand.black,
    borderBottomWidth: 0,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
});
