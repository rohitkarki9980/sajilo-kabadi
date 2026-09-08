export type Rate = {
  id: string;
  name: string;
  abbr: string;
  price: number;
  trend: string;
  up: boolean;
  category: "metal" | "paper-plastic" | "other";
};

export type HomeSummary = {
  name: string;
  walletBalance: number;
  topRates: Pick<Rate, "id" | "name" | "price" | "trend" | "up">[];
  nextPickup: {
    bookingId: string;
    collectorName: string;
    day: string;
    slot: string;
    itemsCount: number;
    approxKg: number;
  } | null;
  dropoffSummary: { count: number; distanceKm: number; openTill: string };
};

export type WalletHistoryEntry = {
  id: string;
  label: string;
  date: string;
  method: string;
  amount: number;
  direction: "in" | "out";
};

export type WalletSummary = {
  balance: number;
  earnedThisYear: number;
  pickupsDone: number;
  history: WalletHistoryEntry[];
};

export type ImpactSummary = {
  totalKg: number;
  since: string;
  cards: { value: string; label: string; tone: "green" | "red" | "neutral" }[];
  bars: { name: string; kg: number; pct: number; tone: "green" | "olive" | "red" | "amber" }[];
};

export type DropoffCenter = { id: string; name: string; meta: string; tag1: string; tag2: string };

export type CartLine = { name: string; kg: number; price: number; amount: number };

export type Quote = {
  lines: CartLine[];
  cartKg: number;
  cartValue: number;
  haulCost: number;
  fee: number;
  netTotal: number;
  distanceKm: number;
  haulOptions: { id: "self" | "collector" | "truck"; cost: number }[];
};

export type BookingSummary = { id: string; cartKg: number; cartValue: number; haulCost: number; fee: number; netTotal: number; status: string };

export type BookingDetail = {
  id: string;
  status: string;
  day: string;
  slot: string;
  collectorName: string;
  collectorPlate: string;
  cart: CartLine[];
  cartKg: number;
  cartValue: number;
  haul: string;
  haulCost: number;
  fee: number;
  netTotal: number;
};

export type TrackInfo = {
  collectorName: string;
  collectorPlate: string;
  steps: { label: string; time: string; done: boolean }[];
};

export type WeighInfo = { rows: CartLine[]; total: number; kg: number };

export type CollectorHome = {
  todaysBuying: number;
  kgToday: number;
  pickupsToday: number;
  accepting: boolean;
  area: string;
  openJobCount: number;
};

export type Job = { id: string; area: string; dist: string; items: string; value: number; slot: string };

export type JobDetail = {
  id: string;
  area: string;
  dist: string;
  value: number;
  slot: string;
  status: string;
  sellerName: string;
  sellerRating: number;
  margin: number;
  items: { name: string; kg: string }[];
};

export type Earnings = {
  thisWeek: number;
  changePct: number;
  bars: { day: string; pct: number }[];
  stock: { name: string; kg: number; worth: number }[];
};

export type Listing = { id: string; title: string; ask: number; meta: string; tint: string };

export type Profile = {
  name: string;
  initials: string;
  phone: string;
  area: string;
  address: string;
  verified: boolean;
  rating: number;
  recycledKg: number;
};
