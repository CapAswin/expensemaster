/**
 * Rooms data layer (localStorage backed).
 *
 * THIS IS THE ONLY FILE TO REPLACE WHEN MIGRATING TO A REAL BACKEND.
 * Every page imports from here, so swap each function body with an axios call
 * and the rest of the app keeps working unchanged.
 *
 * Storage shape under localStorage["expensemaster:rooms"]:
 *   { [roomId]: Room }
 */

export type RoomMember = {
    name: string;
    joinedAt: number;
};

export type SplitMode = 'equal' | 'exact';

export type RoomExpense = {
    id: string;
    description: string;
    amount: number;
    paidBy: string;
    splitAmong: string[];
    splitMode: SplitMode;
    exactSplits?: Record<string, number>;
    date: string; // YYYY-MM-DD
    createdAt: number;
};

export type Room = {
    id: string;
    name: string;
    passwordHash: string;
    createdBy: string;
    createdAt: number;
    members: RoomMember[];
    expenses: RoomExpense[];
};

export type SettleTransfer = {
    from: string;
    to: string;
    amount: number;
};

const ROOMS_KEY = 'expensemaster:rooms';

// ---------- internal helpers ----------

const readAll = (): Record<string, Room> => {
    try {
        const raw = localStorage.getItem(ROOMS_KEY);
        return raw ? (JSON.parse(raw) as Record<string, Room>) : {};
    } catch {
        return {};
    }
};

const writeAll = (rooms: Record<string, Room>) => {
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
};

// Tiny non-cryptographic hash. Good enough for "did you type the right password
// to enter a local demo room" — NOT real security.
const hash = (s: string): string => {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return h.toString(36);
};

const genId = (): string => {
    const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no ambiguous chars
    const pick = (n: number) =>
        Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
    return `${pick(3)}-${pick(3)}`;
};

