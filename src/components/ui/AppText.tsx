import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/context/ThemeContext';

type Variant = 'title' | 'heading' | 'subtitle' | 'body' | 'label' | 'caption' | 'amount' | 'display';

interface AppTextProps extends TextProps {
  variant?: Variant;
  color?: string;
  center?: boolean;
}

export function AppText({
  variant = 'body',
  color,
  center,
  style,
  ...rest
}: AppTextProps) {
  const { colors } = useTheme();

  const base: TextStyle = { color: color ?? colors.text };
  const variantStyle: TextStyle = (() => {
    switch (variant) {
      case 'display':
        return { fontSize: 40, fontWeight: '800', letterSpacing: -1 };
      case 'title':
        return { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 };
      case 'heading':
        return { fontSize: 20, fontWeight: '700' };
      case 'subtitle':
        return { fontSize: 16, fontWeight: '700' };
      case 'label':
        return { fontSize: 14, fontWeight: '600' };
      case 'caption':
        return { fontSize: 12, fontWeight: '500', color: color ?? colors.textMuted };
      case 'amount':
        return { fontSize: 17, fontWeight: '700', fontVariant: ['tabular-nums'] };
      case 'body':
      default:
        return { fontSize: 15, fontWeight: '400' };
    }
  })();

  return (
    <Text
      {...rest}
      style={[base, variantStyle, center && styles.center, style]}
    />
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
});
