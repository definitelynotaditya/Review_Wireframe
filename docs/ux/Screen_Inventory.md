# Screen Inventory — Meeting Room

> **Status:** Canonical · **Version:** 3.0 · **Last updated:** 2026-07-13
> **This documents screens; it does not design UI.** V3: room-first dashboard, calendar-first booking sequence, internal Member DB (CSV), maintenance, and manual (never automatic) meeting close.

## Purpose

Exhaustive inventory of every Meeting Room dashboard screen and LUXEGENIE screen — Purpose, Primary user, Entry point, Actions, States, Dependencies, Components, Related. The basis for the next **Reference Wireframes** phase.

## Scope

Dashboard + LUXEGENIE surfaces. Visual design is out of scope (next phase).

## Dependencies

[MeetingRoom_Product_Spec](../product/MeetingRoom_Product_Spec.md) · [Dashboard_Architecture](../architecture/Dashboard_Architecture.md) · [Information_Architecture](../architecture/Information_Architecture.md) · [Component_Mapping](../architecture/Component_Mapping.md) · [State_Machines](../architecture/State_Machines.md)

## Assumptions

Screens mirror restaurant equivalents unless noted; reference: [`../reference/restaurant-dashboard/pages/`](../reference/restaurant-dashboard/pages/). Every design choice defers to **reduce staff effort** (FD-22).

## Screen-ID crosswalk (this doc ↔ the rest of the repo)

