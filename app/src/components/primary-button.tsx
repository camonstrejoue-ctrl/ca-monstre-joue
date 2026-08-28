import { Pressable, StyleSheet } from 'react-native';

import { StickerBox } from '@/components/sticker';
import { ThemedText } from '@/components/themed-text';
import { Brand, Radius, Spacing } from '@/constants/theme';

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled}>
      {({ pressed }) => (
        <StickerBox
          backgroundColor={disabled ? Brand.grayLight : Brand.coral}
          radius={Radius.md}
          style={pressed && styles.pressed}>
          <ThemedText type="smallBold" style={styles.text}>
            {label}
          </ThemedText>
        </StickerBox>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.7 },
  text: {
    color: Brand.white,
    textAlign: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
});
