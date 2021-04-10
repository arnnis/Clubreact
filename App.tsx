import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import Navigator from "./src/navigator";
import { LogBox } from "react-native";
import Toast from "react-native-fast-toast";
import RoomMiniPlayer from "./src/components/room-mini-player";

// This log comes from rtc/pubnub depencency
Platform.OS !== "web" &&
  LogBox.ignoreLogs(["Setting a timer for a long period of time"]);

export default function App() {
  const [loaded, error] = useFonts({
    "Nunito-Regular": require("./src/assets/fonts/Nunito/Nunito-Regular.ttf"),
    "Nunito-SemiBold": require("./src/assets/fonts/Nunito/Nunito-SemiBold.ttf"),
    "Nunito-Bold": require("./src/assets/fonts/Nunito/Nunito-Bold.ttf"),
    "Nunito-Light": require("./src/assets/fonts/Nunito/Nunito-Light.ttf"),
  });
  if (!loaded) return null;

  return (
    <View style={styles.container}>
      <Navigator />
      <StatusBar style="auto" />
      <Toast ref={(ref) => (global["toast"] = ref)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: Platform.select({ web: "30%", default: undefined }),
  },
});
