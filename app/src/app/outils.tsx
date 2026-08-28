import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NavTile } from '@/components/nav-tile';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export default function OutilsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.pageTitle}>
          Outils
        </ThemedText>
        <NavTile
          href="/outils/des"
          icon="dice"
          eyebrow="Pendant la partie"
          label="Lanceur de dés"
          description="Choisis le nombre de dés et lance-les"
          color="ice"
        />
        <NavTile
          href="/outils/score"
          icon="trophy"
          eyebrow="Pendant la partie"
          label="Compteur de points"
          description="Suis les scores des joueurs pendant la partie"
          color="green"
        />
        <NavTile
          href="/outils/souvenirs"
          icon="images"
          eyebrow="Après la partie"
          label="Mes souvenirs"
          description="Garde une trace des événements auxquels tu as participé"
          color="flame"
          shimmer
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.four },
  pageTitle: { fontSize: 32, marginBottom: Spacing.two },
});
