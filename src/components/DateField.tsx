import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { radius, shadow, spacing } from '@/theme';
import { parseISODate, toISODate } from '@/utils/format';

import { AppText } from './ui/AppText';
import { Button } from './ui/Button';

interface DateFieldProps {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Células (dias) do mês, alinhadas ao domingo. `null` = espaço vazio. */
function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** Campo de data com calendário próprio (funciona em Android, iOS e web). */
export function DateField({ label, value, onChange }: DateFieldProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(() => parseISODate(value));
  const [viewMonth, setViewMonth] = useState(() => {
    const d = parseISODate(value);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  useEffect(() => {
    const d = parseISODate(value);
    setSelected(d);
    setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [value]);

  const cells = useMemo(
    () => buildMonthGrid(viewMonth.getFullYear(), viewMonth.getMonth()),
    [viewMonth],
  );

  const today = new Date();
  const monthTitle = viewMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const confirm = () => {
    onChange(toISODate(selected));
    setOpen(false);
  };

  const pickQuick = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    setSelected(d);
    setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  return (
    <View style={styles.wrapper}>
      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Selecionar data. ${value}`}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.field,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: pressed ? 0.85 : 1,
          },
        ]}>
        <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
        <AppText variant="body" style={styles.fieldText}>
          {parseISODate(value).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </AppText>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}>
        <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: colors.card }, shadow(colors.shadow, 'lg')]}
            onPress={(e) => e.stopPropagation()}>
            <View style={styles.monthHeader}>
              <Pressable
                hitSlop={10}
                onPress={() =>
                  setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))
                }>
                <Ionicons name="chevron-back" size={22} color={colors.text} />
              </Pressable>
              <AppText variant="subtitle" style={styles.monthLabel}>
                {monthTitle}
              </AppText>
              <Pressable
                hitSlop={10}
                onPress={() =>
                  setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))
                }>
                <Ionicons name="chevron-forward" size={22} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.quickRow}>
              <QuickChip label="Hoje" onPress={() => pickQuick(0)} />
              <QuickChip label="Ontem" onPress={() => pickQuick(1)} />
            </View>

            <View style={styles.weekRow}>
              {WEEKDAYS.map((day, index) => (
                <AppText key={`${day}-${index}`} variant="caption" center style={styles.weekCell}>
                  {day}
                </AppText>
              ))}
            </View>

            <View style={styles.grid}>
              {cells.map((date, index) => {
                if (!date) return <View key={`empty-${index}`} style={styles.dayCell} />;
                const isSelected = sameDay(date, selected);
                const isToday = sameDay(date, today);
                return (
                  <Pressable
                    key={date.toISOString()}
                    onPress={() => setSelected(date)}
                    style={[
                      styles.dayCell,
                      isSelected && { backgroundColor: colors.primary },
                      !isSelected && isToday && { borderColor: colors.primary, borderWidth: 1 },
                    ]}>
                    <AppText
                      variant="body"
                      center
                      color={isSelected ? colors.onPrimary : colors.text}>
                      {date.getDate()}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            <Button label="Confirmar" icon="checkmark-outline" fullWidth onPress={confirm} />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function QuickChip({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickChip,
        { backgroundColor: colors.primarySoft, opacity: pressed ? 0.7 : 1 },
      ]}>
      <AppText variant="caption" color={colors.primary}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  label: { marginLeft: spacing.xs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
  },
  fieldText: { flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthLabel: {},
  quickRow: { flexDirection: 'row', gap: spacing.sm },
  quickChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  weekRow: { flexDirection: 'row' },
  weekCell: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
});
