import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { IconButton } from '@/components/ui/IconButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ScreenScroll } from '@/components/ui/Screen';
import { useFinance } from '@/context/FinanceContext';
import { useTheme } from '@/context/ThemeContext';
import { radius, spacing } from '@/theme';
import { formatCurrency, formatMonthYear } from '@/utils/format';

export default function CategoriesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { month, categoryExpenses } = useFinance();

  const withLimit = categoryExpenses.filter((c) => c.monthly_limit && c.monthly_limit > 0);
  const totalLimit = withLimit.reduce((sum, c) => sum + (c.monthly_limit ?? 0), 0);
  const totalSpent = withLimit.reduce((sum, c) => sum + c.spent, 0);
  const budgetExceeded = totalLimit > 0 && totalSpent > totalLimit;

  return (
    <ScreenScroll>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="title">Categorias</AppText>
          <AppText variant="caption">Limites de {formatMonthYear(month)}</AppText>
        </View>
        <IconButton
          icon="add"
          accessibilityLabel="Nova categoria"
          onPress={() => router.push('/category')}
        />
      </View>

      {categoryExpenses.length === 0 ? (
        <EmptyState
          icon="pricetags-outline"
          title="Nenhuma categoria"
          description="Crie categorias com limites para acompanhar seus gastos."
        />
      ) : (
        <>
          <Card style={styles.overview} elevation="sm">
            <View style={styles.overviewRow}>
              <AppText variant="subtitle">Orçamento total</AppText>
              <AppText variant="label" color={budgetExceeded ? colors.danger : colors.text}>
                {formatCurrency(totalSpent)} / {formatCurrency(totalLimit)}
              </AppText>
            </View>
            <ProgressBar value={totalSpent} max={totalLimit} height={12} />
            <View style={styles.overviewFooter}>
              <Ionicons
                name={budgetExceeded ? 'alert-circle' : 'checkmark-circle'}
                size={15}
                color={budgetExceeded ? colors.danger : colors.income}
              />
              <AppText variant="caption" color={budgetExceeded ? colors.danger : colors.income}>
                {totalLimit <= 0
                  ? 'Defina limites para acompanhar seu orçamento.'
                  : budgetExceeded
                    ? `Excedido em ${formatCurrency(totalSpent - totalLimit)}`
                    : `Restam ${formatCurrency(totalLimit - totalSpent)}`}
              </AppText>
            </View>
          </Card>

          <View style={styles.list}>
            {categoryExpenses.map((category) => {
              const hasLimit = !!category.monthly_limit && category.monthly_limit > 0;
              const ratio = hasLimit ? category.spent / (category.monthly_limit as number) : 0;
              const exceeded = hasLimit && ratio > 1;
              const near = hasLimit && ratio >= 0.85 && !exceeded;
              const statusColor = exceeded ? colors.danger : near ? colors.warning : colors.income;
              const statusBg = exceeded
                ? colors.expenseSoft
                : near
                  ? colors.warningSoft
                  : colors.incomeSoft;

              return (
                <Card key={category.id} style={styles.row} elevation="sm">
                  <View style={styles.rowHeader}>
                    <CategoryIcon icon={category.icon} color={category.color} size={46} />
                    <View style={styles.rowInfo}>
                      <AppText variant="label" numberOfLines={1}>
                        {category.name}
                      </AppText>
                      <AppText variant="caption" numberOfLines={1}>
                        {hasLimit
                          ? `${formatCurrency(category.spent)} de ${formatCurrency(
                              category.monthly_limit ?? 0,
                            )}`
                          : `${formatCurrency(category.spent)} gastos • sem limite`}
                      </AppText>
                    </View>
                    <IconButton
                      icon="create-outline"
                      size={38}
                      accessibilityLabel={`Editar ${category.name}`}
                      onPress={() => router.push(`/category?id=${category.id}`)}
                    />
                  </View>

                  {hasLimit ? (
                    <>
                      <ProgressBar value={category.spent} max={category.monthly_limit} />
                      <View style={styles.rowFooter}>
                        <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
                          <AppText variant="caption" color={statusColor}>
                            {exceeded ? 'Excedido' : near ? 'Atenção' : 'Dentro do limite'}
                          </AppText>
                        </View>
                        <AppText variant="caption" color={statusColor}>
                          {exceeded
                            ? `+${formatCurrency(category.spent - (category.monthly_limit ?? 0))}`
                            : `Restam ${formatCurrency(
                                (category.monthly_limit ?? 0) - category.spent,
                              )}`}
                        </AppText>
                      </View>
                    </>
                  ) : (
                    <View style={styles.noLimitRow}>
                      <Ionicons name="infinite-outline" size={14} color={colors.textMuted} />
                      <AppText variant="caption">Sem limite definido para esta categoria</AppText>
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        </>
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: { flex: 1, gap: 2 },
  overview: { gap: spacing.md },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  list: { gap: spacing.md },
  row: { gap: spacing.md },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowInfo: { flex: 1, gap: 2 },
  rowFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  noLimitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
