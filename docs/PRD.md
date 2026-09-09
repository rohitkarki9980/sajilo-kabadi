# Sajilo Kabadi — Product Requirements Document (PRD)

Status: Draft v1 · Target stack: Django (backend) + Flutter (mobile frontend)
Source of truth for intent: `project/Scrap App.dc.html`, `chats/`, and the working
Node/React-Native reference implementation in `backend/` and `mobile/`.

## 1. Summary

Sajilo Kabadi ("easy scrap dealer") is a dual-sided mobile marketplace for scrap
collecting in Nepal. One app, two roles:

- **Seller** — a household or business with scrap to get rid of. Picks materials,
  sees today's rate, books a pickup, gets weighed and paid the same day.
- **Collector** ("buyer" in-app) — an independent kabadi/scrap dealer who accepts
  nearby pickup jobs, buys loads listed on a marketplace, and tracks earnings and
  godown (warehouse) stock.

A single logged-in identity can hold both roles and switch between them with one
tap; the app does not force a user to pick a side at signup.

## 2. Problem statement

Scrap selling in Nepal today is informal: sellers don't know the fair going rate,
have to negotiate on the spot, and often can't get a collector to come same-day.
Collectors waste fuel visiting low-value pickups and have no visibility into
which loads are worth the trip. Sajilo Kabadi fixes the information asymmetry
(published daily rates per material) and the coordination problem (bookable
pickups with live tracking, weigh-in agreed by both sides, instant payout).

## 3. Goals

- G1 — A seller can, in under two minutes, know what their scrap is worth,
  book a pickup, and choose how they get paid.
- G2 — Both sides see the same weigh-in numbers at pickup time, so the amount
  paid is never a point of dispute at the door.
- G3 — A collector can see which nearby jobs are worth accepting before
  driving anywhere, and track a rolling picture of earnings and stock on hand.
- G4 — Rates are centrally published and trusted (verified kabadi-center
  average), not re-negotiated per pickup.

## 4. Non-goals (v1)

- No payment processing integration (wallet balance is a ledger the platform
  operator settles manually / via bank transfer for now; see Phase 3 in
  `phases.md` for real payment gateway work).
- No live GPS map / turn-by-turn routing — "tracking" shows a status timeline
  and static map art, not a real-time moving pin (see Phase 2).
- No public marketplace browsing without an account.
- No web app — mobile only (Flutter, Android + iOS).

## 5. Personas

| Persona | Role | Needs |
|---|---|---|
| Bina Shrestha | Seller | Wants a fair price without haggling, same-day cash or wallet payout, minimal typing. |
| Ram Tamang | Collector | Wants to fill his truck with high-margin loads, minimize dead trips, keep a written log of what he bought (for his own resale/godown). |

## 6. Scope: feature list

Numbers match the 16-screen prototype in `project/Scrap App.dc.html` (artboard 1a).
Each maps to one or more Django apps / Flutter routes in `ARCHITECTURE.md`.

### 6.1 Shared

1. **Sign-in** — phone number, OTP ("send me a code"), language toggle
   (English / नेपाली). "Continue as a collector" is a role shortcut on the same
   screen, not a separate account type.
2. **Role switch** — one control in the header swaps Seller ⇄ Collector context
   app-wide (bottom tab set, home screen, FAB behavior) without signing out.
3. **Profile** — name, phone (masked), address book, payout method, language,
   notification prefs, help/disputes, sign out.
4. **Materials & rates** — a shared catalog of scrap materials (see §7) with a
   daily price per kg, trend indicator, and category (metal / paper & plastic /
   other), filterable rate board.

### 6.2 Seller flows

5. **Home** — wallet balance, top 5 rates carousel, next scheduled pickup card,
   nearest drop-off summary.
6. **Rate board** — full catalog, filterable by category.
7. **Sell calculator (step 1)** — tap materials on/off, set kg with a stepper
   per material; running total updates live from today's rate.
8. **Schedule & haul (step 2)** — pickup address, day/time slot, haul method
   (self drop-off / collector pickup / truck + helper — each with its own
   cost rule), full price breakdown (scrap value − haul cost − service fee =
   net payout), confirm.
9. **Track** — collector identity, live status timeline (confirmed → accepted
   → en route → weighing), call action.
10. **Weigh-in** — line-by-line weights entered by the collector, visible to
    the seller in real time; seller can flag a line for dispute.
11. **Payout** — success state, choice of wallet / cash-from-collector /
    bank transfer, confirmation.
12. **Wallet** — balance, withdraw-to-bank, lifetime stats, transaction history.
13. **Impact** — cumulative kg diverted from landfill, translated into
    relatable stats (CO2e, rank among neighbors), breakdown by material.
