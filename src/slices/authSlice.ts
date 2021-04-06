import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LoginResult, UserProfile } from "../types";

export interface AuthState {
  user_profile: UserProfile | null;
  access_token: string | null;
  auth_token: string | null;
  refresh_token: string | null;
  is_verified: boolean;
  is_waitlisted: boolean;
  is_onboarding: boolean;
}

const initialState: AuthState = {
  user_profile: null,
  access_token: null,
  auth_token: null,
  refresh_token: null,
  is_verified: false,
  is_waitlisted: false,
  is_onboarding: false,
};

const authSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<LoginResult>) {
      state.user_profile = action.payload.user_profile;
      state.access_token = action.payload.access_token;
      state.auth_token = action.payload.auth_token;
      state.refresh_token = action.payload.refresh_token;
      state.is_verified = action.payload.is_verified;
      state.is_waitlisted = action.payload.is_waitlisted;
      state.is_onboarding = action.payload.is_onboarding;
    },
    logout(state) {
      state = Object.assign(state, initialState);
    },
  },
});

export const authReducer = authSlice.reducer;

export const authActions = authSlice.actions;
