# Future Considerations

> **Status:** Canonical · **Version:** 3.0 · **Last updated:** 2026-07-13
> V3: adds **RF notifications**, reframes **Member** (now internal → future *external sync*), and confirms the **Touche POS / Automatic F&B / Automatic Billing** roadmap. The Manager Dashboard **continues to exist** alongside any future self-service app (FD-23).

## Purpose

Capture everything deliberately **out of V1** so it is not lost and so V1 is built with clean seams that don't block it. These are explicitly deferred (founder decisions, PRD "Later/Future" notes, or analysis).

## Scope

Post-V1 features, integrations, and scalability. Not V1 requirements (those are in [MeetingRoom_Product_Spec](../product/MeetingRoom_Product_Spec.md)).

## Dependencies

[Founder_Decision_Log](../product/Founder_Decision_Log.md) · [Integration_Points](Integration_Points.md) · [Business_Rules](../product/Business_Rules.md)

---

## 1. Self-service booking (guest / member web app)

- **What:** an app/web-app where members/guests book rooms themselves, instead of via management (WhatsApp/Phone/Email). **The Manager Dashboard continues to exist** alongside it (FD-23).
- **Source:** FD-03, FD-23.
- **V1 seam:** store `booking_channel`; keep the booking/availability APIs **UI-agnostic** so a self-service client calls the same endpoints and the same Availability Engine/Pricing Calculator.

## 2. Direct LG meeting extension with backend slot-blocking

- **What:** LUXEGENIE extends a meeting directly and blocks the extended slot automatically, without staff mediation.
- **Source:** FD-17 / Features Flow §5.4 ("Future Enhancement: Allow LUXEGENIE to extend booking directly, block calendar, update software automatically").
- **V1 seam:** extension is already a booking end-time mutation via the Availability Engine (BR-E1); the same mutation can later be triggered by LG instead of the dashboard.

## 3. Automatic Billing / payment settlement

- **What:** actual payment processing and automatic bill generation, rather than record-only manual entry.
- **Source:** FD-23 ("Automatic Billing"), FD-06.
- **V1 seam:** RoomBill/Payment records `mode` + `amount` + `confirmed_by`; a settlement/auto-bill provider can later attach to these records.

## 4. Touche POS + Automatic F&B integration

- **What:** (a) auto-fetch bill amount (and line items) from **Touche POS** instead of manual entry; (b) **Automatic F&B** — route punched orders to the kitchen/POS automatically instead of manual punch.
- **Source:** FD-23 ("Touche POS", "Automatic F&B"), FD-05.
- **V1 seam:** bill-amount entry behind an adapter (manual vs fetched swappable); F&B order is a structured record so it can later be pushed to POS.

## 5. External Member-system sync

- **What:** sync the internal Member DB with an external membership system (richer profiles, balances, tiers).
- **Source:** FD-18 ("Future synchronisation with external software is possible… without changing UX").
- **V1 seam:** the Member DB sits behind a **repository interface**; the internal store can be swapped/augmented by an external source **without changing the booking UX** (BR-MEM4).

## 5a. RF-based notifications

- **What:** replace Wi-Fi-dependent notifications with an **RF-based** communication layer (more reliable in-venue).
- **Source:** FD-19.
- **V1 seam:** abstract the **notification transport** (dashboard + smartwatch today); RF becomes another transport behind the same interface.

## 6. Multi-venue

- **What:** one operator managing multiple venues / a venue switcher.
- **Source:** platform is currently single-tenant per token.
- **V1 seam:** keep everything `restaurant_id`/venue-scoped (already the convention).

## 7. Reporting / exports

- **What:** exportable or scheduled reports beyond the live dashboard + View History.
- **Source:** not requested by founder; low priority.
- **V1 seam:** metrics derive from booking/session/activity records, so reporting can be added on top.

## 8. Additional room resources / equipment

- **What:** AV, projector, whiteboard, video-conferencing, room photos, amenities as structured data.
- **Source:** not in PRD; must not be invented (analysis "never infer new resources").
- **V1 seam:** room schema is extensible; add fields only when specified.

## 9. Start-of-meeting reminder

- **What:** 10-min **start** reminder (the PRD marks this "Later"; only the **end** reminder is V1).
- **Source:** PRD, FD-10.

## Prioritization (suggested)

| Item | Likely priority |
|---|---|
| Scheduler for time-triggered events | **V1 prerequisite** (see Integration_Points §6) |
| Internal Member DB + CSV import | **V1** (owned, FD-18) — not future |
| Self-service booking web app | V2 |
| Direct LG extension | V2 |
| Touche POS auto-fetch / Automatic F&B | V2 |
| Automatic Billing / payment settlement | V2+ |
| External member sync | V2+ |
| RF notifications | V2+ |
| Multi-venue / reporting / equipment | later |

## Related Documents

- [Founder_Decision_Log](../product/Founder_Decision_Log.md) · [Integration_Points](Integration_Points.md) · [Engineering_Assumptions](Engineering_Assumptions.md) · [PROJECT_STATUS](../PROJECT_STATUS.md)
