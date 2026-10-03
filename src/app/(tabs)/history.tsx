import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { TransactionItem } from '@/components/TransactionItem';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { TextField } from '@/components/ui/TextField';
import { useFinance } from '@/context/FinanceContext';
import { useTheme } from '@/context/ThemeContext';
import { radius, shadow, spacing } from '@/theme';
import {
  formatCurrency,
  formatGroupLabel,
  formatMonthYear,
  groupTransactionsByDate,
} from '@/utils/format';

type TypeFilter = 'all' | 'expense' | 'income';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const { month, setMonth, transactions, categories } = useFinance();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [categoryId, setCategoryId] = useState<number | null>(null);

  useEffect(() => {
    if (params.categoryId) setCategoryId(Number(params.categoryId));
  }, [params.categoryId]);

  const isCurrentMonth =
    month.getFullYear() === new Date().getFullYear() &&
    month.getMonth() === new Date().getMonth();

  const results = useMemo(() => {
    const term = search.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (categoryId != null && tx.category_id !== categoryId) return false;
      if (!term) return true;
      return (
        tx.title.toLowerCase().includes(term) ||
        (tx.category_name ?? '').toLowerCase().includes(term)
      );
    });
  }, [transactions, search, typeFilter, categoryId]);

  const sections = useMemo(
    () =>
      groupTransactionsByDate(results).map((group) => ({
        title: formatGroupLabel(group.date),
        data: group.data,
      })),
    [results],
  );

  const totals = useMemo(
    () =>
      results.reduce(
        (acc, tx) => {
          if (tx.type === 'income') acc.income += tx.amount;
          else acc.expense += tx.amount;
          return acc;
        },
        { income: 0, expense: 0 },
      ),
    [results],
  );

  const hasFilters = search.trim().length > 0 || typeFilter !== 'all' || categoryId != null;
  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <Screen style={styles.screen}>
      <FlatList
        data={sections}
        keyExtractor={(section) => `${section.title}-${section.data[0]?.id ?? 'x'}`}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppText variant="title">Histórico</AppText>

            <View
              style={[
                styles.monthPill,
                { backgroundColor: colors.card, borderColor: colors.border },
                shadow(colors.shadow, 'sm'),
              ]}>
              <Pressable
                hitSlop={6}
                accessibilityLabel="Mês anterior"
                onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                style={styles.monthArrow}>
                <Ionicons name="chevron-back" size={20} color={colors.text} />
              </Pressable>
              <AppText variant="label">{formatMonthYear(month)}</AppText>
              <Pressable
                hitSlop={6}
                accessibilityLabel="Próximo mês"
                disabled={isCurrentMonth}
                onPress={() => {
                  if (!isCurrentMonth) {
                    setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));
                  }
                }}
                style={[styles.monthArrow, { opacity: isCurrentMonth ? 0.25 : 1 }]}>
                <Ionicons name="chevron-forward" size={20} color={colors.text} />
              </Pressable>
            </View>

            <TextField
              icon="search-outline"
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por descrição ou categoria"
              returnKeyType="search"
              autoCorrect={false}
            />

            <SegmentedControl<TypeFilter>
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: 'all', label: 'Tudo' },
                { value: 'expense', label: 'Despesas', color: colors.expense },
                { value: 'income', label: 'Receitas', color: colors.income },
              ]}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}>
              <FilterChip
                label="Todas"
                selected={categoryId == null}
                onPress={() => setCategoryId(null)}
              />
              {categories.map((category) => (
                <FilterChip
                  key={category.id}
                  label={category.name}
                  color={category.color}
                  selected={categoryId === category.id}
                  onPress={() => setCategoryId(category.id)}
                />
              ))}
            </ScrollView>

            <View style={styles.totalsRow}>
              <View style={[styles.totalPill, { backgroundColor: colors.incomeSoft }]}>
                <AppText variant="caption" color={colors.income}>
                  + {formatCurrency(totals.income)}
                </AppText>
              </View>
              <View style={[styles.totalPill, { backgroundColor: colors.expenseSoft }]}>
                <AppText variant="caption" color={colors.expense}>
                  - {formatCurrency(totals.expense)}
                </AppText>
              </View>
              <View style={styles.spacer} />
              <AppText variant="caption">
                {results.length} {results.length === 1 ? 'item' : 'itens'}
              </AppText>
            </View>
          </View>
        }
        renderItem={({ item: section }) => (
          <View>
            <AppText variant="caption" style={styles.groupHeader}>
              {section.title}
            </AppText>
            {section.data.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                onPress={() => router.push(`/transaction?id=${tx.id}`)}
              />
            ))}
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={hasFilters ? 'filter-outline' : 'receipt-outline'}
            title={hasFilters ? 'Nada encontrado' : `Sem lançamentos em ${formatMonthYear(month)}`}
            description={
              hasFilters
                ? 'Tente ajustar a busca, o tipo ou a categoria.'
                : 'Os lançamentos deste mês aparecerão aqui.'
            }
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {selectedCategory ? (
        <View
          style={[
            styles.activeFilter,
            { backgroundColor: colors.primary, borderColor: colors.primary },
            shadow(colors.shadow, 'md'),
          ]}>
          <AppText variant="caption" color={colors.onPrimary}>
            {selectedCategory.name}
          </AppText>
          <Pressable hitSlop={8} onPress={() => setCategoryId(null)}>
            <Ionicons name="close-circle" size={18} color={colors.onPrimary} />
          </Pressable>
        </View>
      ) : null}
    </Screen>
  );
}

function FilterChip({
  label,
  selected,
  color,
  onPress,
}: {
  label: string;
  selected: boolean;
  color?: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const accent = color ?? colors.primary;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? `${accent}22` : colors.surface,
          borderColor: selected ? accent : 'transparent',
          opacity: pressed ? 0.75 : 1,
        },
      ]}>
      <AppText variant="caption" color={selected ? accent : colors.textMuted}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: spacing.lg },
  header: { gap: spacing.md, marginBottom: spacing.sm, paddingTop: spacing.md },
  monthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  monthArrow: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsRow: { gap: spacing.sm, paddingVertical: 2, paddingRight: spacing.lg },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  totalsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  totalPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  spacer: { flex: 1 },
  listContent: { paddingBottom: 150 },
  groupHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    textTransform: 'capitalize',
  },
  activeFilter: {
    position: 'absolute',
    bottom: spacing.lg,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
