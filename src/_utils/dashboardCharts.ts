import dayjs, { Dayjs } from 'dayjs';
import { DateRange } from '@mui/x-date-pickers-pro/models';
import type { Transaction } from '../_pages/transactionGrid';

export const normalizeTransactionType = (type: string): 'Income' | 'Expense' | 'Other' => {
    const t = (type || '').trim().toLowerCase();
    if (t === 'income' || t === 'credit') return 'Income';
    if (t === 'expense' || t === 'debit') return 'Expense';
    return 'Other';
};

export const isInDateRange = (dateStr: string, range: DateRange<Dayjs>): boolean => {
    const td = dayjs(dateStr);
    if (!td.isValid()) return false;

    const [start, end] = range;
    if (start && end) {
        return !td.isBefore(start, 'day') && !td.isAfter(end, 'day');
    }
    if (start) return !td.isBefore(start, 'day');
    if (end) return !td.isAfter(end, 'day');
    return true;
};

export const filterDashboardTransactions = (
    transactions: Transaction[],
    dateRange: DateRange<Dayjs>,
    categoryId: string,
): Transaction[] => {
    let filtered = transactions.filter((t) => isInDateRange(t.TransactionDate, dateRange));
    if (categoryId !== 'all') {
        const id = parseInt(categoryId, 10);
        if (!Number.isNaN(id)) {
            filtered = filtered.filter((t) => t.CategoryID?.id === id);
        }
    }
    return filtered;
};

/** Every calendar day from start through end (inclusive). */
export const daysInRange = (range: DateRange<Dayjs>): string[] => {
    const [start, end] = range;
    if (!start || !end) return [];

    const labels: string[] = [];
    let cur = start.startOf('day');
    const last = end.startOf('day');

    while (cur.isBefore(last) || cur.isSame(last, 'day')) {
        labels.push(cur.format('YYYY-MM-DD'));
        cur = cur.add(1, 'day');
    }
    return labels;
};

export type DashboardTotals = {
    income: number;
    expense: number;
    balance: number;
};

export const computeTotals = (transactions: Transaction[]): DashboardTotals => {
    let income = 0;
    let expense = 0;

    transactions.forEach((t) => {
        const amount = Number(t.Amount) || 0;
        const kind = normalizeTransactionType(t.TransactionType);
        if (kind === 'Income') income += amount;
        else if (kind === 'Expense') expense += amount;
    });

    return {
        income: roundMoney(income),
        expense: roundMoney(expense),
        balance: roundMoney(income - expense),
    };
};

export type TimeSeriesChart = {
    labels: string[];
    income: number[];
    expense: number[];
};

export const buildTimeSeries = (
    transactions: Transaction[],
    dateRange: DateRange<Dayjs>,
): TimeSeriesChart => {
    const incomeByDay: Record<string, number> = {};
    const expenseByDay: Record<string, number> = {};

    transactions.forEach((t) => {
        const dateKey = dayjs(t.TransactionDate).format('YYYY-MM-DD');
        const amount = Number(t.Amount) || 0;
        const kind = normalizeTransactionType(t.TransactionType);
        if (kind === 'Income') {
            incomeByDay[dateKey] = (incomeByDay[dateKey] || 0) + amount;
        } else if (kind === 'Expense') {
            expenseByDay[dateKey] = (expenseByDay[dateKey] || 0) + amount;
        }
    });

    const rangeLabels = daysInRange(dateRange);
    const labels =
        rangeLabels.length > 0
            ? rangeLabels
            : Array.from(
                  new Set([...Object.keys(incomeByDay), ...Object.keys(expenseByDay)]),
              ).sort();

    return {
        labels,
        income: labels.map((d) => roundMoney(incomeByDay[d] || 0)),
        expense: labels.map((d) => roundMoney(expenseByDay[d] || 0)),
    };
};

export type CategoryAmount = {
    name: string;
    amount: number;
};

export const aggregateByCategory = (
    transactions: Transaction[],
    type: 'Income' | 'Expense',
): CategoryAmount[] => {
    const map = new Map<string, number>();

    transactions.forEach((t) => {
        if (normalizeTransactionType(t.TransactionType) !== type) return;
        const name = t.CategoryID?.Name?.trim() || 'Uncategorized';
        map.set(name, (map.get(name) || 0) + (Number(t.Amount) || 0));
    });

    return Array.from(map.entries())
        .map(([name, amount]) => ({ name, amount: roundMoney(amount) }))
        .filter((e) => e.amount > 0)
        .sort((a, b) => b.amount - a.amount);
};

export const roundMoney = (n: number) => Math.round(n * 100) / 100;

export const formatInr = (n: number) =>
    `₹ ${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n)}`;
