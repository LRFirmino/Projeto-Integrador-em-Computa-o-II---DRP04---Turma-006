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

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { TextField } from '@/components/ui/TextField';
import { useFinance } from '@/context/FinanceContext';
import { useTheme } from '@/context/ThemeContext';
import { categoryColorOptions, radius, spacing } from '@/theme';
import { parseCurrencyInput } from '@/utils/format';

const ICON_OPTIONS: (keyof typeof Ionicons.glyphMap)[] = [
  'restaurant-outline',
  'fast-food-outline',
  'cafe-outline',
  'car-outline',
  'bus-outline',
  'bicycle-outline',
  'home-outline',
  'cart-outline',
  'card-outline',
  'medkit-outline',
  'school-outline',
  'game-controller-outline',
  'airplane-outline',
  'paw-outline',
  'shirt-outline',
  'gift-outline',
  'construct-outline',
  'pricetag-outline',
];

export default function CategoryFormScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { categories, addCategory, editCategory, removeCategory } = useFinance();

  const editingId = params.id ? Number(params.id) : null;
  const editing = useMemo(
    () => (editingId ? categories.find((c) => c.id === editingId) : undefined),
    [editingId, categories],
  );

  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string>(ICON_OPTIONS[0] as string);
  const [color, setColor] = useState(categoryColorOptions[0]);
  const [limit, setLimit] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editing) return;
    setName(editing.name);
    setIcon(editing.icon);
    setColor(editing.color);
    setLimit(editing.monthly_limit != null ? String(editing.monthly_limit).replace('.', ',') : '');
  }, [editing]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Dê um nome para a categoria.');
      return;
    }
    setSaving(true);
    try {
      const parsedLimit = limit.trim() ? parseCurrencyInput(limit) : 0;
      const input = {
        name: name.trim(),
        icon,
        color,
        monthly_limit: parsedLimit > 0 ? parsedLimit : null,
      };
      if (editingId) await editCategory(editingId, input);
      else await addCategory(input);
      router.back();
    } catch {
      setError('Não foi possível salvar. Verifique se o nome já existe.');
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!editingId) return;
    Alert.alert(
      'Excluir categoria',
      'Os lançamentos desta categoria ficarão "sem categoria". Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await removeCategory(editingId);
            router.back();
          },
        },
      ],
    );
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
          <AppText variant="subtitle">{editingId ? 'Editar categoria' : 'Nova categoria'}</AppText>
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
          <View style={styles.preview}>
            <CategoryIcon icon={icon} color={color} size={76} />
            <AppText variant="subtitle">{name || 'Nome da categoria'}</AppText>
          </View>

          <TextField
            label="Nome"
            icon="pricetag-outline"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setError('');
            }}
            placeholder="Ex.: Alimentação, Transporte..."
          />

          <TextField
            label="Limite mensal (opcional)"
            prefix="R$"
            value={limit}
            onChangeText={setLimit}
            placeholder="0,00"
            keyboardType="decimal-pad"
          />

          <View style={styles.field}>
            <AppText variant="caption" style={styles.fieldLabel}>
              Ícone
            </AppText>
            <View style={styles.iconGrid}>
              {ICON_OPTIONS.map((option) => {
                const selected = icon === option;
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setIcon(option)}
                    style={[
                      styles.iconOption,
                      {
                        backgroundColor: selected ? `${color}22` : colors.surface,
                        borderColor: selected ? color : 'transparent',
                      },
                    ]}>
                    <Ionicons name={option} size={22} color={selected ? color : colors.textMuted} />
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <AppText variant="caption" style={styles.fieldLabel}>
              Cor
            </AppText>
            <View style={styles.colorGrid}>
              {categoryColorOptions.map((option) => (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected: color === option }}
                  onPress={() => setColor(option)}
                  style={[
                    styles.colorOption,
                    {
                      backgroundColor: option,
                      borderColor: color === option ? colors.text : 'transparent',
                    },
                  ]}>
                  {color === option ? (
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  ) : null}
                </Pressable>
              ))}
            </View>
          </View>

          {error ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={15} color={colors.danger} />
              <AppText variant="caption" color={colors.danger}>
                {error}
              </AppText>
            </View>
          ) : null}

          <Button
            label={saving ? 'Salvando...' : 'Salvar categoria'}
            icon="checkmark-circle-outline"
            fullWidth
            disabled={saving}
            onPress={handleSave}
          />
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
  content: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxl },
  preview: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  field: { gap: spacing.sm },
  fieldLabel: { marginLeft: spacing.xs },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
});
