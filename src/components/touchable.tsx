import React, { FC } from "react";
import {
  Platform,
  StyleSheet,
  TouchableNativeFeedback,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

const Touchable: FC<TouchableOpacityProps> = ({
  children,
  style,
  ...props
}) => {
  if (Platform.OS === "android") {
    return (
      <TouchableNativeFeedback
        background={TouchableNativeFeedback.Ripple("rgba(0,0,0,.2)", false)}
        {...props}
      >
        <View style={style}>{children}</View>
      </TouchableNativeFeedback>
    );
  }
  return <TouchableOpacity {...props} />;
};

const styles = StyleSheet.create({
  container: {},
});

export default Touchable;
