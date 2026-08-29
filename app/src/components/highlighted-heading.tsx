import { StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { StickerBox } from '@/components/sticker';
import { Brand, Fonts, Radius } from '@/constants/theme';

export function HighlightedHeading({
  children,
  size = 'title',
  style,
}: {
  children: string;
  size?: 'title' | 'subtitle';
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <StickerBox
      backgroundColor={Brand.ice}
      radius={Radius.sm}
      shadowOffset={4}
      style={[styles.wrap, style]}>
      <Text style={[styles.text, size === 'title' ? styles.title : styles.subtitle]}>
        {children}
      </Text>
    </StickerBox>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'flex-start' },
  text: {
    color: Brand.white,
    fontFamily: Fonts.displayExtraBold,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  title: {
    fontSize: 22,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
  },
});
