import React from "react";
import {
  CardStyleInterpolators,
  createStackNavigator,
} from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import Login from "./screens/login";
import VerificationCode from "./screens/verification-code";
import Home from "./screens/home";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import Room from "./screens/room";
import { useTheme } from "./contexts/theme/context";
import UserProfile from "./screens/user-profile";
import { User } from "./models/channel";
import IsWaitlisted from "./screens/is-waitlisted";
import Register from "./screens/signup";
import Explore from "./screens/explore";

export type StackParamList = {
  Login: undefined;
  VerificationCode: { phonenumber: string };
  Home: undefined;
  Room: { channel_id: number; channel: string };
  UserProfile: { user_id: number; user: User };
  IsWaitlisted: undefined;
  Register: undefined;
  Explore: undefined;
};

const Stack = createStackNavigator<StackParamList>();

const Navigator = () => {
  const authState = useSelector((state: RootState) => state.auth);
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.bg,
            borderBottomWidth: 0,
            shadowRadius: 0,
            shadowOffset: {
              height: 0,
              width: 0,
            },
            elevation: 0,
          },
          headerTintColor: theme.fg,
          animationEnabled: true,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      >
        {authState.auth_token ? (
          authState.is_waitlisted ? (
            <Stack.Screen
              name="IsWaitlisted"
              component={IsWaitlisted}
              options={{ title: "Invitation" }}
            />
          ) : authState.is_onboarding ? (
            <Stack.Screen
              name="Register"
              component={Register}
              options={{ title: "" }}
            />
          ) : (
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
              <Stack.Screen
                name="UserProfile"
                component={UserProfile}
                options={{ title: "" }}
              />
              <Stack.Screen name="Explore" component={Explore} />
            </>
          )
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
