import React, { useState } from "react";
import { View } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenChrome } from "../components/ScreenChrome";
import { Card } from "../components/Card";
import { PillButton } from "../components/PillButton";
import { Heading, Body } from "../components/Typography";
import { colors } from "../theme/tokens";
import { useApiGet } from "../api/useApi";
import { JobDetail } from "../api/types";
import { api } from "../api/client";
import { RootStackParamList } from "../navigation/routes";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, "JobDetail">;

export function JobDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<R>();
  const { data } = useApiGet<JobDetail>(`/collector/jobs/${params.jobId}`);
  const [accepting, setAccepting] = useState(false);

  const accept = async () => {
    setAccepting(true);
    try {
      await api.post(`/collector/jobs/${params.jobId}/accept`);
      navigation.push("CollectorHome");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <ScreenChrome crumb={data?.area ?? "Job"} title="Job detail">
      <Card padded={false} elevated style={{ height: 170, marginBottom: 12, backgroundColor: colors.greenTint2, alignItems: "center", justifyContent: "center" }}>
        <Body style={{ fontSize: 12, color: colors.inkA(0.5) }}>Drop the seller's photo of the load</Body>
      </Card>

      <Card elevated>
        <Heading style={{ fontSize: 22 }}>{data?.area ?? "…"}</Heading>
        <Body style={{ fontSize: 13, color: colors.inkA(0.6), marginTop: 4 }}>
          {data?.dist} · {data?.sellerName} · {data?.sellerRating} ★
        </Body>
        <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: colors.inkA(0.09), paddingTop: 14 }}>
          {(data?.items ?? []).map((it) => (
            <View key={it.name} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 7 }}>
              <Body style={{ fontSize: 14 }}>{it.name}</Body>
              <Body style={{ fontSize: 14, color: colors.inkA(0.6) }}>{it.kg}</Body>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 14, flexDirection: "row", justifyContent: "space-between" }}>
          <Body weight="semibold" style={{ fontSize: 15 }}>Estimated payout</Body>
          <Body weight="semibold" style={{ fontSize: 15 }}>Rs {data?.value.toLocaleString() ?? 0}</Body>
        </View>
        <Body style={{ fontSize: 12, marginTop: 2, color: colors.inkA(0.55) }}>
          Your margin at today's center rate: about Rs {data?.margin ?? 0}
        </Body>
      </Card>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
        <PillButton label="Skip" variant="outline" height={56} flex={1} onPress={() => navigation.canGoBack() && navigation.goBack()} />
        <PillButton label="Accept & start route" variant="secondary" height={56} flex={2} disabled={accepting} onPress={accept} />
      </View>
    </ScreenChrome>
  );
}
