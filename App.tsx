import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import React from "react";
import { StyleSheet, View } from "react-native";
import Navigator from "./src/navigator";

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
      {/* <StatusBar style="auto" /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
