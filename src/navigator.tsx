import React, { useEffect, useState } from "react";
import {
  CardStyleInterpolators,
  createStackNavigator,
} from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import Login from "./screens/login";
import VerificationCode from "./screens/verification-code";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setToken } from "./utils/token";
import Home from "./screens/home";

export type StackParamList = {
  Login: undefined;
  VerificationCode: { phonenumber: string };
  Home: undefined;
};

const Stack = createStackNavigator<StackParamList>();

const Navigator = () => {
  const [loadingToken, setLoadingToken] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    let token = await AsyncStorage.getItem("token");
    if (token) {
      setToken(token);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    setLoadingToken(false);
  };

  if (loadingToken) return null;

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
          animationEnabled: true,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
        mode="card"
      >
        {isLoggedIn ? (
          <>
            <Stack.Screen
              name="Home"
              component={Home}
              options={{ headerShown: false }}
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
