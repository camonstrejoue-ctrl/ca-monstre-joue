import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Link, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormField } from '@/components/form-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  addMemory,
  copyPhotoToPersistentStorage,
  exportMemories,
  importMemories,
  useMemories,
  type Memory,
} from '@/lib/souvenirs';

function AddMemoryForm({ onAdded }: { onAdded: () => void }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [photoUris, setPhotoUris] = useState<string[]>([]);
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
    setPhotoUris((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
  }

  async function handleSave() {
    if (!title.trim() || !date.trim()) {
      setError('Renseigne au moins un nom et une date.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const persistedUris = await Promise.all(photoUris.map(copyPhotoToPersistentStorage));
      await addMemory({
        title: title.trim(),
        date: date.trim(),
        location: location.trim(),
        photoUris: persistedUris,
      });
      onAdded();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.form}>
      <FormField label="Nom de l’événement" value={title} onChangeText={setTitle} placeholder="ex: Ludopathique 2026" />
      <FormField label="Date (AAAA-MM-JJ)" value={date} onChangeText={setDate} placeholder="2026-09-15" />
      <FormField label="Lieu" value={location} onChangeText={setLocation} placeholder="ex: Genève" />

      <Pressable onPress={handlePickPhotos}>
        <ThemedView type="backgroundElement" style={styles.photoPickerButton}>
          <ThemedText type="small">📷 Ajouter des photos ({photoUris.length})</ThemedText>
        </ThemedView>
      </Pressable>
      {photoUris.length > 0 ? (
        <FlatList
          horizontal
          data={photoUris}
          keyExtractor={(uri) => uri}
          contentContainerStyle={styles.photoPreviewRow}
          renderItem={({ item }) => <Image source={{ uri: item }} style={styles.photoPreview} />}
        />
      ) : null}

      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
      <Pressable onPress={handleSave} disabled={saving}>
        <ThemedView type="backgroundSelected" style={styles.saveButton}>
          <ThemedText type="smallBold">{saving ? 'Enregistrement...' : 'Enregistrer le souvenir'}</ThemedText>
        </ThemedView>
      </Pressable>
    </View>
  );
}

export default function SouvenirsScreen() {
  const { memories, loading, refresh } = useMemories();
  const [showAdd, setShowAdd] = useState(false);
  const [query, setQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const theme = useTheme();

  const locations = useMemo(
    () => Array.from(new Set(memories.map((m) => m.location).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'fr')),
    [memories]
  );

  const filtered = memories.filter((m) => {
    if (query.trim() && !m.title.toLowerCase().includes(query.trim().toLowerCase())) return false;
    if (dateFilter.trim() && !m.date.includes(dateFilter.trim())) return false;
    if (locationFilter && m.location !== locationFilter) return false;
    return true;
  });
  const sorted = [...filtered].sort((a, b) => (a.date < b.date ? 1 : -1));

  async function handleExport() {
    setExporting(true);
    setMessage(null);
    try {
      await exportMemories();
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setExporting(false);
    }
  }

  async function handleImport() {
    setImporting(true);
    setMessage(null);
    try {
      const count = await importMemories();
      setMessage(count > 0 ? `${count} souvenir(s) importé(s).` : 'Aucun nouveau souvenir à importer.');
      await refresh();
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setImporting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Souvenirs' }} />
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText type="small" themeColor="textSecondary">
              Garde une trace des événements auxquels tu as participé, avec tes photos. Tout reste
              sur ce téléphone — utilise "Exporter" pour sauvegarder ou transférer vers un autre
              appareil.
            </ThemedText>

            <View style={styles.exportRow}>
              <Pressable onPress={handleExport} disabled={exporting || memories.length === 0}>
                <ThemedView type="backgroundElement" style={styles.smallButton}>
                  <ThemedText type="small">{exporting ? '...' : '⬆ Exporter'}</ThemedText>
                </ThemedView>
              </Pressable>
              <Pressable onPress={handleImport} disabled={importing}>
                <ThemedView type="backgroundElement" style={styles.smallButton}>
                  <ThemedText type="small">{importing ? '...' : '⬇ Importer'}</ThemedText>
                </ThemedView>
              </Pressable>
            </View>
            {message ? (
              <ThemedText type="small" themeColor="textSecondary">
                {message}
              </ThemedText>
            ) : null}

            <Pressable onPress={() => setShowAdd((v) => !v)}>
              <ThemedView type="backgroundSelected" style={styles.addButton}>
                <ThemedText type="smallBold">
                  {showAdd ? 'Fermer' : '+ Ajouter un souvenir'}
                </ThemedText>
              </ThemedView>
            </Pressable>
            {showAdd ? (
              <AddMemoryForm
                onAdded={() => {
                  setShowAdd(false);
                  refresh();
                }}
              />
            ) : null}

            {!showAdd && memories.length > 0 ? (
              <View style={styles.filters}>
                <View style={styles.searchBar}>
                  <Ionicons name="search" size={16} color={theme.textSecondary} />
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Rechercher un événement"
                    placeholderTextColor={theme.textSecondary}
                    style={[styles.searchInput, { color: theme.text }]}
                  />
                </View>
                <TextInput
                  value={dateFilter}
                  onChangeText={setDateFilter}
                  placeholder="Filtrer par date (ex: 2026 ou 2026-09)"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.dateFilterInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                />
                {locations.length > 0 ? (
                  <View style={styles.chipRow}>
                    {locations.map((loc) => (
                      <Pressable
                        key={loc}
                        onPress={() => setLocationFilter((cur) => (cur === loc ? null : loc))}>
                        <ThemedView
                          type="backgroundElement"
                          style={[styles.chip, locationFilter === loc && styles.chipSelected]}>
                          <ThemedText type={locationFilter === loc ? 'smallBold' : 'small'}>
                            {loc}
                          </ThemedText>
                        </ThemedView>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}

            {!loading && memories.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                Aucun souvenir enregistré pour l’instant.
              </ThemedText>
            ) : null}
            {!loading && memories.length > 0 && sorted.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                Aucun souvenir ne correspond à ta recherche.
              </ThemedText>
            ) : null}
          </View>
        }
        renderItem={({ item }) => <MemoryRow memory={item} />}
      />
    </SafeAreaView>
  );
}

function MemoryRow({ memory }: { memory: Memory }) {
  return (
    <Link href={{ pathname: '/outils/souvenir/[id]', params: { id: memory.id } }} asChild>
      <Pressable style={styles.memoryCard}>
        {memory.photoUris[0] ? (
          <Image source={{ uri: memory.photoUris[0] }} style={styles.memoryImage} />
        ) : (
          <ThemedView type="backgroundElement" style={styles.memoryImage} />
        )}
        <View style={styles.memoryInfo}>
          <ThemedText type="smallBold">{memory.title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {memory.date}
            {memory.location ? ` · ${memory.location}` : ''}
          </ThemedText>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  list: { padding: Spacing.four, gap: Spacing.three },
  header: { gap: Spacing.three, marginBottom: Spacing.three },
  exportRow: { flexDirection: 'row', gap: Spacing.two },
  smallButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  addButton: { paddingVertical: Spacing.three, borderRadius: Spacing.two, alignItems: 'center' },
  form: { gap: Spacing.two },
  photoPickerButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    alignSelf: 'flex-start',
  },
  photoPreviewRow: { gap: Spacing.two },
  photoPreview: { width: 64, height: 64, borderRadius: Spacing.two },
  error: { color: '#D14343' },
  saveButton: { paddingVertical: Spacing.three, borderRadius: Spacing.two, alignItems: 'center' },
  filters: { gap: Spacing.two },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  searchInput: { flex: 1, fontSize: 16 },
  dateFilterInput: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipSelected: { borderColor: Brand.ice },
  pressed: { opacity: 0.7 },
  memoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  memoryImage: { width: 56, height: 56, borderRadius: Spacing.two },
  memoryInfo: { flex: 1, gap: 2 },
});
