import React from "react";
import { View } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenChrome } from "../components/ScreenChrome";
import { Card } from "../components/Card";
import { PillButton } from "../components/PillButton";
import { Heading, Body } from "../components/Typography";
import { colors } from "../theme/tokens";
import { useApiGet } from "../api/useApi";
import { WeighInfo } from "../api/types";
import { RootStackParamList } from "../navigation/routes";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, "Weigh">;

export function WeighScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<R>();
  const { data } = useApiGet<WeighInfo>(`/bookings/${params.bookingId}/weigh`);

  return (
    <ScreenChrome crumb="Live sheet" title="Weigh-in">
      <Body style={{ marginHorizontal: 2, marginBottom: 14, fontSize: 14, lineHeight: 21, color: colors.inkA(0.65) }}>
        Ram enters each weight on his phone — you see it here at the same time. Tap a row to dispute it.
      </Body>

      <Card padded={false} elevated style={{ paddingVertical: 6, paddingHorizontal: 4 }}>
        {(data?.rows ?? []).map((w, i, arr) => (
          <View
            key={w.name}
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
            <View style={{ flex: 1 }}>
              <Body weight="semibold" style={{ fontSize: 14 }}>{w.name}</Body>
              <Body style={{ fontSize: 12, color: colors.inkA(0.55), marginTop: 1 }}>Rs {w.price}/kg</Body>
            </View>
            <Heading style={{ fontSize: 18 }}>{w.kg} kg</Heading>
            <Body weight="semibold" style={{ width: 74, textAlign: "right", fontSize: 14, color: colors.green }}>Rs {w.amount.toLocaleString()}</Body>
          </View>
        ))}
      </Card>

      <Card tone="ink" style={{ marginTop: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
          <Body style={{ fontSize: 14, color: colors.creamA(0.65) }}>Total for {data?.kg ?? 0} kg</Body>
          <Heading style={{ fontSize: 30, color: colors.cream }}>Rs {(data?.total ?? 0).toLocaleString()}</Heading>
        </View>
        <PillButton
          label="Accept & get paid"
          variant="secondary"
          style={{ marginTop: 16 }}
          onPress={() => navigation.push("Payout", { bookingId: params.bookingId })}
        />
      </Card>
    </ScreenChrome>
  );
}
