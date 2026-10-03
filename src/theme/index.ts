/**
 * Design tokens do aplicativo (Modern Minimalist & Clean).
 *
 * Paleta de valores:
 *  - Entradas/Receitas -> verde esmeralda (`income`)
 *  - Saídas/Despesas   -> vermelho coral (`expense`)
 *  - Indicadores de orçamento -> verde (dentro do limite) / vermelho (excedido)
 */

export const palette = {
  emerald: '#10B981',
  emeraldDark: '#059669',
  coral: '#F43F5E',
  coralDark: '#E11D48',
  teal: '#0F766E',
  amber: '#F59E0B',
} as const;

export interface ThemeColors {
  /** Fundo geral das telas. */
  background: string;
  /** Cards e superfícies elevadas. */
  card: string;
  /** Superfície secundária (inputs, chip inativo). */
  surface: string;
  /** Borda sutil. */
  border: string;
  /** Texto principal. */
  text: string;
  /** Texto secundário/legendas. */
  textMuted: string;
  /** Texto sobre a cor primária. */
  onPrimary: string;
  /** Texto sobre a cor de perigo. */
  onDanger: string;
  /** Texto sobre cores de destaque genéricas. */
  textOnAccent: string;
  /** Cor de destaque/primária (marca). */
  primary: string;
  /** Fundo suave da cor primária. */
  primarySoft: string;
  /** Cor de entrada/receita. */
  income: string;
  /** Fundo suave de receita. */
  incomeSoft: string;
  /** Cor de saída/despesa. */
  expense: string;
  /** Fundo suave de despesa. */
  expenseSoft: string;
  /** Estado de orçamento saudável. */
  success: string;
  /** Estado de orçamento no limite/excedido. */
  danger: string;
  /** Estado de atenção. */
  warning: string;
  /** Fundo suave de atenção. */
  warningSoft: string;
  /** Cor base das sombras (rgba). */
  shadow: string;
  /** Overlay de modais. */
  overlay: string;
}

export const lightColors: ThemeColors = {
  background: '#F5F6F8',
  card: '#FFFFFF',
  surface: '#EEF1F4',
  border: '#E4E8ED',
  text: '#0F1720',
  textMuted: '#69737E',
  onPrimary: '#FFFFFF',
  onDanger: '#FFFFFF',
  textOnAccent: '#FFFFFF',
  primary: palette.teal,
  primarySoft: 'rgba(15, 118, 110, 0.10)',
  income: palette.emerald,
  incomeSoft: 'rgba(16, 185, 129, 0.12)',
  expense: palette.coral,
  expenseSoft: 'rgba(244, 63, 94, 0.12)',
  success: palette.emerald,
  danger: palette.coral,
  warning: palette.amber,
  warningSoft: 'rgba(245, 158, 11, 0.14)',
  shadow: 'rgba(15, 23, 42, 0.12)',
  overlay: 'rgba(15, 23, 42, 0.45)',
};

export const darkColors: ThemeColors = {
  background: '#0A0E13',
  card: '#141A21',
  surface: '#1E262F',
  border: '#2A333D',
  text: '#F3F6F8',
  textMuted: '#94A1AE',
  onPrimary: '#04231A',
  onDanger: '#3B0A12',
  textOnAccent: '#FFFFFF',
  primary: '#34D399',
  primarySoft: 'rgba(52, 211, 153, 0.14)',
  income: '#34D399',
  incomeSoft: 'rgba(52, 211, 153, 0.16)',
  expense: '#FB7185',
  expenseSoft: 'rgba(251, 113, 133, 0.16)',
  success: '#34D399',
  danger: '#FB7185',
  warning: '#FBBF24',
  warningSoft: 'rgba(251, 191, 36, 0.16)',
  shadow: 'rgba(0, 0, 0, 0.55)',
  overlay: 'rgba(0, 0, 0, 0.65)',
};

export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** Paleta sugerida para novas categorias. */
export const categoryColorOptions = [
  '#10B981',
  '#F43F5E',
  '#F59E0B',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F97316',
  '#6366F1',
  '#EF4444',
];

/** Cores fixas de fallback para ícones de categoria sem cor válida. */
export const FALLBACK_CATEGORY_COLOR = '#6B7280';

export { shadow } from './shadow';
