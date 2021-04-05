import React, { FC } from "react";
import { View, ViewProps, ViewStyle } from "react-native";

interface Props extends ViewProps {
  justify?: ViewStyle["justifyContent"];
  align?: ViewStyle["alignItems"];
  direction?: ViewStyle["flexDirection"];
}

const Flex: FC<Props> = ({
  justify,
  align,
  direction,
  style,
  children,
  ...rest
}) => (
  <View
    style={[
      { justifyContent: justify, alignItems: align, flexDirection: direction },
      style,
    ]}
    {...rest}
  >
    {children}
  </View>
);

export default Flex;
