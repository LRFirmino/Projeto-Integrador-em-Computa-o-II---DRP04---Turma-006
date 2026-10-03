import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/context/ThemeContext';

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
  color?: string;
  size?: number;
  /** 'solid' usa superfície; 'plain' fica transparente. */
  variant?: 'solid' | 'plain';
  style?: StyleProp<ViewStyle>;
}

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  color,
  size = 44,
  variant = 'solid',
  style,
}: IconButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: variant === 'solid' ? colors.surface : 'transparent',
          opacity: pressed ? 0.65 : 1,
        },
        style,
      ]}>
      <Ionicons name={icon} size={size * 0.5} color={color ?? colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
