import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
// L'API "moderne" (File/Directory) d'expo-file-system a changé de forme en
// SDK 57 ; on garde l'ancienne API par chemins texte (encore fournie sous
// /legacy), plus simple pour ce qu'on fait ici (lecture/écriture base64).
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import JSZip from 'jszip';
import { useCallback, useEffect, useState } from 'react';

// Stockage 100% local (pas de Firebase) : les souvenirs sont personnels et
// restent sur l'appareil. Métadonnées dans AsyncStorage, photos copiées dans
// le dossier de documents de l'app pour survivre au-delà du cache temporaire
// du sélecteur de photos.
export interface Memory {
  id: string;
  title: string;
  date: string; // AAAA-MM-JJ
  location: string;
  photoUris: string[];
  createdAt: string;
}

const STORAGE_KEY = 'cmj:souvenirs';
const PHOTOS_DIR = `${FileSystem.documentDirectory}souvenirs/`;

async function ensurePhotosDir() {
  const info = await FileSystem.getInfoAsync(PHOTOS_DIR);
  if (!info.exists) await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
}

export async function listMemories(): Promise<Memory[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveAll(memories: Memory[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
}

export async function copyPhotoToPersistentStorage(uri: string): Promise<string> {
  await ensurePhotosDir();
  const ext = uri.split('.').pop()?.split('?')[0] || 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const dest = PHOTOS_DIR + filename;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

export async function addMemory(data: {
  title: string;
  date: string;
  location: string;
  photoUris: string[];
}): Promise<Memory> {
  const memories = await listMemories();
  const memory: Memory = {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`,
    ...data,
    createdAt: new Date().toISOString(),
  };
  memories.push(memory);
  await saveAll(memories);
  return memory;
}

export async function updateMemory(
  id: string,
  data: { title: string; date: string; location: string; photoUris: string[] }
): Promise<void> {
  const memories = await listMemories();
  const idx = memories.findIndex((m) => m.id === id);
  if (idx === -1) return;
  memories[idx] = { ...memories[idx], ...data };
  await saveAll(memories);
}

export async function deleteMemory(id: string): Promise<void> {
  const memories = await listMemories();
  const memory = memories.find((m) => m.id === id);
  if (memory) {
    for (const uri of memory.photoUris) {
      await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
    }
  }
  await saveAll(memories.filter((m) => m.id !== id));
}

// Export/import manuel (fichier .zip à partager où l'utilisateur veut :
// Drive, e-mail, etc.) — seule façon de transférer les souvenirs vers un
// nouveau téléphone puisque tout est stocké localement, sans compte.
export async function exportMemories(): Promise<void> {
  const memories = await listMemories();
  const zip = new JSZip();
  const manifest = memories.map((m) => ({
    ...m,
    photoUris: m.photoUris.map((_, i) => `photos/${m.id}-${i}.jpg`),
  }));
  zip.file('memories.json', JSON.stringify(manifest, null, 2));

  for (const m of memories) {
    for (let i = 0; i < m.photoUris.length; i++) {
      const base64 = await FileSystem.readAsStringAsync(m.photoUris[i], {
        encoding: FileSystem.EncodingType.Base64,
      });
      zip.file(`photos/${m.id}-${i}.jpg`, base64, { base64: true });
    }
  }

  const base64Zip = await zip.generateAsync({ type: 'base64' });
  const zipPath = `${FileSystem.cacheDirectory}souvenirs-export-${Date.now()}.zip`;
  await FileSystem.writeAsStringAsync(zipPath, base64Zip, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(zipPath, {
      mimeType: 'application/zip',
      dialogTitle: 'Exporter mes souvenirs',
    });
  } else {
    throw new Error('Le partage de fichiers n’est pas disponible sur cet appareil.');
  }
}

/** Retourne le nombre de souvenirs importés (les doublons, déjà présents, sont ignorés). */
export async function importMemories(): Promise<number> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/zip', 'application/x-zip-compressed'],
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets[0]) return 0;

  const base64Zip = await FileSystem.readAsStringAsync(result.assets[0].uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const zip = await JSZip.loadAsync(base64Zip, { base64: true });
  const manifestFile = zip.file('memories.json');
  if (!manifestFile) throw new Error('Fichier de sauvegarde invalide.');
  const manifest = JSON.parse(await manifestFile.async('string')) as Memory[];

  await ensurePhotosDir();
  const existing = await listMemories();
  const existingIds = new Set(existing.map((m) => m.id));
  const restored: Memory[] = [];

  for (const m of manifest) {
    if (existingIds.has(m.id)) continue;
    const photoUris: string[] = [];
    for (const relPath of m.photoUris) {
      const file = zip.file(relPath);
      if (!file) continue;
      const base64 = await file.async('base64');
      const dest = PHOTOS_DIR + relPath.split('/').pop();
      await FileSystem.writeAsStringAsync(dest, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      photoUris.push(dest);
    }
    restored.push({ ...m, photoUris });
  }

  await saveAll([...existing, ...restored]);
  return restored.length;
}

export function useMemories() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setMemories(await listMemories());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { memories, loading, refresh };
}
