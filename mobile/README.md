# Sajilo Kabadi — mobile app

React Native (Expo) implementation of the "Scrap App" design (`project/Scrap App.dc.html`,
artboard 1a — the 16-screen working prototype). Talks to the API in `../backend`.

## Run

```
# 1. start the API (separate terminal)
cd ../backend && npm install && npm run dev

# 2. start the app
npm install
npm start        # then press i / a / w, or scan the QR code with Expo Go
```

The app auto-detects the dev machine's LAN IP (via Expo's host URI) to reach the backend on
port 4000, so it works out of the box on a simulator, emulator, or a physical device on the
same network — no manual IP configuration needed. For a production build, set
`expo.extra.apiBaseUrl` in `app.json`.

## Structure

- `src/theme/` — colors, type scale (Caprasimo headings, Figtree body), icon paths, radii —
  ported from the design system tokens in `_ds/organic-.../styles.css`.
- `src/components/` — shared UI: `ScreenChrome` (header, role switch, Sell/Buy FAB, bottom tab
  bar), `Card`, `PillButton`, `RadioOptionRow`, `StatTile`, etc.
- `src/context/AppContext.tsx` — role (seller/collector), language, and the in-progress
  booking cart shared between the two booking screens.
- `src/api/` — typed REST client for the backend.
- `src/screens/` — the 16 screens, one file each, matching the design's screen list:
  Home, Rates, Book1/Book2 (sell calculator + scheduling), Track, Weigh, Payout, Wallet,
  Impact, Dropoff, CollectorHome, JobDetail, Marketplace, Earnings, Profile, Signin.
- `src/navigation/` — a single native-stack navigator; `ScreenChrome` reads the active route
  to highlight the right tab, mirroring the original prototype's single-page screen switch.

Fonts (Caprasimo, Figtree) load via `@expo-google-fonts/*` before the app renders.
