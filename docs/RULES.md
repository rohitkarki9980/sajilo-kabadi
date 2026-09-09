# Sajilo Kabadi — Engineering Rules

Status: Draft v1. Applies to the Django backend and Flutter frontend described
in `ARCHITECTURE.md`. Read alongside `PRD.md` (what) and `PHASES.md` (when).

## 1. General

1. **No screen ships without a Figma/prototype source.** Every screen in this
   app traces back to `project/Scrap App.dc.html` (artboard 1a) or an explicit
   product decision recorded in a PR description. Don't invent UI.
2. **Money is never computed twice.** Any number that affects a payout is
   computed once, server-side, in `bookings/pricing.py`. The Flutter app
   renders numbers the server returned; it does not re-derive them.
3. **NPR is integer rupees.** No paisa/decimal money handling unless a future
   PRD revision explicitly asks for it — don't introduce `Decimal`/float
   ambiguity speculatively.
4. **Both languages, always.** No user-facing string is hardcoded in English
   only. Every new string goes into the `.arb` files for both `en` and `ne`
   in the same PR that introduces it — a PR adding English-only copy is not
   mergeable.
5. **Soft delete, never hard delete**, on `Booking`, `WeighInLine`, `Payout`,
   `WalletTransaction`. These are audit records; use a `deleted_at` /
   `is_active` field and filter it out of default querysets.

## 2. Git workflow

1. Branch naming: `feature/<short-slug>`, `fix/<short-slug>`,
   `chore/<short-slug>`. No work happens directly on `main`.
2. One logical change per PR. A PR that touches both `backend/` and
   `mobile-flutter/` is fine when it's one feature (e.g. a new field end to
   end) but should not bundle unrelated cleanup.
3. Commit messages: imperative mood, explain *why* over *what*
   (`Add haul-cost floor for sub-10kg pickups` not `Update pricing.py`).
4. PRs require: a passing CI run (lint + tests, both stacks as applicable),
   and — for anything touching `bookings/pricing.py` or its Flutter
   equivalent — a reviewer who re-derives the formula by hand against
   `PRD.md` §8 FR4/FR5 before approving.
5. Never force-push a shared branch after another person has pushed to it.
6. Squash-merge to `main`; keep the PR's final commit message as the
   changelog entry.

## 3. Backend (Django) rules

1. **App boundaries are load-bearing.** A model lives in the app described in
   `ARCHITECTURE.md` §3.1. If a feature doesn't fit an existing app, propose
   a new one in the PR description rather than bolting it onto `core`.
2. **Every migration is reviewed like code.** No `makemigrations
   --merge` without understanding the conflict; no editing an already-applied
   migration file.
3. **Views stay thin.** Business logic (pricing, matching, dispute rules)
   lives in a `services.py` or dedicated module per app, unit-tested
   independent of DRF. A view/viewset method should mostly call one service
   function and serialize the result.
4. **Serializers are role-aware, not conditional.** Don't sprinkle
   `if request.user.role == ...` inside a single serializer's `to_representation`.
   Use separate serializer classes (`BookingSellerSerializer`,
   `BookingCollectorSerializer`) selected in the view. This matches
   `ARCHITECTURE.md` §3.3 and keeps the Flutter-side generated models honest.
5. **Permissions are object-level.** `IsBookingOwnerOrAssignedCollector`-style
   permission classes, not `queryset.filter(user=request.user)` alone —
   a filtered-empty queryset and a 403 look different to a client and mean
   different things; don't let a permission bug silently look like "no data".
6. **No `print()`/bare logging in views.** Use the `logging` module with the
   app's logger name; no PII (phone numbers, OTP codes, addresses) in log
   messages above `DEBUG`.
7. **All new endpoints ship with a `drf-spectacular` schema** (correct
   request/response types, not `Any`) — this is what keeps the Flutter
   client's generated models in sync per `ARCHITECTURE.md` §9.
8. **Celery tasks are idempotent** and safe to retry — no task assumes it
   runs exactly once.
9. Lint/format: `ruff` (lint) + `black` (format) + `isort`, enforced in CI;
   no PR merges with lint failures.

## 4. Frontend (Flutter) rules

1. **Widgets match the design tokens, not ad-hoc values.** Colors, radii,
   spacing, and type come from `lib/theme/`, ported 1:1 from
   `mobile/src/theme/tokens.ts`. No inline hex colors or magic-number
   `EdgeInsets` in a screen file — if a value doesn't exist in the theme yet,
   add it there first.
2. **Screens don't call `dio` directly.** A screen's controller calls a
   `features/<x>/repository.dart`, which calls `core/api_client.dart`. This
   keeps API-shape changes contained to one file per feature.
3. **State lives at the right altitude.** Global (Riverpod) state is
   reserved for what's genuinely cross-screen: auth session, role, language,
   the in-progress booking cart. Everything else is local widget state.
4. **No business logic in widgets.** A `build()` method renders; it does not
   compute haul cost, format currency by hand (use a shared `formatNpr()`
   helper), or decide booking status transitions.
5. **Every new screen gets a widget test** covering at least: loading state,
   populated state, and the primary CTA's tap handler firing the expected
   controller call (mocked repository).
6. **Accessibility**: minimum 44×44 logical-pixel tap targets (matches PRD
   §9); run `flutter analyze` with the accessibility lints enabled before
   merging a new interactive widget.
7. Lint/format: the standard `flutter_lints` set plus `dart format --set-exit-if-changed`
   in CI; no PR merges with analyzer warnings introduced by the diff.

## 5. API contract rules

1. Every response error uses the single envelope in `ARCHITECTURE.md` §3.3 —
   no endpoint returns a bare string or an ad-hoc shape on failure.
2. Breaking changes to a `/api/v1/` response shape require a version bump
   (`/api/v2/`) or an additive, backward-compatible field — never a silent
   field rename/removal that an already-shipped Flutter build depends on.
3. List endpoints that can grow unbounded (wallet history, marketplace,
   payout history) must be paginated from day one — don't ship an
   unpaginated endpoint "for now."
4. Idempotency-Key is required on `POST /bookings/` and `POST
   /bookings/{id}/payout/` per `ARCHITECTURE.md` §3.3 — a client retry must
   never double-book or double-pay.

## 6. Definition of done (per feature)

A feature is done when:
- [ ] It matches a PRD requirement or an explicitly recorded decision.
- [ ] Backend: service function unit-tested, endpoint has a passing
      `pytest-django` test, schema exported correctly.
- [ ] Frontend: widget test written, both `en`/`ne` strings present, matches
      the design tokens (no hardcoded style values).
- [ ] Manually verified end-to-end against a locally running backend, not
      just against mocked data.
- [ ] No new lint/analyzer warnings.
