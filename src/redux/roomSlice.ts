import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface JoinedRoom {
    roomCode: string;
    roomName: string;
    joinedAt: number;
}

interface RoomState {
    joinedRooms: JoinedRoom[];
    bump: number;
}

const initialState: RoomState = {
    joinedRooms: [],
    bump: 0,
};

const roomSlice = createSlice({
    name: 'room',
    initialState,
    reducers: {
        rememberJoinedRoom(state, action: PayloadAction<JoinedRoom>) {
            const existing = state.joinedRooms.find((r) => r.roomCode === action.payload.roomCode);
            if (!existing) state.joinedRooms.unshift(action.payload);
        },
        forgetJoinedRoom(state, action: PayloadAction<string>) {
            state.joinedRooms = state.joinedRooms.filter((r) => r.roomCode !== action.payload);
        },
        bumpRoomData(state) {
            state.bump = (state.bump + 1) % 1_000_000;
        },
    },
});

export const {
    rememberJoinedRoom,
    forgetJoinedRoom,
    bumpRoomData,
} = roomSlice.actions;
export default roomSlice.reducer;
