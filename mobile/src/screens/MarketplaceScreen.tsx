import React from "react";
import { View } from "react-native";
import { ScreenChrome } from "../components/ScreenChrome";
import { Card } from "../components/Card";
import { PillButton } from "../components/PillButton";
import { IconButton } from "../components/IconButton";
import { Heading, Body } from "../components/Typography";
import { colors, radii } from "../theme/tokens";
import { useApiGet } from "../api/useApi";
import { Listing } from "../api/types";

export function MarketplaceScreen() {
  const { data } = useApiGet<{ listings: Listing[] }>("/collector/marketplace");

  return (
    <ScreenChrome crumb="Loads near you" title="Marketplace">
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
        <View style={{ flex: 1, height: 44, borderRadius: radii.pill, backgroundColor: colors.surface, justifyContent: "center", paddingHorizontal: 16 }}>
          <Body style={{ fontSize: 13, color: colors.inkA(0.5) }}>Search material or area…</Body>
        </View>
        <IconButton name="search" bg={colors.ink} iconColor={colors.cream} />
      </View>

      {(data?.listings ?? []).map((l) => (
        <Card key={l.id} padded={false} elevated style={{ marginBottom: 12, overflow: "hidden" }}>
          <View style={{ height: 132, backgroundColor: l.tint }} />
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
              <Heading style={{ fontSize: 18 }}>{l.title}</Heading>
              <Body weight="semibold" style={{ fontSize: 14, color: colors.red }}>Rs {l.ask.toLocaleString()}</Body>
            </View>
            <Body style={{ fontSize: 12, color: colors.inkA(0.58), marginTop: 4 }}>{l.meta}</Body>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
              <PillButton label="Offer a price" variant="secondary" flex={1} height={44} />
              <IconButton name="save" bg="transparent" style={{ borderWidth: 1, borderColor: colors.inkA(0.16) }} />
            </View>
          </View>
        </Card>
      ))}
    </ScreenChrome>
  );
}
