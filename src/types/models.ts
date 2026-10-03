export type TransactionType = 'income' | 'expense';

/**
 * Categoria de lançamento. Espelha a tabela `categories` do SQLite.
 */
export interface Category {
  id: number;
  name: string;
  /** Nome do ícone Ionicons (ex.: "fast-food-outline"). */
  icon: string;
  /** Cor em hexadecimal usada na interface (ex.: "#10B981"). */
  color: string;
  /** Limite mensal de gastos. `null` significa "sem limite definido". */
  monthly_limit: number | null;
}

/**
 * Lançamento financeiro. Espelha a tabela `transactions` do SQLite.
 */
export interface Transaction {
  id: number;
  title: string;
  /** Valor sempre positivo; o sinal é definido por `type`. */
  amount: number;
  type: TransactionType;
  category_id: number | null;
  /** Data do lançamento no formato ISO `YYYY-MM-DD`. */
  date: string;
  /** Data/hora de criação no formato ISO completo. */
  created_at: string;
}

export type TransactionInput = Omit<Transaction, 'id' | 'created_at'>;

export type CategoryInput = Omit<Category, 'id'>;

export type ThemePreference = 'system' | 'light' | 'dark';

export interface MonthSummary {
  income: number;
  expense: number;
  balance: number;
}
