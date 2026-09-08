import React from "react";
import { View, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenChrome } from "../components/ScreenChrome";
import { Card } from "../components/Card";
import { Heading, Body } from "../components/Typography";
import { colors, radii } from "../theme/tokens";
import { useApiGet } from "../api/useApi";
import { Rate } from "../api/types";
import { useApp } from "../context/AppContext";
import { RootStackParamList } from "../navigation/routes";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PICK_ORDER = ["Newspaper", "Cardboard", "Plastic (PET)", "Iron & steel", "Aluminium", "Copper", "Brass", "E-waste", "Appliances", "Glass"];

export function Book1Screen() {
  const navigation = useNavigation<Nav>();
  const { data } = useApiGet<{ rates: Rate[] }>("/rates");
  const { cart, toggleMaterial, stepKg } = useApp();

  const rateByName = new Map((data?.rates ?? []).map((r) => [r.name, r]));
  const pickItems = PICK_ORDER.filter((n) => rateByName.has(n));

  const lines = Object.keys(cart.kgs)
    .filter((n) => rateByName.has(n))
    .map((name) => {
      const r = rateByName.get(name)!;
      const kg = cart.kgs[name];
      return { name, price: r.price, kg, amount: Math.round(kg * r.price) };
    });
  const cartKg = lines.reduce((a, l) => a + l.kg, 0);
  const cartValue = lines.reduce((a, l) => a + l.amount, 0);

  return (
    <ScreenChrome crumb="Step 1 of 3" title="What you have">
      <View style={{ flexDirection: "row", gap: 6, marginBottom: 16 }}>
        <View style={{ flex: 1, height: 6, borderRadius: radii.pill, backgroundColor: colors.red }} />
        <View style={{ flex: 1, height: 6, borderRadius: radii.pill, backgroundColor: colors.inkA(0.13) }} />
        <View style={{ flex: 1, height: 6, borderRadius: radii.pill, backgroundColor: colors.inkA(0.13) }} />
      </View>
      <Body style={{ marginHorizontal: 2, marginBottom: 14, fontSize: 14, lineHeight: 21, color: colors.inkA(0.65) }}>
        Pick your materials, then set the kilos. We multiply each one by today's rate as you go.
      </Body>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {pickItems.map((name) => {
          const r = rateByName.get(name)!;
          const on = cart.kgs[name] !== undefined;
          return (
            <Pressable
              key={name}
              onPress={() => toggleMaterial(name)}
              style={{
                height: 42,
                paddingHorizontal: 15,
                borderRadius: radii.pill,
                flexDirection: "row",
                alignItems: "center",
                gap: 7,
                backgroundColor: on ? colors.red : colors.surface
              }}
            >
              <Body weight="semibold" style={{ fontSize: 13.5, color: on ? colors.white : colors.ink }}>{name}</Body>
              <Body weight="bold" style={{ fontSize: 11, opacity: 0.6, color: on ? colors.white : colors.ink }}>Rs {r.price}</Body>
            </Pressable>
          );
        })}
      </View>

      {lines.length > 0 ? (
        <>
          <Heading style={{ fontSize: 20, marginTop: 22, marginBottom: 10, marginHorizontal: 2 }}>How much of each?</Heading>
          <Card elevated padded={false} style={{ padding: 4 }}>
            {lines.map((l, i) => (
              <View key={l.name} style={{ padding: 14, paddingHorizontal: 16, borderBottomWidth: i < lines.length - 1 ? 1 : 0, borderBottomColor: colors.inkA(0.07) }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
                  <Body weight="semibold" style={{ fontSize: 14.5 }}>{l.name}</Body>
                  <Body weight="bold" style={{ fontSize: 11.5, color: colors.inkA(0.5) }}>Rs {l.price}/kg</Body>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 11 }}>
                  <Pressable onPress={() => stepKg(l.name, -1)} style={styles.stepBtn}>
                    <Heading style={{ fontSize: 18 }}>−</Heading>
                  </Pressable>
                  <Heading style={{ fontSize: 20, minWidth: 76, textAlign: "center" }}>{l.kg} kg</Heading>
                  <Pressable onPress={() => stepKg(l.name, 1)} style={styles.stepBtn}>
                    <Heading style={{ fontSize: 18 }}>+</Heading>
                  </Pressable>
                  <Body weight="semibold" style={{ flex: 1, textAlign: "right", fontSize: 15, color: colors.green }}>= Rs {l.amount.toLocaleString()}</Body>
                </View>
              </View>
            ))}
          </Card>

          <Card tone="ink" style={{ marginTop: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
              <Body style={{ fontSize: 13, color: colors.creamA(0.65) }}>{cartKg} kg · {lines.length} materials</Body>
              <Heading style={{ fontSize: 30, color: colors.cream }}>Rs {cartValue.toLocaleString()}</Heading>
            </View>
            <Body style={{ fontSize: 12, color: colors.creamA(0.5), marginTop: 4 }}>
              Scrap value at today's rates, before pickup cost and service fee.
            </Body>
            <Pressable style={styles.cta} onPress={() => navigation.push("Book2")}>
              <Heading style={{ fontSize: 16, color: colors.white }}>Choose pickup →</Heading>
            </Pressable>
          </Card>
        </>
      ) : null}
    </ScreenChrome>
  );
}

const styles = {
  stepBtn: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: colors.inkA(0.07),
    alignItems: "center" as const,
    justifyContent: "center" as const
  },
  cta: {
    marginTop: 14,
    height: 52,
    borderRadius: radii.pill,
    backgroundColor: colors.red,
    alignItems: "center" as const,
    justifyContent: "center" as const
  }
};
