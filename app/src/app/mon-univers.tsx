import { Stack } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NavTile } from '@/components/nav-tile';
import { Spacing } from '@/constants/theme';

export default function MonUniversScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Mon univers' }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <NavTile
          href="/ludotheque"
          label="Ma ludothèque"
          image="assets/categories/jeux-dambiance-categorie.jpg"
        />
        <NavTile
          href="/outils/souvenirs"
          label="Mes souvenirs"
          image="assets/categories/jeux-strategie-categorie.JPG"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: Spacing.four, gap: Spacing.four },
});
