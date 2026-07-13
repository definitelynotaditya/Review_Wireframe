# Engineering Assumptions

> **Status:** Canonical · **Version:** 3.0 · **Last updated:** 2026-07-13
> **Classification key:** ✅ **Confirmed** · 🟨 **Assumed** · 🔮 **Future**.
> **V3 restructures this doc to keep four concerns separate (as required): Business Rules · UI Behaviour · Backend Behaviour · Future Enhancements.**

## Purpose

State what engineering may rely on and what must not be silently assumed, with the four concern-types kept explicitly apart so they are never conflated.

## Scope

Cross-cutting technical assumptions and the concern-separation guide. Feature rules live in [Business_Rules](../product/Business_Rules.md); integrations in [Integration_Points](Integration_Points.md); deferred scope in [Future_Considerations](Future_Considerations.md).

## Dependencies

[Business_Rules](../product/Business_Rules.md) · [State_Machines](../architecture/State_Machines.md) · [Tech_Stack](../architecture/Tech_Stack.md) · [RealTime_And_Sync](../architecture/RealTime_And_Sync.md) · [Founder_Decision_Log](../product/Founder_Decision_Log.md)

---

## 0. Separation of concerns (how to read the rest)

| Concern | Definition | Lives in |
|---|---|---|
| **Business Rule** | A "must" that is true regardless of implementation (e.g. maintenance blocks bookings 24h). | [Business_Rules](../product/Business_Rules.md) (`BR-*`) — §1 below indexes the load-bearing ones |
| **UI Behaviour** | What the operator/guest sees and does on a surface. | [Screen_Inventory](../ux/Screen_Inventory.md), [Interaction_Patterns](../ux/Interaction_Patterns.md) — §2 below |
| **Backend Behaviour** | Server-side responsibilities (state, scheduling, concurrency, events). | §3 below |
| **Future Enhancement** | Explicitly deferred; build seams, not the feature. | [Future_Considerations](Future_Considerations.md) — §5 below |

Do **not** mix these. A UI doc must not invent a business rule; a backend note must not assume a UI; a future item must not leak into V1 scope.

## 1. Business Rules engineering must honour (index)

The authoritative list is [Business_Rules](../product/Business_Rules.md). The load-bearing, easy-to-get-wrong ones:
- **Availability = ALL of** capacity≥seats, whole-duration-free, not-maintenance, not-booked (BR-A2/A3).
- **Pricing is auto + isolated/configurable** (BR-P1..P5) — never hardcode in booking UI.
- **First-save-wins + manual override** (BR-CF1..CF3).
- **Maintenance blocks new bookings 24h; existing bookings remain + manual reroute** (BR-M1..M4).
- **Extensions:** dashboard is authoritative & immediate (+30); LG is request-only (BR-E1..E4).
- **Members:** internal DB (CSV), invalid ID blocks booking (BR-MEM1..MEM4).
- **Meetings never auto-end** (BR-END1..END5).
- **Q Pay members-only** (BR-PAY7); dashboard records, never processes (BR-PAY5).

## 2. UI Behaviour assumptions

- ✅ Meeting Room is an **extension inside the existing React/Vite app** — same shell, auth, deploy. Reuse App Shell, ProtectedRoute, axios client, React Query, Pusher provider, Tailwind theme, toasts.
- ✅ **Dashboard is room-first; Bookings is calendar-first** (guided sequence). See [Dashboard_Architecture](../architecture/Dashboard_Architecture.md).
- ✅ **One primary action per room-card state** (reduce staff effort, FD-22).
- ✅ Notifications surface on **dashboard + smartwatch** (FD-19).
- 🟨 New pages/stores/routes under a `meeting-rooms` namespace; new zustand stores per domain; new React Query keys wired to the Pusher provider.

## 3. Backend Behaviour assumptions

- ✅ **Backend is the single source of truth.** Dashboard invalidates React Query keys and refetches; Pusher is a signal, not state (RealTime_And_Sync).
- 🟨 **Scheduler/cron required** for time-triggered transitions/notifications: **room-reserved** at slot start, **ending-soon** at −10 min, **escalation** at +1 min. **No auto-end timer** (FD-21) — the end-time trigger emits a *notification only*.
- 🟨 **Optimistic concurrency** on bookings (a `version`/timestamp) to implement first-save-wins (BR-CF1); override is an explicit privileged write (BR-CF2).
- 🟨 **Pricing Calculator** is a server-side, config-driven module callable by booking and billing (BR-P3).
- 🟨 **Availability Engine** is the single authority both booking and extension call (BR-A2, BR-E2).
- 🟨 **Maintenance block** stored with `blocked_until = start + 24h`; availability excludes the room for that window (BR-M3/M4).
- ✅ REST `/api/v1/`, tenant-scoped, soft deletes, `{success,data}` envelopes, INR string money, ISO-UTC + venue `time_zone`.
- ✅ Auth: bearer `auth_token`; 401 → logout (`apiClient.js`).

## 4. Must NOT be assumed (require explicit input)

- ❌ **POS/Touche amount retrieval** — manual entry is the V1 baseline (FD-06); an API adapter is unconfirmed.
- ❌ **Pricing-band thresholds** beyond the two given examples (BR-P5) — configurable, exact policy TBD.
- ❌ **Maintenance reroute mechanics** — assisted suggestions vs fully manual (BR-M2).
- ❌ **Reserved timing** — reconcile "at slot start" vs "10 min before" (BR-S1).
- ❌ **No-show handling** for un-started bookings.
- ❌ **Smartwatch delivery channel** — assumed existing; confirm transport.

## 5. Explicitly Future (build seams, not the feature)

- 🔮 Self-service guest/member booking web app (FD-23) — keep booking APIs UI-agnostic.
- 🔮 Direct LG extension + automatic calendar blocking (FD-17/BR-E5).
- 🔮 Automatic billing / payment settlement & automatic F&B (FD-23) — RoomBill/Payment + F&B order records leave room for it.
- 🔮 **RF-based notification transport** replacing Wi-Fi (FD-19/BR-N5) — abstract the notification transport.
- 🔮 External Member-system sync (FD-18) — Member DB behind a repository interface so the source can change without UX change.
- 🔮 Multi-venue switching.

## Future Work

- Convert each ❌ into ✅ via [Integration_Points](Integration_Points.md) and [REPOSITORY_AUDIT](../REPOSITORY_AUDIT.md).

## Related Documents

- [Business_Rules](../product/Business_Rules.md) · [Data_Model](Data_Model.md) · [Integration_Points](Integration_Points.md) · [Future_Considerations](Future_Considerations.md) · [State_Machines](../architecture/State_Machines.md)
