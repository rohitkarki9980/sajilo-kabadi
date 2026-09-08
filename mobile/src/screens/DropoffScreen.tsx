import React from "react";
import { View } from "react-native";
import { ScreenChrome } from "../components/ScreenChrome";
import { Card } from "../components/Card";
import { IconButton } from "../components/IconButton";
import { Body } from "../components/Typography";
import { colors, radii } from "../theme/tokens";
import { useApiGet } from "../api/useApi";
import { DropoffCenter } from "../api/types";

export function DropoffScreen() {
  const { data } = useApiGet<{ centers: DropoffCenter[] }>("/dropoff-centers");

  return (
    <ScreenChrome crumb="Near Jhamsikhel" title="Drop-off centers">
      <View style={{ height: 230, borderRadius: radii.lg, backgroundColor: colors.greenTint2, overflow: "hidden" }} />

      {(data?.centers ?? []).map((c) => (
        <Card key={c.id} style={{ marginTop: 12, flexDirection: "row", gap: 14, alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <Body weight="semibold" style={{ fontSize: 15 }}>{c.name}</Body>
            <Body style={{ fontSize: 12, color: colors.inkA(0.58), marginTop: 2 }}>{c.meta}</Body>
            <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill, backgroundColor: colors.greenTint }}>
                <Body weight="bold" style={{ fontSize: 11, color: colors.greenText }}>{c.tag1}</Body>
              </View>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill, backgroundColor: colors.inkA(0.07) }}>
                <Body weight="bold" style={{ fontSize: 11, color: colors.inkA(0.65) }}>{c.tag2}</Body>
              </View>
            </View>
          </View>
          <IconButton name="directions" bg={colors.ink} iconColor={colors.cream} />
        </Card>
      ))}
    </ScreenChrome>
  );
}