const genExpenseId = (): string =>
    `e_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

// ---------- public API ----------

export const listAllRooms = (): Room[] => Object.values(readAll());

export const getRoom = (id: string): Room | undefined => readAll()[id];

export const createRoom = (params: {
    name: string;
    password: string;
    creatorName: string;
}): Room => {
    const all = readAll();
    let id = genId();
    while (all[id]) id = genId();

    const room: Room = {
        id,
        name: params.name.trim(),
        passwordHash: hash(params.password),
        createdBy: params.creatorName,
        createdAt: Date.now(),
        members: [{ name: params.creatorName, joinedAt: Date.now() }],
        expenses: [],
    };

    all[id] = room;
    writeAll(all);
    return room;
};

export type JoinResult =
    | { ok: true; room: Room }
    | { ok: false; reason: 'not-found' | 'bad-password' };

export const joinRoom = (params: {
    id: string;
    password: string;
    memberName: string;
}): JoinResult => {
    const id = params.id.trim().toUpperCase();
    const all = readAll();
    const room = all[id];
    if (!room) return { ok: false, reason: 'not-found' };
    if (room.passwordHash !== hash(params.password)) return { ok: false, reason: 'bad-password' };

    if (!room.members.find((m) => m.name === params.memberName)) {
        room.members.push({ name: params.memberName, joinedAt: Date.now() });
        all[id] = room;
        writeAll(all);
    }
    return { ok: true, room };
};

export const addExpense = (
    roomId: string,
    expense: Omit<RoomExpense, 'id' | 'createdAt'>,
): Room | undefined => {
    const all = readAll();
    const room = all[roomId];
    if (!room) return undefined;
    room.expenses.unshift({ ...expense, id: genExpenseId(), createdAt: Date.now() });
    all[roomId] = room;
    writeAll(all);
    return room;
};

export const removeExpense = (roomId: string, expenseId: string): Room | undefined => {
    const all = readAll();
    const room = all[roomId];
    if (!room) return undefined;
    room.expenses = room.expenses.filter((e) => e.id !== expenseId);
    all[roomId] = room;
    writeAll(all);
    return room;
};

export const leaveRoom = (roomId: string, memberName: string): Room | undefined => {
    const all = readAll();
    const room = all[roomId];
    if (!room) return undefined;
    room.members = room.members.filter((m) => m.name !== memberName);
    all[roomId] = room;
    writeAll(all);
    return room;
};

export const deleteRoom = (roomId: string): void => {
    const all = readAll();
    delete all[roomId];
    writeAll(all);
};

// ---------- invite-link encoding (workaround for cross-browser sharing) ----------

/**
 * Encode a room into a URL-safe base64 payload that fully represents the room
 * (members + expenses snapshot). The recipient can paste it into a `?invite=`
 * query param and the app will import the room into their local storage.
 *
 * NOTE: This is a one-way snapshot — later changes don't sync. For real
 * multi-user with live updates, swap this file's functions for a backend.
 */
export const encodeInvite = (room: Room): string => {
    const json = JSON.stringify(room);
    // utf-8 safe btoa
    const b64 = btoa(unescape(encodeURIComponent(json)));
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const decodeInvite = (payload: string): Room | null => {
    try {
        const padded = payload.replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(escape(atob(padded)));
        const parsed = JSON.parse(json) as Room;
        if (!parsed?.id || !parsed?.name || !Array.isArray(parsed?.members)) return null;
        return parsed;
    } catch {
        return null;
    }
};

/**
 * Imports a room from an invite payload into local storage. If a room with
 * the same id already exists locally, the existing one is preserved (so we
 * don't overwrite expenses added on this device).
 */
export const importRoomFromInvite = (payload: string): Room | null => {
    const incoming = decodeInvite(payload);
    if (!incoming) return null;
    const all = readAll();
    if (!all[incoming.id]) {
        all[incoming.id] = incoming;
        writeAll(all);
    }
    return all[incoming.id];
};

/**
 * Build the full invite URL — relative to the current origin + base path so it
 * works in dev (localhost), GitHub Pages homepage path, or wherever the app is hosted.
 */
export const buildInviteLink = (room: Room): string => {
    return `${window.location.origin}/rooms?invite=${encodeInvite(room)}`;
};

// ---------- math: net balances + settle-up ----------

/**
 * Returns a map of memberName -> net balance.
 *   positive = others owe them this much
 *   negative = they owe others this much
 *
 * Equal splits divide the expense evenly among `splitAmong`.
 * Exact splits use the per-member exact amounts.
 */
export const computeBalances = (room: Room): Record<string, number> => {
    const balances: Record<string, number> = {};
    room.members.forEach((m) => {
        balances[m.name] = 0;
    });

    room.expenses.forEach((e) => {
        balances[e.paidBy] = (balances[e.paidBy] ?? 0) + e.amount;

        if (e.splitMode === 'exact' && e.exactSplits) {
            Object.entries(e.exactSplits).forEach(([name, owed]) => {
                balances[name] = (balances[name] ?? 0) - owed;
            });
        } else {
            const share = e.amount / Math.max(1, e.splitAmong.length);
            e.splitAmong.forEach((name) => {
                balances[name] = (balances[name] ?? 0) - share;
            });
        }
    });

    // Round to 2 decimals to avoid float noise
    Object.keys(balances).forEach((k) => {
        balances[k] = Math.round(balances[k] * 100) / 100;
    });
    return balances;
};

/**
 * Greedy minimization: at each step transfer the max possible from the biggest
 * debtor to the biggest creditor until everyone is settled.
 */
export const settleUp = (balances: Record<string, number>): SettleTransfer[] => {
    const transfers: SettleTransfer[] = [];
    const list = Object.entries(balances)
        .map(([name, bal]) => ({ name, bal }))
        .filter((x) => Math.abs(x.bal) > 0.01);

    while (list.length > 1) {
        list.sort((a, b) => a.bal - b.bal); // most negative first
        const debtor = list[0];
        const creditor = list[list.length - 1];
        if (debtor.bal >= -0.01 || creditor.bal <= 0.01) break;

        const amount = Math.min(-debtor.bal, creditor.bal);
        const rounded = Math.round(amount * 100) / 100;
        if (rounded < 0.01) break;

        transfers.push({ from: debtor.name, to: creditor.name, amount: rounded });
        debtor.bal += rounded;
        creditor.bal -= rounded;

        if (Math.abs(debtor.bal) < 0.01) list.shift();
        if (Math.abs(creditor.bal) < 0.01) list.pop();
    }

    return transfers;
};
