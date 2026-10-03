import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { radius, shadow, spacing } from '@/theme';

import { AppText } from './AppText';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  fullWidth,
  disabled,
  style,
}: ButtonProps) {
  const { colors } = useTheme();

  const filled = variant === 'primary' || variant === 'danger';
  const background = (() => {
    if (variant === 'primary') return colors.primary;
    if (variant === 'danger') return colors.danger;
    if (variant === 'secondary') return colors.surface;
    return 'transparent';
  })();
  const textColor = (() => {
    if (variant === 'primary') return colors.onPrimary;
    if (variant === 'danger') return colors.onDanger;
    return colors.text;
  })();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: background,
          borderColor: variant === 'ghost' ? colors.border : 'transparent',
          opacity: disabled ? 0.45 : pressed ? 0.9 : 1,
        },
        filled && !disabled && shadow(colors.shadow, 'sm'),
        fullWidth && styles.fullWidth,
        style,
      ]}>
      {icon ? <Ionicons name={icon} size={18} color={textColor} /> : null}
      <AppText variant="label" color={textColor}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  fullWidth: { alignSelf: 'stretch' },
});
