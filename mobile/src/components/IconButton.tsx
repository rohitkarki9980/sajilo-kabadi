import React from "react";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import { Icon } from "./Icon";
import { colors } from "../theme/tokens";
import type { IconName } from "../theme/icons";

type Props = {
  name: IconName | string;
  onPress?: () => void;
  size?: number;
  bg?: string;
  iconColor?: string;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({ name, onPress, size = 44, bg = colors.inkA(0.06), iconColor = colors.ink, iconSize = 19, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: 999,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.93 : 1 }]
        },
        style
      ]}
    >
      <Icon name={name} size={iconSize} color={iconColor} />
    </Pressable>
  );
}
