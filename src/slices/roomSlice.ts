import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Channel, User } from "../models/channel";

export interface AuthState {
  currentRoom: Channel | null;
  speakingUsers: number[];
}

const initialState: AuthState = {
  currentRoom: null,
  speakingUsers: [],
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setSpeakingUsers(state, action: PayloadAction<AuthState["speakingUsers"]>) {
      state.speakingUsers = action.payload;
    },
    setRoom(state, action: PayloadAction<Channel | null>) {
      state.currentRoom = action.payload;
    },
    addRoomUser(state, action: PayloadAction<User>) {
      state.currentRoom?.users.push(action.payload);
    },
    removeRoomUser(state, action: PayloadAction<{ user_id: number }>) {
      if (state.currentRoom?.users)
        state.currentRoom.users = state.currentRoom?.users.filter(
          (u) => u.user_id !== action.payload.user_id
        );
    },
  },
});

export const roomReducer = roomSlice.reducer;

export const roomActions = roomSlice.actions;
