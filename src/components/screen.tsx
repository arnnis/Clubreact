import React, { FC } from "react";
import { SafeAreaView, StyleSheet, ViewProps } from "react-native";
import { useTheme } from "../contexts/theme/context";

interface Props extends ViewProps {}

const Screen: FC<Props> = ({ children, style, ...rest }) => {
  const { theme } = useTheme();
  console.log("theme", theme);
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.bg }, style]}
      {...rest}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
});

export default Screen;
