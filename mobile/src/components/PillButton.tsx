import React from "react";
import { Pressable, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { colors, fonts, radii } from "../theme/tokens";
import { Icon } from "./Icon";
import { Body } from "./Typography";
import type { IconName } from "../theme/icons";

type Variant = "primary" | "secondary" | "dark" | "outline" | "ghost";

const VARIANT_BG: Record<Variant, string> = {
  primary: colors.red,
  secondary: colors.green,
  dark: colors.ink,
  outline: "transparent",
  ghost: "transparent"
};

const VARIANT_FG: Record<Variant, string> = {
  primary: colors.white,
  secondary: colors.white,
  dark: colors.cream,
  outline: colors.ink,
  ghost: colors.ink
};

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: IconName;
  height?: number;
  flex?: number;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  textColor?: string;
};

export function PillButton({ label, onPress, variant = "primary", icon, height = 52, flex, style, disabled, textColor }: Props) {
  const bg = VARIANT_BG[variant];
  const fg = textColor ?? VARIANT_FG[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          height,
          flex,
          backgroundColor: bg,
          borderWidth: variant === "outline" ? 1 : 0,
          borderColor: colors.inkA(0.16),
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }]
        },
        style
      ]}
    >
      {icon ? <Icon name={icon} size={18} color={fg} /> : null}
      <Body weight="regular" style={{ fontFamily: fonts.heading, fontSize: 16, color: fg }}>
        {label}
      </Body>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 20
  }
});
