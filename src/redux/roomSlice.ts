import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface JoinedRoom {
    roomId: string;
    memberName: string;
    joinedAt: number;
}

interface RoomState {
    memberName: string | null;
    joinedRooms: JoinedRoom[];
    bump: number;
}

const initialState: RoomState = {
    memberName: null,
    joinedRooms: [],
    bump: 0,
};

const roomSlice = createSlice({
    name: 'room',
    initialState,
    reducers: {
        setMemberName(state, action: PayloadAction<string>) {
            state.memberName = action.payload.trim();
        },
        clearMemberName(state) {
            state.memberName = null;
        },
        rememberJoinedRoom(state, action: PayloadAction<JoinedRoom>) {
            const existing = state.joinedRooms.find((r) => r.roomId === action.payload.roomId);
            if (!existing) state.joinedRooms.unshift(action.payload);
        },
        forgetJoinedRoom(state, action: PayloadAction<string>) {
            state.joinedRooms = state.joinedRooms.filter((r) => r.roomId !== action.payload);
        },
        bumpRoomData(state) {
            state.bump = (state.bump + 1) % 1_000_000;
        },
    },
});

export const {
    setMemberName,
    clearMemberName,
    rememberJoinedRoom,
    forgetJoinedRoom,
    bumpRoomData,
} = roomSlice.actions;
export default roomSlice.reducer;
