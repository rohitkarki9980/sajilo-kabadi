# Sajilo Kabadi — API server

Simple Express + SQLite backend for the Sajilo Kabadi scrap-collecting app. Backs the
`mobile/` React Native client — no auth beyond a mock phone sign-in, matching the design's
"Send me a code" prototype flow.

## Run

```
npm install
npm run dev      # tsx watch, http://localhost:4000
```

The SQLite file lives at `data/sajilo.db` and is seeded automatically on first run with the
same mock data (rates, wallet, jobs, listings, drop-off centers) used in the original design.
Delete it to reset to the seed state.

## Endpoints

- `GET  /api/rates?filter=All|Metal|Paper & plastic`
- `GET  /api/rates/top`
- `GET  /api/home` — seller home summary (wallet, top rates, next pickup, drop-off summary)
- `GET  /api/wallet` / `POST /api/wallet/withdraw { amount }`
- `GET  /api/impact`
- `GET  /api/dropoff-centers`
- `POST /api/bookings/quote { items, haul }` — price a cart without persisting
- `POST /api/bookings { items, day, slot, haul }` — confirm a pickup booking
- `GET  /api/bookings/:id`, `/:id/track`, `/:id/weigh`
- `POST /api/bookings/:id/payout { method: wallet|cash|bank }`
- `GET  /api/collector/home`, `/jobs`, `/jobs/:id`, `/earnings`, `/marketplace`
- `POST /api/collector/jobs/:id/accept`
- `GET  /api/profile`
- `POST /api/auth/signin { role }` / `POST /api/auth/signout`
