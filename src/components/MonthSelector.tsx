import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { radius, shadow, spacing } from '@/theme';

import { AppText } from './ui/AppText';

interface MonthSelectorProps {
  label: string;
  onPrevious: () => void;
  onNext: () => void;
  /** Desabilita o avanço para meses futuros. */
  disableNext?: boolean;
}

export function MonthSelector({ label, onPrevious, onNext, disableNext }: MonthSelectorProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
        shadow(colors.shadow, 'sm'),
      ]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Mês anterior"
        hitSlop={6}
        onPress={onPrevious}
        style={({ pressed }) => [styles.arrow, { opacity: pressed ? 0.55 : 1 }]}>
        <Ionicons name="chevron-back" size={20} color={colors.text} />
      </Pressable>

      <View style={styles.center}>
        <Ionicons name="calendar-outline" size={15} color={colors.primary} />
        <AppText variant="label" style={styles.label}>
          {label}
        </AppText>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Próximo mês"
        accessibilityState={{ disabled: !!disableNext }}
        disabled={disableNext}
        hitSlop={6}
        onPress={onNext}
        style={({ pressed }) => [
          styles.arrow,
          { opacity: disableNext ? 0.25 : pressed ? 0.55 : 1 },
        ]}>
        <Ionicons name="chevron-forward" size={20} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  arrow: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  label: {
    textTransform: 'capitalize',
  },
});
