import React, { FC } from "react";
import { SafeAreaView, StyleSheet, ViewProps } from "react-native";

interface Props extends ViewProps {}

const Screen: FC<Props> = ({ children, style, ...rest }) => {
  return (
    <SafeAreaView style={[styles.container, style]} {...rest}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f2efe4",
  },
});

export default Screen;
