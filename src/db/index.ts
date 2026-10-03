import * as SQLite from 'expo-sqlite';

import { DATABASE_NAME, migrateDatabase } from '@/db/schema';
import type { Category, CategoryInput, Transaction, TransactionInput } from '@/types/models';

export interface TransactionWithCategory extends Transaction {
  category_name: string | null;
  category_color: string | null;
  category_icon: string | null;
}

export interface TransactionFilter {
  /** Texto buscado em título ou nome da categoria. */
  search?: string;
  /** 'all' | 'income' | 'expense'. */
  type?: 'all' | 'income' | 'expense';
  categoryId?: number | null;
  /** Data inicial inclusiva (`YYYY-MM-DD`). */
  startDate?: string;
  /** Data final inclusiva (`YYYY-MM-DD`). */
  endDate?: string;
  limit?: number;
}

export interface CategoryExpense {
  id: number;
  name: string;
  icon: string;
  color: string;
  monthly_limit: number | null;
  spent: number;
}

export interface MonthlyTotal {
  /** Chave no formato `YYYY-MM`. */
  month: string;
  income: number;
  expense: number;
}

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Abre (uma única vez) o banco local e garante o schema criado. */
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DATABASE_NAME).then(async (db) => {
      await migrateDatabase(db);
      return db;
    });
  }
  return dbPromise;
}

/* -------------------------------------------------------------------------- */
/*                                  Categorias                                */
/* -------------------------------------------------------------------------- */

export async function listCategories(): Promise<Category[]> {
  const db = await getDatabase();
  return db.getAllAsync<Category>('SELECT * FROM categories ORDER BY name COLLATE NOCASE ASC;');
}

export async function getCategory(id: number): Promise<Category | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Category>('SELECT * FROM categories WHERE id = ?;', id);
}

export async function createCategory(input: CategoryInput): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO categories (name, icon, color, monthly_limit) VALUES (?, ?, ?, ?);',
    input.name,
    input.icon,
    input.color,
    input.monthly_limit,
  );
  return result.lastInsertRowId;
}

export async function updateCategory(id: number, input: CategoryInput): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE categories SET name = ?, icon = ?, color = ?, monthly_limit = ? WHERE id = ?;',
    input.name,
    input.icon,
    input.color,
    input.monthly_limit,
    id,
  );
}

export async function deleteCategory(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM categories WHERE id = ?;', id);
}

/* -------------------------------------------------------------------------- */
/*                                 Transações                                 */
/* -------------------------------------------------------------------------- */

const TRANSACTION_SELECT = `
  SELECT
    t.*,
    c.name  AS category_name,
    c.color AS category_color,
    c.icon  AS category_icon
  FROM transactions t
  LEFT JOIN categories c ON c.id = t.category_id
`;

export async function listTransactions(
  filter: TransactionFilter = {},
): Promise<TransactionWithCategory[]> {
  const db = await getDatabase();
  const where: string[] = [];
  const params: (string | number)[] = [];

  if (filter.type && filter.type !== 'all') {
    where.push('t.type = ?');
    params.push(filter.type);
  }
  if (typeof filter.categoryId === 'number') {
    where.push('t.category_id = ?');
    params.push(filter.categoryId);
  }
  if (filter.startDate) {
    where.push('t.date >= ?');
    params.push(filter.startDate);
  }
  if (filter.endDate) {
    where.push('t.date <= ?');
    params.push(filter.endDate);
  }
  if (filter.search && filter.search.trim()) {
    where.push('(t.title LIKE ? OR c.name LIKE ?)');
    const term = `%${filter.search.trim()}%`;
    params.push(term, term);
  }

  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const limit = filter.limit ? `LIMIT ${Math.floor(filter.limit)}` : '';

  return db.getAllAsync<TransactionWithCategory>(
    `${TRANSACTION_SELECT} ${clause} ORDER BY t.date DESC, t.id DESC ${limit};`,
    ...params,
  );
}

export async function getTransaction(id: number): Promise<TransactionWithCategory | null> {
  const db = await getDatabase();
  return db.getFirstAsync<TransactionWithCategory>(
    `${TRANSACTION_SELECT} WHERE t.id = ?;`,
    id,
  );
}

export async function createTransaction(input: TransactionInput): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO transactions (title, amount, type, category_id, date)
     VALUES (?, ?, ?, ?, ?);`,
    input.title,
    input.amount,
    input.type,
    input.category_id,
    input.date,
  );
  return result.lastInsertRowId;
}

export async function updateTransaction(id: number, input: TransactionInput): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE transactions
       SET title = ?, amount = ?, type = ?, category_id = ?, date = ?
     WHERE id = ?;`,
    input.title,
    input.amount,
    input.type,
    input.category_id,
    input.date,
    id,
  );
}

export async function deleteTransaction(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM transactions WHERE id = ?;', id);
}

/* -------------------------------------------------------------------------- */
/*                              Consultas / resumo                            */
/* -------------------------------------------------------------------------- */

/** Soma de entradas, saídas e saldo em um intervalo de datas. */
export async function getPeriodSummary(
  startDate: string,
  endDate: string,
): Promise<{ income: number; expense: number; balance: number }> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ income: number | null; expense: number | null }>(
    `SELECT
       SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) AS income,
       SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
     FROM transactions
     WHERE date >= ? AND date <= ?;`,
    startDate,
    endDate,
  );
  const income = row?.income ?? 0;
  const expense = row?.expense ?? 0;
  return { income, expense, balance: income - expense };
}

/** Gasto por categoria (apenas despesas) em um intervalo de datas. */
export async function getCategoryExpenses(
  startDate: string,
  endDate: string,
): Promise<CategoryExpense[]> {
  const db = await getDatabase();
  return db.getAllAsync<CategoryExpense>(
    `SELECT
       c.id,
       c.name,
       c.icon,
       c.color,
       c.monthly_limit,
       COALESCE(SUM(t.amount), 0) AS spent
     FROM categories c
     LEFT JOIN transactions t
       ON t.category_id = c.id
      AND t.type = 'expense'
      AND t.date >= ?
      AND t.date <= ?
     GROUP BY c.id
     ORDER BY spent DESC, c.name COLLATE NOCASE ASC;`,
    startDate,
    endDate,
  );
}

/**
 * Totais de entradas/saídas por mês para os últimos `months` meses.
 * Sempre retorna os meses em ordem cronológica, preenchendo meses sem
 * movimentação com zero.
 */
export async function getMonthlyTotals(months = 6): Promise<MonthlyTotal[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ month: string; income: number | null; expense: number | null }>(
    `SELECT
       substr(date, 1, 7) AS month,
       SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) AS income,
       SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
     FROM transactions
     GROUP BY month
     ORDER BY month ASC;`,
  );

  const map = new Map(rows.map((r) => [r.month, r]));
  const result: MonthlyTotal[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const found = map.get(key);
    result.push({ month: key, income: found?.income ?? 0, expense: found?.expense ?? 0 });
  }
  return result;
}

/** Saldo acumulado considerando tudo o que foi lançado até hoje. */
export async function getTotalBalance(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ balance: number | null }>(
    `SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS balance
     FROM transactions;`,
  );
  return row?.balance ?? 0;
}

/* -------------------------------------------------------------------------- */
/*                                 Configurações                              */
/* -------------------------------------------------------------------------- */

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?;',
    key,
  );
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value;`,
    key,
    value,
  );
}
