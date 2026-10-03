import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BarChart } from '@/components/BarChart';
import { DonutChart, DonutLegend, type DonutSlice } from '@/components/DonutChart';
import { EmptyState } from '@/components/EmptyState';
import { MonthSelector } from '@/components/MonthSelector';
import { TransactionItem } from '@/components/TransactionItem';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ScreenScroll } from '@/components/ui/Screen';
import { useFinance } from '@/context/FinanceContext';
import { useTheme } from '@/context/ThemeContext';
import { getMonthlyTotals, type MonthlyTotal } from '@/db';
import { radius, spacing } from '@/theme';
import { formatCurrency, formatMonthYear } from '@/utils/format';

const MIN_SLICE_PERCENT = 0.04;

export default function ReportsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { month, setMonth, categoryExpenses, summary, transactions } = useFinance();
  const [monthly, setMonthly] = useState<MonthlyTotal[]>([]);

  const loadMonthly = useCallback(async () => {
    setMonthly(await getMonthlyTotals(6));
  }, []);

  useEffect(() => {
    loadMonthly();
  }, [loadMonthly, transactions, month]);

  const slices = useMemo<DonutSlice[]>(() => {
    const positive = categoryExpenses
      .filter((c) => c.spent > 0)
      .map((c) => ({ label: c.name, value: c.spent, color: c.color }))
      .sort((a, b) => b.value - a.value);

    const total = positive.reduce((sum, slice) => sum + slice.value, 0);
    if (total <= 0) return [];

    const big = positive.filter((slice) => slice.value / total >= MIN_SLICE_PERCENT);
    const small = positive.filter((slice) => slice.value / total < MIN_SLICE_PERCENT);

    if (small.length === 0) return big;
    const otherValue = small.reduce((sum, slice) => sum + slice.value, 0);
    return [...big, { label: 'Outros', value: otherValue, color: colors.textMuted }];
  }, [categoryExpenses, colors.textMuted]);

  const topExpenses = useMemo(
    () =>
      [...transactions]
        .filter((t) => t.type === 'expense')
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5),
    [transactions],
  );

  const limits = useMemo(
    () => categoryExpenses.filter((c) => c.monthly_limit && c.monthly_limit > 0),
    [categoryExpenses],
  );

  const isCurrentMonth =
    month.getFullYear() === new Date().getFullYear() &&
    month.getMonth() === new Date().getMonth();

  return (
    <ScreenScroll>
      <View style={styles.header}>
        <AppText variant="title">Relatórios</AppText>
        <AppText variant="caption">Resumo de {formatMonthYear(month)}</AppText>
      </View>

      <MonthSelector
        label={formatMonthYear(month)}
        onPrevious={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
        onNext={() => {
          if (!isCurrentMonth) setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));
        }}
        disableNext={isCurrentMonth}
      />

      <View style={styles.summaryRow}>
        <SummaryTile
          label="Entradas"
          value={formatCurrency(summary.income)}
          icon="arrow-down-circle-outline"
          color={colors.income}
        />
        <SummaryTile
          label="Saídas"
          value={formatCurrency(summary.expense)}
          icon="arrow-up-circle-outline"
          color={colors.expense}
        />
        <SummaryTile
          label="Saldo"
          value={formatCurrency(summary.balance)}
          icon="wallet-outline"
          color={summary.balance >= 0 ? colors.income : colors.expense}
        />
      </View>

      <Card style={styles.card}>
        <AppText variant="subtitle">Gastos por categoria</AppText>
        {slices.length > 0 ? (
          <>
            <View style={styles.donutWrapper}>
              <DonutChart
                data={slices}
                size={190}
                centerLabel="Total gasto"
                centerValue={formatCurrency(summary.expense)}
              />
            </View>
            <DonutLegend data={slices} />
          </>
        ) : (
          <EmptyState
            icon="pie-chart-outline"
            title="Sem despesas neste mês"
            description="Assim que você registrar gastos, a distribuição por categoria aparece aqui."
          />
        )}
      </Card>

      <Card style={styles.card}>
        <AppText variant="subtitle">Evolução mensal</AppText>
        <AppText variant="caption">Entradas x saídas nos últimos 6 meses</AppText>
        <BarChart data={monthly} />
      </Card>

      <Card style={styles.card}>
        <AppText variant="subtitle">Limites do mês</AppText>
        {limits.length === 0 ? (
          <AppText variant="caption">
            Defina limites na aba Categorias para acompanhar o orçamento aqui.
          </AppText>
        ) : (
          limits.map((category) => {
            const limit = category.monthly_limit ?? 0;
            const exceeded = category.spent > limit;
            return (
              <View key={category.id} style={styles.limitRow}>
                <View style={styles.limitHeader}>
                  <AppText variant="label">{category.name}</AppText>
                  <AppText variant="caption" color={exceeded ? colors.danger : colors.textMuted}>
                    {formatCurrency(category.spent)} / {formatCurrency(limit)}
                  </AppText>
                </View>
                <ProgressBar value={category.spent} max={category.monthly_limit} />
                <AppText variant="caption" color={exceeded ? colors.danger : colors.income}>
                  {exceeded
                    ? `Excedeu ${formatCurrency(category.spent - limit)}`
                    : `Restam ${formatCurrency(limit - category.spent)}`}
                </AppText>
              </View>
            );
          })
        )}
      </Card>

      {topExpenses.length > 0 ? (
        <Card style={styles.card}>
          <AppText variant="subtitle">Maiores gastos</AppText>
          {topExpenses.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              showDate
              onPress={() => router.push(`/transaction?id=${tx.id}`)}
            />
          ))}
        </Card>
      ) : null}
    </ScreenScroll>
  );
}

function SummaryTile({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  const { colors } = useTheme();
  return (
    <Card style={styles.tile} elevation="sm">
      <Ionicons name={icon} size={18} color={color} />
      <AppText variant="caption">{label}</AppText>
      <AppText variant="label" color={color} numberOfLines={1} style={styles.tileValue}>
        {value}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { gap: 2 },
  summaryRow: { flexDirection: 'row', gap: spacing.md },
  tile: {
    flex: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  tileValue: { fontSize: 13, textAlign: 'left' },
  card: { gap: spacing.md },
  donutWrapper: { alignItems: 'center', marginTop: spacing.sm },
  limitRow: { gap: spacing.xs, marginBottom: spacing.md },
  limitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
