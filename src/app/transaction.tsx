import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DateField } from '@/components/DateField';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Chip, SegmentedControl } from '@/components/ui/SegmentedControl';
import { TextField } from '@/components/ui/TextField';
import { useFinance } from '@/context/FinanceContext';
import { useTheme } from '@/context/ThemeContext';
import { getTransaction } from '@/db';
import { spacing } from '@/theme';
import type { TransactionType } from '@/types/models';
import { parseCurrencyInput, todayISO } from '@/utils/format';

export default function TransactionFormScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; type?: string; categoryId?: string }>();
  const { categories, transactions, addTransaction, editTransaction, removeTransaction } =
    useFinance();

  const editingId = params.id ? Number(params.id) : null;

  const [type, setType] = useState<TransactionType>(
    params.type === 'income' ? 'income' : 'expense',
  );
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(
    params.categoryId ? Number(params.categoryId) : null,
  );
  const [date, setDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Ao editar, prefere a transação já carregada; senão busca no banco
  // (caso ela pertença a um mês que não está no contexto atual).
  useEffect(() => {
    if (!editingId) return;
    let active = true;
    const cached = transactions.find((t) => t.id === editingId);
    const apply = (tx: {
      type: TransactionType;
      amount: number;
      title: string;
      category_id: number | null;
      date: string;
    }) => {
      setType(tx.type);
      setAmount(String(tx.amount).replace('.', ','));
      setTitle(tx.title ?? '');
      setCategoryId(tx.category_id);
      setDate(tx.date);
    };
    if (cached) {
      apply(cached);
      return () => {
        active = false;
      };
    }
    getTransaction(editingId).then((tx) => {
      if (active && tx) apply(tx);
    });
    return () => {
      active = false;
    };
  }, [editingId, transactions]);

  // Categoria padrão em um novo lançamento.
  useEffect(() => {
    if (editingId || categoryId !== null || categories.length === 0) return;
    setCategoryId(categories.find((c) => c.name === 'Alimentação')?.id ?? categories[0].id);
  }, [categories, categoryId, editingId]);

  const accent = type === 'income' ? colors.income : colors.expense;

  const categoryName = useMemo(
    () => categories.find((c) => c.id === categoryId)?.name,
    [categories, categoryId],
  );

  const handleSave = async () => {
    const parsed = parseCurrencyInput(amount);
    if (parsed <= 0) {
      setError('Informe um valor maior que zero.');
      return;
    }
    setSaving(true);
    try {
      const input = {
        amount: parsed,
        type,
        title: title.trim() || categoryName || 'Lançamento',
        category_id: categoryId,
        date,
      };
      if (editingId) await editTransaction(editingId, input);
      else await addTransaction(input);
      router.back();
    } catch {
      setError('Não foi possível salvar. Tente novamente.');
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!editingId) return;
    Alert.alert('Excluir lançamento', 'Deseja realmente excluir este lançamento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await removeTransaction(editingId);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.screen, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Fechar">
            <Ionicons name="close" size={26} color={colors.text} />
          </Pressable>
          <AppText variant="subtitle">
            {editingId ? 'Editar lançamento' : 'Novo lançamento'}
          </AppText>
          {editingId ? (
            <Pressable onPress={handleDelete} hitSlop={12} accessibilityLabel="Excluir">
              <Ionicons name="trash-outline" size={22} color={colors.danger} />
            </Pressable>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <SegmentedControl<TransactionType>
            value={type}
            onChange={setType}
            options={[
              { value: 'expense', label: 'Despesa', color: colors.expense },
              { value: 'income', label: 'Receita', color: colors.income },
            ]}
          />

          <TextField
            large
            prefix="R$"
            value={amount}
            onChangeText={(text) => {
              setAmount(text);
              setError('');
            }}
            placeholder="0,00"
            keyboardType="decimal-pad"
            autoFocus={!editingId}
            selectionColor={accent}
          />

          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <AppText variant="caption" style={styles.fieldLabel}>
                Categoria
              </AppText>
              {categoryName ? (
                <AppText variant="caption" color={accent}>
                  {categoryName}
                </AppText>
              ) : null}
            </View>
            <View style={styles.chips}>
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  label={category.name}
                  icon={category.icon as keyof typeof Ionicons.glyphMap}
                  color={category.color}
                  selected={categoryId === category.id}
                  onPress={() => setCategoryId(category.id)}
                />
              ))}
            </View>
          </View>

          <TextField
            label="Descrição (opcional)"
            icon="create-outline"
            value={title}
            onChangeText={setTitle}
            placeholder="Ex.: Padaria, almoço, gasolina..."
            returnKeyType="done"
          />

          <DateField label="Data" value={date} onChange={setDate} />

          {error ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={15} color={colors.danger} />
              <AppText variant="caption" color={colors.danger}>
                {error}
              </AppText>
            </View>
          ) : null}

          <Button
            label={saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Salvar lançamento'}
            icon="checkmark-circle-outline"
            fullWidth
            disabled={saving}
            onPress={handleSave}
            style={{ backgroundColor: accent }}
          />

          <AppText variant="caption" center>
            Dica: valor + categoria já bastam — a descrição é opcional.
          </AppText>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerSpacer: { width: 26 },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  field: { gap: spacing.sm },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  fieldLabel: { marginLeft: 0 },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
});
