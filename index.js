import React from "react";
import { registerRootComponent } from "expo";
import { Provider as ReduxProvider } from "react-redux";
import { QueryClient, QueryClientProvider } from "react-query";
import App from "./App";
import { store, persistor } from "./src/store/store";
import { PersistGate } from "redux-persist/integration/react";
import RtcEngineProvider from "./src/contexts/rtcEngineContext";

const queryClient = new QueryClient();

const Root = () => (
  <ReduxProvider store={store}>
    <PersistGate persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        <RtcEngineProvider>
          <App />
        </RtcEngineProvider>
      </QueryClientProvider>
    </PersistGate>
  </ReduxProvider>
);

registerRootComponent(Root);
