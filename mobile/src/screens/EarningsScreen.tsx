import React from "react";
import { View } from "react-native";
import { ScreenChrome } from "../components/ScreenChrome";
import { Card } from "../components/Card";
import { PillButton } from "../components/PillButton";
import { SectionTitle } from "../components/SectionTitle";
import { Heading, Body, Kicker } from "../components/Typography";
import { colors } from "../theme/tokens";
import { useApiGet } from "../api/useApi";
import { Earnings } from "../api/types";

export function EarningsScreen() {
  const { data } = useApiGet<Earnings>("/collector/earnings");

  return (
    <ScreenChrome crumb="This week" title="Earnings & stock">
      <Card elevated>
        <Kicker>This week</Kicker>
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10, marginTop: 6 }}>
          <Heading style={{ fontSize: 32 }}>Rs {(data?.thisWeek ?? 0).toLocaleString()}</Heading>
          <Body weight="bold" style={{ fontSize: 12, color: colors.green, paddingBottom: 6 }}>+{data?.changePct ?? 0}%</Body>
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, height: 96, marginTop: 18 }}>
          {(data?.bars ?? []).map((b) => (
            <View key={b.day} style={{ flex: 1, alignItems: "center", gap: 6 }}>
              <View style={{ width: "100%", flex: 1, justifyContent: "flex-end" }}>
                <View style={{ width: "100%", height: `${b.pct}%`, borderRadius: 10, backgroundColor: b.pct > 75 ? colors.green : colors.greenTint3 }} />
              </View>
              <Body weight="bold" style={{ fontSize: 10, color: colors.inkA(0.5) }}>{b.day}</Body>
            </View>
          ))}
        </View>
      </Card>

      <SectionTitle title="Stock in your godown" />
      <Card padded={false} elevated style={{ paddingVertical: 6, paddingHorizontal: 4 }}>
        {(data?.stock ?? []).map((s, i, arr) => (
          <View
            key={s.name}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderBottomWidth: i < arr.length - 1 ? 1 : 0,
              borderBottomColor: colors.inkA(0.07)
            }}
          >
            <Body weight="semibold" style={{ flex: 1, fontSize: 14 }}>{s.name}</Body>
            <Heading style={{ fontSize: 16 }}>{s.kg} kg</Heading>
            <Body weight="semibold" style={{ width: 86, textAlign: "right", fontSize: 13, color: colors.green }}>Rs {s.worth.toLocaleString()}</Body>
          </View>
        ))}
      </Card>

      <PillButton label="Sell load to a center" variant="dark" style={{ marginTop: 16 }} />
    </ScreenChrome>
  );
}
