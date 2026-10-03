import type { SQLiteDatabase } from 'expo-sqlite';

import type { CategoryInput } from '@/types/models';

export const DATABASE_NAME = 'controle_gastos.db';

/**
 * Script de criação do schema local (SQLite).
 *
 * Tabelas:
 *  1. `categories`   (`id`, `name`, `icon`, `color`, `monthly_limit`)
 *  2. `transactions` (`id`, `title`, `amount`, `type`, `category_id`, `date`, `created_at`)
 *  3. `settings`     (chave/valor para preferências locais, ex.: tema)
 */
export const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL UNIQUE,
  icon          TEXT    NOT NULL DEFAULT 'pricetag-outline',
  color         TEXT    NOT NULL DEFAULT '#10B981',
  monthly_limit REAL
);

CREATE TABLE IF NOT EXISTS transactions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  amount      REAL    NOT NULL,
  type        TEXT    NOT NULL CHECK (type IN ('income', 'expense')),
  category_id INTEGER,
  date        TEXT    NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions (category_id);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

/**
 * Categorias iniciais (com ícones e cores). Cada família pode editar os
 * limites mensais na tela "Categorias".
 */
const DEFAULT_CATEGORIES: CategoryInput[] = [
  { name: 'Alimentação', icon: 'restaurant-outline', color: '#10B981', monthly_limit: 800 },
  { name: 'Transporte', icon: 'car-outline', color: '#3B82F6', monthly_limit: 400 },
  { name: 'Lanches', icon: 'fast-food-outline', color: '#F59E0B', monthly_limit: 250 },
  { name: 'Assinaturas', icon: 'card-outline', color: '#8B5CF6', monthly_limit: 120 },
  { name: 'Moradia', icon: 'home-outline', color: '#14B8A6', monthly_limit: 1500 },
  { name: 'Saúde', icon: 'medkit-outline', color: '#EC4899', monthly_limit: 300 },
  { name: 'Lazer', icon: 'game-controller-outline', color: '#F97316', monthly_limit: 200 },
  { name: 'Outros', icon: 'pricetag-outline', color: '#6B7280', monthly_limit: null },
];

/** Cria o schema e popula as categorias padrão na primeira execução. */
export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(SCHEMA_SQL);
  await seedDefaultCategories(db);
}

async function seedDefaultCategories(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM categories;',
  );
  if ((row?.count ?? 0) > 0) return;

  for (const category of DEFAULT_CATEGORIES) {
    await db.runAsync(
      'INSERT INTO categories (name, icon, color, monthly_limit) VALUES (?, ?, ?, ?);',
      category.name,
      category.icon,
      category.color,
      category.monthly_limit,
    );
  }
}
