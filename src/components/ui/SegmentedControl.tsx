import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { radius, shadow, spacing } from '@/theme';

import { AppText } from './AppText';

interface SegmentOption<T extends string> {
  value: T;
  label: string;
  color?: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Controle segmentado usado para escolher o tipo (Despesa/Receita) e filtros. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {options.map((option) => {
        const active = option.value === value;
        const activeColor = option.color ?? colors.primary;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            style={[
              styles.segment,
              active && { backgroundColor: colors.card },
              active && shadow(colors.shadow, 'sm'),
            ]}>
            <AppText variant="label" color={active ? activeColor : colors.textMuted}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

interface ChipProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  selected?: boolean;
  color?: string;
  onPress: () => void;
}

/** Chip de categoria para uso no formulário de lançamento. */
export function Chip({ label, icon, selected, color, onPress }: ChipProps) {
  const { colors } = useTheme();
  const accent = color ?? colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? `${accent}22` : colors.surface,
          borderColor: selected ? accent : 'transparent',
          opacity: pressed ? 0.75 : 1,
        },
      ]}>
      {icon ? (
        <Ionicons name={icon} size={16} color={selected ? accent : colors.textMuted} />
      ) : null}
      <AppText variant="caption" color={selected ? accent : colors.text}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: radius.md,
    gap: 4,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    minHeight: 40,
  },
});
