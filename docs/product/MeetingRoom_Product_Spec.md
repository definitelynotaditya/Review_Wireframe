# Meeting Room ("Quorum") — Canonical Product Specification

> **Status:** Canonical · **Version:** 3.0 · **Last updated:** 2026-07-12
> **This is the single definitive description of what the product does.** It folds in the **V3 founder decisions** and the definitive **Updated Features Flow**. Where this spec and any older text disagree, **this spec wins.** Raw sources: [`../reference/source-inputs/`](../reference/source-inputs/).

## Purpose

The authoritative "what" for the Meeting Room product, merging: the definitive Features Flow (`Meeting_Room_Features_Flow_v3_CANONICAL.md`), the [Founder_Decision_Log](Founder_Decision_Log.md), the [Business_Rules](Business_Rules.md), and the existing platform ([Restaurant_Current_State](Restaurant_Current_State.md)).

## Scope

Guest-facing brand **Quorum**, the manager **dashboard** module, the **LUXEGENIE** in-room experience, bookings, sessions, requests, F&B, billing, notifications, and operational analytics — **as an extension of the existing Woobly dashboard**, not a standalone app.

## Dependencies

[Founder_Decision_Log](Founder_Decision_Log.md) · [Business_Rules](Business_Rules.md) · [Dashboard_Architecture](../architecture/Dashboard_Architecture.md) · [State_Machines](../architecture/State_Machines.md)

## Assumptions

Reuse-first ([Component_Mapping](../architecture/Component_Mapping.md)); the module lives inside the same shell/auth/deploy; new concepts introduced only where behaviour genuinely differs.

---

## 0. Guiding principles

1. **Extension, not a new app.** Reuse the Restaurant Manager Dashboard architecture wherever practical (FD-01).
2. **Reduce staff effort (core design principle).** The main operational risk is staff resistance to manual work; every decision minimizes effort, and when solutions compete, **less effort beats more functionality** (FD-22).
3. **Dashboard is ROOM-FIRST; Bookings are CALENDAR-FIRST** (FD-12, FD-13).
4. **The room's state drives everything** — Available → Reserved → In-Use → Ending Soon → Billing → Available (FD-24).

## 1. Product summary

**Quorum** is the meeting-room offering on the Woobly platform. Management books rooms through a guided **calendar-first** flow backed by an availability engine. At the scheduled time the room shows **Reserved** and the in-room **LUXEGENIE** shows "Welcome to Quorum / Start Meeting". The guest taps **Start Meeting** → **In-Use**. During the meeting the guest requests Wi-Fi, assistance, IT support, a power bank, F&B, an extension, or the bill; staff service each from the **room-first dashboard**. Meetings **never auto-end** — management (or the guest via LG) ends them; then the room returns to **Available** and the dashboard immediately shows the next booking.

## 2. Personas & devices

| Actor | Surface | Notes |
|---|---|---|
| **Guest / Member** | LUXEGENIE in-room device | Booked by management (V1); interacts in-room via LG |
| **Management / Staff** | Manager Dashboard (web) | Single access level (FD-07); notifications also on **smartwatch** (FD-19) |
| **LUXEGENIE device** | In-room tablet + LED | Pre-configured per room (no daily assignment) |

## 3. Terminology (locked)

*Quorum* = guest-facing brand · *LUXEGENIE / LG* = in-room device · *Dashboard / DB* = management web app · *Room / Booking / Session / Activity* = core entities · *Member* = a party in the internal Member DB (Q Pay eligible).

## 4. Dashboard modules (proposed IA)

| Module | Mirrors restaurant | Purpose |
|---|---|---|
| **Meeting Rooms** (live, ROOM-FIRST) | Tables | Operational radar — **landing surface** (FD-12) |
| **Bookings** (CALENDAR-FIRST) | Reservations | Guided booking flow + availability engine (FD-13) |
| **Dashboard** (operational KPIs) | Dashboard | Today's status/bookings/attention (FD-20) |
| **View History** | View History | Secondary analytics (revenue, ratings, durations) |
| **Manage Rooms** | Manage Tables | Room CRUD + pricing bands + maintenance |
| **F&B Menu** | Chef's Specials | Curated meeting-room catalogue (FD-05) |
| **Members / Guests** | Guest List | **Internal Member DB** (CSV) + guests (FD-18) |
| **LUXEGENIE** | LUXEGENIE | Device fleet (fixed per room) |
| **Users** | Users | Staff accounts (single access level) |
| **Settings** | Settings | Payment modes, cancellation/extension policy, reminders, pricing policy, Wi-Fi/events/about |

