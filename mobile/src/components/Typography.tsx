import React from "react";
import { Text, TextProps } from "react-native";
import { colors, fonts } from "../theme/tokens";

type Weight = "regular" | "semibold" | "bold";

const weightFont: Record<Weight, string> = {
  regular: fonts.body,
  semibold: fonts.bodySemibold,
  bold: fonts.bodyBold
};

export function Heading({ style, ...rest }: TextProps) {
  return <Text {...rest} style={[{ fontFamily: fonts.heading, color: colors.ink }, style]} />;
}

export function Body({ weight = "regular", style, ...rest }: TextProps & { weight?: Weight }) {
  return <Text {...rest} style={[{ fontFamily: weightFont[weight], color: colors.ink, fontSize: 14 }, style]} />;
}

export function Kicker({ style, ...rest }: TextProps) {
  return (
    <Text
      {...rest}
      style={[
        { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 0.9, textTransform: "uppercase", color: colors.inkA(0.45) },
        style
      ]}
    />
  );
}
