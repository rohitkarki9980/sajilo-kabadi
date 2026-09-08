import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenChrome } from "../components/ScreenChrome";
import { Card } from "../components/Card";
import { SectionTitle } from "../components/SectionTitle";
import { Heading, Body, Kicker } from "../components/Typography";
import { colors, radii } from "../theme/tokens";
import { useApiGet } from "../api/useApi";
import { CollectorHome, Job } from "../api/types";
import { RootStackParamList } from "../navigation/routes";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function CollectorHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { data } = useApiGet<CollectorHome>("/collector/home");
  const { data: jobsData } = useApiGet<{ jobs: Job[] }>("/collector/jobs");
  const [accepting, setAccepting] = useState(true);

  return (
    <ScreenChrome crumb="Ram Tamang" title="Collector home">
      <Card tone="ink">
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
          <View>
            <Kicker style={{ color: colors.creamA(0.55) }}>Today's buying</Kicker>
            <Heading style={{ fontSize: 30, color: colors.cream, marginTop: 6 }}>Rs {(data?.todaysBuying ?? 0).toLocaleString()}</Heading>
          </View>
          <Body style={{ fontSize: 13, color: colors.creamA(0.65), textAlign: "right" }}>
            {data?.kgToday ?? 0} kg{"\n"}{data?.pickupsToday ?? 0} pickups
          </Body>
        </View>
        <Pressable
          onPress={() => setAccepting((a) => !a)}
          style={{ marginTop: 16, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderRadius: radii.pill, backgroundColor: colors.creamA(0.12) }}
        >
          <View style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: accepting ? colors.greenBright : colors.inkA(0.3) }} />
          <Body weight="semibold" style={{ flex: 1, fontSize: 13, color: colors.cream }}>
            {accepting ? `Accepting jobs in ${data?.area ?? "Lalitpur"}` : "Not accepting jobs"}
          </Body>
          <View style={{ width: 44, height: 26, borderRadius: 999, backgroundColor: accepting ? colors.green : colors.inkA(0.3) }}>
            <View style={{ position: "absolute", top: 3, left: accepting ? 21 : 3, width: 20, height: 20, borderRadius: 999, backgroundColor: colors.cream }} />
          </View>
        </Pressable>
      </Card>

      <SectionTitle title="Jobs near you" />
      {(jobsData?.jobs ?? []).map((j) => (
        <Pressable key={j.id} onPress={() => navigation.push("JobDetail", { jobId: j.id })}>
          <Card elevated style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
              <Heading style={{ fontSize: 18 }}>{j.area}</Heading>
              <Body weight="bold" style={{ fontSize: 12, color: colors.green }}>{j.dist}</Body>
            </View>
            <Body style={{ fontSize: 13, color: colors.inkA(0.62), marginTop: 6 }}>{j.items}</Body>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
              <Body weight="semibold" style={{ fontSize: 14 }}>Est. Rs {j.value.toLocaleString()}</Body>
              <View style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: radii.pill, backgroundColor: colors.greenTint }}>
                <Body weight="bold" style={{ fontSize: 12, color: colors.greenText }}>{j.slot}</Body>
              </View>
            </View>
          </Card>
        </Pressable>
      ))}
    </ScreenChrome>
  );
}
