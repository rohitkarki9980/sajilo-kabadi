import React, { createContext, useContext, useMemo, useState, useCallback } from "react";

export type Role = "seller" | "collector";
export type Lang = "English" | "नेपाली";
export type HaulId = "self" | "collector" | "truck";

type CartState = {
  kgs: Record<string, number>;
  day: number;
  slot: string;
  haul: HaulId;
};

const DEFAULT_CART: CartState = {
  kgs: { "Iron & steel": 10, Aluminium: 4 },
  day: 2,
  slot: "10:30 – 11:00",
  haul: "collector"
};

type AppContextValue = {
  role: Role;
  setRole: (r: Role) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  initials: string;
  cart: CartState;
  toggleMaterial: (name: string) => void;
  stepKg: (name: string, delta: number) => void;
  setDay: (day: number) => void;
  setSlot: (slot: string) => void;
  setHaul: (haul: HaulId) => void;
  resetCart: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("seller");
  const [lang, setLang] = useState<Lang>("English");
  const [cart, setCart] = useState<CartState>(DEFAULT_CART);

  const toggleMaterial = useCallback((name: string) => {
    setCart((c) => {
      const kgs = { ...c.kgs };
      if (kgs[name] === undefined) kgs[name] = 5;
      else delete kgs[name];
      return { ...c, kgs };
    });
  }, []);

  const stepKg = useCallback((name: string, delta: number) => {
    setCart((c) => {
      const kgs = { ...c.kgs };
      kgs[name] = Math.max(1, (kgs[name] ?? 0) + delta);
      return { ...c, kgs };
    });
  }, []);

  const setDay = useCallback((day: number) => setCart((c) => ({ ...c, day })), []);
  const setSlot = useCallback((slot: string) => setCart((c) => ({ ...c, slot })), []);
  const setHaul = useCallback((haul: HaulId) => setCart((c) => ({ ...c, haul })), []);
  const resetCart = useCallback(() => setCart({ ...DEFAULT_CART, kgs: {} }), []);

  const value = useMemo<AppContextValue>(
    () => ({ role, setRole, lang, setLang, initials: "BS", cart, toggleMaterial, stepKg, setDay, setSlot, setHaul, resetCart }),
    [role, lang, cart, toggleMaterial, stepKg, setDay, setSlot, setHaul, resetCart]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
