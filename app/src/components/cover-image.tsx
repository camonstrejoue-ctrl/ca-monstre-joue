import { Image, type ImageStyle } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { resolveAsset } from '@/lib/content';

export function CoverImage({
  path,
  style,
  contentFit = 'cover',
}: {
  path: string | undefined | null;
  style?: StyleProp<ImageStyle>;
  contentFit?: 'cover' | 'contain';
}) {
  const [failed, setFailed] = useState(false);
  const uri = resolveAsset(path);

  if (!uri || failed) {
    return (
      <View style={[styles.placeholder, style as StyleProp<ViewStyle>]}>
        <Image
          source={{ uri: resolveAsset('assets/logo.png') }}
          style={styles.placeholderImage}
          contentFit="contain"
        />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit={contentFit}
      onError={() => setFailed(true)}
      transition={150}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#EDEBE4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderImage: {
    width: '40%',
    height: '40%',
  },
});
