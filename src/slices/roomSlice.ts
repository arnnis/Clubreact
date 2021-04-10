import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthState {
  speakingUsers: number[];
}

const initialState: AuthState = {
  speakingUsers: [],
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setSpeakingUsers(state, action: PayloadAction<AuthState["speakingUsers"]>) {
      state.speakingUsers = action.payload;
    },
  },
});

export const roomReducer = roomSlice.reducer;

export const roomActions = roomSlice.actions;
