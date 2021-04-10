import {
  combineReducers,
  configureStore,
  getDefaultMiddleware,
} from "@reduxjs/toolkit";
import { createLogger } from "redux-logger";
import { persistReducer, persistStore } from "redux-persist";
import persistConfig from "./persistConfig";
import { authReducer } from "../slices/authSlice";
import { roomReducer } from "../slices/roomSlice";

const logger = createLogger();
const middleware = [
  ...getDefaultMiddleware({ serializableCheck: false }),
  logger,
];

const rootReducer = combineReducers({
  auth: authReducer,
  room: roomReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const persistedReducer = persistReducer<RootState>(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware,
});

export const persistor = persistStore(store);
