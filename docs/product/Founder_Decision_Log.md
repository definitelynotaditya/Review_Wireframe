# Founder Decision Log

> **Status:** Canonical · **Version:** 3.0 · **Last updated:** 2026-07-12
> **Sources:** Founder interview (`../reference/source-inputs/Founder_Call_Raw_Notes.md`) + **V3 founder decisions** + the definitive **Updated Features Flow** (`../reference/source-inputs/Meeting_Room_Features_Flow_v3_CANONICAL.md`).

## Purpose

The durable record of **engineering decisions** derived from founder input, and the *why* behind each. This is the "why" companion to [MeetingRoom_Product_Spec](MeetingRoom_Product_Spec.md) (the "what") and [Business_Rules](Business_Rules.md) (the enforceable rules).

## Scope

Decisions that shape architecture, data model, UX priority, or scope. Where a **V3** decision overrides an earlier one, the earlier entry is marked **⚠️ Superseded** and points forward. **Founder decisions always win over prior analysis.**

## Dependencies

[MeetingRoom_Product_Spec](MeetingRoom_Product_Spec.md) · [Business_Rules](Business_Rules.md) · [State_Machines](../architecture/State_Machines.md) · [Component_Mapping](../architecture/Component_Mapping.md)

## Status legend

`Confirmed` · `Provisional` (V1, will evolve) · `Superseded` (replaced by a later FD).

---

## Core design principle (applies to every decision)

