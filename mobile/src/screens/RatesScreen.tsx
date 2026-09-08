import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { ScreenChrome } from "../components/ScreenChrome";
import { Card } from "../components/Card";
import { Heading, Body } from "../components/Typography";
import { colors, radii, trendColor } from "../theme/tokens";
import { useApiGet } from "../api/useApi";
import { Rate } from "../api/types";

const FILTERS = ["All", "Metal", "Paper & plastic"] as const;

export function RatesScreen() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const { data } = useApiGet<{ rates: Rate[] }>(`/rates?filter=${encodeURIComponent(filter)}`, [filter]);

  return (
    <ScreenChrome crumb="Today in Kathmandu" title="Rate board">
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={{
                height: 40,
                paddingHorizontal: 16,
                borderRadius: radii.pill,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: active ? colors.ink : colors.inkA(0.07)
              }}
            >
              <Body weight="semibold" style={{ fontSize: 13, color: active ? colors.cream : colors.ink }}>{f}</Body>
            </Pressable>
          );
        })}
      </View>

      <Card padded={false} elevated style={{ paddingVertical: 6, paddingHorizontal: 4 }}>
        {(data?.rates ?? []).map((r, i, arr) => (
          <View
            key={r.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingHorizontal: 16,
              paddingVertical: 13,
              borderBottomWidth: i < arr.length - 1 ? 1 : 0,
              borderBottomColor: colors.inkA(0.07)
            }}
          >
            <View style={{ width: 38, height: 38, borderRadius: 999, backgroundColor: r.category === "metal" ? colors.greenTint2 : colors.redTint, alignItems: "center", justifyContent: "center" }}>
              <Heading style={{ fontSize: 13 }}>{r.abbr}</Heading>
            </View>
            <Body weight="semibold" style={{ flex: 1, fontSize: 14 }}>{r.name}</Body>
            <Heading style={{ fontSize: 17 }}>Rs {r.price.toLocaleString()}</Heading>
            <Body weight="bold" style={{ width: 42, textAlign: "right", fontSize: 11, color: trendColor(r.up) }}>{r.trend}</Body>
          </View>
        ))}
      </Card>

      <Body style={{ marginTop: 14, marginHorizontal: 4, fontSize: 12, lineHeight: 18, color: colors.inkA(0.55) }}>
        Rates are the average paid by verified kabadi centers in Kathmandu valley today. Your collector may offer a little more for clean, sorted scrap.
      </Body>
    </ScreenChrome>
  );
}
