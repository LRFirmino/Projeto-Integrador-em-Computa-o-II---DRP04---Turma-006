import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';
import { radius, shadow, spacing } from '@/theme';

/**
 * Botão de Ação Flutuante (+) para o lançamento rápido.
 * Posicionado acima do menu inferior, no canto, evitando cobrir o conteúdo central.
 */
export function FloatingAddButton() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Novo lançamento"
      onPress={() => router.push('/transaction')}
      style={({ pressed }) => [
        styles.fab,
        {
          backgroundColor: colors.primary,
          bottom: 64 + insets.bottom + spacing.lg,
          right: spacing.lg,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
        shadow(colors.primary, 'lg'),
      ]}>
      <Ionicons name="add" size={30} color={colors.onPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
});
