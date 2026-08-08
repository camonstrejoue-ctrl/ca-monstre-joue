import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

const CORAL = '#E8392A';

export function HighlightedHeading({
  children,
  size = 'title',
  style,
}: {
  children: string;
  size?: 'title' | 'subtitle';
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text style={[styles.base, size === 'title' ? styles.title : styles.subtitle, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    backgroundColor: CORAL,
    color: '#FFFFFF',
    fontWeight: '800',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
  },
});
