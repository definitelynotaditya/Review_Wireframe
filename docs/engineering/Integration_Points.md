# Integration Points

> **Status:** Canonical · **Version:** 3.0 · **Last updated:** 2026-07-13
> **Classification:** ✅ Confirmed · 🟨 Assumed · 🔮 Future.
> **V3 change:** the **Member database is now INTERNAL** (CSV-seeded), not an external integration — this **resolves the prior member blocker**. RF notification transport added as future.

## Purpose

Enumerate every system the Meeting Room module must talk to that it does **not** own, with what is known, unknown, and required before that area can be built. Prevents engineering from inventing integration behaviour.

## Scope

Adjacent systems: POS/Touche, **internal Member DB** (owned, but CSV/sync boundary), Q Pay/payments, LUXEGENIE devices + smartwatches, RF (future), Pusher, media/CDN, notifications/scheduler.

## Dependencies

[Engineering_Assumptions](Engineering_Assumptions.md) · [Founder_Decision_Log](../product/Founder_Decision_Log.md) · [RealTime_And_Sync](../architecture/RealTime_And_Sync.md)

---

## 1. POS / Touche (billing amount) — ⚠️ contract required

- ✅ The **bill amount comes from the POS** (FD-06). Staff enters/retrieves it on the room card.
- 🟨 The Flow mentions amount "retrieved from POS or **Touche**" — implies a possible integration rather than pure manual entry.
- **Unknown / required:** Is the amount **manually typed** or **fetched via an API**? If fetched: endpoint, auth, mapping of booking→POS ticket. Is "Touche" a distinct system or the POS product name?
- **V1 fallback:** manual entry is acceptable (FD-06) — build manual entry first, treat API retrieval as an adapter.

## 2. Member Database — ✅ INTERNAL in V1 (FD-18)

- ✅ Members are an **internal, owned entity** — **not** an external integration in V1. Onboarding by **CSV import**; management then **manually edits** Member IDs/details (BR-MEM1).
- ✅ Booking validates `member_id` against the internal DB → **auto-fill** (BR-MEM2); **invalid ID blocks the booking** (BR-MEM3). Q Pay eligibility comes from the member record.
- 🟨 **CSV schema** (columns, id format, de-dupe on re-import) to confirm.
- 🔮 **Future external sync** (another membership system) must be possible **without changing the UX** (BR-MEM4) — put the Member DB behind a **repository interface** so the data source can swap.
- **No longer a blocker** for member bookings (was V2 risk R2, now resolved).

## 3. Payments / Q Pay — ❌ do not process

- ✅ Dashboard **records** payment mode + amount + staff confirmation only; **no settlement** in V1 (FD-06, BR-PAY5).
- Modes: Q Pay (members only), Payment Link, Scan to Pay, Card, Cash.
- 🔮 Actual settlement (Q Pay, payment links, card terminals) is future and provider-dependent.
- **Required if/when automated:** provider contracts, receipt/invoice logic, reconciliation.

## 4. LUXEGENIE devices + smartwatches — ✅ platform-native

- ✅ Devices are the same LUXEGENIE hardware family, **pre-configured per room** (no daily assignment).
- ✅ **Staff Smartwatch notifications** are a **confirmed V1 channel** (FD-19) — escalations/ending-soon/meeting-ended reach the watch so staff needn't watch the screen (FD-22). Confirm the delivery transport (assumed existing).
- ✅ Device fleet management reuses the restaurant LUXEGENIE module.

## 4a. RF notification transport — 🔮 future (FD-19)

- 🔮 A future **RF-based** communication layer replaces Wi-Fi-dependent notifications. **V1 seam:** abstract the notification transport so dashboard/smartwatch delivery can later ride RF without touching product logic. See [Future_Considerations](Future_Considerations.md).

## 5. Pusher (real-time) — ✅ confirmed

- ✅ `pusher-js`, cluster `ap2`, per-tenant channel. Reuse (RealTime_And_Sync). Add Meeting Room event bindings to the existing provider.
- 🟨 Channel naming for Meeting Room (`venue-{id}` vs reuse `restaurant-{id}`) — decide.

## 6. Scheduler / time-triggered notifications — 🟨 new infrastructure (biggest new backend dependency)

- The Meeting Room module needs **time-driven** events with no restaurant precedent:
  - Room → **Reserved** at slot start (BR-S1).
  - **Ending Soon** at −10 min (BR-S3/BR-N2) + smartwatch.
  - **>1-min request escalation** (BR-SR4).
  - **Maintenance block auto-expiry** at +24h (BR-M3).
- **Meetings never auto-end (BR-END1):** the end-time trigger emits a *notification to management only* — **do not** implement an auto-end state change.
- **Required:** a backend scheduler/cron (or delayed-job queue). Confirm it exists or plan to build it.

## 7. Media / CDN — ✅ confirmed

- ✅ AWS CloudFront under `restaurants/{id}/…` for images (F&B items, room photos if added). Reuse the existing upload→crop→CloudFront pipeline.

## 8. Booking intake channels (WhatsApp/Phone/Email) — ✅ manual (V1)

- ✅ Bookings arrive via WhatsApp/Phone/Email and are **entered manually** by staff (FD-03). These are **not** integrations in V1 — just a recorded `booking_channel` value.
- 🔮 Automated intake / self-service booking is future.

## Integration readiness summary

| Integration | V1 need | Status | Blocker? |
|---|---|---|---|
| **Member DB** | internal, CSV import | ✅ owned (V3) | **No longer blocking** — confirm CSV schema only |
| POS/Touche amount | manual entry ok | contract unknown | Not blocking V1 (manual); blocking only for auto-fetch |
| Payments/Q Pay | record only | ok for V1 | Blocking only if automated (future) |
| LUXEGENIE/smartwatch | reuse | ✅ | No (confirm watch transport) |
| Pusher | reuse | ✅ | No (name channel) |
| **Scheduler** | new | 🟨 must confirm/build | **Blocking** time-triggered features (single biggest dependency) |
| CDN | reuse | ✅ | No |
| RF transport | — | 🔮 future | No (abstract the seam) |

## Future Work

- Confirm CSV member-import schema; design the external-member-sync seam.
- Confirm or build the scheduler.
- Obtain POS/Touche auto-fetch contract (if pursued); define Q Pay/automatic-billing settlement path (future).

## Related Documents

- [Engineering_Assumptions](Engineering_Assumptions.md) · [Data_Model](Data_Model.md) · [Future_Considerations](Future_Considerations.md) · [RealTime_And_Sync](../architecture/RealTime_And_Sync.md)
