import React, { useState } from "react";
import { View } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenChrome } from "../components/ScreenChrome";
import { PillButton } from "../components/PillButton";
import { RadioOptionRow } from "../components/RadioOptionRow";
import { Heading, Body } from "../components/Typography";
import { colors } from "../theme/tokens";
import { useApiGet } from "../api/useApi";
import { WeighInfo } from "../api/types";
import { api } from "../api/client";
import { RootStackParamList } from "../navigation/routes";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, "Payout">;

type PayId = "wallet" | "cash" | "bank";

const METHODS: { id: PayId; name: string; note: string }[] = [
  { id: "wallet", name: "Sajilo wallet", note: "Instant · withdraw to bank any time" },
  { id: "cash", name: "Cash from the collector", note: "Ram pays you at the door" },
  { id: "bank", name: "Straight to bank", note: "Nabil Bank ••4471 · 1–2 hours" }
];

export function PayoutScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<R>();
  const { data } = useApiGet<WeighInfo>(`/bookings/${params.bookingId}/weigh`);
  const [method, setMethod] = useState<PayId>("wallet");
  const [submitting, setSubmitting] = useState(false);

  const finish = async () => {
    setSubmitting(true);
    try {
      await api.post(`/bookings/${params.bookingId}/payout`, { method });
      navigation.push("Wallet");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenChrome crumb="Pickup done" title="Payout">
      <View style={{ alignItems: "center", paddingVertical: 8 }}>
        <View style={{ width: 88, height: 88, borderRadius: 999, backgroundColor: colors.greenTint, alignItems: "center", justifyContent: "center" }}>
          <Heading style={{ fontSize: 38, color: colors.green }}>✓</Heading>
        </View>
        <Heading style={{ fontSize: 26, marginTop: 14 }}>Rs {(data?.total ?? 0).toLocaleString()} is yours</Heading>
        <Body style={{ fontSize: 13, color: colors.inkA(0.6), marginTop: 2 }}>
          {data?.kg ?? 0} kg collected · receipt #{params.bookingId}
        </Body>
      </View>

      <Heading style={{ fontSize: 20, marginTop: 22, marginBottom: 10, marginHorizontal: 2 }}>How would you like it?</Heading>
      {METHODS.map((m) => (
        <RadioOptionRow key={m.id} name={m.name} note={m.note} selected={method === m.id} onPress={() => setMethod(m.id)} />
      ))}

      <PillButton
        label={method === "cash" ? "Confirm cash received" : "Send my money"}
        style={{ marginTop: 8 }}
        disabled={submitting}
        onPress={finish}
      />
    </ScreenChrome>
  );
}
