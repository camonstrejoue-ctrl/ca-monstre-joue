import { Image } from 'expo-image';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentState } from '@/components/content-state';
import { NavTile } from '@/components/nav-tile';
import { ScatteredTags } from '@/components/scattered-tags';
import { Spacing } from '@/constants/theme';
import { useContent } from '@/lib/content';

export default function AccueilScreen() {
  const { content, loading, error, refresh } = useContent();

  if (loading || error || !content) {
    return <ContentState loading={loading} error={error} onRetry={refresh} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          contentFit="contain"
        />

        <ScatteredTags labels={content.categories.slice(0, 6).map((c) => c.name)} />

        <NavTile
          href="/joueurs"
          label="Trouver des joueurs"
          eyebrow="Communauté"
          description="Organise une partie ou un échange près de chez toi"
          icon="people"
          color="ice"
        />
        <NavTile
          href="/agenda"
          label="Agenda"
          eyebrow="Ne rate rien"
          description="Festivals, tournois, soirées jeux..."
          icon="calendar"
          color="green"
        />
        <NavTile
          href="/catalogue"
          label="Le blog"
          eyebrow="À lire"
          description="Toutes nos fiches jeux et critiques"
          icon="newspaper"
          color="cream"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: Spacing.four, gap: Spacing.four },
  logo: {
    width: '112.5%',
    aspectRatio: 971 / 489,
    alignSelf: 'center',
    marginBottom: Spacing.two,
  },
});
