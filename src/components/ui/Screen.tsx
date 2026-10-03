import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';
import { spacing } from '@/theme';

interface ScreenProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Bordas seguras aplicadas. Por padrão, apenas o topo. */
  edges?: Edge[];
}

/** Container de tela que respeita a área segura (status bar / notch). */
export function Screen({ children, style, edges = ['top'] }: ScreenProps) {
  const { colors } = useTheme();
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.screen, { backgroundColor: colors.background }, style]}>
      {children}
    </SafeAreaView>
  );
}

interface ScreenScrollProps extends ScreenProps {
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/** Variante rolável com padding inferior para não ficar atrás do FAB/menu. */
export function ScreenScroll({ children, contentContainerStyle, style }: ScreenScrollProps) {
  return (
    <Screen style={style}>
      <ScrollView
        contentContainerStyle={[styles.content, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 150 },
});
