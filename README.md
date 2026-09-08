# Sajilo Kabadi

A dual-sided scrap collecting & selling app for Nepal — sellers book pickups, get weighed
and paid instantly; collectors accept jobs, track earnings, and manage stock. Implemented
from the Claude Design prototype in `project/Scrap App.dc.html` (see `project/DESIGN_HANDOFF.md`
and `chats/` for the original design brief).

- `backend/` — Express + SQLite API (rates, wallet, bookings, jobs, marketplace, etc.)
- `mobile/` — Expo React Native app implementing the 16-screen prototype

## Quickstart

```
# 1. API server
cd backend
npm install
npm run dev          # http://localhost:4000

# 2. mobile app (new terminal)
cd mobile
npm install
npm start             # then press i / a, or scan the QR code with Expo Go
```

The mobile app auto-detects your machine's LAN IP to reach the backend, so it works
out of the box for a simulator, emulator, or a phone on the same Wi-Fi — no manual
config needed. See `backend/README.md` and `mobile/README.md` for details.
