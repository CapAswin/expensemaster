import type { APIBalance, APIRoomExpense } from './roomsAPI';

export type SettleTransfer = {
    from: string;
    to: string;
    amount: number;
};

export type UserSettlementSummary = {
    paid: number;
    owed: number;
    net: number;
    /** Still to pay others: max(0, your share − what you already paid). */
    amountToPay: number;
    /** Still to receive: max(0, what you paid − your share). */
    amountToReceive: number;
    status: 'owe' | 'owed' | 'settled';
};

export type UserExpenseHistoryRow = {
    expenseId: number;
    date: string;
    description: string;
    totalAmount: number;
    paidByUsername: string;
    yourShare: number;
    youPaid: boolean;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Compute balances from expenses (same rules as Django RoomBalanceView).
 * net = paid − owed (positive ⇒ others owe you).
 */
export const computeBalancesFromExpenses = (
    expenses: APIRoomExpense[],
    members: { id: number; username: string }[],
): APIBalance[] => {
    const paid: Record<number, number> = {};
    const owed: Record<number, number> = {};
    for (const m of members) {
        paid[m.id] = 0;
        owed[m.id] = 0;
    }

    for (const exp of expenses) {
        if (paid[exp.paid_by_id] !== undefined) {
            paid[exp.paid_by_id] += exp.amount;
        }
        for (const s of exp.shares) {
            if (owed[s.user_id] !== undefined) {
                owed[s.user_id] += s.share_amount;
            }
        }
    }

    return members.map((m) => {
        const p = round2(paid[m.id] ?? 0);
        const o = round2(owed[m.id] ?? 0);
        return {
            user_id: m.id,
            username: m.username,
            paid: p,
            owed: o,
            net: round2(p - o),
        };
    });
};

export const getUserBalanceById = (
    balances: APIBalance[],
    userId: number,
): APIBalance | undefined => balances.find((b) => b.user_id === userId);

export const getUserBalance = (
    balances: APIBalance[],
    username: string,
): APIBalance | undefined => balances.find((b) => b.username === username);

export const getUserSettlementSummary = (
    balances: APIBalance[],
    userIdOrUsername: number | string,
): UserSettlementSummary | null => {
    const mine =
        typeof userIdOrUsername === 'number'
            ? getUserBalanceById(balances, userIdOrUsername)
            : getUserBalance(balances, userIdOrUsername);
    if (!mine) return null;

    const paid = round2(mine.paid);
    const owed = round2(mine.owed);
    const net = round2(paid - owed);
    const amountToPay = round2(Math.max(0, owed - paid));
    const amountToReceive = round2(Math.max(0, paid - owed));
    const status: UserSettlementSummary['status'] =
        amountToPay > 0.01 ? 'owe' : amountToReceive > 0.01 ? 'owed' : 'settled';

    return {
        paid,
        owed,
        net,
        amountToPay,
        amountToReceive,
        status,
    };
};

export const getPaymentsYouOwe = (
    username: string,
    transfers: SettleTransfer[],
): SettleTransfer[] => transfers.filter((t) => t.from === username);

export const getPaymentsYouReceive = (
    username: string,
    transfers: SettleTransfer[],
): SettleTransfer[] => transfers.filter((t) => t.to === username);

export const buildUserExpenseHistory = (
    expenses: APIRoomExpense[],
    userId: number,
): UserExpenseHistoryRow[] =>
    expenses
        .map((e) => {
            const share = e.shares.find((s) => s.user_id === userId);
            const youPaid = e.paid_by_id === userId;
            if (!share && !youPaid) return null;

            return {
                expenseId: e.id,
                date: e.created_at,
                description: e.description || 'Expense',
                totalAmount: e.amount,
                paidByUsername: e.paid_by_username,
                yourShare: share?.share_amount ?? 0,
                youPaid,
            };
        })
        .filter((row): row is UserExpenseHistoryRow => row !== null);

/** Sum of "your share" column — should match summary.owed. */
export const sumHistoryShares = (history: UserExpenseHistoryRow[]) =>
    round2(history.reduce((s, row) => s + row.yourShare, 0));

/**
 * Suggested payments (debtor → creditor), greedy two-pointer on sorted balances.
 */
export const settleUp = (balances: Record<string, number>): SettleTransfer[] => {
    const transfers: SettleTransfer[] = [];

    const debtors = Object.entries(balances)
        .filter(([, bal]) => bal < -0.01)
        .map(([name, bal]) => ({ name, remaining: round2(-bal) }))
        .sort((a, b) => b.remaining - a.remaining);

    const creditors = Object.entries(balances)
        .filter(([, bal]) => bal > 0.01)
        .map(([name, bal]) => ({ name, remaining: round2(bal) }))
        .sort((a, b) => b.remaining - a.remaining);

    let i = 0;
    let j = 0;
    while (i < debtors.length && j < creditors.length) {
        const amount = round2(Math.min(debtors[i].remaining, creditors[j].remaining));
        if (amount >= 0.01) {
            transfers.push({
                from: debtors[i].name,
                to: creditors[j].name,
                amount,
            });
        }
        debtors[i].remaining = round2(debtors[i].remaining - amount);
        creditors[j].remaining = round2(creditors[j].remaining - amount);
        if (debtors[i].remaining < 0.01) i += 1;
        if (creditors[j].remaining < 0.01) j += 1;
    }

    return transfers;
};
