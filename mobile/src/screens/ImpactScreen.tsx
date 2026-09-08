import React from "react";
import { View } from "react-native";
import { ScreenChrome } from "../components/ScreenChrome";
import { Card } from "../components/Card";
import { Heading, Body } from "../components/Typography";
import { colors, radii } from "../theme/tokens";
import { useApiGet } from "../api/useApi";
import { ImpactSummary } from "../api/types";

const CARD_TONE: Record<string, "greenTint" | "redTint" | "surface"> = { green: "greenTint", red: "redTint", neutral: "surface" };
const BAR_COLOR: Record<string, string> = { green: colors.green, olive: colors.olive, red: colors.red, amber: colors.amber };

export function ImpactScreen() {
  const { data } = useApiGet<ImpactSummary>("/impact");

  return (
    <ScreenChrome crumb={`Since ${data?.since ?? "Baisakh"}`} title="My impact">
      <Card tone="green">
        <Heading style={{ fontSize: 44, color: colors.cream, lineHeight: 46 }}>{data?.totalKg ?? 0} kg</Heading>
        <Body style={{ fontSize: 14, color: colors.creamA(0.75), marginTop: 6 }}>
          kept out of the Bagmati landfill since {data?.since ?? "Baisakh"}
        </Body>
      </Card>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
        {(data?.cards ?? []).map((c) => (
          <Card key={c.label} tone={CARD_TONE[c.tone]} style={{ width: "48%" }}>
            <Heading style={{ fontSize: 24 }}>{c.value}</Heading>
            <Body style={{ fontSize: 12, lineHeight: 17, color: colors.inkA(0.65), marginTop: 4 }}>{c.label}</Body>
          </Card>
        ))}
      </View>

      <Heading style={{ fontSize: 20, marginTop: 22, marginBottom: 10, marginHorizontal: 2 }}>By material</Heading>
      <Card elevated>
        {(data?.bars ?? []).map((b) => (
          <View key={b.name} style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Body weight="semibold" style={{ fontSize: 13 }}>{b.name}</Body>
              <Body weight="semibold" style={{ fontSize: 13 }}>{b.kg} kg</Body>
            </View>
            <View style={{ marginTop: 6, height: 10, borderRadius: radii.pill, backgroundColor: colors.inkA(0.09) }}>
              <View style={{ height: 10, borderRadius: radii.pill, backgroundColor: BAR_COLOR[b.tone], width: `${b.pct}%` }} />
            </View>
          </View>
        ))}
      </Card>
    </ScreenChrome>
  );
}
