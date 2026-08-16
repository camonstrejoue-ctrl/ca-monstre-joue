import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StickerBox } from '@/components/sticker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

function ToolCard({
  href,
  icon,
  title,
  description,
}: {
  href: '/outils/des' | '/outils/score';
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
}) {
  const theme = useTheme();
  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [pressed && styles.pressed]}>
        <StickerBox backgroundColor={Brand.white} radius={Radius.md}>
          <View style={styles.cardInner}>
            <Ionicons name={icon} size={32} color={theme.text} />
            <View style={styles.cardText}>
              <ThemedText type="smallBold">{title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {description}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </View>
        </StickerBox>
      </Pressable>
    </Link>
  );
}

export default function OutilsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.pageTitle}>
          Outils
        </ThemedText>
        <ToolCard
          href="/outils/des"
          icon="dice"
          title="Lanceur de dés"
          description="Choisis le nombre de dés et lance-les"
        />
        <ToolCard
          href="/outils/score"
          icon="trophy"
          title="Compteur de points"
          description="Suis les scores des joueurs pendant la partie"
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.four },
  pageTitle: { fontSize: 32, marginBottom: Spacing.two },
  pressed: { opacity: 0.85 },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  cardText: { flex: 1, gap: 2 },
});
