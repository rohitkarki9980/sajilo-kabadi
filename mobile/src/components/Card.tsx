import React from "react";
import { View, ViewProps, StyleProp, ViewStyle } from "react-native";
import { colors, radii, shadow } from "../theme/tokens";

type Props = ViewProps & {
  tone?: "surface" | "ink" | "green" | "greenTint" | "redTint" | "greenTint2";
  padded?: boolean;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
};

const TONE_BG: Record<NonNullable<Props["tone"]>, string> = {
  surface: colors.surface,
  ink: colors.ink,
  green: colors.green,
  greenTint: colors.greenTint,
  redTint: colors.redTint,
  greenTint2: colors.greenTint2
};

export function Card({ tone = "surface", padded = true, elevated = false, style, children, ...rest }: Props) {
  return (
    <View
      {...rest}
      style={[
        { borderRadius: radii.lg, backgroundColor: TONE_BG[tone] },
        padded && { padding: 18 },
        elevated && shadow.sm,
        style
      ]}
    >
      {children}
    </View>
  );
}
