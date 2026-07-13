# Repository Audit — V3 Freeze

> **Status:** Canonical · **Version:** 3.0 · **Date:** 2026-07-13
> Final consistency audit performed as part of freezing the V3 documentation. Every issue found was **fixed in place**, not merely reported.

## Purpose

Certify the repository as internally consistent and ready for the next phase. Records repository health, what changed, what was deprecated, remaining open questions, risks, and go/no-go readiness for wireframing and engineering.

## Scope

The full `docs/` tree. Method: automated link/version/terminology sweeps + manual contradiction review against the V3 founder decisions and the Cleaned Updated Features Flow.

---

## Repository Health

| Check | Result |
|---|---|
| Canonical docs at V3.0 version stamp | ✅ All 19 canonical docs = 3.0 (incl. PROJECT_STATUS, this file) |
| Internal markdown links resolve | ✅ 0 broken after this file was added |
| One source of truth per rule | ✅ Rules live only in [Business_Rules](product/Business_Rules.md) (`BR-*`); other docs reference, not restate |
| Decisions vs rules vs UI vs backend separated | ✅ Enforced in [Engineering_Assumptions §0](engineering/Engineering_Assumptions.md#0-separation-of-concerns-how-to-read-the-rest) |
| Founder overrides reconciled | ✅ Superseded FDs (08, 09, 10, 11) marked and forward-pointed |
| Terminology consistent | ✅ Swept (see below) |
| Diagrams present for every lifecycle | ✅ [State_Machines](architecture/State_Machines.md) covers Room, Booking, Session, Service Request, F&B, Extension, Bill/Payment, Notification |

**Overall:** healthy and internally consistent. Safe to freeze.

## Contradictions found & resolved

| Contradiction | Resolution |
|---|---|
| Extension "management-mediated request" (V2) vs "dashboard immediate +30" (V3 founder) | Resolved to **two paths**: dashboard authoritative +30 (BR-E1), LG request-only "Seen" (BR-E3). FD-09 marked superseded by FD-17. |
| "Auto-end when no action" (V2/old flow) vs "meetings never auto-end" (V3) | **Auto-end removed** everywhere; BR-END1 + FD-21; State_Machines has no auto-close transition. |
| Member "external lookup, unknown contract" (V2) vs "internal DB, CSV" (V3) | Flipped to **internal Member DB** (FD-18); Integration_Points R2 marked resolved; Domain/Data models updated. |
| KPI list (V2 revenue-first) vs "operational-first, no unnecessary analytics" (V3) | Dashboard is **operational-first** (FD-20); revenue metrics moved to View History; new [Dashboard_Architecture](architecture/Dashboard_Architecture.md). |
| Reserved timing: flow §2 "10 min before" vs §7 "at scheduled start" | Canonical rule = **Reserved at scheduled start; LG shows Start screen ~10 min before** (BR-S1); flagged as an open question to confirm. |
| Room lifecycle (V2 4-state) vs V3 canonical 6-state | Updated to **Available → Reserved → In-Use → Ending Soon → Billing → Available** + Under Maintenance interrupt (FD-24). |

## Terminology sweep (standardized)

- **Quorum** (guest brand), **LUXEGENIE/LG** (device), **Dashboard/DB** (management app) — consistent.
- Room states as tokens: `available`, `reserved`, `in_use`, `ending_soon`, `billing`, `under_maintenance`.
- Booking closure verbs: **Accept** (services), **View Order → Order Punched** (F&B), **Seen** (LG extension request), **End Meeting** (close).
- "Members / Guests" module name used consistently (replaced "Guest / Member List").
- `FD-*` (founder decisions) and `BR-*` (business rules) IDs used repo-wide.

## Documents Updated (V2 → V3)

| Doc | Change |
|---|---|
| product/Founder_Decision_Log.md | Added FD-12…FD-24; marked FD-08/09/10/11 superseded; added core principle FD-22 + V3 delta table |
| product/Business_Rules.md | New/changed rule families: seating (A2/A3), pricing engine (P1–P5), conflict/override (CF1–CF3), maintenance (M1–M4), meeting-end (END1–END5), member DB (MEM1–MEM4), extension (E1–E5); auto-end removed |
| product/MeetingRoom_Product_Spec.md | Room-first dashboard, calendar-first booking, member DB, no auto-end, revised extension, operational KPIs, reduce-effort principle |
| product/Restaurant_Current_State.md | Version aligned (content unchanged — existing product) |
| architecture/Dashboard_Architecture.md | **NEW** — room-first + operational-first dashboard |
| architecture/State_Machines.md | New 6-state room lifecycle; two-path extension; no auto-end; maintenance interrupt; billing state |
| architecture/Component_Mapping.md | Added logical Booking-Engine components; member DB; maintenance; extension; updated events |
| architecture/Information_Architecture.md | Room-first landing; calendar-first bookings; Members module; workflow table |
| architecture/RealTime_And_Sync.md | Revised event set; smartwatch delivery; RF-future; no auto-end note |
| architecture/Domain_Model.md | Member (internal), MaintenanceBlock, booking version; ERD updated |
| architecture/Tech_Stack.md | Version + scheduler dependency note |
| ux/Interaction_Patterns.md | Added core principle (§0), calendar-first booking pattern (§4a), 6 status colours, smartwatch escalation |
| ux/Screen_Inventory.md | Room-first dashboard, booking sequence, Members/CSV, maintenance, manual close |
| ux/User_Flows.md | Calendar-first booking; two-path extension; no-auto-end end flow; maintenance flow |
| engineering/Engineering_Assumptions.md | Restructured into Business/UI/Backend/Future concerns |
| engineering/Data_Model.md | Member DB + CSV, MaintenanceBlock, booking version, new session/room states, new endpoints |
| engineering/Integration_Points.md | Member now internal; smartwatch confirmed; RF future; readiness table |
| engineering/Future_Considerations.md | RF, external member sync, Touche/Auto-F&B/Auto-Billing, self-service |
| README.md / PROJECT_STATUS.md | V3 freeze; next phase = Reference Wireframes |

## Documents Deprecated

None deleted in V3. Superseded material remains under [`reference/_archive/`](reference/_archive/) (V1 restaurant KB + V1 meeting-room analysis) and the older Features Flow under [`reference/source-inputs/`](reference/source-inputs/). The **authoritative** flow is `Meeting_Room_Features_Flow_v3_CANONICAL.md`.

## Outstanding Questions

1. **Reserved timing** — confirm "Reserved at slot start, LG Start-screen ~10 min prior" (BR-S1).
2. **Pricing-band thresholds** — the full configurable policy beyond the two examples (BR-P5).
3. **Maintenance reroute UX** — assisted suggestions vs fully manual (BR-M2).
4. **POS/Touche** — manual entry (V1 baseline) vs API auto-fetch; is "Touche" the POS product or separate?
5. **CSV member schema** — columns, ID format, re-import de-dupe (BR-MEM1).
6. **Scheduler** — confirm the backend scheduler/cron exists or must be built.
7. **No-show handling** — for bookings that reach start but never Start Meeting.
8. **Smartwatch transport** — confirm the delivery channel.
9. **Channel naming & IA coexistence** — `venue-{id}` vs reuse `restaurant-{id}`; one combined sidebar vs product switcher.

## Engineering Risks

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| E1 | **Scheduler** for time-triggered events (Reserved, Ending-Soon, escalation, 24h maintenance expiry) may not exist | High | Confirm/build early; single biggest new backend dependency ([Integration_Points §6](engineering/Integration_Points.md)) |
| E2 | **Concurrency** (first-save-wins) must be atomic to avoid double-booking | High | Optimistic concurrency via booking `version` (BR-CF1) |
| E3 | **Pricing** hardcoded instead of isolated | Med | Enforce isolated, config-driven Pricing Calculator (BR-P3) |
| E4 | **Availability engine** duplicated between booking & extension | Med | Single Availability Engine authority (BR-A2/E2) |
| E5 | Accidental **auto-end** implementation | Med | Explicitly prohibited (BR-END1); end-time trigger = notification only |
| E6 | POS/CSV/smartwatch contracts unknown | Med | Build behind adapters; manual-entry baseline |

## Product Risks

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| P1 | **Staff resistance** to manual work (the founder's stated top risk) | High | Reduce-effort principle (FD-22) baked into every surface; smartwatch push; guided flows; auto-fill |
| P2 | Manual maintenance **reroute** burden | Med | Design an efficient reroute prompt; consider assisted suggestions later |
| P3 | Manual **bill entry & payment confirmation** friction | Med | Minimize steps; pre-fill; Touche auto-fetch is a future relief |
| P4 | Recurring-clash handling could overwhelm staff | Low/Med | Flag-only + override; keep patterns to Weekly/Monthly |

## Future Enhancements (deferred — seams in place)

Self-service booking web app · direct LG extension + auto slot-blocking · automatic billing/payment settlement · Touche POS auto-fetch + automatic F&B · external member sync · RF notifications · multi-venue · reporting/exports. See [Future_Considerations](engineering/Future_Considerations.md).

## Ready for Wireframing?

**YES.** Information architecture, screen inventory, user flows, business rules, state machines, component hierarchy, and interaction patterns are all specified and internally consistent. The outstanding questions do **not** block wireframing — where a screen depends on one (e.g. maintenance reroute UX), the wireframe notes the dependency. This is exactly the input the next phase needs.

## Ready for Engineering?

**PARTIALLY — not yet a full go.** Frontend structure, domain/data model, state machines, and events are specified. Before the **Engineering Blueprint**, resolve the blocking unknowns: **E1 (scheduler), E2 (concurrency approach), and outstanding Q4/Q5/Q6 (POS, CSV schema, scheduler existence)**. Member bookings are now unblocked (internal DB). Recommended: wireframe + resolve E1/E2 in parallel, then start engineering on the well-specified areas (rooms, bookings, F&B catalogue, members) first.

## Related Documents

- [PROJECT_STATUS](PROJECT_STATUS.md) · [Founder_Decision_Log](product/Founder_Decision_Log.md) · [Business_Rules](product/Business_Rules.md) · [Engineering_Assumptions](engineering/Engineering_Assumptions.md) · [Integration_Points](engineering/Integration_Points.md)
