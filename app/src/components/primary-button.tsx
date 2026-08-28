import { Pressable, StyleSheet } from 'react-native';

import { SoftCard } from '@/components/soft-card';
import { ThemedText } from '@/components/themed-text';
import { Brand, Spacing } from '@/constants/theme';

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
        <SoftCard
          backgroundColor={disabled ? Brand.grayLight : Brand.coral}
          radius={999}
          style={pressed && styles.pressed}>
          <ThemedText type="smallBold" style={styles.text}>
            {label}
          </ThemedText>
        </SoftCard>
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
