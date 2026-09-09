# Sajilo Kabadi — Architecture Requirements Document (ARD)

Status: Draft v1 · Backend: Django + Django REST Framework · Frontend: Flutter
Companion to `PRD.md` (what to build) and `PHASES.md` (in what order). This
document says how the system is put together and supersedes the Node/Express +
React Native stack in `backend/` and `mobile/`, which remains in the repo as a
working reference for behavior, pricing formulas, and screen content — not as
the target production stack.

## 1. System overview

```
┌────────────────┐        HTTPS/JSON         ┌─────────────────────────┐
│  Flutter app    │ ────────────────────────▶ │  Django + DRF API        │
│  (Android/iOS)  │ ◀──────────────────────── │  (sajilo_backend)        │
└────────────────┘        REST + polling      │                          │
                                                │  ┌────────────────────┐ │
                                                │  │ PostgreSQL          │ │
                                                │  └────────────────────┘ │
                                                │  ┌────────────────────┐ │
                                                │  │ Redis (cache,       │ │
                                                │  │ Channels layer,     │ │
                                                │  │ Celery broker)      │ │
                                                │  └────────────────────┘ │
                                                └─────────────────────────┘
                                                        │
                                          Celery workers │ scheduled/async jobs
                                          (rate refresh, SMS OTP, notifications)
```

- One Django project (`sajilo_backend`), split into focused apps (§3).
- One Flutter codebase targeting Android + iOS (no separate web target in v1,
  per PRD non-goals).
- Realtime-ish behavior (weigh-in updates, job availability) is **polling in
  v1** with a documented upgrade path to Django Channels (WebSockets) in
  Phase 2 — see §7.

## 2. Why this stack (context for the decision)

- Django + DRF gives batteries-included admin (rate management, dispute
  queue, manual payout reconciliation — all "back office" needs the PRD marks
  out of scope for the consumer app UI) without building a separate internal
  tool.
- Flutter gives one codebase for Android + iOS with a widget system that maps
  cleanly onto the existing design tokens (Caprasimo/Figtree type scale,
  pill-radius components, ink/cream/red/green palette) already proven out in
  the React Native reference app.
- Both are a deliberate **replacement** of the prototype's Node/Express +
  SQLite + React Native stack, chosen for this project's longer-term needs
  (admin tooling, background jobs, ORM migrations). Reuse the reference app's
  *screens, copy, and pricing logic* — not its runtime.

## 3. Backend architecture

### 3.1 Django apps

| App | Responsibility |
|---|---|
| `accounts` | User model (phone-based), OTP issuance/verification, JWT auth, Profile, role state |
| `materials` | Material catalog, daily `RatePoint` history (so "trend" is computed, not hand-entered) |
| `bookings` | The seller-side pickup lifecycle: `Booking`, `BookingItem`, `HaulQuote`, `WeighInLine`, `Payout` |
| `matching` | Turns a confirmed `Booking` into visible `JobOffer`s for nearby collectors; acceptance |
| `marketplace` | Direct `Listing`s a seller posts for any collector to browse/offer on (independent of `bookings`) |
| `wallet` | `WalletTransaction` ledger, balance projection |
| `geo` | `DropoffCenter`, address book entries, distance calculation |
| `impact` | Read-side aggregation over completed bookings (kg diverted, CO2e, per-material breakdown) — no writable model, just querysets + a cache |
| `notifications` | Push token registry, templated push/SMS sends (Celery tasks) |
| `core` | Shared base models (timestamped, soft-delete), pagination, error format, permissions |

**Key modeling decision vs. the reference backend**: the reference Node
backend keeps seller `bookings` and collector `jobs` as two separate tables
with no foreign key between them (a prototyping shortcut). In the Django
target, a **booking is the single source of truth**; `matching.JobOffer` is a
thin projection (`booking`, `collector`, `status`) so a seller's tracking
screen and a collector's job-detail screen are two views of the same
underlying record. This removes a whole class of "seller and collector
disagree about what happened" bugs.

### 3.2 Core data model (essential fields only)

