import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { radius, shadow, spacing } from '@/theme';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Remove o padding interno. */
  flush?: boolean;
  /** Intensidade da sombra. */
  elevation?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, style, flush, elevation = 'sm' }: CardProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        elevation !== 'none' && shadow(colors.shadow, elevation),
        flush ? styles.flush : styles.padded,
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  padded: { padding: spacing.lg },
  flush: { padding: 0 },
});
