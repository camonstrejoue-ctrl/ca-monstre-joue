import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormField } from '@/components/form-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { copyPhotoToPersistentStorage, deleteMemory, listMemories, updateMemory, type Memory } from '@/lib/souvenirs';

function EditForm({ memory, onSaved, onCancel }: { memory: Memory; onSaved: () => void; onCancel: () => void }) {
  const [title, setTitle] = useState(memory.title);
  const [date, setDate] = useState(memory.date);
  const [location, setLocation] = useState(memory.location);
  const [photoUris, setPhotoUris] = useState<string[]>(memory.photoUris);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePickPhotos() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Accès à tes photos refusé.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (result.canceled) return;
    const persisted = await Promise.all(result.assets.map((a) => copyPhotoToPersistentStorage(a.uri)));
    setPhotoUris((prev) => [...prev, ...persisted]);
  }

  function removePhoto(uri: string) {
    setPhotoUris((prev) => prev.filter((u) => u !== uri));
  }

  async function handleSave() {
    if (!title.trim() || !date.trim()) {
      setError('Renseigne au moins un nom et une date.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateMemory(memory.id, {
        title: title.trim(),
        date: date.trim(),
        location: location.trim(),
        photoUris,
      });
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.form}>
      <FormField label="Nom de l’événement" value={title} onChangeText={setTitle} />
      <FormField label="Date (AAAA-MM-JJ)" value={date} onChangeText={setDate} />
      <FormField label="Lieu" value={location} onChangeText={setLocation} />

      {photoUris.length > 0 ? (
        <FlatList
          horizontal
          data={photoUris}
          keyExtractor={(uri) => uri}
          contentContainerStyle={styles.photoPreviewRow}
          renderItem={({ item }) => (
            <View style={styles.photoPreviewWrap}>
              <Image source={{ uri: item }} style={styles.photoPreview} />
              <Pressable
                onPress={() => removePhoto(item)}
                style={styles.removePhotoBadge}
                accessibilityLabel="Retirer cette photo"
                accessibilityRole="button">
                <Ionicons name="close-circle" size={20} color="#D14343" />
              </Pressable>
            </View>
          )}
        />
      ) : null}
      <Pressable onPress={handlePickPhotos}>
        <ThemedView type="backgroundElement" style={styles.photoPickerButton}>
          <ThemedText type="small">📷 Ajouter des photos</ThemedText>
        </ThemedView>
      </Pressable>

      {error ? <ThemedText style={styles.deleteText}>{error}</ThemedText> : null}
      <View style={styles.confirmButtons}>
        <Pressable onPress={handleSave} disabled={saving}>
          <ThemedView type="backgroundSelected" style={styles.saveButton}>
            <ThemedText type="smallBold">{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</ThemedText>
          </ThemedView>
        </Pressable>
        <Pressable onPress={onCancel}>
          <ThemedView type="backgroundElement" style={styles.confirmButton}>
            <ThemedText type="small">Annuler</ThemedText>
          </ThemedView>
        </Pressable>
      </View>
    </View>
  );
}

export default function SouvenirDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [memory, setMemory] = useState<Memory | null | undefined>(undefined);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [viewerUri, setViewerUri] = useState<string | null>(null);

  async function reload() {
    const all = await listMemories();
    setMemory(all.find((m) => m.id === id) ?? null);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <View style={styles.notFound}>
        <ThemedText>Ce souvenir est introuvable.</ThemedText>
      </View>
    );
  }

  if (editing) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <Stack.Screen options={{ title: memory.title }} />
        <View style={styles.list}>
          <EditForm
            memory={memory}
            onCancel={() => setEditing(false)}
            onSaved={() => {
              setEditing(false);
              reload();
            }}
          />
        </View>
      </SafeAreaView>
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
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              {memory.title}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {memory.date}
              {memory.location ? ` · ${memory.location}` : ''}
            </ThemedText>

            <View style={styles.actionsRow}>
              <Pressable onPress={() => setEditing(true)}>
                <ThemedView type="backgroundElement" style={styles.confirmButton}>
                  <ThemedText type="small">✎ Modifier</ThemedText>
                </ThemedView>
              </Pressable>
            </View>

            {confirmingDelete ? (
              <View style={styles.confirmRow}>
                <ThemedText type="small">Supprimer ce souvenir ?</ThemedText>
                <View style={styles.confirmButtons}>
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
                </View>
              </View>
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
          </View>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => setViewerUri(item)}>
            <Image source={{ uri: item }} style={styles.photo} />
          </Pressable>
        )}
      />

      <Modal visible={viewerUri !== null} transparent animationType="fade" onRequestClose={() => setViewerUri(null)}>
        <Pressable style={styles.viewerBackdrop} onPress={() => setViewerUri(null)}>
          {viewerUri ? (
            <Image source={{ uri: viewerUri }} style={styles.viewerImage} contentFit="contain" />
          ) : null}
          <Pressable
            style={styles.viewerClose}
            onPress={() => setViewerUri(null)}
            accessibilityLabel="Fermer la photo"
            accessibilityRole="button">
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.four, gap: Spacing.three },
  header: { gap: Spacing.two, marginBottom: Spacing.three },
  title: { fontSize: 26 },
  actionsRow: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: Spacing.three, marginBottom: Spacing.three },
  deleteText: { color: '#D14343' },
  confirmRow: { gap: Spacing.two, marginTop: Spacing.two },
  confirmButtons: { flexDirection: 'row', gap: Spacing.two },
  confirmButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  form: { gap: Spacing.two },
  photoPreviewRow: { gap: Spacing.two },
  photoPreviewWrap: { position: 'relative' },
  photoPreview: { width: 72, height: 72, borderRadius: Spacing.two },
  removePhotoBadge: { position: 'absolute', top: -6, right: -6, backgroundColor: '#FFFFFF', borderRadius: 10 },
  photoPickerButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    alignSelf: 'flex-start',
  },
  saveButton: { paddingVertical: Spacing.three, paddingHorizontal: Spacing.four, borderRadius: Spacing.two },
  viewerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerImage: { width: '100%', height: '80%' },
  viewerClose: { position: 'absolute', top: 50, right: 20, padding: Spacing.two },
});
