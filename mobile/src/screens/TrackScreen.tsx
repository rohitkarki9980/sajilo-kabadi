import React from "react";
import { View } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenChrome } from "../components/ScreenChrome";
import { Card } from "../components/Card";
import { PillButton } from "../components/PillButton";
import { IconButton } from "../components/IconButton";
import { Body } from "../components/Typography";
import { colors } from "../theme/tokens";
import { useApiGet } from "../api/useApi";
import { TrackInfo } from "../api/types";
import { RootStackParamList } from "../navigation/routes";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, "Track">;

export function TrackScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<R>();
  const { data } = useApiGet<TrackInfo>(`/bookings/${params.bookingId}/track`);

  return (
    <ScreenChrome crumb={`Pickup ${params.bookingId}`} title="On the way">
      <Card padded={false} elevated style={{ overflow: "hidden" }}>
        <View style={{ height: 220, backgroundColor: colors.greenTint2 }} />
        <View style={{ padding: 18, flexDirection: "row", gap: 14, alignItems: "center" }}>
          <View style={{ width: 52, height: 52, borderRadius: 999, backgroundColor: colors.greenTint3 }} />
          <View style={{ flex: 1 }}>
            <Body weight="semibold" style={{ fontSize: 15 }}>{data?.collectorName ?? "Collector"} · 4.9 ★</Body>
            <Body style={{ fontSize: 13, color: colors.inkA(0.6), marginTop: 2 }}>Arriving in 8 min · {data?.collectorPlate}</Body>
          </View>
          <IconButton name="call" bg={colors.green} iconColor={colors.cream} />
        </View>
      </Card>

      <Card style={{ marginTop: 16 }} padded={false}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 8 }}>
          {(data?.steps ?? []).map((t) => (
            <View key={t.label} style={{ flexDirection: "row", gap: 14, alignItems: "center", paddingVertical: 12 }}>
              <View style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: t.done ? colors.green : colors.inkA(0.18) }} />
              <Body weight="semibold" style={{ flex: 1, fontSize: 14, color: t.done ? colors.ink : colors.inkA(0.45) }}>{t.label}</Body>
              <Body style={{ fontSize: 12, color: colors.inkA(0.5) }}>{t.time}</Body>
            </View>
          ))}
        </View>
      </Card>

      <PillButton
        label="Open weighing sheet"
        variant="outline"
        style={{ marginTop: 16 }}
        onPress={() => navigation.push("Weigh", { bookingId: params.bookingId })}
      />
    </ScreenChrome>
  );
}
