import React, { useRef, useState } from "react";
import { View, ScrollView, Pressable, Animated, StyleSheet, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radii, shadow } from "../theme/tokens";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";
import { Heading, Kicker } from "./Typography";
import { useApp } from "../context/AppContext";
import { RootStackParamList, SELLER_TABS, COLLECTOR_TABS } from "../navigation/routes";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  crumb: string;
  title: string;
  showFab?: boolean;
  children: React.ReactNode;
};

export function ScreenChrome({ crumb, title, showFab = true, children }: Props) {
  const navigation = useNavigation<Nav>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { role, setRole, initials } = useApp();
  const [stuck, setStuck] = useState(false);
  const fabBottom = useRef(new Animated.Value(104)).current;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    if (!stuck && y > 80) {
      setStuck(true);
      Animated.timing(fabBottom, { toValue: 18, duration: 220, useNativeDriver: false }).start();
    } else if (stuck && y < 36) {
      setStuck(false);
      Animated.timing(fabBottom, { toValue: 104, duration: 220, useNativeDriver: false }).start();
    }
  };

  const roleLabel = role === "seller" ? "Seller" : "Buyer";
  const tabs = role === "seller" ? SELLER_TABS : COLLECTOR_TABS;

  const toggleRole = () => {
    const next = role === "seller" ? "collector" : "seller";
    setRole(next);
    navigation.reset({ index: 0, routes: [{ name: next === "seller" ? "Home" : "CollectorHome" }] });
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <IconButton name="back" onPress={() => navigation.canGoBack() && navigation.goBack()} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Kicker numberOfLines={1}>{crumb} · {roleLabel}</Kicker>
          <Heading numberOfLines={1} style={{ fontSize: 18 }}>{title}</Heading>
        </View>
        <IconButton name="swap" onPress={toggleRole} bg={colors.ink} iconColor={colors.cream} iconSize={17} />
        <Pressable
          onPress={() => navigation.push("Profile")}
          style={({ pressed }) => [styles.avatarButton, { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.93 : 1 }] }]}
        >
          <Heading style={{ fontSize: 15, color: colors.greenText }}>{initials}</Heading>
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentContainer}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      {showFab ? (
        <Animated.View pointerEvents="box-none" style={[styles.fabWrap, { bottom: fabBottom }]}>
          <View style={styles.fabPill}>
            <Pressable style={[styles.fabButton, { backgroundColor: colors.red }]} onPress={() => navigation.push("Book1")}>
              <Icon name="sell" size={18} color={colors.white} />
              <Heading style={{ fontSize: 17, color: colors.white }}>Sell</Heading>
            </Pressable>
            <Pressable style={[styles.fabButton, { backgroundColor: colors.green }]} onPress={() => navigation.push("Marketplace")}>
              <Icon name="buy" size={18} color={colors.white} />
              <Heading style={{ fontSize: 17, color: colors.white }}>Buy</Heading>
            </Pressable>
          </View>
        </Animated.View>
      ) : null}

      <View style={[styles.tabBar, { paddingBottom: Math.max(10, insets.bottom) }]}>
        {tabs.map((t) => {
          const active = route.name === t.route;
          return (
            <Pressable
              key={t.route}
              style={styles.tabButton}
              onPress={() => (active ? undefined : navigation.push(t.route as any))}
            >
              <View style={[styles.tabIconWrap, active && { backgroundColor: colors.greenTint2 }]}>
                <Icon name={t.icon} size={20} color={active ? colors.greenText : colors.inkA(0.5)} />
              </View>
              <Heading style={{ fontFamily: fonts.bodyBold, fontSize: 10.5, color: active ? colors.greenText : colors.inkA(0.5) }}>
                {t.label}
              </Heading>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: colors.greenTint2,
    alignItems: "center",
    justifyContent: "center"
  },
  contentContainer: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 150 },
  fabWrap: { position: "absolute", left: 0, right: 0, alignItems: "center", zIndex: 3 },
  fabPill: {
    flexDirection: "row",
    gap: 8,
    padding: 7,
    borderRadius: radii.pill,
    backgroundColor: colors.cream,
    ...shadow.lg
  },
  fabButton: {
    height: 52,
    paddingHorizontal: 24,
    borderRadius: radii.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: 9
  },
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: colors.cream,
    borderTopWidth: 1,
    borderTopColor: colors.inkA(0.08)
  },
  tabButton: { flex: 1, alignItems: "center", gap: 5, paddingVertical: 4 },
  tabIconWrap: { width: 46, height: 32, borderRadius: 999, alignItems: "center", justifyContent: "center" }
});
