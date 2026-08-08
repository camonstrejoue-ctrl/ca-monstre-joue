import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { storage } from '@/lib/firebase';

/** Ouvre le sélecteur de photos et retourne l'URI locale choisie, ou null si annulé. */
export async function pickProfilePhoto(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Accès à tes photos refusé.');
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0].uri;
}

/** Upload une photo locale vers Firebase Storage et retourne son URL publique. */
export async function uploadProfilePhoto(uid: string, localUri: string): Promise<string> {
  if (!storage) throw new Error('Firebase non configuré.');
  const response = await fetch(localUri);
  const blob = await response.blob();
  const photoRef = ref(storage, `profile-photos/${uid}.jpg`);
  await uploadBytes(photoRef, blob, { contentType: 'image/jpeg' });
  return getDownloadURL(photoRef);
}
