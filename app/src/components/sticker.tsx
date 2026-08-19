import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Brand, Radius, StickerBorder } from '@/constants/theme';

/**
 * Reproduit le look "autocollant" du site : bordure noire épaisse + ombre
 * dure décalée (pas de flou, un simple aplat noir en dessous) — voir
 * `.cat-card .highlight` / `--shadow` dans css/style.css.
 */
export function StickerBox({
  children,
  style,
  radius = Radius.md,
  backgroundColor = Brand.white,
  shadowOffset = 4,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  backgroundColor?: string;
  shadowOffset?: number;
}) {
  return (
    <View style={[{ paddingBottom: shadowOffset, paddingRight: shadowOffset }, style]}>
      <View
        style={{
          position: 'absolute',
          top: shadowOffset,
          left: shadowOffset,
          right: 0,
          bottom: 0,
          backgroundColor: Brand.black,
          borderRadius: radius,
        }}
      />
      <View
        style={[
          styles.front,
          { borderRadius: radius, backgroundColor, borderColor: Brand.black },
        ]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  front: {
    flex: 1,
    borderWidth: StickerBorder,
    overflow: 'hidden',
  },
});
