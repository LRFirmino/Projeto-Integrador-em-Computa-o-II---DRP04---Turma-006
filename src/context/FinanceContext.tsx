import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  createCategory,
  createTransaction,
  deleteCategory,
  deleteTransaction,
  getCategoryExpenses,
  getPeriodSummary,
  getTotalBalance,
  listCategories,
  listTransactions,
  updateCategory,
  updateTransaction,
  type CategoryExpense,
  type TransactionWithCategory,
} from '@/db';
import type { Category, CategoryInput, TransactionInput } from '@/types/models';
import { monthEndISO, monthStartISO } from '@/utils/format';

interface FinanceContextValue {
  /** Mês selecionado (base para dashboard, relatórios e limites). */
  month: Date;
  setMonth: (month: Date) => void;
  /** Data inicial/final do mês selecionado (`YYYY-MM-DD`). */
  monthRange: { start: string; end: string };

  categories: Category[];
  transactions: TransactionWithCategory[];
  categoryExpenses: CategoryExpense[];
  summary: { income: number; expense: number; balance: number };
  totalBalance: number;

  loading: boolean;
  reload: () => Promise<void>;

  addTransaction: (input: TransactionInput) => Promise<number>;
  editTransaction: (id: number, input: TransactionInput) => Promise<void>;
  removeTransaction: (id: number) => Promise<void>;

  addCategory: (input: CategoryInput) => Promise<number>;
  editCategory: (id: number, input: CategoryInput) => Promise<void>;
  removeCategory: (id: number) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [month, setMonthState] = useState<Date>(() => new Date());
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
  const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpense[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const monthRange = useMemo(
    () => ({ start: monthStartISO(month), end: monthEndISO(month) }),
    [month],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, txs, expenses, periodSummary, total] = await Promise.all([
        listCategories(),
        listTransactions({ startDate: monthRange.start, endDate: monthRange.end }),
        getCategoryExpenses(monthRange.start, monthRange.end),
        getPeriodSummary(monthRange.start, monthRange.end),
        getTotalBalance(),
      ]);
      setCategories(cats);
      setTransactions(txs);
      setCategoryExpenses(expenses);
      setSummary(periodSummary);
      setTotalBalance(total);
    } finally {
      setLoading(false);
    }
  }, [monthRange.start, monthRange.end]);

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [load]);

  const setMonth = useCallback((next: Date) => {
    setMonthState(new Date(next.getFullYear(), next.getMonth(), 1));
  }, []);

  const reload = useCallback(async () => {
    await load();
  }, [load]);

  const addTransaction = useCallback(
    async (input: TransactionInput) => {
      const id = await createTransaction(input);
      await reload();
      return id;
    },
    [reload],
  );

  const editTransaction = useCallback(
    async (id: number, input: TransactionInput) => {
      await updateTransaction(id, input);
      await reload();
    },
    [reload],
  );

  const removeTransaction = useCallback(
    async (id: number) => {
      await deleteTransaction(id);
      await reload();
    },
    [reload],
  );

  const addCategory = useCallback(
    async (input: CategoryInput) => {
      const id = await createCategory(input);
      await reload();
      return id;
    },
    [reload],
  );

  const editCategory = useCallback(
    async (id: number, input: CategoryInput) => {
      await updateCategory(id, input);
      await reload();
    },
    [reload],
  );

  const removeCategory = useCallback(
    async (id: number) => {
      await deleteCategory(id);
      await reload();
    },
    [reload],
  );

  const value = useMemo<FinanceContextValue>(
    () => ({
      month,
      setMonth,
      monthRange,
      categories,
      transactions,
      categoryExpenses,
      summary,
      totalBalance,
      loading,
      reload,
      addTransaction,
      editTransaction,
      removeTransaction,
      addCategory,
      editCategory,
      removeCategory,
    }),
    [
      month,
      setMonth,
      monthRange,
      categories,
      transactions,
      categoryExpenses,
      summary,
      totalBalance,
      loading,
      reload,
      addTransaction,
      editTransaction,
      removeTransaction,
      addCategory,
      editCategory,
      removeCategory,
    ],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceContextValue {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance deve ser usado dentro de <FinanceProvider>.');
  return ctx;
}
