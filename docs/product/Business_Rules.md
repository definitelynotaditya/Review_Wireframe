# Business Rules — Meeting Room ("Quorum")

> **Status:** Canonical · **Version:** 3.0 · **Last updated:** 2026-07-12
> **One rule, one place.** This is the single authoritative list of enforceable rules. Each has an ID (`BR-*`), a statement, and a source. Where V3 changed a rule, the old wording is gone (not preserved).

## Purpose

Deterministic rules an engineer implements against, extracted from the spec and founder decisions. Rules are the enforceable "must"s; the [Product Spec](MeetingRoom_Product_Spec.md) is the narrative and [Founder_Decision_Log](Founder_Decision_Log.md) is the rationale.

## Scope

Availability, seating, pricing, booking, recurrence, conflict/override, room/session/meeting lifecycle, maintenance, service requests, F&B, extension, cancellation, billing/payment, meeting-end, notifications, permissions.

## Dependencies

[MeetingRoom_Product_Spec](MeetingRoom_Product_Spec.md) · [Founder_Decision_Log](Founder_Decision_Log.md) · [State_Machines](../architecture/State_Machines.md)

## Assumptions

Rules tagged **(assumed)** are unconfirmed and listed in [REPOSITORY_AUDIT](../REPOSITORY_AUDIT.md#outstanding-questions). All others trace to a founder decision (`FD-*`) or the canonical Features Flow.

---

## Availability & seating rules

| ID | Rule | Source |
|---|---|---|
| BR-A1 | The **backend booking calendar is the single source of truth** for availability. LG and dashboard are clients. | Platform |
| BR-A2 | A room is **available** for a request only if **ALL** hold: `capacity ≥ requiredSeats` **AND** free for the **entire** requested duration **AND** **not** under a maintenance block **AND** **not** already booked in that window. | FD-13 |
| BR-A3 | The **Seat Capacity Filter** shows rooms with `capacity ≥ requiredSeats` (never smaller). E.g. seats=6 → 6/8/10/12-seaters; exclude 4-seater. | FD-13 |
| BR-A4 | Bookings are allowed up to a **6-month** future horizon. | FD-04 |
| BR-A5 | No two bookings may **overlap** for the same room (enforced atomically — see BR-CF1). | FD-13, FD-16 |
| BR-A6 | Time slots are **hourly**; duration is composed of hourly slots. | Flow |

## Pricing rules

| ID | Rule | Source |
|---|---|---|
| BR-P1 | Every room stores **Hourly, Half-Day, Full-Day** prices. | FD-15 |
| BR-P2 | The **Pricing Calculator** auto-determines total price from duration (e.g. 4h → Half-Day; 5h → Half-Day + 1 Hour). | FD-15 |
| BR-P3 | Pricing logic is an **isolated, configurable module** — not hardcoded in booking UI; the full policy is configurable later. | FD-15 |
| BR-P4 | The live room card and booking flow display the applicable **rate/estimate**. | FD-01, FD-15 |
| BR-P5 | Exact band-selection thresholds beyond the two given examples (rounding, when Full-Day is cheaper/applies) are **(assumed)** and configurable. | FD-15 |

## Booking rules

| ID | Rule | Source |
|---|---|---|
| BR-B1 | Booking types: **Member, Guest/Non-Member, Recurring** (walk-in is an immediate same-time booking). | Flow |
| BR-B2 | **Booking sequence:** New Booking → Date → Duration → Time Slot → Number of Seats → Display Available Rooms → Booking Details → Confirm. | FD-13 |
| BR-B3 | **Member booking** requires a valid **Member ID**; details auto-fill from the Member DB (BR-MEM2). | FD-18 |
| BR-B4 | **Guest booking** requires Guest Name + Mobile No.; No. of Guests optional. | Flow |
| BR-B5 | All bookings are **staff-entered** in V1; booking channel (Phone/WhatsApp/Email) is recorded metadata. | FD-03 |
| BR-B6 | Bookings can be **modified/rescheduled** and **cancelled** (cancellation configurable). | Flow, FD-10 |

## Recurrence rules

| ID | Rule | Source |
|---|---|---|
| BR-R1 | Patterns: **Weekly** and **Monthly** only. | FD-04 |
| BR-R2 | Occurrences generated only within the **6-month** horizon. | FD-04 |
| BR-R3 | Modify/cancel must distinguish **"this occurrence"** vs **"entire series."** | FD-04 |
| BR-R4 | A clashing occurrence is **flagged for staff** (never silently skipped or overbooked); staff resolve via reschedule or override (BR-CF2). | FD-04, FD-16 |

## Booking conflict & override rules

| ID | Rule | Source |
|---|---|---|
| BR-CF1 | On concurrent booking attempts for the same room/slot, the **first successful save wins**; the later save is rejected with a conflict (optimistic concurrency). | FD-16 |
| BR-CF2 | Management may **manually override** availability (book despite a conflict/maintenance) via the documented **override workflow**; overrides are recorded (who/when/why — assumed). | FD-16 |
| BR-CF3 | Override is a deliberate, logged action — not the default path. | FD-16, FD-22 |

## Room, session & meeting lifecycle rules

| ID | Rule | Source |
|---|---|---|
| BR-S1 | At the **scheduled slot start time**, room status → **Reserved** (time-triggered). LG shows the Start-Meeting screen from ~10 min before *(reconciliation — see audit)*. | Flow §7, FD-24 |
| BR-S2 | On guest **Start Meeting** (LG), room status → **In-Use**; a **Session** opens. | Flow, FD-24 |
| BR-S3 | 10 minutes before end, session/room → **Ending Soon** (dashboard message + smartwatch). | Flow, FD-24 |
| BR-S4 | On bill request / meeting close initiation, room → **Billing**. | FD-24 |
| BR-S5 | Room lifecycle is **Available → Reserved → In-Use → Ending Soon → Billing → Available**; **Under Maintenance** is an interrupt from Available. | FD-24 |

## Meeting-end rules

| ID | Rule | Source |
|---|---|---|
| BR-END1 | **Meetings never end automatically.** When meeting time finishes, **Management is notified**. | FD-21 |
| BR-END2 | Meeting ends only by an explicit action: **Management** (End Meeting / Generate Bill / Confirm Payment / Mark Available) **or Guest** (End Meeting on LG). | FD-21, Flow §6 |
| BR-END3 | After a meeting ends, the room **immediately returns to Available**. | FD-21 |
| BR-END4 | On end, the dashboard **immediately shows the room's next upcoming booking** (if any). | FD-21 |
| BR-END5 | **Manual closure:** if a guest leaves without requesting the bill or ending, Management can End Meeting, Generate Bill, Confirm Payment, and Mark Room Available from the dashboard. | Flow §6 |

## Maintenance rules

| ID | Rule | Source |
|---|---|---|
| BR-M1 | Only **Management** can mark a room **Under Maintenance** (manual action). | FD-14 |
| BR-M2 | Entering maintenance **does not cancel existing bookings** — they remain and Management **manually reroutes** them. | FD-14 |
| BR-M3 | Entering maintenance **blocks new bookings for 24 hours** from the maintenance start time. | FD-14 |
| BR-M4 | A room under a maintenance block fails the availability check (BR-A2) for the blocked window. | FD-14 |

## Service request rules (Assistance, IT Support, Power Bank, Other Service — one pattern)

| ID | Rule | Source |
|---|---|---|
| BR-SR1 | These four requests share **one** workflow (do not model separately in UX). | Flow §5.2, FD-22 |
| BR-SR2 | A request can be **cancelled within 3 seconds** on LG before it is sent. | Flow §7 |
| BR-SR3 | Once sent, the dashboard shows **"{Service} Requested" + Accept**; LG shows "Request Sent" + Home, auto-returning home after **10 seconds**. | Flow §5.2, §7 |
| BR-SR4 | If **unattended > 1 minute**: **bell notification** + animated Accept CTA (dashboard) + smartwatch alert. | Flow §7, FD-19 |
| BR-SR5 | Staff **Accept** closes the request; **no change on LG**. | Flow §5.2 |
| BR-SR6 | **Response time** (request→accept) is recorded for operational metrics. | Restaurant parity |

## F&B rules

| ID | Rule | Source |
|---|---|---|
| BR-F1 | Meeting Room F&B uses a **separate curated catalogue** (not restaurant Chef's Specials). | FD-05 |
| BR-F2 | Order placed from LG (Veg/Non-Veg/All filters + categories + cart); LG shows "served shortly", auto-home after 10s. | Flow §5.3 |
| BR-F3 | Dashboard shows **"F&B Order Requested" + View Order + Order Punched**; staff may **add/remove items, modify quantity, add verbal orders**. | Flow §5.3 |
| BR-F4 | Order closes on **Order Punched**; no automatic POS/kitchen routing (auto-F&B is future). | FD-05, FD-23 |
| BR-F5 | Escalation as BR-SR4 (>1 min → bell + CTA + smartwatch). | Flow §5.3 |

## Extension rules

| ID | Rule | Source |
|---|---|---|
| BR-E1 | The **Dashboard** can **Extend Meeting** in **+30-minute increments**; the **end time updates immediately** and availability updates accordingly. | FD-17 |
| BR-E2 | An extension is only grantable if the room is free for the extended window (BR-A2); otherwise it requires override (BR-CF2) or is refused. | FD-17, FD-13 |
| BR-E3 | On LG, **Extend Meeting** is a **guest request only**: LG shows "management will contact you"; dashboard shows the request + **"Seen"** button; clicking Seen closes the request (management then extends via BR-E1). | Flow §5.4, FD-17 |
| BR-E4 | Extending updates the booking end time and **re-blocks the slot**; if a next booking exists it constrains the maximum extension. | FD-17 |
| BR-E5 | **Future:** LG extends directly and blocks the calendar automatically (out of V1). | Flow §5.4, FD-23 |

## Cancellation rules

| ID | Rule | Source |
|---|---|---|
| BR-C1 | Cancellation is **configurable** (enabled/disabled, any cutoff) in Settings; policy is management-dependent. | FD-10 |
| BR-C2 | No pre-payment is taken in V1, so cancellation has no refund logic. *(assumed)* | — |

## Billing & payment rules

| ID | Rule | Source |
|---|---|---|
| BR-PAY1 | The **bill amount source is POS/Touche** (staff enters it on the room card). | FD-06 |
| BR-PAY2 | The guest selects **exactly one** payment mode at bill request. | FD-06 |
| BR-PAY3 | Payment modes: **Q Pay (members only), Scan to Pay, Payment Link, Card, Cash**; a preferred mode is configurable. | Flow §5.6 |
| BR-PAY4 | Ratings (**Quorum Experience + LUXEGENIE Experience**) are captured at bill request. | Flow §5.6 |
| BR-PAY5 | The dashboard **records** mode + amount + staff confirmation; it does **not process** settlement (automatic billing is future). | FD-06, FD-23 |
| BR-PAY6 | On **staff payment confirmation**, the meeting ends and room → Available (BR-END3). | Flow §5.6 |
| BR-PAY7 | **Q Pay** is available **only** for Member bookings. | Flow §5.6, FD-18 |

## Member database rules

| ID | Rule | Source |
|---|---|---|
| BR-MEM1 | Members live in an **internal Member Database**, seeded by **CSV import**; management can manually **edit Member IDs and details** afterward. | FD-18 |
| BR-MEM2 | Booking by **Member ID → lookup → auto-fill** member details. | FD-18 |
| BR-MEM3 | An **invalid Member ID blocks the booking** (booking cannot proceed). | FD-18 |
| BR-MEM4 | The Member DB is designed for **future external sync without UX change** (abstract the data source). | FD-18 |

## Notification rules

| ID | Rule | Source |
|---|---|---|
| BR-N1 | Notifications are delivered to the **Dashboard** and **Staff Smartwatches**. | FD-19 |
| BR-N2 | End reminder fires **10 minutes** before end ("Ending Soon"). | FD-10, Flow |
| BR-N3 | Unattended request escalation (>1 min) → bell + animated CTA + smartwatch (BR-SR4). | Flow §7 |
| BR-N4 | Start reminder (10 min before) is **deferred** ("Later"). | PRD |
| BR-N5 | **Future:** RF-based notification transport (replacing Wi-Fi dependence). | FD-19, FD-23 |

## Permission rules

| ID | Rule | Source |
|---|---|---|
| BR-PERM1 | **Any authenticated management dashboard user may perform any action.** No per-action role matrix. | FD-07 |
| BR-PERM2 | Staff **roles** remain labels/attribution, not gates. | FD-07 |
| BR-PERM3 | Marking **Under Maintenance** and **manual overrides** are Management actions (within the single access level, but explicitly management-authority). | FD-14, FD-16 |

## Future Work

- Resolve **(assumed)** rules: BR-P5, BR-C2, BR-S1 (reserved timing), maintenance-reroute UX.
- Formalize pricing-band thresholds (BR-P5) once the configurable policy is defined.

## Related Documents

- [MeetingRoom_Product_Spec](MeetingRoom_Product_Spec.md) · [Founder_Decision_Log](Founder_Decision_Log.md) · [State_Machines](../architecture/State_Machines.md) · [Data_Model](../engineering/Data_Model.md) · [Engineering_Assumptions](../engineering/Engineering_Assumptions.md)
