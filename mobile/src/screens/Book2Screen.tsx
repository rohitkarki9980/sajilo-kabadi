import React, { useEffect, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenChrome } from "../components/ScreenChrome";
import { Card } from "../components/Card";
import { PillButton } from "../components/PillButton";
import { RadioOptionRow } from "../components/RadioOptionRow";
import { Heading, Body, Kicker } from "../components/Typography";
import { colors, radii } from "../theme/tokens";
import { useApp, HaulId } from "../context/AppContext";
import { api } from "../api/client";
import { Quote } from "../api/types";
import { RootStackParamList } from "../navigation/routes";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DAYS: [string, string][] = [["Fri", "8"], ["Sat", "9"], ["Sun", "10"], ["Mon", "11"], ["Tue", "12"]];
const SLOTS = ["8:00 – 9:00", "10:30 – 11:00", "1:00 – 2:00", "4:00 – 5:00"];

const HAUL_LABEL: Record<HaulId, { name: string; note: string }> = {
  self: { name: "I'll drop it myself", note: "Take it to the center — nothing deducted" },
  collector: { name: "Collector picks up", note: "Free above 10 kg, Rs 60 below" },
  truck: { name: "Truck + 1 helper", note: "For heavy loads · Rs 400 + Rs 30/km" }
};

export function Book2Screen() {
  const navigation = useNavigation<Nav>();
  const { cart, setDay, setSlot, setHaul, resetCart } = useApp();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [confirming, setConfirming] = useState(false);

  const items = Object.entries(cart.kgs).map(([name, kg]) => ({ name, kg }));

  useEffect(() => {
    let cancelled = false;
    api.post<Quote>("/bookings/quote", { items, haul: cart.haul }).then((q) => {
      if (!cancelled) setQuote(q);
    }).catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(cart.kgs), cart.haul]);

  const haulCostFor = (id: HaulId) => quote?.haulOptions.find((h) => h.id === id)?.cost ?? 0;

  const confirmBooking = async () => {
    setConfirming(true);
    try {
      const res = await api.post<{ id: string }>("/bookings", {
        items, day: DAYS[cart.day].join(" "), slot: cart.slot, haul: cart.haul
      });
      resetCart();
      navigation.push("Track", { bookingId: res.id });
    } finally {
      setConfirming(false);
    }
  };

  return (
    <ScreenChrome crumb="Step 2 of 3" title="When & where">
      <View style={{ flexDirection: "row", gap: 6, marginBottom: 16 }}>
        <View style={{ flex: 1, height: 6, borderRadius: radii.pill, backgroundColor: colors.red }} />
        <View style={{ flex: 1, height: 6, borderRadius: radii.pill, backgroundColor: colors.red }} />
        <View style={{ flex: 1, height: 6, borderRadius: radii.pill, backgroundColor: colors.inkA(0.13) }} />
      </View>

      <Card elevated style={{ marginBottom: 14 }}>
        <Kicker>Pickup at</Kicker>
        <Body weight="semibold" style={{ fontSize: 15, lineHeight: 21, marginTop: 6 }}>
          Bina Shrestha{"\n"}Jhamsikhel, Lalitpur — Ward 3, house 42
        </Body>
        <PillButton label="Change address" variant="outline" height={40} style={{ marginTop: 12, alignSelf: "flex-start", paddingHorizontal: 16 }} />
      </Card>

      <Heading style={{ fontSize: 20, marginHorizontal: 2, marginBottom: 10 }}>Pick a time</Heading>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, marginBottom: 12 }}>
        {DAYS.map((d, i) => {
          const active = cart.day === i;
          return (
            <Pressable
              key={d[0]}
              onPress={() => setDay(i)}
              style={{ width: 72, paddingVertical: 12, borderRadius: 22, alignItems: "center", backgroundColor: active ? colors.ink : colors.surface }}
            >
              <Body weight="bold" style={{ fontSize: 11, opacity: 0.65, color: active ? colors.cream : colors.ink }}>{d[0]}</Body>
              <Heading style={{ fontSize: 20, marginTop: 2, color: active ? colors.cream : colors.ink }}>{d[1]}</Heading>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {SLOTS.map((s) => {
          const active = cart.slot === s;
          return (
            <Pressable
              key={s}
              onPress={() => setSlot(s)}
              style={{ width: "47%", height: 52, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: active ? colors.greenTint : colors.surface }}
            >
              <Body weight="semibold" style={{ fontSize: 14 }}>{s}</Body>
            </Pressable>
          );
        })}
      </View>

      <Heading style={{ fontSize: 20, marginTop: 22, marginHorizontal: 2, marginBottom: 6 }}>How does it reach the center?</Heading>
      <Body style={{ fontSize: 12.5, marginHorizontal: 2, marginBottom: 10, color: colors.inkA(0.55) }}>
        Jhamsikhel → Jhamsikhel Kabadi Store · {quote?.distanceKm ?? 2.4} km
      </Body>
      {(["self", "collector", "truck"] as HaulId[]).map((id) => {
        const cost = haulCostFor(id);
        return (
          <RadioOptionRow
            key={id}
            name={HAUL_LABEL[id].name}
            note={HAUL_LABEL[id].note}
            trailing={cost ? `− Rs ${cost.toLocaleString()}` : "Free"}
            trailingColor={cost ? colors.redDeep : colors.green}
            selected={cart.haul === id}
            onPress={() => setHaul(id)}
          />
        );
      })}

      <Card tone="redTint" style={{ marginTop: 4 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 }}>
          <Body weight="semibold" style={{ fontSize: 13.5 }}>{quote?.cartKg ?? 0} kg scrap at today's rates</Body>
          <Body weight="semibold" style={{ fontSize: 13.5 }}>Rs {(quote?.cartValue ?? 0).toLocaleString()}</Body>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 }}>
          <Body style={{ fontSize: 13.5, color: quote?.haulCost ? colors.redDeep : colors.inkA(0.6) }}>
            {cart.haul === "self" ? "Self drop-off" : cart.haul === "collector" ? "Pickup by collector" : `Truck + helper (${quote?.distanceKm ?? 2.4} km)`}
          </Body>
          <Body style={{ fontSize: 13.5, color: quote?.haulCost ? colors.redDeep : colors.inkA(0.6) }}>
            {quote?.haulCost ? `− Rs ${quote.haulCost.toLocaleString()}` : "Rs 0"}
          </Body>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 }}>
          <Body style={{ fontSize: 13.5, color: colors.inkA(0.6) }}>Service fee (2%)</Body>
          <Body style={{ fontSize: 13.5, color: colors.inkA(0.6) }}>− Rs {(quote?.fee ?? 0).toLocaleString()}</Body>
        </View>
        <View style={{ marginTop: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.inkA(0.14), flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
          <Body weight="semibold" style={{ fontSize: 14 }}>You receive</Body>
          <Heading style={{ fontSize: 28 }}>Rs {(quote?.netTotal ?? 0).toLocaleString()}</Heading>
        </View>
        <Body style={{ fontSize: 12, marginTop: 4, color: colors.inkA(0.6) }}>
          Estimate only — final amount is set by the weighing at your door.
        </Body>
        <PillButton
          label="Confirm pickup"
          style={{ marginTop: 14 }}
          disabled={confirming || items.length === 0}
          onPress={confirmBooking}
        />
      </Card>
    </ScreenChrome>
  );
}
