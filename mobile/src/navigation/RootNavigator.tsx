import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./routes";

import { SigninScreen } from "../screens/SigninScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { RatesScreen } from "../screens/RatesScreen";
import { Book1Screen } from "../screens/Book1Screen";
import { Book2Screen } from "../screens/Book2Screen";
import { TrackScreen } from "../screens/TrackScreen";
import { WeighScreen } from "../screens/WeighScreen";
import { PayoutScreen } from "../screens/PayoutScreen";
import { WalletScreen } from "../screens/WalletScreen";
import { ImpactScreen } from "../screens/ImpactScreen";
import { DropoffScreen } from "../screens/DropoffScreen";
import { CollectorHomeScreen } from "../screens/CollectorHomeScreen";
import { JobDetailScreen } from "../screens/JobDetailScreen";
import { MarketplaceScreen } from "../screens/MarketplaceScreen";
import { EarningsScreen } from "../screens/EarningsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Signin" screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="Signin" component={SigninScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Rates" component={RatesScreen} />
      <Stack.Screen name="Book1" component={Book1Screen} />
      <Stack.Screen name="Book2" component={Book2Screen} />
      <Stack.Screen name="Track" component={TrackScreen} />
      <Stack.Screen name="Weigh" component={WeighScreen} />
      <Stack.Screen name="Payout" component={PayoutScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="Impact" component={ImpactScreen} />
      <Stack.Screen name="Dropoff" component={DropoffScreen} />
      <Stack.Screen name="CollectorHome" component={CollectorHomeScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
      <Stack.Screen name="Earnings" component={EarningsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
