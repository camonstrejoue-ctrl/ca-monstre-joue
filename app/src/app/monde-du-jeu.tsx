import { Stack } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NavTile } from '@/components/nav-tile';
import { Spacing } from '@/constants/theme';

export default function MondeDuJeuScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Le monde du jeu' }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <NavTile
          href="/agenda"
          label="Agenda - Les événements du jeu de société"
          image="assets/categories/jeux-adeux-categorie.JPG"
        />
        <NavTile
          href="/joueurs"
          label="Trouver des joueurs près de chez moi"
          image="assets/categories/jeux-narratifs-categorie.JPG"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: Spacing.four, gap: Spacing.four },
});
