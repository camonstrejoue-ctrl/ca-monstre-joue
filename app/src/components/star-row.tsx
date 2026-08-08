import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { StarRating } from '@/types/content';

export function StarRow({ rating }: { rating: StarRating }) {
  const max = rating.max || 6;
  const full = Math.floor(rating.stars);
  const hasHalf = rating.stars - full >= 0.5;

  return (
    <View style={styles.row}>
      <View style={styles.stars}>
        {Array.from({ length: max }, (_, i) => {
          const position = i + 1;
          const name: ComponentProps<typeof Ionicons>['name'] =
            position <= full ? 'star' : position === full + 1 && hasHalf ? 'star-half' : 'star-outline';
          return <Ionicons key={position} name={name} size={16} color="#F5B301" />;
        })}
      </View>
      {rating.label ? <ThemedText type="small">{rating.label}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  stars: { flexDirection: 'row', gap: 2 },
});