14. **Drop-off centers** — nearby self-serve centers with hours and specialties.

### 6.3 Collector flows

15. **Collector home** — today's buying total, kg/pickups today, "accepting
    jobs" availability toggle, nearby job list.
16. **Job detail** — seller's photo of the load, itemized estimate, margin
    estimate, accept / skip.
17. **Marketplace** — loads other sellers have listed directly (not booked
    pickups) that any collector can browse and offer on.
18. **Earnings & stock** — weekly earnings chart, running godown inventory by
    material with current resale value.

## 7. Materials catalog (reference dummy data)

Twenty materials across three categories, used to seed rates and drive the
sell calculator. This is illustrative content, not a hard requirement to keep
exactly these 20 — the requirement is that materials are **data**, not
hardcoded screens, so the catalog can grow without an app release.

| Category | Materials |
|---|---|
| Metal | Copper, Bronze, Brass, Lead, Zinc, Aluminium, Stainless steel, Iron & steel |
| Other scrap | Batteries, E-waste, Appliances, Tyres, Rubber, Wood |
| Paper & plastic | Plastic (HDPE), Plastic (PET), Newspaper, Mixed paper, Cardboard, Glass |

Each material has: display name, short abbreviation (for a badge), price per
kg (in NPR), a day-over-day trend (%, up/down), and category.

## 8. Functional requirements

- FR1: Rates are set by an admin/back-office process (out of scope for the
  consumer app UI in v1) and are read-only to sellers/collectors.
- FR2: A booking's final price is **always computed server-side** at
  confirmation and again at weigh-in — the client never sends a total, only
  quantities, so a modified client can't alter the payout.
- FR3: A seller can have at most one active (non-completed) pickup booking at
  a time in v1 (simplifies tracking UI; revisit in Phase 2 if needed).
- FR4: Haul cost rules (v1, mirrors the reference implementation):
  - Self drop-off: free.
  - Collector pickup: free at ≥ 10 kg total, else a flat Rs 60.
  - Truck + helper: Rs 400 + Rs 30/km over the booking's computed distance.
- FR5: Service fee is a flat 2% of scrap value, deducted before payout.
- FR6: Weigh-in numbers are entered by the collector's device and pushed to
  the seller's device in near-real-time (polling is acceptable for v1;
  WebSocket/Channels upgrade is a Phase 2 item).
- FR7: A seller can raise a dispute on a specific weigh-in line item; disputed
  bookings are held out of the payout step until resolved (resolution flow
  itself — human support queue — is Phase 2).
- FR8: Wallet is an internal ledger (`WalletTransaction` rows); "withdraw to
  bank" in v1 records intent and decrements the ledger — actual bank transfer
  is a manual back-office step until Phase 3.
- FR9: A collector's "accepting jobs" toggle removes them from the nearby-job
  matching pool but does not affect jobs already accepted.
- FR10: All money values are NPR, integer rupees (no paisa/decimal handling
  needed for v1).

## 9. Non-functional requirements

- **Localization**: UI copy must support English and Nepali (Devanagari)
  from day one — the sign-in screen's language toggle is the first thing a
  user sees. All user-facing strings live in Flutter's `.arb` files, not
  hardcoded.
- **Performance**: cold start to interactive home screen < 3s on a mid-range
  Android device over 4G; API endpoints in the hot path (home, rates,
  booking quote) respond < 300ms server time at p95.
- **Offline tolerance**: the app should not hard-crash without connectivity;
  cached last-known rates/home data may render with a "stale" indicator
  (full offline-first sync is out of scope for v1).
- **Accessibility**: minimum tap target 44×44dp (already reflected in the
  reference design), color contrast meets WCAG AA for body text.
- **Security & privacy**: phone numbers masked in UI wherever shown; OTP
  codes never logged; JWTs short-lived with refresh; see `ARCHITECTURE.md` §6.
- **Auditability**: every booking, weigh-in edit, and wallet transaction is
  append-only / soft-deleted, never hard-deleted, for dispute resolution.

## 10. Success metrics

- % of bookings that complete (confirmed → paid) without a dispute.
- Median time from "confirm pickup" to "weigh-in accepted".
- Weekly active sellers and collectors, and the seller:collector ratio per
  service area (used to guide where to recruit more collectors).
- Wallet retention: % of payout value withdrawn vs. kept in-app.

## 11. Open questions

- Do collectors need a minimum rating/verification gate before they can
  accept jobs (fraud/no-show prevention)?
- Should the marketplace (§6.3.17) support seller-initiated price
  negotiation (counter-offers), or is it list-price-only in v1?
- Multi-city launch: is the rate board single national rate or per-city?
  (Reference implementation assumes one city — Kathmandu valley.)
