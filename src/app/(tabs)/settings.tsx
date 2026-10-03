import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ScreenScroll } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useFinance } from '@/context/FinanceContext';
import { useTheme } from '@/context/ThemeContext';
import { spacing } from '@/theme';
import type { ThemePreference } from '@/types/models';

export default function SettingsScreen() {
  const { colors, preference, setPreference } = useTheme();
  const { categories, transactions } = useFinance();

  return (
    <ScreenScroll>
      <AppText variant="title">Ajustes</AppText>

      <Card style={styles.card}>
        <View style={styles.cardTitle}>
          <Ionicons name="color-palette-outline" size={18} color={colors.primary} />
          <AppText variant="subtitle">Aparência</AppText>
        </View>
        <AppText variant="caption">Escolha como o aplicativo deve exibir as cores.</AppText>
        <SegmentedControl<ThemePreference>
          value={preference}
          onChange={setPreference}
          options={[
            { value: 'system', label: 'Sistema' },
            { value: 'light', label: 'Claro' },
            { value: 'dark', label: 'Escuro' },
          ]}
        />
      </Card>

      <Card style={styles.card}>
        <View style={styles.cardTitle}>
          <Ionicons name="stats-chart-outline" size={18} color={colors.primary} />
          <AppText variant="subtitle">Meus dados</AppText>
        </View>
        <InfoRow label="Categorias cadastradas" value={String(categories.length)} />
        <InfoRow label="Lançamentos no mês" value={String(transactions.length)} />
        <InfoRow label="Armazenamento" value="Local (SQLite) • Offline" last />
      </Card>

      <Card style={styles.card}>
        <View style={styles.cardTitle}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <AppText variant="subtitle">Sobre o aplicativo</AppText>
        </View>
        <AppText variant="body">
          Controle de Gastos Familiar é um aplicativo offline-first para registrar receitas e
          despesas do dia a dia e acompanhar o orçamento da família.
        </AppText>
        <AppText variant="caption">
          Projeto Integrador em Computação II (DRP04) • UNIVESP{'\n'}
          Versão 1.0.0
        </AppText>
      </Card>
    </ScreenScroll>
  );
}

function InfoRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.infoRow,
        { borderBottomColor: colors.border, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth },
      ]}>
      <AppText variant="body" color={colors.textMuted}>
        {label}
      </AppText>
      <AppText variant="label">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
});
