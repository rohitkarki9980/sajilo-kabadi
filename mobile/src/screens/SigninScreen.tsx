import React, { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Heading, Body, Kicker } from "../components/Typography";
import { PillButton } from "../components/PillButton";
import { Card } from "../components/Card";
import { colors, radii } from "../theme/tokens";
import { useApp, Lang } from "../context/AppContext";
import { api } from "../api/client";
import { RootStackParamList } from "../navigation/routes";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SigninScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { lang, setLang, setRole } = useApp();
  const [submitting, setSubmitting] = useState(false);

  const signIn = async (role: "seller" | "collector") => {
    setSubmitting(true);
    try {
      await api.post("/auth/signin", { role });
    } catch {
      // Offline-friendly: the design's prototype sign-in never fails either.
    } finally {
      setSubmitting(false);
    }
    setRole(role);
    navigation.reset({ index: 0, routes: [{ name: role === "seller" ? "Home" : "CollectorHome" }] });
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 26, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.logo}>
        <Heading style={{ fontSize: 26, color: colors.white }}>स</Heading>
      </View>
      <Heading style={{ fontSize: 30, marginTop: 20 }}>Sajilo Kabadi</Heading>
      <Body style={{ marginTop: 8, fontSize: 14, lineHeight: 21.7, color: colors.inkA(0.62) }}>
        Sell your scrap from home, or buy loads near you. Rates in rupees, paid the same day.
      </Body>

      <View style={styles.langRow}>
        {(["English", "नेपाली"] as Lang[]).map((l) => {
          const active = lang === l;
          return (
            <Pressable
              key={l}
              onPress={() => setLang(l)}
              style={[styles.langBtn, { backgroundColor: active ? colors.ink : colors.inkA(0.07) }]}
            >
              <Body weight="semibold" style={{ fontSize: 14, color: active ? colors.cream : colors.ink }}>{l}</Body>
            </Pressable>
          );
        })}
      </View>

      <Card style={{ marginTop: 22 }} elevated>
        <Kicker>Mobile number</Kicker>
        <View style={styles.phoneRow}>
          <View style={styles.phonePrefix}>
            <Body weight="semibold" style={{ fontSize: 15 }}>+977</Body>
          </View>
          <Heading style={{ fontSize: 22, letterSpacing: 1 }}>98•••• 4471</Heading>
        </View>
      </Card>

      <PillButton
        label="Send me a code"
        variant="primary"
        height={56}
        style={{ marginTop: 14 }}
        disabled={submitting}
        onPress={() => signIn("seller")}
      />
      <PillButton
        label="Continue as a collector"
        variant="outline"
        style={{ marginTop: 10 }}
        disabled={submitting}
        onPress={() => signIn("collector")}
      />

      <Body style={{ marginTop: 18, fontSize: 11.5, lineHeight: 16.5, color: colors.inkA(0.5) }}>
        By continuing you agree to the rate terms. Cash or wallet — you choose at every pickup.
      </Body>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream, paddingHorizontal: 24 },
  logo: { width: 64, height: 64, borderRadius: 999, backgroundColor: colors.red, alignItems: "center", justifyContent: "center" },
  langRow: { flexDirection: "row", gap: 8, marginTop: 24 },
  langBtn: { flex: 1, height: 46, borderRadius: radii.pill, alignItems: "center", justifyContent: "center" },
  phoneRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 },
  phonePrefix: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: radii.pill, backgroundColor: colors.inkA(0.07) }
});
