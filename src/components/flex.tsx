import React, { FC } from "react";
import { View, ViewProps, ViewStyle } from "react-native";

interface Props extends ViewProps {
  justify?: ViewStyle["justifyContent"];
  align?: ViewStyle["alignItems"];
  direction?: ViewStyle["flexDirection"];
  flex?: ViewStyle["flex"];
}

const Flex: FC<Props> = ({
  justify,
  align,
  direction,
  style,
  flex,
  children,
  ...rest
}) => (
  <View
    style={[
      {
        flex,
        justifyContent: justify,
        alignItems: align,
        flexDirection: direction,
      },
      style,
    ]}
    {...rest}
  >
    {children}
  </View>
);

export default Flex;
