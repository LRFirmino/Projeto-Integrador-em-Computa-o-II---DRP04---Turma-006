import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { FALLBACK_CATEGORY_COLOR } from '@/theme';

interface CategoryIconProps {
  icon: string;
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/** Círculo colorido com o ícone da categoria. */
export function CategoryIcon({ icon, color, size = 44, style }: CategoryIconProps) {
  const tint = color ?? FALLBACK_CATEGORY_COLOR;
  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: `${tint}22`,
        },
        style,
      ]}>
      <Ionicons
        name={(icon || 'pricetag-outline') as keyof typeof Ionicons.glyphMap}
        size={size * 0.48}
        color={tint}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