This inventory groups screens **functionally** (A = dashboard, B = LUXEGENIE). The canonical **S-IDs** (`S0…S18`) are the numbering used by [DESIGN.md §11](../DESIGN.md#11-screen-directory), the [Wireframe_Specification](Wireframe_Specification.md), and the [`wireframes/`](wireframes/) files. Use this map when cross-referencing.

| This doc | Canonical S-ID | Wireframe file |
|---|---|---|
| — (App Shell) | S0 | `00-app-shell` |
| A1 Meeting Rooms — Live Board | **S1** | `01-live-board` |
| (Room Detail drawer, opened from A1) | **S2** | `02-room-detail` |
| A2 Dashboard — Operational KPIs | **S3** | `03-dashboard` |
| A3 Bookings — List | **S4** | `04-bookings-list` |
| A4 New / Edit Booking | **S5** | `05-new-booking` |
| A5 Manage Rooms | **S6** | `06-manage-rooms` |
| A5 Manage Rooms → Room Editor + Maintenance | **S7** | `07-room-editor-maintenance` |
| A6 F&B Menu | **S8** | `08-fnb-menu` |
| A9 Bill / Payment panel | **S9** | `09-bill-payment` |
| A9b F&B Order Review | **S10** | `10-fnb-order-review` |
| A9c Extension Control | **S11** | `11-extension` |
| A12 Members / Guests | **S12** | `12-members` |
| A10 View History | **S13** | `13-view-history` |
| A11 Recent Activities | **S14** | `14-recent-activities` |
| A8 Users | **S15** | `15-users` |
| A7 LUXEGENIE (device fleet) | **S16** | `16-luxegenie-devices` |
| A13 Settings | **S17** | `17-settings` |
| B1–B4 LUXEGENIE in-room | **S18** | `18-luxegenie-inroom` |

---

# A. Dashboard screens

## A1. Meeting Rooms — LIVE, ROOM-FIRST (landing) — FD-12
- **Purpose:** the operational radar — instantly see which rooms are Available / Occupied / need Attention / Ending Soon, plus upcoming meetings.
- **Primary user:** management/staff.
- **Entry point:** post-login **landing**; sidebar "Meeting Rooms".
- **Actions:** view rooms; **one primary action per card** (Accept request / View Order→Punch / Seen / Enter Bill / **End Meeting**); mark Under Maintenance; filter by area/status; search.
- **States (room):** Available / Reserved / In-Use / **Ending Soon** / **Billing** / Under Maintenance. Card sub-states: request badge(s), escalation shake, "Ending Soon", "Bill Requested", "meeting ended — needs closing".
- **On meeting end:** card **immediately** flips to Available and **surfaces the next booking** (BR-END4).
- **Dependencies:** rooms API, sessions/activities API, Pusher + smartwatch.
- **Components:** Room Card (🟡 extends Table Card), Status Badge (6 states + maintenance), request primary-action, Bill Panel, Extension Control, area/status tabs, search.
- **Related:** Dashboard KPIs (A2), Bookings (A3), Bill Panel (A9), Manage Rooms (A5).

## A2. Dashboard — OPERATIONAL KPIs — FD-20
- **Purpose:** how **today** is going operationally (not revenue analytics).
- **Primary user:** management.
- **Entry point:** sidebar "Dashboard".
- **Widgets:** **Today's Status** (rooms available/occupied/ending-soon/maintenance), **Today's Bookings** (schedule + next), **Meeting Room Status** (live roll-up), **Operational Attention** (open + escalated requests, unbilled ended meetings).
- **Actions:** open View History (secondary analytics).
- **States:** loading, empty, populated.
- **Dependencies:** rooms/bookings/activities aggregates.
- **Components:** KPI Cards (🟢), "View History" button.
- **Deferred to View History:** revenue, ratings, durations, payment-mode % (FD-20).
- **Related:** Meeting Rooms (A1), View History (A10). See [Dashboard_Architecture](../architecture/Dashboard_Architecture.md).

## A3. Bookings — CALENDAR-FIRST — FD-13
- **Purpose:** create/modify/cancel bookings via a guided, engine-backed flow.
- **Primary user:** management (enters bookings received via WhatsApp/Phone/Email).
- **Entry point:** sidebar "Bookings".
- **Actions:** search; scope tabs (Upcoming/Today/Past/All); **New Booking** (A4); modify/reschedule; cancel; manual **override** on conflict (BR-CF2).
- **States:** booking = Booked / Active / Completed / Cancelled / Rerouted / NoShow; recurring series vs occurrence; conflict-flagged.
- **Dependencies:** bookings API, **Availability Engine**, **Pricing Calculator**, **Member DB**.
- **Components:** booking list/cards (🟡 extends Reservations), New Booking flow (A4).
- **Related:** New Booking (A4), Meeting Rooms (A1).

## A4. New / Edit Booking — guided sequence — FD-13
- **Purpose:** capture constraints, let the engine return rooms, confirm.
- **Sequence:** **Date → Duration → Time Slot → Number of Seats → Display Available Rooms (with rates) → Booking Details → Confirm.**
- **Actions:** enter constraints; toggle **Recurring** (Weekly/Monthly ≤6mo); choose type (Member/Guest); **Member ID → lookup → auto-fill** (invalid ID blocks); pick a returned room + see estimate; confirm.
- **States:** validating; **no rooms match**; **member not found** (block); **conflict on save** → override option; recurring clash → flagged.
- **Dependencies:** Availability Engine, Seat Filter, Pricing Calculator, Conflict Resolver, Member DB.
- **Components:** **Availability Slot Picker** (🔵), **Recurrence Control** (🔵), member/guest fields, pricing estimate, **override prompt** (🔵).
- **Related:** Bookings (A3).

## A5. Manage Rooms
- **Purpose:** CRUD rooms + pricing bands; set maintenance.
- **Actions:** add/edit/delete room; capacity, area, **Hourly/Half-Day/Full-Day prices**; **mark Under Maintenance** (management-only → prompts to reroute affected bookings, blocks new for 24h); assign device.
- **States:** active / under-maintenance (24h block); soft-deleted.
- **Dependencies:** rooms API, pricing, maintenance block.
- **Components:** CRUD list (🟡 extends Manage Tables), Add Room Modal (🟡 + pricing), **Maintenance toggle + reroute prompt** (🔵).
- **Related:** Meeting Rooms (A1), LUXEGENIE (A7).

## A6. F&B Menu
- **Purpose:** manage the **curated meeting-room F&B catalogue** (separate from Chef's Specials).
- **Actions:** add/edit/toggle/delete items; category + veg/non-veg + price + image; search.
- **Components:** CRUD list + item cards (🟢 reuse Chef's Specials shape).
- **Related:** F&B Order Review (A9b), LUXEGENIE F&B (B3c).

## A7. LUXEGENIE (device fleet)
- **Purpose:** monitor/assign/reboot devices; fixed per room.
- **Components:** device list (🟢 reuse), kebab menu.

## A8. Users
- **Purpose:** manage staff accounts (single access level, FD-07).
- **Components:** Users list + Add User modal (🟢 reuse).

## A9. Bill / Payment panel
- **Purpose:** enter POS amount, drive LG payment display, confirm payment, close.
- **Entry point:** room card "Bill Requested" or manual "Generate Bill".
- **Actions:** enter POS/Touche amount (room → Billing); confirm payment → meeting ends, room → Available + next booking shown.
- **States:** bill_requested → amount_entered → instructions_shown → payment_confirmed → closed.
- **Components:** Bill/Payment Panel (🟡 extends BillRequestAndSessionDetailsModal).
- **Related:** [State_Machines §7](../architecture/State_Machines.md#7-bill--payment-lifecycle).

### A9b. F&B Order Review (sub-surface)
- **Entry:** room card "F&B Order Requested" → **View Order**.
- **Actions:** add/remove items, change quantity, add verbal orders; **Order Punched**.
- **Components:** Order Review (🟡 extends ChefSpecialsOrdersModal).

### A9c. Extension Control (sub-surface) — FD-17
- **Entry:** room card (In-Use/Ending Soon) → **Extend Meeting**; or an LG extension **request** card.
- **Actions:** **+30-minute** increments; end time updates **immediately** + availability re-blocks; for an LG request, click **Seen** to close then extend.
- **States:** extendable / blocked (needs override).
- **Components:** **Extension Control** (🔵), **Extension Request + Seen** (🔵).

## A10. View History (secondary analytics)
- **Purpose:** detailed historical data by domain (kept OFF the operational dashboard, FD-20).
- **Tabs (proposed):** Rooms, Bookings, Staff, Payments, F&B, Ratings.
- **Metrics:** Total Revenue, Room Rent, F&B Revenue, Ratings (Quorum + LUXEGENIE), Total Bookings, Total Duration, Preferred Payment Mode %.
- **Components:** period tabs (🟢), CustomDateRangeModal (🟢), history tables (🟡).

## A11. Recent Activities
- **Purpose:** full activity feed. Entry: bell → "View all activities". (🟢 reuse.)

## A12. Members / Guests — FD-18
- **Purpose:** the **internal Member Database** + derived guests.
- **Actions:** **CSV import** (onboarding); **manually add/edit Member IDs & details**; search; view guests (derived from bookings).
- **States:** member active / deleted; import in-progress / errors.
- **Dependencies:** Member DB API.
- **Components:** Members list (🟡 extends Guest List), **Member Import (CSV)** (🔵), Member editor (🔵).
- **Related:** New Booking member lookup (A4).

## A13. Settings
- **Sub-tabs (proposed):** Payment Modes (+ preferred), Cancellation & Extension policy, Reminders, **Pricing Policy** (configurable, FD-15), Wi-Fi, Events/About Quorum.
- **Components:** Content Section Editor (🟢 reuse), toggles.

---

# B. LUXEGENIE (in-room) screens

## B1. Reserved / idle
"Welcome to Quorum", "Reserved for {Guest Name}", Slot/Duration, Room No., **Start Meeting**. Shown from ~10 min before start; device pre-configured per room.

## B2. In-meeting home
"Welcome {Guest}", tap targets: Tap for Wi-Fi (no DB), Tap for Assistance, F&B Order, Services, Explore (no DB), Bill Request, Review Quorum on Google (no DB), Room No.

## B3. Tap actions
- **B3a Wi-Fi:** QR + username/password (no DB).
- **B3b Service request:** one workflow for Assistance/IT Support/Power Bank/Other — confirmation → 3s cancel → "Request Sent" → dashboard Accept ([User_Flows §3](User_Flows.md#3-service-request-flow-one-pattern)).
- **B3c F&B Order:** filters + categories + cart → order → "served shortly". DB: View Order → edit → Order Punched.
- **B3d Services:** IT Support, Power Bank, **Extend Meeting** (guest request → "management will contact you"), Other Service.
- **B3e Explore/Events:** upcoming events (no DB).
- **B3f Bill Request:** choose one mode → ratings (Quorum + LUXEGENIE) → wait for amount → per-mode instruction.

## B4. End-of-meeting prompts (no auto-end) — FD-21
- **Ending Soon:** Extend / Confirm / Cancel / Home. **If no action, the meeting does NOT end** — management is notified to close it.
- **Guest End Meeting:** guest may end from LG.
- **Meeting Ended:** Total Amount, QR / per-mode instruction, ratings (optional).

---

## Screen → primary component index

| Screen | Reuses | New/Extended |
|---|---|---|
| Meeting Rooms (A1) | App Shell, Status Badge | Room Card 🟡 (6 states), Bill Panel 🟡, Extension Control 🔵 |
| Dashboard (A2) | KPI Card 🟢 | operational widgets 🟡 |
| Bookings (A3/A4) | list | Availability Picker 🔵, Recurrence 🔵, override prompt 🔵 |
| Manage Rooms (A5) | CRUD list | pricing 🟡, Maintenance toggle 🔵 |
| F&B Menu (A6) | Chef's Specials CRUD 🟢 | separate catalogue |
| Members (A12) | Guest List 🟡 | CSV import 🔵, member editor 🔵 |
| Bill Panel (A9) | session/bill modal | POS amount + confirm 🟡 |

## Future Work

- Confirm View History tab set, Settings sub-tabs, and whether A1 (live board) and A2 (KPIs) are one screen or two.
- Confirm the maintenance reroute UX.

## Related Documents

- [Dashboard_Architecture](../architecture/Dashboard_Architecture.md) · [User_Flows](User_Flows.md) · [Interaction_Patterns](Interaction_Patterns.md) · [Component_Mapping](../architecture/Component_Mapping.md) · [MeetingRoom_Product_Spec](../product/MeetingRoom_Product_Spec.md)