```
User(id, phone, name, initials, preferred_lang, is_verified_collector)
Profile(user, area, address, rating, recycled_kg_lifetime)

Material(id, name, abbr, category[metal|other|paper_plastic], active)
RatePoint(material, price_npr, effective_date)  # latest per material = current rate

Booking(id, seller, status[requested|accepted|en_route|weighing|disputed|paid|cancelled],
        address, scheduled_day, scheduled_slot, haul_method[self|collector|truck],
        haul_cost_npr, service_fee_npr, cart_value_npr, net_total_npr,
        distance_km, created_at)
BookingItem(booking, material, kg, price_npr_snapshot, amount_npr)
WeighInLine(booking, material, kg, price_npr_snapshot, amount_npr, disputed)
Payout(booking, method[wallet|cash|bank], amount_npr, completed_at)

JobOffer(booking, collector, status[offered|accepted|skipped], offered_at)

Listing(id, seller, title, ask_price_npr, meta, photo, status[open|sold])

WalletTransaction(user, direction[in|out], amount_npr, label, method, related_booking, created_at)

DropoffCenter(id, name, meta, tag1, tag2, lat, lng)
```

Money fields are integer NPR (`PositiveIntegerField`), matching PRD §8/FR10.
All monetary/quantity calculations that determine payout happen in a single
`bookings.pricing` module, unit-tested independently of the views (this is
the Django equivalent of the reference backend's `priceItems`/`haulCostFor`
functions in `backend/src/routes/bookings.ts` — same formulas, ported).

### 3.3 API design

