import axios from 'axios';
import axiosInstance from './axios';

// ---------- API types (mirrors backend responses) ----------

export interface APIRoomMember {
    id: number;
    username: string;
    email: string;
    joined_at: string;
}

export interface APIRoom {
    id: number;
    name: string;
    room_code: string;
    created_by_username: string;
    created_at: string;
    members: APIRoomMember[];
    member_count: number;
}

export interface APIExpenseShare {
    user_id: number;
    username: string;
    share_amount: number;
}

export interface APIRoomExpense {
    id: number;
    amount: number;
    description: string;
    created_at: string;
    paid_by_id: number;
    paid_by_username: string;
    shares: APIExpenseShare[];
}

export interface APIBalance {
    user_id: number;
    username: string;
    paid: number;
    owed: number;
    net: number;
}

export interface APIBalancesResponse {
    room_code: string;
    total_spent: number;
    balances: APIBalance[];
}

export interface RoomInfo {
    name: string;
    room_code: string;
    member_count: number;
    created_by: string;
}

const normalizeRoomCode = (roomCode: string) => roomCode.trim().toUpperCase();

/** Public invite preview — no auth required. */
const publicApi = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/',
});

export const getApiErrorMessage = (err: unknown, fallback: string): string => {
    if (!axios.isAxiosError(err)) return fallback;
    const data = err.response?.data;
    if (typeof data === 'string') return data;
    if (data && typeof data === 'object') {
        if ('detail' in data && typeof data.detail === 'string') return data.detail;
        const firstKey = Object.keys(data)[0];
        const val = firstKey ? (data as Record<string, unknown>)[firstKey] : undefined;
        if (Array.isArray(val) && typeof val[0] === 'string') return val[0];
        if (typeof val === 'string') return val;
    }
    if (err.message === 'Network Error') {
        return 'Cannot reach the server. Is Django running on port 8000?';
    }
    return fallback;
};

// ---------- Room CRUD ----------

export const apiListRooms = (): Promise<APIRoom[]> =>
    axiosInstance.get('/api/rooms/').then((r) => r.data);

export const apiCreateRoom = (data: {
    name: string;
    password: string;
}): Promise<APIRoom> =>
    axiosInstance.post('/api/rooms/create/', data).then((r) => r.data);

export const apiJoinRoom = (data: {
    room_code: string;
    password: string;
}): Promise<APIRoom & { joined: boolean }> =>
    axiosInstance
        .post('/api/rooms/join/', {
            room_code: normalizeRoomCode(data.room_code),
            password: data.password,
        })
        .then((r) => r.data);

export const apiGetRoom = (roomCode: string): Promise<APIRoom> =>
    axiosInstance.get(`/api/rooms/${normalizeRoomCode(roomCode)}/`).then((r) => r.data);

export const apiLeaveRoom = (roomCode: string): Promise<void> =>
    axiosInstance.post(`/api/rooms/${normalizeRoomCode(roomCode)}/leave/`).then(() => undefined);

// ---------- Expenses ----------

export const apiListExpenses = (roomCode: string): Promise<APIRoomExpense[]> =>
    axiosInstance
        .get(`/api/rooms/${normalizeRoomCode(roomCode)}/expenses/`)
        .then((r) => r.data);

export const apiAddExpense = (
    roomCode: string,
    data: {
        amount: number;
        description?: string;
        paid_by?: number;
        split_among?: number[];
        shares?: Record<string, number>;
    },
): Promise<APIRoomExpense> =>
    axiosInstance
        .post(`/api/rooms/${normalizeRoomCode(roomCode)}/expenses/`, data)
        .then((r) => r.data);

export const apiDeleteExpense = (
    roomCode: string,
    expenseId: number,
): Promise<void> =>
    axiosInstance
        .delete(`/api/rooms/${normalizeRoomCode(roomCode)}/expenses/${expenseId}/`)
        .then(() => undefined);

// ---------- Balances ----------

export const apiGetBalances = (roomCode: string): Promise<APIBalancesResponse> =>
    axiosInstance
        .get(`/api/rooms/${normalizeRoomCode(roomCode)}/balances/`)
        .then((r) => r.data);

// ---------- Public / invite ----------

export const apiGetRoomInfo = (roomCode: string): Promise<RoomInfo> =>
    publicApi.get(`/api/rooms/${normalizeRoomCode(roomCode)}/info/`).then((r) => r.data);

export const apiCheckMembership = (
    roomCode: string,
): Promise<{ is_member: boolean; name: string; room_code: string }> =>
    axiosInstance
        .get(`/api/rooms/${normalizeRoomCode(roomCode)}/check/`)
        .then((r) => r.data);
