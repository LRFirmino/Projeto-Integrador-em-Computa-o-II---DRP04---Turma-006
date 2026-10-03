import type { Transaction } from '@/types/models';

/** Arredonda para 2 casas decimais evitando erros de ponto flutuante. */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Formata um número como moeda brasileira (R$). */
export function formatCurrency(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(safe);
}

/** Formata valor com sinal explícito (+/-) conforme o tipo. */
export function formatSignedCurrency(value: number, type: Transaction['type']): string {
  const sign = type === 'income' ? '+' : '-';
  return `${sign} ${formatCurrency(Math.abs(value))}`;
}

/** Converte um objeto Date para o formato ISO de data `YYYY-MM-DD` (fuso local). */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Retorna a data de hoje no formato `YYYY-MM-DD`. */
export function todayISO(): string {
  return toISODate(new Date());
}

/** Converte `YYYY-MM-DD` em Date local (sem deslocamento de fuso). */
export function parseISODate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Retorna o primeiro dia do mês de uma data no formato `YYYY-MM-DD`. */
export function monthStartISO(reference: Date = new Date()): string {
  return toISODate(new Date(reference.getFullYear(), reference.getMonth(), 1));
}

/** Retorna o último dia do mês de uma data no formato `YYYY-MM-DD`. */
export function monthEndISO(reference: Date = new Date()): string {
  return toISODate(new Date(reference.getFullYear(), reference.getMonth() + 1, 0));
}

const MONTHS_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

/** Nome do mês em português, ex.: "Outubro 2026". */
export function formatMonthYear(reference: Date): string {
  return `${MONTHS_PT[reference.getMonth()]} ${reference.getFullYear()}`;
}

/** Nome curto do mês, ex.: "Out". */
export function formatShortMonth(reference: Date): string {
  return MONTHS_PT[reference.getMonth()].slice(0, 3);
}

/** Formata data `YYYY-MM-DD` como `DD/MM`. */
export function formatShortDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

/**
 * Rótulo amigável do cabeçalho de agrupamento:
 * "Hoje", "Ontem" ou uma data por extenso curta (ex.: "12 de set.").
 */
export function formatGroupLabel(iso: string): string {
  const today = todayISO();
  const yesterday = toISODate(new Date(Date.now() - 86_400_000));
  if (iso === today) return 'Hoje';
  if (iso === yesterday) return 'Ontem';
  return parseISODate(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

/** Converte texto digitado ("1.234,56" ou "1234.56") em número. */
export function parseCurrencyInput(raw: string): number {
  if (!raw) return 0;
  const normalized = raw
    .replace(/[^\d.,-]/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.');
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? Math.abs(value) : 0;
}

/** Agrupa transações por data preservando a ordem de entrada. */
export function groupTransactionsByDate<T extends { date: string }>(
  transactions: T[],
): { date: string; data: T[] }[] {
  const groups: { date: string; data: T[] }[] = [];
  for (const tx of transactions) {
    const last = groups[groups.length - 1];
    if (last && last.date === tx.date) {
      last.data.push(tx);
    } else {
      groups.push({ date: tx.date, data: [tx] });
    }
  }
  return groups;
}
