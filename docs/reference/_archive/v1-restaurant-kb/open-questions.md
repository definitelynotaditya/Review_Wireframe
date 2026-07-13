# Open Questions & Access Gaps

Tracks things that are not yet answerable from the current vantage point. Each item names what would unblock it.

## Resolved in Session 1

- [x] Manual authentication — done by user.
- [x] Landing route — `/restaurant/tables`.
- [x] Full navigation inventory — 10 modules (see [IA](../architecture/information-architecture.md)).
- [x] Auth mechanism — bearer `auth_token` in `localStorage`, sent as `Authorization: Bearer` to `api.mywoobly.com`.
- [x] Roles present — `admin, server, host, steward, chef, captain` (see [roles](../architecture/roles-and-permissions.md)).

## Access / permissions (still open)

- [ ] Non-admin role surfaces (`server`/`host`/`steward`/`chef`/`captain`) — likely device-side or a separate staff app; need such an account to confirm.
- [ ] Multi-venue: token is single-restaurant (`restaurant_id: 3`); no venue switcher observed. Does one operator manage multiple venues?
- [ ] Is there an owner/super-admin tier above dashboard `admin`?

## Login screen

- [ ] Password-reset / "forgot password" flow — not visible on `/login`.
- [ ] SSO / OAuth — none visible.

## Behaviours not exercised (need data or would cause side effects)

- [ ] **Session transfer** flow (Manage Sessions) — no active session existed at capture.
- [ ] **Device Reboot/Shutdown** (single + all) — hardware-affecting; not triggered.
- [ ] Dashboard **"View History"** and notifications **"View all activities"** destinations.
- [ ] **Mutation endpoints** (`POST/PATCH/DELETE`) and their payloads — inferred, not observed (no writes performed).
- [ ] Reservation **Seat** action (table-picker vs auto-assign).

## Data-shape gaps (need a venue/window with activity)

- [ ] Dashboard endpoint **response schemas** (all zero at capture).
- [ ] Full enums: `reservation_status`, `activity_type`, `activity_status`, LED `color_id` → colour map.
- [ ] Per-card numeric counter on Chef's Specials (units sold vs requests).
- [ ] Restaurant-level config editors not found in Settings tabs (hours, payment UPI/QR, address, notify flags).

---

_Resolve items here by moving the finding into the relevant page/architecture doc and checking the box._
