import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TabHref = '/' | '/ludotheque' | '/joueurs' | '/outils' | '/profil';

// Cinq destinations directes, à plat — plus de sous-menu "Mon univers" à
// traverser pour la ludothèque : chaque onglet mène droit à sa
// destination, en 1 tap partout.
const TABS: {
  href: TabHref;
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  matchAlso?: string[];
}[] = [
  { href: '/', label: 'Accueil', icon: 'home' },
  { href: '/ludotheque', label: 'Ludothèque', icon: 'library' },
  { href: '/joueurs', label: 'Joueurs', icon: 'people' },
  { href: '/outils', label: 'Outils', icon: 'dice', matchAlso: ['/outils/souvenirs'] },
  { href: '/profil', label: 'Profil', icon: 'person-circle' },
];

const MENU_ITEMS: {
  href: '/catalogue' | '/agenda';
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
}[] = [
  { href: '/agenda', label: 'Agenda', icon: 'calendar' },
  { href: '/catalogue', label: 'Blog', icon: 'newspaper' },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Barre flottante en pilule noire, icônes seules — idée empruntée à une
// référence de design partagée par l'utilisateur (nav du bas en pilule
// sombre flottante). Reste en flux normal (pas de position absolute) :
// simplement une bordure/marge tout autour qui laisse voir le fond crème
// de la page, donnant l'effet "flottant" sans devoir ajouter du padding
// bas partout ailleurs dans l'app.
export function BottomTabBar() {
  const pathname = usePathname();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);

  const menuActive = MENU_ITEMS.some((item) => isActive(pathname, item.href));

  return (
    <>
      <View style={[styles.wrap, { paddingBottom: insets.bottom || Spacing.two }]}>
        <View style={styles.pill}>
          {TABS.map((tab) => {
            const active = isActive(pathname, tab.href) || tab.matchAlso?.some((h) => isActive(pathname, h));
            return (
              <Pressable
                key={tab.href}
                style={styles.tab}
                onPress={() => router.push(tab.href)}
                accessibilityLabel={tab.label}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}>
                <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                  <Ionicons
                    name={tab.icon}
                    size={20}
                    color={active ? Brand.black : 'rgba(255,255,255,0.6)'}
                  />
                </View>
              </Pressable>
            );
          })}
          <Pressable
            style={styles.tab}
            onPress={() => setMenuOpen(true)}
            accessibilityLabel="Plus"
            accessibilityRole="button">
            <View style={[styles.iconWrap, menuActive && styles.iconWrapActive]}>
              <Ionicons
                name="menu"
                size={20}
                color={menuActive ? Brand.black : 'rgba(255,255,255,0.6)'}
              />
            </View>
          </Pressable>
        </View>
      </View>

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
  wrap: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two },
  pill: {
    flexDirection: 'row',
    backgroundColor: Brand.black,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 6,
    ...Platform.select({
      web: { boxShadow: '0 10px 24px rgba(26,26,26,0.35)' },
      default: {
        shadowColor: '#1A1A1A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: Brand.coral },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,26,26,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
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
