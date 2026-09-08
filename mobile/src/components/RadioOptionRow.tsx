import React from "react";
import { Pressable, View } from "react-native";
import { Body, Heading } from "./Typography";
import { colors, radii, shadow } from "../theme/tokens";

type Props = {
  name: string;
  note: string;
  trailing?: string;
  trailingColor?: string;
  selected: boolean;
  onPress: () => void;
};

export function RadioOptionRow({ name, note, trailing, trailingColor, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 13,
          padding: 16,
          borderRadius: radii.md,
          backgroundColor: selected ? colors.greenTint : colors.surface,
          marginBottom: 10
        },
        selected ? { borderWidth: 2, borderColor: colors.green } : shadow.sm
      ]}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 999,
          borderWidth: 2,
          borderColor: selected ? colors.green : colors.inkA(0.25),
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {selected ? <View style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: colors.green }} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <Body weight="semibold" style={{ fontSize: 15 }}>{name}</Body>
        <Body style={{ fontSize: 12, color: colors.inkA(0.58), marginTop: 2 }}>{note}</Body>
      </View>
      {trailing ? (
        <Heading style={{ fontSize: 17, color: trailingColor ?? colors.ink }}>{trailing}</Heading>
      ) : null}
    </Pressable>
  );
}
