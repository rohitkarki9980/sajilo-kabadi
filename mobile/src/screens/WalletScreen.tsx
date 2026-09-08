import React from "react";
import { View } from "react-native";
import { ScreenChrome } from "../components/ScreenChrome";
import { Card } from "../components/Card";
import { StatTile } from "../components/StatTile";
import { SectionTitle } from "../components/SectionTitle";
import { PillButton } from "../components/PillButton";
import { Heading, Body, Kicker } from "../components/Typography";
import { colors } from "../theme/tokens";
import { useApiGet } from "../api/useApi";
import { WalletSummary } from "../api/types";

export function WalletScreen() {
  const { data } = useApiGet<WalletSummary>("/wallet");

  return (
    <ScreenChrome crumb="Balance & history" title="Wallet">
      <Card elevated>
        <Kicker>Balance</Kicker>
        <Heading style={{ fontSize: 34, marginTop: 6 }}>Rs {(data?.balance ?? 0).toLocaleString()}</Heading>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
          <PillButton label="To bank" variant="secondary" flex={1} height={48} />
          <PillButton label="Statement" variant="outline" flex={1} height={48} />
        </View>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
          <StatTile flex={1} tone="greenTint" value={`Rs ${(data?.earnedThisYear ?? 0).toLocaleString()}`} label="earned this year" />
          <StatTile flex={1} tone="redTint" value={String(data?.pickupsDone ?? 0)} label="pickups done" />
        </View>
      </Card>

      <SectionTitle title="Payout history" />
      <Card padded={false} elevated style={{ paddingVertical: 6, paddingHorizontal: 4 }}>
        {(data?.history ?? []).map((h, i, arr) => {
          const isIn = h.direction === "in";
          return (
            <View
              key={h.id}
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
              <View style={{ width: 38, height: 38, borderRadius: 999, backgroundColor: isIn ? colors.greenTint : colors.redTint, alignItems: "center", justifyContent: "center" }}>
                <Heading style={{ fontSize: 12 }}>{isIn ? "↓" : "↑"}</Heading>
              </View>
              <View style={{ flex: 1 }}>
                <Body weight="semibold" style={{ fontSize: 14 }}>{h.label}</Body>
                <Body style={{ fontSize: 12, color: colors.inkA(0.55), marginTop: 1 }}>{h.date} · {h.method}</Body>
              </View>
              <Heading style={{ fontSize: 16, color: isIn ? colors.green : colors.red }}>
                {isIn ? "+" : "−"} Rs {Math.abs(h.amount).toLocaleString()}
              </Heading>
            </View>
          );
        })}
      </Card>
    </ScreenChrome>
  );
}
