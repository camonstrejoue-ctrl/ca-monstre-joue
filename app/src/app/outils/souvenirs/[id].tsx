import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { deleteMemory, listMemories, type Memory } from '@/lib/souvenirs';

export default function SouvenirDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [memory, setMemory] = useState<Memory | null | undefined>(undefined);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    listMemories().then((all) => setMemory(all.find((m) => m.id === id) ?? null));
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteMemory(id);
      router.back();
    } finally {
      setDeleting(false);
    }
  }

  if (memory === undefined) return null;
  if (memory === null) {
    return (
      <ThemedView style={styles.notFound}>
        <ThemedText>Ce souvenir est introuvable.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen options={{ title: memory.title }} />
      <FlatList
        data={memory.photoUris}
        keyExtractor={(uri) => uri}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              {memory.title}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {memory.date}
              {memory.location ? ` · ${memory.location}` : ''}
            </ThemedText>

            {confirmingDelete ? (
              <ThemedView style={styles.confirmRow}>
                <ThemedText type="small">Supprimer ce souvenir ?</ThemedText>
                <ThemedView style={styles.confirmButtons}>
                  <Pressable onPress={handleDelete} disabled={deleting}>
                    <ThemedView type="backgroundElement" style={styles.confirmButton}>
                      <ThemedText type="small" style={styles.deleteText}>
                        {deleting ? '...' : 'Oui, supprimer'}
                      </ThemedText>
                    </ThemedView>
                  </Pressable>
                  <Pressable onPress={() => setConfirmingDelete(false)}>
                    <ThemedView type="backgroundElement" style={styles.confirmButton}>
                      <ThemedText type="small">Annuler</ThemedText>
                    </ThemedView>
                  </Pressable>
                </ThemedView>
              </ThemedView>
            ) : (
              <Pressable onPress={() => setConfirmingDelete(true)}>
                <ThemedText type="link" style={styles.deleteText}>
                  Supprimer ce souvenir
                </ThemedText>
              </Pressable>
            )}

            {memory.photoUris.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                Aucune photo pour ce souvenir.
              </ThemedText>
            ) : null}
          </ThemedView>
        }
        renderItem={({ item }) => <Image source={{ uri: item }} style={styles.photo} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.four, gap: Spacing.three },
  header: { gap: Spacing.two, marginBottom: Spacing.three },
  title: { fontSize: 26 },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: Spacing.three, marginBottom: Spacing.three },
  deleteText: { color: '#D14343' },
  confirmRow: { gap: Spacing.two, marginTop: Spacing.two },
  confirmButtons: { flexDirection: 'row', gap: Spacing.two },
  confirmButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
});
