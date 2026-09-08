import React from "react";
import { View, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenChrome } from "../components/ScreenChrome";
import { Card } from "../components/Card";
import { StatTile } from "../components/StatTile";
import { SectionTitle } from "../components/SectionTitle";
import { PillButton } from "../components/PillButton";
import { Icon } from "../components/Icon";
import { Heading, Body } from "../components/Typography";
import { colors, radii } from "../theme/tokens";
import { useApiGet } from "../api/useApi";
import { api } from "../api/client";
import { Profile } from "../api/types";
import { RootStackParamList } from "../navigation/routes";
import type { IconName } from "../theme/icons";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SETTINGS_ROWS: { label: string; note: string; icon: IconName; tint: string }[] = [
  { label: "Personal details", note: "Name, phone, photo", icon: "personal", tint: colors.greenTint2 },
  { label: "Pickup addresses", note: "2 saved — Jhamsikhel, Sanepa", icon: "centers", tint: colors.redTint },
  { label: "Payout method", note: "Sajilo wallet · Nabil Bank ••4471", icon: "wallet", tint: colors.greenTint2 },
  { label: "Language", note: "English · नेपाली", icon: "language", tint: colors.surface2 },
  { label: "Notifications", note: "Rate alerts on for copper, iron", icon: "notifications", tint: colors.surface2 },
  { label: "Help & disputes", note: "Weight disagreement, missed pickup", icon: "help", tint: colors.redTint }
];

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { data } = useApiGet<Profile>("/profile");

  const signOut = async () => {
    await api.post("/auth/signout").catch(() => {});
    navigation.reset({ index: 0, routes: [{ name: "Signin" }] });
  };

  return (
    <ScreenChrome crumb={data?.name ?? "Profile"} title="Profile" showFab={false}>
      <Card elevated style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
        <View style={{ width: 66, height: 66, borderRadius: 999, backgroundColor: colors.greenTint2, alignItems: "center", justifyContent: "center" }}>
          <Heading style={{ fontSize: 24, color: colors.greenText }}>{data?.initials ?? "BS"}</Heading>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Heading style={{ fontSize: 22 }}>{data?.name ?? "Bina Shrestha"}</Heading>
          <Body style={{ fontSize: 13, color: colors.inkA(0.6), marginTop: 2 }}>{data?.phone} · {data?.area}</Body>
          <View style={styles.verifiedBadge}>
            <Icon name="verified" size={13} color={colors.greenText} />
            <Body weight="bold" style={{ fontSize: 11, color: colors.greenText }}>Verified seller</Body>
          </View>
        </View>
      </Card>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
        <StatTile flex={1} tone="greenTint" value={`${data?.rating ?? 4.8} ★`} label="collector rating" />
        <StatTile flex={1} tone="redTint" value={`${data?.recycledKg ?? 0} kg`} label="recycled" />
      </View>

      <SectionTitle title="Settings" />
      <Card padded={false} style={{ padding: 4 }}>
        {SETTINGS_ROWS.map((row, i) => (
          <Pressable
            key={row.label}
            style={[styles.settingsRow, i < SETTINGS_ROWS.length - 1 && styles.settingsRowDivider]}
          >
            <View style={[styles.settingsIcon, { backgroundColor: row.tint }]}>
              <Icon name={row.icon} size={18} color={colors.ink} />
            </View>
            <View style={{ flex: 1 }}>
              <Body weight="semibold" style={{ fontSize: 14 }}>{row.label}</Body>
              <Body style={{ fontSize: 12, color: colors.inkA(0.55), marginTop: 1 }}>{row.note}</Body>
            </View>
            <Icon name="chevronRight" size={16} color={colors.inkA(0.35)} />
          </Pressable>
        ))}
      </Card>

      <PillButton
        label="Sign out"
        variant="outline"
        icon="signOut"
        style={{ marginTop: 16, borderColor: "rgba(194,69,47,0.4)" }}
        onPress={signOut}
      />
    </ScreenChrome>
  );
}

const styles = {
  verifiedBadge: {
    marginTop: 8,
    flexDirection: "row" as const,
    alignSelf: "flex-start" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.greenTint
  },
  settingsRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: radii.md
  },
  settingsRowDivider: {},
  settingsIcon: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: "center" as const,
    justifyContent: "center" as const
  }
};
