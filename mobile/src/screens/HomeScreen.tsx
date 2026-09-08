import React from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenChrome } from "../components/ScreenChrome";
import { Card } from "../components/Card";
import { SectionTitle } from "../components/SectionTitle";
import { PillButton } from "../components/PillButton";
import { Heading, Body, Kicker } from "../components/Typography";
import { colors, trendColor } from "../theme/tokens";
import { useApiGet } from "../api/useApi";
import { HomeSummary } from "../api/types";
import { RootStackParamList } from "../navigation/routes";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { data, loading } = useApiGet<HomeSummary>("/home");

  return (
    <ScreenChrome crumb="Sajilo Kabadi" title="Home">
      <Card tone="ink">
        <Kicker style={{ color: colors.creamA(0.55) }}>Namaste, {data?.name ?? "…"}</Kicker>
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, marginTop: 8 }}>
          <Heading style={{ fontSize: 34, color: colors.cream }}>Rs {(data?.walletBalance ?? 0).toLocaleString()}</Heading>
          <Body style={{ fontSize: 13, color: colors.creamA(0.6), paddingBottom: 4 }}>in wallet</Body>
        </View>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
          <PillButton label="Withdraw" flex={1} height={44} style={{ backgroundColor: colors.cream }} onPress={() => navigation.push("Wallet")} variant="ghost" />
          <PillButton
            label="My impact"
            flex={1}
            height={44}
            variant="outline"
            textColor={colors.cream}
            style={{ borderColor: colors.creamA(0.35) }}
            onPress={() => navigation.push("Impact")}
          />
        </View>
      </Card>

      <SectionTitle title="Today's rates" actionLabel="See all 12 →" onAction={() => navigation.push("Rates")} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 6 }}>
        {(data?.topRates ?? []).map((r) => (
          <Card key={r.id} elevated style={{ width: 126, padding: 14 }}>
            <Heading style={{ fontSize: 22 }}>{r.price.toLocaleString()}</Heading>
            <Body weight="bold" style={{ fontSize: 11, color: colors.inkA(0.5) }}>Rs / kg</Body>
            <Body weight="semibold" style={{ fontSize: 13, marginTop: 10 }}>{r.name}</Body>
            <Body weight="bold" style={{ fontSize: 11, marginTop: 8, color: trendColor(r.up) }}>{r.trend}</Body>
          </Card>
        ))}
      </ScrollView>

      {data?.nextPickup ? (
        <>
          <SectionTitle title="Your next pickup" />
          <Pressable onPress={() => navigation.push("Track", { bookingId: data.nextPickup!.bookingId })}>
            <Card tone="greenTint2" style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
              <View style={{ width: 52, height: 52, borderRadius: 999, backgroundColor: colors.green, alignItems: "center", justifyContent: "center" }}>
                <Heading style={{ fontSize: 13, color: colors.cream, textAlign: "center", lineHeight: 15 }}>
                  {data.nextPickup.day.split(" ")[0]}{"\n"}{data.nextPickup.day.split(" ")[1]}
                </Heading>
              </View>
              <View style={{ flex: 1 }}>
                <Body weight="semibold" style={{ fontSize: 15 }}>{data.nextPickup.collectorName} is on the way</Body>
                <Body style={{ fontSize: 13, color: colors.inkA(0.6), marginTop: 2 }}>
                  {data.nextPickup.itemsCount} items · approx. {data.nextPickup.approxKg} kg · {data.nextPickup.slot}
                </Body>
              </View>
              <Body style={{ fontSize: 18, color: colors.inkA(0.4) }}>›</Body>
            </Card>
          </Pressable>
        </>
      ) : null}

      <SectionTitle title="Nearby drop-off" />
      <Pressable onPress={() => navigation.push("Dropoff")}>
        <Card padded={false} style={{ overflow: "hidden" }}>
          <View style={{ height: 120, backgroundColor: colors.greenTint2 }} />
          <View style={{ padding: 14 }}>
            <Body weight="semibold" style={{ fontSize: 14 }}>
              {data?.dropoffSummary.count ?? 3} kabadi centers within {data?.dropoffSummary.distanceKm ?? 2} km{" "}
              <Body style={{ fontWeight: "400", color: colors.inkA(0.55) }}>· open till {data?.dropoffSummary.openTill ?? "6 pm"}</Body>
            </Body>
          </View>
        </Card>
      </Pressable>

      {loading ? <Body style={{ marginTop: 20, color: colors.inkA(0.5) }}>Loading…</Body> : null}
    </ScreenChrome>
  );
}
