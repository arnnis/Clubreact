import React from "react";
import { registerRootComponent } from "expo";
import { Provider as ReduxProvider } from "react-redux";
import { QueryClient, QueryClientProvider } from "react-query";
import PubNub from "pubnub";
import { PubNubProvider, usePubNub } from "pubnub-react";
import { ToastProvider } from "react-native-fast-toast";
import App from "./App";
import { store, persistor } from "./src/store/store";
import { PersistGate } from "redux-persist/integration/react";
import RtcProvider from "./src/contexts/rtcContext";
import { ThemeProvider } from "./src/contexts/theme/provider";
import { RoomProvider } from "./src/contexts/room/provider";

const queryClient = new QueryClient({
  defaultConfig: {
    queries: {
      cacheTime: 0,
    },
  },
});

const Root = () => (
  <ReduxProvider store={store}>
    <PersistGate persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        <RtcProvider>
          <ToastProvider>
            <ThemeProvider>
              <RoomProvider>
                <App />
              </RoomProvider>
            </ThemeProvider>
          </ToastProvider>
        </RtcProvider>
      </QueryClientProvider>
    </PersistGate>
  </ReduxProvider>
);

registerRootComponent(Root);
