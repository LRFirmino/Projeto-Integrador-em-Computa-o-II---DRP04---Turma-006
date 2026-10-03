import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { radius, spacing } from '@/theme';
import type { TransactionWithCategory } from '@/db';
import { formatCurrency, formatShortDate } from '@/utils/format';

import { AppText } from './ui/AppText';
import { CategoryIcon } from './ui/CategoryIcon';

interface TransactionItemProps {
  transaction: TransactionWithCategory;
  onPress?: () => void;
  /** Exibe a data ao lado do subtítulo. */
  showDate?: boolean;
}

export function TransactionItem({ transaction, onPress, showDate }: TransactionItemProps) {
  const { colors } = useTheme();
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? colors.income : colors.expense;
  const fallbackIcon = isIncome ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline';
  const icon = transaction.category_icon || fallbackIcon;
  const iconColor = transaction.category_color || amountColor;

  const title = transaction.title?.trim() || transaction.category_name || 'Lançamento';
  const showCategory =
    !!transaction.category_name && transaction.category_name.toLowerCase() !== title.toLowerCase();

  const subtitleParts: string[] = [];
  if (showCategory) subtitleParts.push(transaction.category_name as string);
  if (showDate) subtitleParts.push(formatShortDate(transaction.date));
  const subtitle = subtitleParts.join(' • ');

  const content = (
    <>
      <CategoryIcon icon={icon} color={iconColor} size={42} />
      <View style={styles.info}>
        <AppText variant="label" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <AppText variant="amount" color={amountColor} style={styles.amount}>
        {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
      </AppText>
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${formatCurrency(transaction.amount)}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: colors.surface, borderRadius: radius.sm },
      ]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  amount: {
    textAlign: 'right',
  },
});
