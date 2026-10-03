import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';

interface ProgressBarProps {
  /** Valor consumido (ex.: gasto). */
  value: number;
  /** Limite máximo. Se `null`/0, exibe a barra vazia em cor neutra. */
  max: number | null;
  /** Altura da barra em pixels. */
  height?: number;
  /** Força uma cor específica em vez do indicador automático. */
  color?: string;
}

/**
 * Barra de progresso de orçamento.
 * Verde enquanto dentro do limite, âmbar perto do teto e vermelha ao exceder.
 */
export function ProgressBar({ value, max, height = 10, color }: ProgressBarProps) {
  const { colors } = useTheme();

  const hasMax = max != null && max > 0;
  const ratio = hasMax ? Math.min(Math.max(value / (max as number), 0), 1) : 0;
  const overflow = hasMax && value > (max as number);

  const fillColor =
    color ?? (overflow ? colors.danger : ratio >= 0.85 ? colors.warning : colors.success);

  return (
    <View
      accessibilityRole="progressbar"
      style={[
        styles.track,
        { backgroundColor: colors.surface, height, borderRadius: height / 2 },
      ]}>
      {ratio > 0 ? (
        <View
          style={{
            width: `${Math.max(ratio * 100, 4)}%`,
            height: '100%',
            borderRadius: height / 2,
            backgroundColor: fillColor,
          }}
        />
      ) : null}
    </View>
  );
}

interface IncomeExpenseBarProps {
  income: number;
  expense: number;
}

/** Barra que compara entradas x saídas no mês. */
export function IncomeExpenseBar({ income, expense }: IncomeExpenseBarProps) {
  const { colors } = useTheme();
  const total = income + expense;
  const incomeRatio = total <= 0 ? 0.5 : income / total;

  return (
    <View style={[styles.split, { backgroundColor: colors.surface }]}>
      <View
        style={{
          flex: incomeRatio,
          backgroundColor: colors.income,
          borderTopLeftRadius: 6,
          borderBottomLeftRadius: 6,
        }}
      />
      <View
        style={{
          flex: 1 - incomeRatio,
          backgroundColor: colors.expense,
          borderTopRightRadius: 6,
          borderBottomRightRadius: 6,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  split: {
    width: '100%',
    height: 8,
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
  },
});
