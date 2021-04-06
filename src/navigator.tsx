import React from "react";
import {
  CardStyleInterpolators,
  createStackNavigator,
} from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import Login from "./screens/login";
import VerificationCode from "./screens/verification-code";
import Home from "./screens/home";
import Room from "./screens/room";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";

export type StackParamList = {
  Login: undefined;
  VerificationCode: { phonenumber: string };
  Home: undefined;
  Room: { channel_id: number; channel: string };
};

const Stack = createStackNavigator<StackParamList>();

const Navigator = () => {
  const authState = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: "#f2efe4",
            borderBottomWidth: 0,
            shadowRadius: 0,
            shadowOffset: {
              height: 0,
              width: 0,
            },
          },
          headerTintColor: "#333",
          animationEnabled: true,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      >
        {!!authState.auth_token ? (
          <>
            <Stack.Screen
              name="Home"
              component={Home}
              options={{ title: "All rooms", headerShown: false }}
            />
            <Stack.Screen
              name="Room"
              component={Room}
              options={{ title: "" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={Login}
              options={{ title: "" }}
            />
            <Stack.Screen
              name="VerificationCode"
              component={VerificationCode}
              options={{ title: "" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigator;