Full map & routes: [Information_Architecture](../architecture/Information_Architecture.md). Restaurant's **Transfer Sessions** has no V1 equivalent.

## 5. Booking (calendar-first, algorithmic) — FD-13

### 5.1 Booking sequence
**New Booking → Date → Duration → Time Slot → Number of Seats → Display Available Rooms → Booking Details → Confirm.**

### 5.2 Availability engine (all constraints must hold)
A room is offered only if: `capacity ≥ requiredSeats` **AND** free for the **entire** duration **AND** not under a maintenance block **AND** not already booked. The **Seat Capacity Filter** shows only rooms with capacity **≥** required (seats=6 → 6/8/10/12; exclude 4). See logical components in [Component_Mapping §Booking Engine](../architecture/Component_Mapping.md#5-logical-product-components-booking-engine).

### 5.3 Pricing (auto, isolated) — FD-15
Each room has **Hourly / Half-Day / Full-Day** prices. The **Pricing Calculator** auto-computes the total (e.g. 4h → Half-Day; 5h → Half-Day + 1 Hour). Policy is configurable later; logic is isolated from UI.

### 5.4 Booking types & fields
- **Member:** Member ID (validated against the internal Member DB) → auto-fill Name; Mobile/Guests optional. **Invalid ID blocks the booking** (FD-18).
- **Guest / Non-Member:** Guest Name + Mobile; Guests optional.
- **Recurring:** Weekly/Monthly, ≤ 6 months; clashing occurrences flagged for staff.
- **Modify/Reschedule, Cancel** (configurable).

### 5.5 Conflicts & override — FD-16
Concurrent attempts: **first successful save wins**; the loser is rejected. Management may **manually override** availability via a documented workflow (a deliberate, logged action).

## 6. Room lifecycle & the ROOM-FIRST dashboard

### 6.1 Lifecycle (FD-24)
**Available → Reserved → In-Use → Ending Soon → Billing → Available**, with **Under Maintenance** as an interrupt. Details: [State_Machines §1](../architecture/State_Machines.md#1-room-lifecycle-canonical).

### 6.2 Room-first dashboard (FD-12)
The landing view answers at a glance: which rooms are **Available / Occupied / need Attention / Ending Soon**, plus **Upcoming meetings**. Layout and widgets: [Dashboard_Architecture](../architecture/Dashboard_Architecture.md). Live room card shows room number, seats, **rate**, status, current guest/member, slot, ending-soon messaging, request badges, and the primary pending action.

### 6.3 Maintenance (FD-14)
Management-only. Existing bookings remain (management **manually reroutes**). **New bookings blocked for 24h** from maintenance start.

## 7. LUXEGENIE in-room experience

- **Reserved screen:** Welcome to Quorum, Reserved for {Guest Name}, Slot/Duration, Room No., **Start Meeting**.
- **Home (In-Use):** Welcome {Guest}, Tap for Wi-Fi (no DB), Tap for Assistance, F&B Order, Services, Explore (no DB), Bill Request, Review Quorum on Google (no DB), Room No.
- **Tap actions:** Wi-Fi (QR + user/pass), service requests (§8), F&B (§9), Services incl. Extend (§10), Explore/Events, Bill Request (§11).

## 8. Service request pattern (one workflow) — FD-22, Flow §5.2

**Assistance, IT Support, Power Bank, Other Service share ONE workflow** (documented once, not repeated):
1. Guest selects → confirmation message + **3-second cancel** window.
2. If not cancelled: LG shows "Request Sent" + Home (auto-home after 10s); **dashboard** shows "{Service} Requested" + **Accept**.
3. If unattended **> 1 min**: bell + animated CTA (dashboard) + smartwatch.
4. Staff **Accept** → closes; no LG change. Response time recorded.

## 9. F&B ordering — FD-05

Separate curated catalogue. LG: filters (All/Veg/Non-Veg) + categories + cart → order → "served shortly" (auto-home 10s). Dashboard: "F&B Order Requested" + **View Order** + **Order Punched**; staff may add/remove items, change quantity, add verbal orders. Escalation as §8. No POS/kitchen automation (future).

## 10. Meeting extension — FD-17

- **Authoritative path (Dashboard):** management taps **Extend Meeting**, in **+30-min increments**; the **end time updates immediately** and availability updates. Constrained by the next booking / maintenance (override possible).
- **Request path (LG):** guest selects Extend → "management will contact you shortly"; dashboard shows "Meeting Extension Requested + Duration + **Seen**"; staff clicks **Seen** to close, then extends via the authoritative path.
- **Future:** LG extends directly + blocks calendar automatically.

## 11. Billing & payment — FD-06, Flow §5.6

1. **LG:** guest selects **one** payment mode → LG asks ratings (Quorum + LUXEGENIE) → bill request to dashboard.
2. **Dashboard:** staff enters bill amount (from **POS/Touche**); room → **Billing**.
3. **LG per mode:** Q Pay (members) "please wait to sign"; Scan to Pay (QR); Payment Link ("sent shortly"); Card / Cash ("host on the way").
4. **Staff confirms payment** → **meeting ends**, room → **Available** (FD-21).

Dashboard **records**, does not process (automatic billing is future).

## 12. Meeting end (never automatic) — FD-21, Flow §4/§6

- Meetings **do not auto-end**. At end time, **management is notified**.
- End happens by explicit action: **Management** (End Meeting / Generate Bill / Confirm Payment / Mark Available) or **Guest** (End Meeting on LG).
- **Manual closure:** if the guest leaves without billing/ending, management closes it from the dashboard.
- On end: room **immediately → Available**, and the dashboard **immediately shows the next upcoming booking** (if any).

## 13. Notifications — FD-19

Delivered to **Dashboard + Staff Smartwatch**. Triggers: end reminder (10 min → "Ending Soon"), unattended-request escalation (>1 min → bell + CTA), meeting-ended notice. Start reminder deferred. **Future:** RF-based transport.

## 14. Analytics (operational-first) — FD-20

The primary **Dashboard** prioritizes **Today's Status, Today's Bookings, Meeting Room Status, Operational Attention.** Do not invent unnecessary analytics. Richer metrics (Total Revenue, Room Rent, F&B Revenue, Average Ratings [Quorum + LUXEGENIE], Total Bookings, Total Duration, Preferred Payment Mode %) live in **View History** / secondary surfaces. See [Dashboard_Architecture](../architecture/Dashboard_Architecture.md).

## 15. Non-Goals (V1)

- Public/self-service guest booking app (**future**, FD-23).
- Automatic billing / payment settlement (dashboard records only, FD-06/FD-23).
- Automatic F&B (kitchen/POS routing) — manual punch (FD-05/FD-23).
- Direct LG extension that blocks the calendar automatically (**future**, FD-17).
- **Automatic meeting end** — explicitly removed (FD-21).
- Per-action role/permission matrix (single access level, FD-07).
- Multi-venue switching; RF notifications (future, FD-19/FD-23).

## Future Work

Self-service booking web app; Touche POS + automatic F&B + automatic billing; RF notifications; direct LG extension. Tracked in [Future_Considerations](../engineering/Future_Considerations.md).

## Related Documents

- [Founder_Decision_Log](Founder_Decision_Log.md) · [Business_Rules](Business_Rules.md) · [Dashboard_Architecture](../architecture/Dashboard_Architecture.md)
- [Information_Architecture](../architecture/Information_Architecture.md) · [Component_Mapping](../architecture/Component_Mapping.md) · [State_Machines](../architecture/State_Machines.md) · [Domain_Model](../architecture/Domain_Model.md)
- [Screen_Inventory](../ux/Screen_Inventory.md) · [User_Flows](../ux/User_Flows.md) · [Interaction_Patterns](../ux/Interaction_Patterns.md)
- [Data_Model](../engineering/Data_Model.md) · [Integration_Points](../engineering/Integration_Points.md)