> **FD-22 · Reduce operational effort.** The primary operational risk is **staff resistance to additional manual work**. Every UX/architecture decision must **minimize staff effort**. When multiple solutions exist, **prefer less staff effort over more functionality.** *(Confirmed — V3. This principle is a tie-breaker throughout the docs; see [Interaction_Patterns §1](../ux/Interaction_Patterns.md#1-core-design-principle-reduce-staff-effort).)*

---

## V1/V2 decisions (still in force unless marked)

### FD-01 · Meeting Rooms reuse the live-floor model, with pricing on the card — `Confirmed`
Room cards show room/device number, seats, live status, **and hourly rate**. Reuse the restaurant Table Card, extended. Rooms are the live landing surface. *(Reinforced by FD-12.)*

### FD-02 · Room status set — `Confirmed` (extended by FD-24)
Live statuses: **Available / Reserved / In-Use / Under Maintenance**. Reserved at scheduled slot start; In-Use on Start Meeting (LG). V3 adds **Ending Soon** and **Billing** as lifecycle states — see FD-24.

### FD-03 · Booking is staff-entered; self-service is future — `Confirmed`
All bookings are entered by management (intake via WhatsApp/Phone/Email). Booking channel is metadata. Self-service = future (FD-23). The *interface* is now defined by FD-13.

### FD-04 · Recurring bookings — `Confirmed`
Weekly & Monthly, up to 6 months. Clashing occurrences are **flagged for staff** (aligns with first-save-wins + manual override, FD-16).

### FD-05 · F&B is a curated Meeting Room menu, punched manually — `Confirmed`
Separate curated catalogue (not Chef's Specials). Staff review/edit and **Order Punched**. No POS/kitchen automation (auto-F&B is future, FD-23).

### FD-06 · Billing amount from POS; one mode chosen; staff present — `Confirmed`
Bill amount source = POS/Touche (staff enters). Guest picks one payment mode. Dashboard **records**, does not process. Reinforced by manual closure (FD-21).

### FD-07 · No granular permissions — single management access level — `Confirmed`
Anyone with dashboard access can act. **Exception:** marking **Under Maintenance** is a *Management* action (FD-14) — still within the single management level, but called out as a management-authority action. Roles remain labels, not gates.

### FD-08 · Membership is a real lookup — `⚠️ Superseded by FD-18`
Original: member IDs resolve to info "the system knows" (assumed external). **V3 clarifies this is an internal Member Database (CSV-seeded).** See FD-18.

### FD-09 · Extension mediated — `⚠️ Superseded by FD-17`
Original: extension is a management-mediated request only. **V3: the Dashboard performs extensions directly and immediately**; the LG path is a *request/notify* only. See FD-17.

### FD-10 · Reminders & messaging — `Confirmed` (auto-end removed by FD-21)
10-minute **end** reminder; "Ending Soon"/"meeting ended" messaging. Cancellation/extension policy is management-configurable. **The earlier "auto-end when no action" is removed** — see FD-21.

### FD-11 · Metrics — `⚠️ Re-prioritized by FD-20`
The full revenue metric list (Total Revenue, Room Rent, F&B Revenue, ratings, bookings, duration, payment-mode %) remains valid for **View History / secondary analytics**, but the **primary Dashboard is operational-first** — see FD-20.

---

## V3 decisions

### FD-12 · The Manager Dashboard is ROOM-FIRST — `Confirmed`
The dashboard's default, primary view answers operational questions at a glance: **which rooms are Available / Occupied / need Attention / are Ending Soon**, plus **Upcoming meetings**. Bookings and analytics are secondary surfaces.
- **Impact:** Landing surface = live Meeting Rooms board. See [Dashboard_Architecture](../architecture/Dashboard_Architecture.md).

### FD-13 · Bookings are CALENDAR-FIRST with an algorithmic engine — `Confirmed`
Booking is a guided sequence: **New Booking → Date → Duration → Time Slot → Number of Seats → Display Available Rooms → Booking Details → Confirm.** The **availability engine** returns only rooms satisfying **ALL**: `capacity ≥ requiredSeats` **AND** free for the **entire** duration **AND** not under maintenance **AND** not already booked. Seat filter shows capacity **≥** required (seats=6 → show 6/8/10/12-seaters; never 4).
- **Impact:** Booking is not a plain list+modal; it is a constraint→availability flow backed by an **Availability Engine, Seat Capacity Filter, Pricing Calculator, Conflict Resolver** (logical components — see [Component_Mapping](../architecture/Component_Mapping.md)).

### FD-14 · Under Maintenance is management-controlled and blocks bookings for 24h — `Confirmed`
Rooms can be **manually** marked Under Maintenance by **Management only**. When maintenance begins: **existing bookings remain** (management **manually reroutes** them); **new bookings are blocked for 24 hours** from the maintenance start time.
- **Impact:** Maintenance is an **interrupt state** with a 24h booking-block window (BR-M1..M4). See [State_Machines](../architecture/State_Machines.md#room-lifecycle).

### FD-15 · Pricing engine is automatic and isolated/configurable — `Confirmed`
Every room has **Hourly, Half-Day, Full-Day** prices. The booking engine **auto-determines** total price (e.g. 4h → Half-Day; 5h → Half-Day + 1 Hour). The full pricing policy is **configurable later**.
- **Impact:** Pricing logic must be an **isolated, configurable module** (Pricing Calculator), not hardcoded in booking UI. See [Data_Model §Pricing](../engineering/Data_Model.md) and [Business_Rules §Pricing](Business_Rules.md#pricing-rules).

### FD-16 · Booking conflicts: first-save-wins + manual override — `Confirmed`
If two managers attempt the same booking, the **first successful save wins** (optimistic concurrency). Managers may **manually override** availability when needed.
- **Impact:** Backend enforces atomic booking with a conflict response; UI supports a documented **override workflow** (Conflict Resolver). See [Business_Rules §Conflicts](Business_Rules.md#booking-conflict--override-rules) and [User_Flows §1](../ux/User_Flows.md#1-booking-flow-calendar-first).

### FD-17 · Extensions: Dashboard is authoritative, immediate, +30 — `Confirmed` (supersedes FD-09)
The **Management Dashboard** must allow **Extend Meeting** in **+30-minute increments**; the **meeting end time updates immediately** and room availability updates accordingly. The **LG "Extend Meeting"** action is a **guest request only** — LG shows "management will contact you," the dashboard shows the request with a **"Seen"** button, and management then performs the actual extension.
- **Impact:** Two paths — authoritative dashboard extension (mutates booking end + availability) and LG request (notify-only). Direct LG-driven extension is future (FD-23). See [State_Machines §Extension](../architecture/State_Machines.md#extension-lifecycle).

### FD-18 · Internal Member Database (CSV-seeded), future external sync — `Confirmed` (supersedes FD-08)
Member bookings use an **internal Member Database**. Onboarding is via **CSV import**; afterward management can **manually edit Member IDs and details**. Booking by Member ID → **lookup → auto-fill** member details. An **invalid Member ID blocks the booking.** Architecture must support **future external sync without changing the UX.**
- **Impact:** Member DB is an **owned entity**, not an external integration in V1. This **resolves the prior member-lookup risk (R2)**. See [Data_Model §Member](../engineering/Data_Model.md) and [Integration_Points §Member](../engineering/Integration_Points.md).

### FD-19 · Notifications: Dashboard + Staff Smartwatch now; RF-based future — `Confirmed`
Current notification channels: **Dashboard** notifications **and Staff Smartwatch** notifications. Future: **RF-based communication** to replace Wi-Fi-dependent notifications.
- **Impact:** Notification delivery abstraction should not assume Wi-Fi permanently. RF documented under [Future_Considerations](../engineering/Future_Considerations.md).

### FD-20 · Dashboard KPIs are operational-first — `Confirmed` (re-prioritizes FD-11)
The dashboard prioritizes **Today's Status, Today's Bookings, Meeting Room Status, Operational Attention.** **Do not invent unnecessary analytics.** Revenue/rating analytics live in secondary/history surfaces, not the primary operational view.
- **Impact:** [Dashboard_Architecture](../architecture/Dashboard_Architecture.md) leads with operational widgets; heavy analytics deferred to View History.

### FD-21 · Meetings never auto-end — `Confirmed` (overrides earlier auto-end)
When meeting time finishes, the meeting **does not end automatically.** **Management is notified** and may: **End Meeting, Generate Bill, Confirm Payment, Mark Room Available.** The **guest may also end** the meeting from LUXEGENIE. After a meeting ends, the room **immediately returns to Available**, and the dashboard **simultaneously shows the next upcoming booking** (if any).
- **Impact:** Removes any auto-end transition; adds a **Billing** lifecycle state and explicit close actions. See [State_Machines §Meeting/Room](../architecture/State_Machines.md).

### FD-23 · Future roadmap anticipated in architecture — `Confirmed`
Future: **Guest/Member Self-Booking Web App** (the Manager Dashboard continues to exist alongside it); future integrations: **Touche POS, Automatic F&B, Automatic Billing**, and **RF** notifications (FD-19). Architecture should anticipate these with clean seams. See [Future_Considerations](../engineering/Future_Considerations.md).

### FD-24 · Canonical Room lifecycle — `Confirmed`
The room lifecycle is explicitly: **Available → Reserved → In Use → Ending Soon → Billing → Available**, with **Under Maintenance** as an **interrupt state**. Almost every workflow depends on room state; this is the backbone. See [State_Machines §Room](../architecture/State_Machines.md#1-room-lifecycle-canonical).

---

## What V3 changed vs V2 (quick reference)

| Area | V2 | V3 |
|---|---|---|
| Dashboard | KPI/analytics-first | **Room-first, operational** (FD-12, FD-20) |
| Booking UI | list + modal | **Calendar-first guided flow + engine** (FD-13) |
| Member data | external lookup (unknown) | **internal DB, CSV-seeded** (FD-18) |
| Extension | management-mediated request | **dashboard-authoritative, immediate +30** (FD-17) |
| Meeting end | auto-end fallback | **never auto-ends** (FD-21) |
| Maintenance | assumed block | **management-only, 24h block, manual reroute** (FD-14) |
| Pricing | bands, unspecified math | **auto engine, isolated/configurable** (FD-15) |
| Conflicts | not specified | **first-save-wins + override** (FD-16) |
| Room lifecycle | Available/Reserved/InUse/Maint | **+ Ending Soon + Billing** (FD-24) |
| Design tie-breaker | reuse-first | **+ reduce staff effort** (FD-22) |

## Open questions (routed to the audit)

- Reserved timing: source says both "at scheduled start" (§7 common rule) and "10 min before" (§2). Canonical rule adopted: **Reserved at scheduled start; LG shows Start-Meeting screen ~10 min before.** Confirm.
- Pricing policy details beyond the two given examples (rounding, when Full-Day applies).
- Manual reroute UX for maintenance-affected bookings.
See [REPOSITORY_AUDIT](../REPOSITORY_AUDIT.md#outstanding-questions).

## Related Documents

- [MeetingRoom_Product_Spec](MeetingRoom_Product_Spec.md) · [Business_Rules](Business_Rules.md) · [Dashboard_Architecture](../architecture/Dashboard_Architecture.md) · [State_Machines](../architecture/State_Machines.md) · [Component_Mapping](../architecture/Component_Mapping.md)
- Definitive flow: [`../reference/source-inputs/Meeting_Room_Features_Flow_v3_CANONICAL.md`](../reference/source-inputs/Meeting_Room_Features_Flow_v3_CANONICAL.md)
