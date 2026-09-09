# Sajilo Kabadi — Delivery Phases

Status: Draft v1. Sequencing for building the Django + Flutter production
stack described in `ARCHITECTURE.md`, delivering the scope in `PRD.md` under
the conventions in `RULES.md`. The existing Node/React Native code in
`backend/` and `mobile/` is the behavioral reference throughout — each phase
below names which of its screens/endpoints it re-implements.

## Phase 0 — Foundations (no user-facing features)

Goal: an empty but real skeleton of both stacks, deployable, before any
screen is built.

- Django project scaffolded per `ARCHITECTURE.md` §3.1 app layout, with
  `core`, `accounts` apps only; PostgreSQL + Redis wired; `drf-spectacular`
  schema endpoint live (even if it describes nothing yet).
- Flutter project scaffolded per §4.1 layout; theme tokens ported from
  `mobile/src/theme/tokens.ts` and `icons.ts`; `go_router` shell in place
  with an empty placeholder home.
- CI: lint + test pipelines for both stacks (`ruff`/`black`/`pytest-django`;
  `flutter analyze`/`dart format`/widget tests), per `RULES.md` §3/§4.
- Auth: phone + OTP → JWT, end to end (`accounts` app + Flutter sign-in
  screen), including the language toggle. This is the one screen that must
  work before anything else is worth building.
- **Exit criteria**: a signed-in session can hit an authenticated
  `/api/v1/profile/` endpoint from the Flutter app and render the response.

## Phase 1 — Seller MVP

Goal: the core seller journey works end to end with real (if manually
maintained) rates. This is the smallest slice that is useful to a real user.

Screens/endpoints (numbers from `PRD.md` §6.2):
- Materials catalog + rate board (§6.1.4, §6.2.6) — `materials` app,
  seeded with the 20-item reference catalog from `backend/src/db.ts`.
- Home (§6.2.5) — wallet balance stub (0 until Phase 1 wallet lands),
  top-rates carousel, drop-off summary.
- Sell calculator + schedule/haul/breakdown (§6.2.7–8) — `bookings` app,
  `pricing.py` ported directly from `backend/src/routes/bookings.ts`'s
  `priceItems`/`haulCostFor` formulas, unit-tested per `RULES.md` §3.
- Track + Weigh-in + Payout (§6.2.9–11) — polling-based per
  `ARCHITECTURE.md` §7 (Channels upgrade deferred to Phase 4).
- Wallet (§6.2.12) — ledger + balance projection, no real bank transfer yet
  (FR8 in `PRD.md`: withdrawal records intent only).
- Drop-off centers (§6.2.14) — static-ish `geo` data, no live map yet.
- Profile (§6.1.3) — read/edit personal details, address book, language.

Explicitly deferred to a later phase: Impact screen, collector-side
anything, marketplace, disputes beyond "flag a line."

**Exit criteria**: a seller can sign in, book a pickup, watch it move through
weigh-in, get paid to wallet, and see the transaction in wallet history —
without a collector-side app existing yet (collector actions can be done via
Django admin for this phase, e.g. an admin advances booking status and
enters weigh-in lines).

## Phase 2 — Collector MVP + realtime

Goal: the collector actually replaces the admin stand-in from Phase 1, and
weigh-in stops being polled.

- `matching` app: confirmed bookings generate `JobOffer`s to nearby
  collectors (§6.3.15–16 in `PRD.md`); accept/skip.
- Collector home, Job detail (§6.3.15–16) in Flutter.
- Earnings & stock (§6.3.18) — `wallet`/new `inventory` read models.
- Django Channels for the Weigh-in screen (`ARCHITECTURE.md` §7) — replaces
  polling for both the seller and collector clients on that screen.
- Dispute flag from Phase 1 gains a real resolution path: a disputed booking
  surfaces in Django admin's queue; resolving it unblocks payout.
- Push notifications (`notifications` app) for job-offered and
  weigh-in-updated events, replacing/augmenting polling elsewhere too.

**Exit criteria**: a seller's booking is picked up by a real collector
account end to end, with no admin intervention required for the happy path.

## Phase 3 — Marketplace, Impact, payments

Goal: round out the remaining screens and connect wallet to real money
movement.

- Marketplace (`marketplace` app, §6.3.17) — listings, browsing, "offer a
  price" (decide in this phase whether counter-offers are in scope, per the
  open question in `PRD.md` §11).
- Impact screen (§6.2.13) — `impact` app's aggregation queries + cache,
  ported from the reference app's static demo numbers into real
  completed-booking rollups.
- Real payment/payout integration: replace "withdraw records intent only"
  (Phase 1 FR8 stopgap) with an actual bank transfer or mobile wallet
  provider integration (provider selection is a decision to make in this
  phase, not before — see `PRD.md` non-goals).
- SMS OTP provider selection and production hardening of `accounts` (rate
  limiting tuned from real traffic, not just the Phase 0 defaults).

**Exit criteria**: every screen in the original 16-screen prototype has a
production Flutter/Django equivalent, and wallet withdrawals move real money
or a real settlement record outside the app.

## Phase 4 — Hardening & scale

Goal: the things that don't show up as a screen but matter for a real
launch.

- Load-test the pricing and matching endpoints; add caching per
  `ARCHITECTURE.md` §3.5 where p95 targets (`PRD.md` §9) aren't met.
- Multi-city rate support if the open question in `PRD.md` §11 resolves
  toward "yes" — this likely touches `materials` and `geo` together.
- Collector verification/rating gate before accepting jobs (`PRD.md` §11
  open question) if fraud/no-shows show up in Phase 1–3 usage data.
- Observability: structured logging, error tracking (e.g. Sentry) wired for
  both stacks, dashboards for the KPIs in `PRD.md` §10.
- App store release process solidified (signed builds via CI per
  `ARCHITECTURE.md` §8, staged rollout).

## Sequencing notes

- Phases are ordered by "smallest thing a real user can complete," not by
  technical layer — Phase 1 deliberately ships a seller-only slice propped
  up by Django admin rather than waiting for both sides to be ready
  simultaneously.
- A phase's exit criteria is a demo, not a date — don't start the next
  phase's screens until the current phase's exit criteria genuinely works
  against the real backend (not mocked data), per `RULES.md` §6.
- The reference Node/React Native app is not deprecated until Phase 3's
  exit criteria is met (full screen parity) — keep it running as the
  spec-by-example until then.
