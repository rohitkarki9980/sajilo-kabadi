export const colors = {
  ink: "#201e1d",
  cream: "#f5ead8",
  canvasBg: "#e7dcc6",
  surface: "#f9f4ed",
  surface2: "#eee7db",
  red: "#c2452f",
  redDark: "#a83a27",
  redDeep: "#8c3423",
  redTint: "#fbe3dc",
  green: "#5a7f3f",
  greenDark: "#4a6b33",
  greenTint: "#e6efd9",
  greenTint2: "#e1eecc",
  greenTint3: "#ccdbb2",
  greenText: "#3d472b",
  greenBright: "#8fd15f",
  amber: "#d67f48",
  brownLink: "#8c491a",
  olive: "#8fa073",
  white: "#ffffff",
  inkA: (a: number) => `rgba(32,30,29,${a})`,
  creamA: (a: number) => `rgba(245,234,216,${a})`
};

export const radii = { sm: 20, md: 24, lg: 28, pill: 999 };

export const fonts = {
  heading: "Caprasimo_400Regular",
  body: "Figtree_400Regular",
  bodySemibold: "Figtree_600SemiBold",
  bodyBold: "Figtree_700Bold"
};

export const shadow = {
  sm: { shadowColor: "#2e2b25", shadowOpacity: 0.14, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  lg: { shadowColor: "#2e2b25", shadowOpacity: 0.24, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 8 }
};

export const trendColor = (up: boolean) => (up ? colors.green : colors.redDeep);
