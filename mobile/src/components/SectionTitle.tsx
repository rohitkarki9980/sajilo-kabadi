import React from "react";
import { View, Pressable } from "react-native";
import { Heading, Body } from "./Typography";
import { colors } from "../theme/tokens";

type Props = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  marginTop?: number;
};

export function SectionTitle({ title, actionLabel, onAction, marginTop = 24 }: Props) {
  return (
    <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop, marginBottom: 10, marginHorizontal: 2 }}>
      <Heading style={{ fontSize: 20 }}>{title}</Heading>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Body weight="bold" style={{ fontSize: 13, color: colors.brownLink }}>
            {actionLabel}
          </Body>
        </Pressable>
      ) : null}
    </View>
  );
}
