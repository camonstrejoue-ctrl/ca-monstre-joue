import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

/**
 * Sélectionne une image dans la galerie, la redimensionne/compresse, et la
 * retourne en data URI base64 — pour la stocker directement dans un document
 * Firestore (pas de Firebase Storage, qui demande le forfait payant). Reste
 * volontairement petit (largeur max + forte compression) pour ne pas
 * approcher la limite de 1 Mo par document Firestore.
 */
export async function pickImageAsBase64(maxWidth = 800, quality = 0.5): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new Error('Accès à tes photos refusé.');

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.9,
  });
  if (result.canceled || !result.assets[0]) return null;

  const manipulated = await ImageManipulator.manipulateAsync(
    result.assets[0].uri,
    [{ resize: { width: maxWidth } }],
    { compress: quality, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );
  if (!manipulated.base64) throw new Error("Impossible de traiter l'image.");

  const dataUri = `data:image/jpeg;base64,${manipulated.base64}`;
  // Garde-fou : Firestore refuse un document de plus de 1 Mo au total.
  if (dataUri.length > 700_000) {
    throw new Error('Image trop lourde même après compression, essaie une autre photo.');
  }
  return dataUri;
}
