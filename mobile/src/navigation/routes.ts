export type RootStackParamList = {
  Signin: undefined;
  Home: undefined;
  Rates: undefined;
  Book1: undefined;
  Book2: undefined;
  Track: { bookingId: string };
  Weigh: { bookingId: string };
  Payout: { bookingId: string };
  Wallet: undefined;
  Impact: undefined;
  Dropoff: undefined;
  CollectorHome: undefined;
  JobDetail: { jobId: string };
  Marketplace: undefined;
  Earnings: undefined;
  Profile: undefined;
};

export const SELLER_TABS = [
  { route: "Home" as const, label: "Home", icon: "home" },
  { route: "Rates" as const, label: "Rates", icon: "rates" },
  { route: "Wallet" as const, label: "Wallet", icon: "wallet" },
  { route: "Impact" as const, label: "Impact", icon: "impact" }
];

export const COLLECTOR_TABS = [
  { route: "CollectorHome" as const, label: "Jobs", icon: "jobs" },
  { route: "Marketplace" as const, label: "Buy", icon: "buy" },
  { route: "Earnings" as const, label: "Earnings", icon: "earn" },
  { route: "Dropoff" as const, label: "Centers", icon: "centers" }
];