- REST over JSON, versioned under `/api/v1/`.
- DRF `ModelViewSet` + `Serializer` per resource; role-sensitive fields
  (e.g. a booking's collector-facing vs seller-facing shape) handled with
  separate serializers, not conditional fields, to keep response shapes
  predictable for the Flutter client's typed models.
- Auth: phone + OTP exchanges for a JWT pair (access + refresh) via
  `djangorestframework-simplejwt`. Access token short-lived (~15 min),
  refresh rotated on use.
- Pagination: cursor pagination on list endpoints with unbounded growth
  (wallet history, marketplace listings); simple list responses elsewhere.
- Errors: a single envelope — `{"error": {"code": "...", "message": "..."}}`
  — for every non-2xx response, so the Flutter client has one parsing path.
- Idempotency: booking confirmation and payout endpoints accept an
  `Idempotency-Key` header (mobile networks retry) so a double-tap or a
  retried request can't create two bookings or pay out twice.

### 3.4 Background work (Celery + Redis)

- Daily (or admin-triggered) rate refresh → writes new `RatePoint` rows.
- OTP SMS dispatch (provider TBD — see PRD open questions).
- Push notification fan-out (job offered, weigh-in updated, payout sent).
- Nightly impact-stats cache warm (backs the `impact` app's read endpoints).

### 3.5 Storage

- **PostgreSQL** — primary datastore (the reference backend's SQLite is a
  prototyping choice, not viable for concurrent writers / Django migrations
  history at production scale).
- **Redis** — Celery broker, DRF throttling counters, short-lived cache
  (rate board, home summary).
- **Object storage (S3-compatible)** — job/listing photos, via
  `django-storages`; never store uploads on local disk in production.

## 4. Frontend architecture (Flutter)

### 4.1 Project layout

```
lib/
  app.dart                 # MaterialApp, theme, router
  theme/                   # colors.dart, type_scale.dart, radii.dart — ports
                            # of mobile/src/theme/tokens.ts and icons.ts
  core/
    api_client.dart        # dio-based client, interceptors (auth, retry, errors)
    models/                # typed request/response models (freezed + json_serializable)
    storage/                # secure token storage
  features/
    auth/                  # sign-in, OTP, language toggle
    home/
    rates/
    booking/                # step 1 (calculator) + step 2 (schedule/haul/breakdown)
    tracking/                # track, weigh-in, payout
    wallet/
    impact/
    dropoff/
    collector_home/
    job_detail/
    marketplace/
    earnings/
    profile/
  shared_widgets/           # PillButton, Card, RadioOptionRow, StatTile, ScreenChrome —
                            # ports of mobile/src/components/*.tsx
```

Each `features/<x>` folder holds its screen widget(s), a state
notifier/controller, and a repository that calls `core/api_client.dart` —
mirroring the separation the reference app already has between
`src/screens/*.tsx` and `src/api/*.ts`.

### 4.2 State management

- **Riverpod** (`flutter_riverpod`) for app-wide state: current role
  (seller/collector), language, auth session, and the in-progress booking
  cart (kg per material, day/slot/haul selection) — the direct equivalent of
  `mobile/src/context/AppContext.tsx`.
- Screen-local state (form inputs, expanded/collapsed UI) stays in
  `StatefulWidget`/`ConsumerStatefulWidget`, not lifted to global state.

### 4.3 Navigation

- `go_router` with one route tree; a `ShellRoute` wraps every authenticated
  screen in the shared chrome (header with role switch + avatar, bottom tab
  bar that swaps by role, floating Sell/Buy pill) — the Flutter equivalent of
  `mobile/src/components/ScreenChrome.tsx`. Sign-in sits outside the shell.
- Route names mirror the 16 screens 1:1 with the reference app
  (`RootStackParamList` in `mobile/src/navigation/routes.ts`) so behavior
  parity is easy to check off screen-by-screen.

### 4.4 Design system port

- Color tokens, the Caprasimo/Figtree type scale, radii, and icon paths in
  `mobile/src/theme/tokens.ts` / `icons.ts` translate directly to a Flutter
  `ThemeData` extension + a `CustomPainter`/`Icon`-per-path set (or bundled
  SVGs via `flutter_svg`, one file per icon key).
- Fonts loaded as bundled assets (Caprasimo, Figtree weights 400/600/700),
  not fetched at runtime, for reliable cold-start rendering.

### 4.5 Networking

- `dio` HTTP client; a single interceptor attaches the JWT, retries once on
  401 after a refresh-token exchange, and unwraps the error envelope from
  §3.3 into a typed `ApiException`.
- Generated models via `freezed` + `json_serializable` from an OpenAPI schema
  that DRF emits (`drf-spectacular`) — keeps backend and app types from
  drifting, which the reference app's hand-written `api/types.ts` doesn't
  guard against.

## 5. Cross-cutting: pricing & the client/server trust boundary

Per PRD FR2, the Flutter app never computes a number that becomes money — it
only:
1. Sends the selected materials + kg to `POST /api/v1/bookings/quote/` and
   renders whatever the server returns (mirrors `Book2Screen`'s call to the
   reference backend's `/bookings/quote`).
2. On confirm, sends the same cart + choices to `POST /api/v1/bookings/` and
   trusts the server's response for the booking id and totals.
3. Never re-derives haul cost, service fee, or net total client-side for
   display purposes beyond the last quote it received.

## 6. Security

- OTP codes: 6-digit, 5-minute expiry, rate-limited per phone number
  (DRF throttle + Redis), never logged at any level above `DEBUG` in a
  non-development settings module.
- JWT access tokens short-lived; refresh tokens stored in Flutter via
  `flutter_secure_storage`, never `SharedPreferences`.
- All endpoints require auth except OTP request/verify and (read-only)
  material rates, which are public so the rate board could later support a
  logged-out preview.
- Object-level permissions: a seller can only read/act on their own
  bookings/wallet; a collector can only read/act on job offers addressed to
  them or open marketplace listings — enforced with DRF permission classes,
  not just query filtering, so a wrong-role request 403s rather than
  returning someone else's data.
- CORS/CSRF: mobile-only clients hitting a token-authenticated API, so CSRF
  is disabled for the API surface and CORS is not applicable; the Django
  admin (staff-only, session-authenticated) keeps CSRF protection.

## 7. Realtime upgrade path (Phase 2)

v1 ships weigh-in and job-offer updates via short-interval polling (matches
the reference app's `useApiGet` pattern). Phase 2 replaces this with Django
Channels: a `booking.<id>` group that the seller's Flutter client subscribes
to while on the Weigh-in screen, and the collector's device publishes to as
they key in each line — removing polling latency without changing the DRF
resource model underneath.

## 8. Environments & deployment

- `settings/` split into `base.py`, `dev.py`, `staging.py`, `production.py`.
- Twelve-factor config via environment variables (`django-environ`).
- Containerized (Docker) for API + Celery worker + Celery beat; PostgreSQL
  and Redis as managed services in staging/production.
- Migrations are the only schema change mechanism — no manual DB edits,
  matching the audit requirement in PRD §9.
- Flutter builds via Codemagic/GitHub Actions producing signed Android
  (`.aab`) and iOS (`.ipa`) artifacts per tagged release.

## 9. Testing strategy

- Backend: `pytest-django` for models/serializers/permission classes; a
  dedicated test module for `bookings.pricing` covers every haul-cost branch
  from PRD FR4 with table-driven cases (kg above/below 10, distance edges).
- Frontend: widget tests per shared component (port of the reference app's
  visual states), integration tests for the two multi-step flows (sell
  calculator → schedule → confirm; job accept → track... once unified per
  §3.1) using `integration_test`.
- Contract testing: the OpenAPI schema from `drf-spectacular` is checked into
  CI as the single source of truth Flutter's generated models are diffed
  against, catching drift before it ships.
