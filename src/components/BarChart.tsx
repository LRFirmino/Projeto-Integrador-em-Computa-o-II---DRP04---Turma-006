import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { radius, spacing } from '@/theme';
import type { MonthlyTotal } from '@/db';
import { formatCurrency, formatShortMonth, parseISODate } from '@/utils/format';

import { AppText } from './ui/AppText';

interface BarChartProps {
  data: MonthlyTotal[];
  height?: number;
}

/** Gráfico de barras agrupadas (entradas x saídas) dos últimos meses. */
export function BarChart({ data, height = 160 }: BarChartProps) {
  const { colors } = useTheme();
  const max = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]));
  const usableHeight = height - 28;

  return (
    <View>
      <View style={[styles.chart, { height }]}>
        {data.map((item) => {
          const incomeHeight = item.income > 0 ? Math.max((item.income / max) * usableHeight, 4) : 0;
          const expenseHeight =
            item.expense > 0 ? Math.max((item.expense / max) * usableHeight, 4) : 0;
          const date = parseISODate(`${item.month}-01`);
          return (
            <View key={item.month} style={styles.group}>
              <View style={[styles.bars, { height: usableHeight }]}>
                <View
                  style={[styles.bar, { height: incomeHeight, backgroundColor: colors.income }]}
                />
                <View
                  style={[styles.bar, { height: expenseHeight, backgroundColor: colors.expense }]}
                />
              </View>
              <AppText variant="caption" center>
                {formatShortMonth(date)}
              </AppText>
            </View>
          );
        })}
      </View>

      <View style={styles.legend}>
        <LegendItem color={colors.income} label="Entradas" />
        <LegendItem color={colors.expense} label="Saídas" />
      </View>
      <AppText variant="caption" center style={styles.maxLabel}>
        Maior valor do período: {formatCurrency(max)}
      </AppText>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <AppText variant="caption">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  group: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  bar: {
    width: 13,
    borderTopLeftRadius: radius.xs,
    borderTopRightRadius: radius.xs,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  maxLabel: { marginTop: spacing.sm },
});
