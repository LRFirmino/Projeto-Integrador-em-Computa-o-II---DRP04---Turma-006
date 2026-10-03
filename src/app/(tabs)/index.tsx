import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';

import { BalanceCard } from '@/components/BalanceCard';
import { EmptyState } from '@/components/EmptyState';
import { MonthSelector } from '@/components/MonthSelector';
import { TransactionItem } from '@/components/TransactionItem';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { IconButton } from '@/components/ui/IconButton';
import { IncomeExpenseBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useFinance } from '@/context/FinanceContext';
import { useTheme } from '@/context/ThemeContext';
import { radius, spacing } from '@/theme';
import { formatCurrency, formatGroupLabel, formatMonthYear, groupTransactionsByDate } from '@/utils/format';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { month, setMonth, transactions, categories, summary, totalBalance, categoryExpenses } =
    useFinance();

  const sections = useMemo(
    () =>
      groupTransactionsByDate(transactions).map((group) => ({
        title: formatGroupLabel(group.date),
        data: group.data,
      })),
    [transactions],
  );

  const isCurrentMonth =
    month.getFullYear() === new Date().getFullYear() &&
    month.getMonth() === new Date().getMonth();

  const quickCategories = categories.slice(0, 4);

  const topCategories = useMemo(
    () => categoryExpenses.filter((c) => c.spent > 0).slice(0, 4),
    [categoryExpenses],
  );

  const Header = (
    <View style={styles.header}>
      <View style={styles.topBar}>
        <View style={styles.greeting}>
          <AppText variant="caption">Olá 👋</AppText>
          <AppText variant="title">Meu dinheiro</AppText>
        </View>
        <IconButton
          icon="settings-outline"
          variant="plain"
          accessibilityLabel="Ajustes"
          onPress={() => router.push('/settings')}
        />
      </View>

      <MonthSelector
        label={formatMonthYear(month)}
        onPrevious={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
        onNext={() => {
          if (!isCurrentMonth) setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));
        }}
        disableNext={isCurrentMonth}
      />

      <BalanceCard
        balance={totalBalance}
        monthIncome={summary.income}
        monthExpense={summary.expense}
      />

      <Card style={styles.compareCard}>
        <View style={styles.compareHeader}>
          <AppText variant="subtitle">Balanço do mês</AppText>
          <View
            style={[
              styles.resultPill,
              { backgroundColor: summary.balance >= 0 ? colors.incomeSoft : colors.expenseSoft },
            ]}>
            <AppText
              variant="caption"
              color={summary.balance >= 0 ? colors.income : colors.expense}>
              {summary.balance >= 0 ? 'No verde' : 'No vermelho'}
            </AppText>
          </View>
        </View>
        <IncomeExpenseBar income={summary.income} expense={summary.expense} />
        <View style={styles.compareLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: colors.income }]} />
            <AppText variant="caption">Entradas</AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: colors.expense }]} />
            <AppText variant="caption">Saídas</AppText>
          </View>
          <View style={styles.spacer} />
          <AppText variant="caption">Saldo do mês </AppText>
          <AppText
            variant="amount"
            color={summary.balance >= 0 ? colors.income : colors.expense}>
            {summary.balance >= 0 ? '+' : '-'} {formatCurrency(Math.abs(summary.balance))}
          </AppText>
        </View>
      </Card>

      <View style={styles.section}>
        <SectionHeader
          title="Acesso rápido"
          actionLabel="Ver limites"
          onAction={() => router.push('/categories')}
        />
        <View style={styles.quickRow}>
          {quickCategories.map((category) => (
            <Pressable
              key={category.id}
              accessibilityRole="button"
              accessibilityLabel={`Novo lançamento em ${category.name}`}
              onPress={() => router.push(`/transaction?categoryId=${category.id}`)}
              style={({ pressed }) => [styles.quickItem, { opacity: pressed ? 0.6 : 1 }]}>
              <CategoryIcon icon={category.icon} color={category.color} size={54} />
              <AppText variant="caption" numberOfLines={1} center>
                {category.name}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>

      {topCategories.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader
            title="Onde estou gastando"
            actionLabel="Ver relatório"
            onAction={() => router.push('/reports')}
          />
          <View style={styles.chipsRow}>
            {topCategories.map((category) => (
              <Pressable
                key={category.id}
                onPress={() => router.push(`/history?categoryId=${category.id}`)}
                style={({ pressed }) => [
                  styles.spendChip,
                  { backgroundColor: `${category.color}18`, opacity: pressed ? 0.7 : 1 },
                ]}>
                <View style={[styles.dot, { backgroundColor: category.color }]} />
                <AppText variant="caption" color={category.color}>
                  {category.name}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <SectionHeader
        title="Lançamentos recentes"
        actionLabel="Ver tudo"
        onAction={() => router.push('/history')}
      />
    </View>
  );

  return (
    <Screen style={styles.screen}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            onPress={() => router.push(`/transaction?id=${item.id}`)}
          />
        )}
        renderSectionHeader={({ section }) => (
          <AppText variant="caption" style={styles.groupHeader}>
            {section.title}
          </AppText>
        )}
        ListHeaderComponent={Header}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title={`Nenhum lançamento em ${formatMonthYear(month)}`}
            description="Toque no botão + para registrar sua primeira receita ou despesa."
          />
        }
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 150 },
  header: { gap: spacing.lg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: { gap: 2 },
  compareCard: { gap: spacing.md },
  compareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  compareLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  spacer: { flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  section: { gap: spacing.md },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  spendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  groupHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    textTransform: 'capitalize',
  },
});
