import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        style,
      ]}
      {...rest}
    />
  );
}

// Police "display" (Baloo 2, arrondie/ludique) pour titres et libellés en
// gras, "body" (Nunito) pour le texte courant — comme sur le site.
const styles = StyleSheet.create({
  small: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  smallBold: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  default: {
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontFamily: Fonts.displayExtraBold,
    fontSize: 34,
    lineHeight: 40,
  },
  subtitle: {
    fontFamily: Fonts.display,
    fontSize: 24,
    lineHeight: 30,
  },
  link: {
    fontFamily: Fonts.bodyBold,
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    fontFamily: Fonts.bodyBold,
    lineHeight: 30,
    fontSize: 14,
    color: '#3c87f7',
  },
});
