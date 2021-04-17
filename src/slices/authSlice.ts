import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LoginUserProfile, LoginResult } from "../models/user";

export interface AuthState {
  user_profile: LoginUserProfile | null;
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
    setAuth(state, action: PayloadAction<Partial<LoginResult>>) {
      if (action.payload.user_profile !== undefined)
        state.user_profile = action.payload.user_profile;
      if (action.payload.access_token !== undefined)
        state.access_token = action.payload.access_token;
      if (action.payload.auth_token !== undefined)
        state.auth_token = action.payload.auth_token;
      if (action.payload.refresh_token !== undefined)
        state.refresh_token = action.payload.refresh_token;
      if (action.payload.is_verified !== undefined)
        state.is_verified = action.payload.is_verified;
      if (action.payload.is_waitlisted !== undefined)
        state.is_waitlisted = action.payload.is_waitlisted;
      if (action.payload.is_onboarding !== undefined)
        state.is_onboarding = action.payload.is_onboarding;
    },

    logout(state) {
      state.user_profile = null;
      state.access_token = null;
      state.auth_token = null;
      state.refresh_token = null;
      state.is_verified = false;
      state.is_waitlisted = false;
      state.is_onboarding = false;
    },
  },
});

export const authReducer = authSlice.reducer;

export const authActions = authSlice.actions;
