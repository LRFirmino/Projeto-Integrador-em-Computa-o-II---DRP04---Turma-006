import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { radius, shadow, spacing } from '@/theme';
import { formatCurrency } from '@/utils/format';

import { AppText } from './ui/AppText';

interface BalanceCardProps {
  /** Saldo acumulado (todas as transações). */
  balance: number;
  /** Total de entradas do mês selecionado. */
  monthIncome: number;
  /** Total de saídas do mês selecionado. */
  monthExpense: number;
}

/** Card destacado com o saldo atual e o resumo do mês. */
export function BalanceCard({ balance, monthIncome, monthExpense }: BalanceCardProps) {
  const { colors } = useTheme();
  const positive = balance >= 0;

  const onPrimary = colors.onPrimary;
  const subtle = `${onPrimary}CC`;
  const faint = `${onPrimary}66`;

  return (
    <View style={[styles.card, { backgroundColor: colors.primary }, shadow(colors.primary, 'lg')]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="wallet-outline" size={16} color={subtle} />
          <AppText variant="caption" color={subtle}>
            Saldo atual
          </AppText>
        </View>
        <View style={[styles.badge, { backgroundColor: faint }]}>
          <Ionicons
            name={positive ? 'trending-up-outline' : 'trending-down-outline'}
            size={14}
            color={onPrimary}
          />
          <AppText variant="caption" color={onPrimary}>
            {positive ? 'No verde' : 'No vermelho'}
          </AppText>
        </View>
      </View>

      <AppText variant="display" color={onPrimary} style={styles.amount}>
        {formatCurrency(balance)}
      </AppText>

      <View style={[styles.divider, { backgroundColor: faint }]} />

      <View style={styles.row}>
        <SummaryColumn
          icon="arrow-down-circle-outline"
          label="Entradas do mês"
          value={monthIncome}
          textColor={onPrimary}
          subtle={subtle}
        />
        <View style={[styles.verticalDivider, { backgroundColor: faint }]} />
        <SummaryColumn
          icon="arrow-up-circle-outline"
          label="Saídas do mês"
          value={monthExpense}
          textColor={onPrimary}
          subtle={subtle}
        />
      </View>
    </View>
  );
}

function SummaryColumn({
  icon,
  label,
  value,
  textColor,
  subtle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  textColor: string;
  subtle: string;
}) {
  return (
    <View style={styles.column}>
      <View style={styles.columnHeader}>
        <Ionicons name={icon} size={15} color={subtle} />
        <AppText variant="caption" color={subtle}>
          {label}
        </AppText>
      </View>
      <AppText variant="subtitle" color={textColor}>
        {formatCurrency(value)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  amount: {
    fontSize: 40,
    letterSpacing: -1.2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  column: {
    flex: 1,
    gap: 4,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  verticalDivider: {
    width: StyleSheet.hairlineWidth,
    height: 38,
    marginHorizontal: spacing.lg,
  },
});
