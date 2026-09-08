import React from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import { Heading, Body } from "./Typography";
import { colors, radii } from "../theme/tokens";

type Props = {
  value: string;
  label: string;
  tone?: "greenTint" | "redTint" | "surface" | "greenTint2";
  flex?: number;
  style?: StyleProp<ViewStyle>;
};

const TONE_BG: Record<NonNullable<Props["tone"]>, string> = {
  greenTint: colors.greenTint,
  redTint: colors.redTint,
  surface: colors.surface,
  greenTint2: colors.greenTint2
};

export function StatTile({ value, label, tone = "surface", flex, style }: Props) {
  return (
    <View style={[{ flex, borderRadius: radii.md, backgroundColor: TONE_BG[tone], padding: 14 }, style]}>
      <Heading style={{ fontSize: 20 }}>{value}</Heading>
      <Body style={{ fontSize: 11, color: colors.inkA(0.6), marginTop: 4 }}>{label}</Body>
    </View>
  );
}
