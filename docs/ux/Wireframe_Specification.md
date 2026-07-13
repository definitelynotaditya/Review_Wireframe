# Wireframe Specification — Implementation Blueprint

> **Status:** Canonical (Phase 4) · **Version:** 1.0 · **Last updated:** 2026-07-13
> Every interaction is specified **before** any wireframe is drawn. Wireframes in [`wireframes/`](wireframes/) implement this document. Governed by [Wireframe_Principles](Wireframe_Principles.md); QA'd by [Wireframe_Checklist](Wireframe_Checklist.md).

## Purpose

A per-screen implementation blueprint covering purpose, users, entry, hierarchy, zones, components, states, CTAs, overlays, notifications, system events, business rules, edge cases, dependencies, responsiveness, and every UI state (loading/empty/success/failure/permission/error). It is complete enough to guide a designer or engineer with no additional explanation.

## Scope

All Meeting Room dashboard screens + LUXEGENIE in-room screens (see [Screen_Inventory](Screen_Inventory.md)). Shared behaviour is factored into **§0 Global Conventions** and referenced per screen (reuse principle).

## Dependencies

Frozen source: [Business_Rules](../product/Business_Rules.md) (`BR-*`), [State_Machines](../architecture/State_Machines.md), [Component_Mapping](../architecture/Component_Mapping.md), [Dashboard_Architecture](../architecture/Dashboard_Architecture.md), [Screen_Inventory](Screen_Inventory.md), [User_Flows](User_Flows.md), [Interaction_Patterns](Interaction_Patterns.md).

---

# §0. Global Conventions (apply to every screen unless overridden)

### 0.1 App Shell
Every dashboard screen renders inside the **App Shell** (reused from restaurant, 🟢): a **left sidebar** (brand lockup, flat module list, profile/logout) and a **top bar** (page title + subtitle, theme toggle, notifications bell, profile). Screens supply `title` + `subtitle` + content; they never replace the shell. Full spec: [wireframes/00-app-shell.md](wireframes/00-app-shell.md).

### 0.2 Universal UI states (every screen must define all)
| State | Global default behaviour |
|---|---|
| **Loading** | Skeleton placeholders in the content zone (`⟳`); shell stays interactive; no spinner-only blank screens. |
| **Empty** | Zone shows a centered `— empty —` message + the primary "create/add" CTA where one exists. |
| **Success** | Toast (top-right, `react-hot-toast`) + optimistic list/card update, reconciled by Pusher→refetch. |
| **Failure/Error** | Inline error banner in the affected zone + a retry affordance; destructive/mutating errors keep the user's input. 401 → logout+redirect (see 0.4). |
| **Permission** | **Single management access level (BR-PERM1/FD-07):** any authenticated user has full access. There is **no per-action gating**. Unauthenticated/expired → `ProtectedRoute`/401 redirect to `/login`. "Management-authority" actions (mark maintenance, override) are available to all authenticated users but are visually deliberate (confirm step). |
| **Notification** | Real-time arrivals surface as (a) a **toast**, (b) a **bell** badge increment → Recent Activities, and (c) a **staff smartwatch** alert `⌚` for attention/escalation events (BR-N1). |

### 0.3 Real-time & system events (all live screens)
Pusher event → **invalidate React Query key → REST refetch** (never trust payload as state). See [RealTime_And_Sync](../architecture/RealTime_And_Sync.md). Time-triggered system events (no user action): `room-reserved` (slot start), `meeting-ending-soon` (−10 min), request escalation (+1 min), maintenance 24h expiry. **No auto-end event exists** (BR-END1).

### 0.4 Auth & error handling
Bearer token via axios interceptor; **401 → logout → `/login`**. Network errors → inline retry. Mutations use optimistic UI reconciled by the matching Pusher event.

### 0.5 Responsive assumptions (all screens)
Desktop-first (primary operator device). Breakpoints follow restaurant: **≥1024px** full (sidebar pinned, multi-column); **768–1023px** sidebar collapses to slide-in, cards reflow to fewer columns; **<768px** single column, filter tabs become horizontally swipable (`overflow-x-auto`), drawers become full-screen sheets. Both light/dark themes supported (colour deferred).

### 0.6 Overlay conventions
- **Modal** = a focused, blocking task with Cancel/Confirm (Add/Edit records, confirmations). Dismiss: ✕, Cancel, Esc, backdrop.
- **Drawer** = a right-side contextual panel that keeps the list visible behind it (room detail, booking flow, bill panel, order review). Dismiss: ✕, Esc; backdrop optional (does not lose entered data without confirm).
- **Primary CTA** bottom-right; **Secondary/Cancel** to its left; **destructive** in `⋮` or left-aligned with a confirm.

### 0.7 Room state tokens (used across live screens) — FD-24 / [State_Machines §1](../architecture/State_Machines.md#1-room-lifecycle-canonical)
`{Available}` · `{Reserved}` · `{In-Use}` · `{Ending Soon}` · `{Billing}` · `{Under Maintenance}`. Plus card sub-badges: `{… Requested}`, `{Escalated ⚠}`, `{Bill Requested}`, `{Ended — action needed}`.

---

# Screen Catalogue (build order → [Wireframe_Handoff](Wireframe_Handoff.md))

| ID | Screen | Type | Wireframe file |
|---|---|---|---|
| S0 | App Shell | frame | [00-app-shell.md](wireframes/00-app-shell.md) |
| S1 | Meeting Rooms — Live Board (landing) | page | [01-live-board.md](wireframes/01-live-board.md) |
| S2 | Meeting Room Detail | drawer | [02-room-detail.md](wireframes/02-room-detail.md) |
| S3 | Operational Dashboard (KPIs) | page | [03-dashboard.md](wireframes/03-dashboard.md) |
| S4 | Bookings — List | page | [04-bookings-list.md](wireframes/04-bookings-list.md) |
| S5 | New / Edit Booking — Guided Flow | drawer | [05-new-booking.md](wireframes/05-new-booking.md) |
| S6 | Manage Rooms | page | [06-manage-rooms.md](wireframes/06-manage-rooms.md) |
| S7 | Room Editor + Maintenance | modal | [07-room-editor-maintenance.md](wireframes/07-room-editor-maintenance.md) |
| S8 | F&B Menu | page | [08-fnb-menu.md](wireframes/08-fnb-menu.md) |
| S9 | Bill / Payment Panel | drawer | [09-bill-payment.md](wireframes/09-bill-payment.md) |
| S10 | F&B Order Review | drawer | [10-fnb-order-review.md](wireframes/10-fnb-order-review.md) |
| S11 | Extension Control | inline/panel | [11-extension.md](wireframes/11-extension.md) |
| S12 | Members / Guests + CSV Import | page+modal | [12-members.md](wireframes/12-members.md) |
| S13 | View History | page | [13-view-history.md](wireframes/13-view-history.md) |
| S14 | Recent Activities | page | [14-recent-activities.md](wireframes/14-recent-activities.md) |
| S15 | Users | page | [15-users.md](wireframes/15-users.md) |
| S16 | LUXEGENIE Devices | page | [16-luxegenie-devices.md](wireframes/16-luxegenie-devices.md) |
| S17 | Settings | page | [17-settings.md](wireframes/17-settings.md) |
| S18 | LUXEGENIE in-room screens | device | [18-luxegenie-inroom.md](wireframes/18-luxegenie-inroom.md) |

---

# S0 · App Shell
- **Purpose:** persistent frame; single top-level navigation for the whole platform.
- **Primary user:** management/staff.
- **Entry point:** any authenticated route.
- **Information hierarchy:** brand → nav modules → (content) ; top bar: page identity → global controls.
- **Layout zones:** `Sidebar` (fixed left) · `TopBar` (fixed top) · `Content` (scroll).
- **Components:** Sidebar (🟢), TopBar/Header (🟢), NotificationsBell→Recent Activities (🟢), ProfileMenu/Logout (🟢).
- **Component states:** nav item {default|active|hover}; bell {0|n unread}; sidebar {expanded|collapsed(slide-in)}.
- **Primary CTA:** n/a (navigation frame). **Secondary:** theme toggle, logout (confirm modal).
- **Modal/Drawer:** Logout confirmation (modal).
- **Notifications/System events:** bell badge from Pusher activity feed; smartwatch mirror for attention events.
- **Business rules:** BR-PERM1 (single access level), BR-N1 (dashboard+smartwatch).
- **Edge cases:** long venue name truncates; >99 unread shows `99+`; offline → shell persists, content shows retry.
- **Dependencies:** auth store, Pusher provider.
- **Responsive:** §0.5. **Loading:** shell renders immediately, content skeleton. **Empty/Success/Failure/Permission:** §0.2.

# S1 · Meeting Rooms — Live Board (landing)
- **Purpose:** room-first operational radar — see at a glance which rooms are Available / Occupied / need Attention / Ending Soon + upcoming meetings (FD-12).
- **Primary user:** management/staff on shift.
- **Entry point:** post-login landing; sidebar "Meeting Rooms".
- **Information hierarchy:** **attention-needing rooms first** (sorted up) → occupied → reserved → available → maintenance. Within a card: room id + `{state}` → occupant/slot → attention badge → **one primary action**.
- **Layout zones:** `FilterBar` (⌕ search · area tabs · status tabs) → `RoomGrid` (cards) → optional `Legend`.
- **Components:** Room Card (🟡 extends Table Card), Status Badge (🟡, 6 states), Segmented Tabs (🟢), Search (🟢), Primary-action slot (per state), `⋮` menu (Mark Maintenance, Open Detail).
- **Component states (Room Card):** one per room state (§0.7) + sub-states: `{Assistance Requested}`, `{IT Support Requested}`, `{Power Bank Requested}`, `{Other Requested}`, `{F&B Order Requested}`, `{Extension Requested}`, `{Escalated ⚠}` (>1 min), `{Bill Requested}`, `{Ended — action needed}`.
- **Primary CTA (per card state):** Available→`[ Walk-in ]` (immediate booking of *this* free room; scheduled bookings go through Bookings→New Booking to preserve calendar-first, FD-13); Reserved→`[ View ]`; In-Use w/ request→`[ Accept ]`/`[ View Order ]`/`[ Seen ]`; Ending Soon→`[ Extend +30 ]`; Billing→`[ Enter Bill ]`; Ended-action-needed→`[ End Meeting ]`; Under Maintenance→`[ Clear ]`. **Exactly one** per card (principle 13).
- **Secondary CTA:** tap card body → Open Detail (S2); `⋮` → New (scheduled) Booking pre-seeded with this room, Mark/Clear Maintenance (S7 modal), Reroute bookings.
- **Modal/Drawer:** clicking a card/`[View]` opens **Room Detail drawer** (S2); primary actions open the relevant drawer (S9/S10/S11) or modal (S7).
- **Notifications/System events:** live `room-reserved`, `meeting-ending-soon`, request activate/deactivate, `meeting-ended` (needs action), maintenance set/clear → card updates + toast + `⌚`. On `meeting-ended`, card flips to `{Available}` and **surfaces next booking** (BR-END4).
- **Business rules:** BR-S1..S5 (states), BR-SR3/SR4 (request+escalation), BR-END1/END3/END4 (no auto-end, immediate available, show next), BR-M1..M4 (maintenance), FD-22 (one action), FD-20 (no analytics here).
- **Edge cases:** many simultaneous requests on one card (stack badges, primary = oldest unattended); room ended but unbilled (`{Ended — action needed}` persists until closed); maintenance with existing bookings (card shows reroute affordance).
- **Dependencies:** rooms API, sessions/activities API, Pusher, scheduler (time events).
- **Responsive:** grid 3-col ≥1024 / 2-col / 1-col; tabs swipable <768. **Loading:** card skeleton grid. **Empty:** "No rooms configured — [ Add Room ]" (→ S6). **Success:** action toast + card state change. **Failure:** per-card inline error + retry; board keeps other cards live. **Permission:** §0.2 (global).

# S2 · Meeting Room Detail (drawer)
- **Purpose:** progressive-disclosure detail for one room without leaving the board (principle 11).
- **Primary user:** management/staff.
- **Entry point:** click a Room Card or its `[ View ]`/`⋮ Open Detail`.
- **Information hierarchy:** header (room id, `{state}`, capacity, rate) → current meeting (occupant, slot, elapsed/remaining, running requests) → **next booking** → actions.
- **Layout zones:** `DrawerHeader` → `CurrentMeeting` → `ActivityLog` (this session's requests + response times) → `NextBooking` → `ActionBar`.
- **Components:** Drawer (🟡), Status Badge (🟡), Activity list row (🟢 from Recent Activities), Action buttons.
- **Component states:** mirrors room state; ActivityLog {empty|list}; NextBooking {none|scheduled}.
- **Primary CTA:** state-appropriate (same set as S1 card).
- **Secondary CTA:** Extend, End Meeting, Generate Bill, Mark Maintenance (context-dependent).
- **Drawer behaviour:** right drawer over the board; Esc/✕ closes; does not navigate away; edits confirm before discard.
- **Notifications/System events:** live updates for this room reflect immediately.
- **Business rules:** BR-SR6 (response time shown), BR-END2/END5 (manual close options), BR-E1/E3 (extend paths), BR-S3/S4 (ending soon/billing).
- **Edge cases:** room becomes Available while drawer open (drawer shows next booking / offers close); concurrent staff action elsewhere (reconcile via refetch).
- **Dependencies:** room + session + activities APIs. **Responsive:** full-screen sheet <768. **Loading/Empty/Success/Failure/Permission:** §0.2.

# S3 · Operational Dashboard (KPIs)
- **Purpose:** how **today** is going operationally (FD-20) — not revenue analytics.
- **Primary user:** management.
- **Entry point:** sidebar "Dashboard".
- **Information hierarchy:** **Today's Status** (room counts by state) → **Operational Attention** (open+escalated requests, unbilled ended meetings) → **Today's Bookings** (timeline/next) → link to View History.
- **Layout zones:** `KpiRow` (status counts) → `AttentionPanel` → `TodaysBookings` → `[ View History ]` link.
- **Components:** KPI Card (🟢 StatCard), Attention list (🟡), Bookings timeline/list (🟡), Period control **absent** here (this is "today"; historical periods live in View History).
- **Component states:** each KPI {loading|value|zero}; attention {empty|list}; bookings {empty|list}.
- **Primary CTA:** none (monitoring surface); attention rows deep-link to the room (S2) / bill (S9).
- **Secondary CTA:** `[ View History ]` → S13.
- **Notifications/System events:** counts update live via Pusher.
- **Business rules:** FD-20 (operational-first; **no** revenue/ratings here), BR-END (unbilled ended meetings surfaced).
- **Edge cases:** no activity today → all zeros + empty attention (valid, not an error). **Dependencies:** operational aggregate endpoints. **Responsive/Loading/Empty/Success/Failure/Permission:** §0.2/0.5.

# S4 · Bookings — List
- **Purpose:** manage the booking book; entry to the calendar-first create flow.
- **Primary user:** management (enters bookings taken via WhatsApp/Phone/Email).
- **Entry point:** sidebar "Bookings".
- **Information hierarchy:** `⌕`+`[ ＋ New Booking ]*` → scope tabs (Upcoming•/Today/Past/All) → booking cards (guest/member · room · date/slot · `{status}` · via) with inline actions.
- **Layout zones:** `ActionBar` (search + New Booking) → `FilterTabs` → `BookingList`.
- **Components:** Entity list/cards (🟡 extends Reservations), Segmented Tabs (🟢), Booking Card (🟡), inline `[ View ]` `✎` `🗑` `⋮`(Override, Reschedule series/occurrence). *(No staff "seat/start" action — Reserved is time-triggered (BR-S1), In-Use is guest-triggered on LG (BR-S2).)*
- **Component states (Booking Card):** `{Booked}` `{Active}` `{Completed}` `{Cancelled}` `{Rerouted}` `{No-Show}`; recurring badge {series|occurrence}; `{Clash-Flagged ⚠}`.
- **Primary CTA:** `[ ＋ New Booking ]` (top-right) → S5.
- **Secondary CTA:** per card: Reschedule (occurrence vs series), Cancel (confirm), Override.
- **Modal/Drawer:** New/Edit → **S5 drawer**; Cancel → confirm modal; recurring modify → "this occurrence / entire series" choice modal.
- **Notifications/System events:** `booking-created/-updated/-cancelled` refetch.
- **Business rules:** BR-B1..B6, BR-R1..R4 (recurrence + clash flag), BR-CF1..CF3 (first-save-wins + override), BR-C1 (cancel configurable).
- **Edge cases:** clash-flagged occurrences shown distinctly with a resolve affordance; past bookings read-only; member vs guest card variants.
- **Dependencies:** bookings API, member DB (display). **Responsive:** cards reflow; tabs swipable. **Loading:** list skeleton. **Empty:** "No bookings — [ ＋ New Booking ]". **Success/Failure/Permission:** §0.2.

# S5 · New / Edit Booking — Guided Flow (drawer) — FD-13
- **Purpose:** create a booking via the constraint→availability sequence; the engine matches rooms so staff never scan a list (FD-22).
- **Primary user:** management.
- **Entry point:** Bookings `[ ＋ New Booking ]`, room-card `[ New Booking ]`, or edit.
- **Information hierarchy (stepper):** **Step 1** Date → **Step 2** Duration → **Step 3** Time Slot → **Step 4** Number of Seats → **Step 5** Available Rooms (with rate/estimate) → **Step 6** Booking Details (type + member/guest, recurring) → **Step 7** Confirm.
- **Layout zones:** `StepHeader` (progress) → `StepBody` → `StepFooter` (Back · Next/Confirm).
- **Components:** Availability Slot Picker (🔵), Recurrence Control (🔵), Member lookup field (🔵, auto-fill), Pricing estimate (🔵 read-out), Room result cards (🟡), Override prompt (🔵).
- **Component states:** Step validation {incomplete|valid}; availability {searching⟳|results|no-match}; member {unchecked|found→autofill|invalid⚠}; save {idle|saving|conflict→override|success}.
- **Primary CTA:** `[ Next ]` per step; `[ Confirm Booking ]*` on Step 7.
- **Secondary CTA:** `[ Back ]`, `[ Cancel ]`; Step 6 toggle `☐ Recurring` → reveals pattern (Weekly/Monthly) + until (≤6 mo).
- **Modal/Drawer:** the whole flow is a right **drawer** (keeps Bookings list behind). Conflict on save → inline **Override** confirm (BR-CF2). Recurring clash → post-save "N occurrences flagged" summary.
- **Notifications/System events:** on confirm → `booking-created`; conflict → rejected (first-save-wins).
- **Business rules:** BR-A2/A3 (availability = all constraints, seats ≥), BR-P1..P5 (auto pricing), BR-B2..B4 (fields), BR-MEM2/MEM3 (member auto-fill; invalid blocks), BR-R1..R4, BR-CF1/CF2.
- **Edge cases:** **no rooms match** → Step 5 empty with "adjust constraints" (back to Step 1–4); **invalid Member ID** → Step 6 blocks Confirm (BR-MEM3); **conflict at save** → Override or cancel; recurring partial clash → flagged list.
- **Dependencies:** Availability Engine, Pricing Calculator, Conflict Resolver, Member DB.
- **Responsive:** drawer → full-screen stepper <768. **Loading:** Step 5 availability skeleton. **Empty:** no-match state (Step 5). **Success:** toast + drawer closes + list updates. **Failure:** step-level inline error, inputs preserved. **Permission:** §0.2.

# S6 · Manage Rooms
- **Purpose:** CRUD rooms + pricing bands; set maintenance (config surface).
- **Primary user:** management.
- **Entry point:** sidebar "Manage Rooms".
- **Information hierarchy:** `⌕`+`[ ＋ Add Room ]*` → area tabs → room cards (id · area · capacity · Hourly/Half-Day/Full-Day · `{active|Under Maintenance}`) with `✎`/`🗑`/`⋮`.
- **Layout zones:** `ActionBar` → `AreaTabs` → `RoomList`.
- **Components:** Entity CRUD list (🟡 extends Manage Tables), Room card (🟡), Add/Edit Room modal (🟡, S7), Maintenance toggle (🔵, S7).
- **Component states:** room {active|under-maintenance(24h)|soft-deleted}.
- **Primary CTA:** `[ ＋ Add Room ]` → S7 (add mode).
- **Secondary CTA:** `✎` edit (S7), `🗑` delete (confirm), `⋮` → Mark/Clear Maintenance.
- **Modal:** Add/Edit Room + Maintenance = **S7**.
- **Business rules:** room schema (BR-P1 pricing bands), BR-M1..M4 (maintenance management-only, existing bookings kept + reroute, 24h block).
- **Edge cases:** delete room with future bookings → block/confirm+reroute; maintenance overlapping bookings → reroute prompt.
- **Dependencies:** rooms + pricing + maintenance APIs. **Responsive/Loading/Empty/Success/Failure/Permission:** §0.2/0.5. **Empty:** "No rooms — [ ＋ Add Room ]".

# S7 · Room Editor + Maintenance (modal)
- **Purpose:** add/edit a room's identity, capacity, area, pricing; toggle maintenance with reroute.
- **Entry point:** S6 Add/Edit/`⋮ Maintenance`.
- **Information hierarchy:** identity (number/name, area, capacity) → **Pricing** (Hourly, Half-Day, Full-Day) → device assignment → (Maintenance section).
- **Layout zones:** `ModalHeader` → `Form` (identity · pricing · device) → `MaintenancePanel` (toggle + reroute list) → `Footer` (Cancel · Save).
- **Components:** Add Room modal (🟡), Pricing inputs (🟡), Maintenance toggle + affected-bookings list (🔵).
- **Component states:** form {valid|invalid}; maintenance {off|on→shows 24h block + affected bookings to reroute}.
- **Primary CTA:** `[ Save ]*`. **Secondary:** `[ Cancel ]`; within maintenance: `[ Confirm Maintenance ]` (deliberate, management-authority).
- **Modal behaviour:** blocking; Esc/Cancel/backdrop dismiss; unsaved-changes confirm.
- **Business rules:** BR-P1 (bands), BR-M1..M4 (maintenance rules; new bookings blocked 24h; existing bookings listed for manual reroute).
- **Edge cases:** setting maintenance lists each affected future booking with a `[ Reroute ]` action; pricing left blank → validation.
- **Dependencies:** rooms/pricing/maintenance APIs, bookings (affected list). **States:** §0.2.

# S8 · F&B Menu
- **Purpose:** manage the **separate curated meeting-room F&B catalogue** (not Chef's Specials).
- **Primary user:** management.
- **Entry point:** sidebar "F&B Menu".
- **Information hierarchy:** `⌕`+`[ ＋ Add Item ]*` → status tabs (Active/Inactive/All) + category tabs → item cards (image slot · name · price · veg/non-veg · category) with toggle/`✎`/`🗑`.
- **Layout zones:** `ActionBar` → `Tabs` → `ItemGrid`.
- **Components:** Entity CRUD list + item cards (🟢 reuse Chef's Specials shape), Add Item modal (🟢).
- **Component states:** item {active|inactive|deleted}.
- **Primary CTA:** `[ ＋ Add Item ]`. **Secondary:** toggle active, edit, delete.
- **Business rules:** BR-F1 (separate catalogue).
- **Edge cases:** image upload (crop-square ≤10MB → CloudFront); empty category. **Dependencies:** F&B API, media. **States:** §0.2. **Empty:** "No items — [ ＋ Add Item ]".

# S9 · Bill / Payment Panel (drawer)
- **Purpose:** enter POS amount, drive LG payment display, confirm payment, close meeting.
- **Primary user:** management.
- **Entry point:** room card `[ Enter Bill ]` (Billing state) or `⋮ Generate Bill` (manual closure).
- **Information hierarchy:** meeting summary (room, occupant, duration) → selected **payment mode** (from LG) → **amount entry** (POS/Touche) → confirm.
- **Layout zones:** `DrawerHeader` → `MeetingSummary` → `PaymentMode` → `AmountEntry` → `Footer` (Confirm Payment).
- **Components:** Bill/Payment Panel (🟡 extends BillRequestAndSessionDetailsModal), amount field, mode display.
- **Component states:** {bill_requested → amount_entered → instructions_shown(LG) → payment_confirmed → closed} (BR-PAY / [State_Machines §7](../architecture/State_Machines.md#7-bill--payment-lifecycle)).
- **Primary CTA:** `[ Confirm Payment ]*` (enabled after amount entered) → closes meeting, room → Available, shows next booking.
- **Secondary CTA:** `[ Save Amount ]` (pushes total to LG), Cancel.
- **Drawer behaviour:** right drawer; stays open through the pay cycle; closing before confirm keeps `{Billing}`.
- **Notifications/System events:** `updated-bill-amount` → LG shows total; `payment-confirmed` → `meeting-ended`.
- **Business rules:** BR-PAY1 (POS amount), BR-PAY2/PAY3 (single mode), BR-PAY5 (record only), BR-PAY6 (close on confirm), BR-PAY7 (Q Pay members), BR-END3/END4.
- **Edge cases:** manual closure with no guest bill request (staff picks mode); Q Pay shown only for member bookings; amount edited before confirm.
- **Dependencies:** billing API, POS (manual entry V1). **States:** §0.2.

# S10 · F&B Order Review (drawer)
- **Purpose:** review/edit a placed F&B order and punch it.
- **Entry point:** room card `[ View Order ]` (`{F&B Order Requested}`).
- **Information hierarchy:** order header (room, time) → line items (name · qty · price) editable → add verbal item → punch.
- **Layout zones:** `DrawerHeader` → `LineItems` (add/remove/qty) → `AddVerbal` → `Footer` (Order Punched).
- **Components:** Order Review (🟡 extends ChefSpecialsOrdersModal), editable line rows.
- **Component states:** {placed → under_review(editing) → punched}; escalation `{Escalated ⚠}` if >1 min.
- **Primary CTA:** `[ Order Punched ]*` → closes request. **Secondary:** add/remove item, ± qty, add verbal.
- **Business rules:** BR-F2/F3/F4/F5.
- **Edge cases:** item unavailable → remove/adjust; verbal-only additions; escalation shake+`⌚`. **Dependencies:** F&B order API, catalogue. **States:** §0.2.

# S11 · Extension Control (inline-first, drawer on block) — FD-17
- **Purpose:** the two extension paths — dashboard-authoritative +30 (immediate) and LG request handling ("Seen").
- **Effort note (FD-22):** the happy path is **one click**. `[ Extend +30 ]` on the card/detail applies immediately when the window is free (inline toast confirmation, no drawer). A panel opens **only when blocked** (needs override / partial availability). Repeated taps add further +30 blocks (each re-checked).
- **Entry point:** room card `[ Extend +30 ]` (Ending Soon / In-Use) **or** `[ Seen ]` on `{Extension Requested}`.
- **Information hierarchy (blocked panel only):** current end time → proposed new end (+30) → availability/conflict result → override/refuse. LG request: requested duration → `[ Seen ]` → then one-click extend.
- **Layout zones:** inline (card action) for happy path; on block → `Panel` (`Header` current/new end → `Conflict/AvailabilityResult` → `Footer` Override / Cancel).
- **Components:** Extension Control (🔵), Extension Request + Seen (🔵), availability read-out (shared engine).
- **Component states:** {extendable → applied(immediate, inline)} or {blocked → panel → override|refuse}; request {requested → seen}.
- **Primary CTA:** `[ Extend +30 ]*` (inline, one-click) / `[ Seen ]` (request). **Secondary (blocked panel only):** `[ Override ]`, `[ Cancel ]`.
- **Business rules:** BR-E1 (immediate +30, updates end + availability), BR-E2 (guard: free window else override), BR-E3 (LG request→Seen), BR-E4 (re-block slot).
- **Edge cases:** next slot fully booked → blocked (override or refuse); partial availability → offer reduced window. **Dependencies:** Availability Engine, bookings. **States:** §0.2.

# S12 · Members / Guests + CSV Import (page + modal) — FD-18
- **Purpose:** the internal Member DB (CSV-seeded, editable) + derived guests.
- **Primary user:** management.
- **Entry point:** sidebar "Members / Guests".
- **Information hierarchy:** `⌕` + `[ Import CSV ]` + `[ ＋ Add Member ]*` → sub-tabs (Members•/Guests) → member rows (id · name · mobile · Q Pay eligible) `✎`/`🗑`; guests read-only (derived).
- **Layout zones:** `ActionBar` → `SubTabs` → `List`.
- **Components:** Members list (🟡 extends Guest List), CSV Import modal (🔵, upload→preview→map→import→result), Member editor (🔵).
- **Component states:** member {active|deleted}; import {idle|uploading⟳|preview|errors⚠|success}.
- **Primary CTA:** `[ ＋ Add Member ]` / within import `[ Import ]*`.
- **Secondary CTA:** `[ Import CSV ]`, edit/delete member.
- **Modal behaviour:** CSV Import modal = upload → column preview → validation errors list → confirm import → result summary.
- **Business rules:** BR-MEM1 (CSV + editable), BR-MEM2 (lookup/auto-fill — consumed by S5), BR-MEM3 (invalid blocks booking), BR-MEM4 (future external sync seam).
- **Edge cases:** duplicate IDs on import (report), malformed rows (skip+report), guests are read-only.
- **Dependencies:** Member DB API + import endpoint. **States:** §0.2. **Empty:** "No members — [ Import CSV ] / [ ＋ Add Member ]".

# S13 · View History (secondary analytics)
- **Purpose:** detailed historical data by domain — kept OFF the operational dashboard (FD-20).
- **Entry point:** Dashboard `[ View History ]`.
- **Information hierarchy:** period tabs (today/yesterday/last_7_days/this_month/custom) + `[ Dashboard ]` back → domain tabs (Rooms/Bookings/Staff/Payments/F&B/Ratings) → data table.
- **Layout zones:** `PeriodBar` → `DomainTabs` → `Table`.
- **Components:** period tabs (🟢), CustomDateRange modal (🟢), history tables (🟡).
- **Metrics:** Total Revenue, Room Rent, F&B Revenue, Ratings (Quorum + LUXEGENIE), Total Bookings, Total Duration, Preferred Payment Mode % (FD-11, deferred here).
- **Primary CTA:** none (analytical); Custom opens date-range modal. **Secondary:** `[ Dashboard ]`.
- **Business rules:** FD-11/FD-20 (analytics live here, not on live board).
- **Edge cases:** no data in period → empty table; custom range validation. **Dependencies:** history endpoints. **States:** §0.2.

# S14 · Recent Activities
- **Purpose:** full chronological activity feed (all requests/events).
- **Entry point:** bell → "View all activities".
- **Information hierarchy:** filter (type/room/time) → activity rows (room · type · staff · status · response time · timestamp).
- **Components:** activity list (🟢 reuse RecentActivities).
- **Primary CTA:** none. **Secondary:** filters; row → room detail (S2).
- **Business rules:** BR-SR6 (response time), FD-19 (mirrors bell/smartwatch feed).
- **Edge cases:** high volume → pagination/infinite scroll. **States:** §0.2. **Empty:** "No activity yet."

# S15 · Users
- **Purpose:** manage staff accounts (single access level, FD-07).
- **Entry point:** sidebar "Users".
- **Components:** Users list + Add User modal (🟢 reuse restaurant verbatim).
- **Delta vs restaurant:** none functional; roles are labels only (BR-PERM2). **Primary CTA:** `[ ＋ Add User ]`.
- **Business rules:** BR-PERM1/PERM2. **States:** §0.2. (Full pattern: [reference](../reference/restaurant-dashboard/pages/04-users.md).)

# S16 · LUXEGENIE Devices
- **Purpose:** device fleet monitor/assign/reboot; devices fixed per room.
- **Entry point:** sidebar "LUXEGENIE".
- **Components:** device list (🟢 reuse), `⋮` (Reboot/Shutdown), assign-to-room.
- **Delta vs restaurant:** device assigned per **room** (not table). **Primary CTA:** none (monitor); `⋮` device actions.
- **Business rules:** device config parity. **Edge cases:** low battery, offline device. **States:** §0.2. (Full pattern: [reference](../reference/restaurant-dashboard/pages/05-luxegenie.md).)

# S17 · Settings
- **Purpose:** meeting-room policy + guest-device content config.
- **Entry point:** sidebar "Settings".
- **Information hierarchy:** sub-tabs → **Payment Modes** (+ preferred) · **Cancellation & Extension** policy · **Reminders** · **Pricing Policy** (configurable, FD-15) · **Wi-Fi** · **Events / About Quorum**.
- **Components:** Content Section Editor (🟢 reuse), "Visible in LUXEGENIE" toggles (🟢), policy forms (🟡).
- **Component states:** each section {view|editing|saving|saved}.
- **Primary CTA:** per-section `[ Save ]`. **Secondary:** visibility toggles, add event/loyalty.
- **Business rules:** BR-PAY3 (modes + preferred), BR-C1 (cancellation configurable), BR-E1 (extension increment), BR-N1/N2 (reminders), BR-P3 (pricing policy configurable).
- **Edge cases:** pricing-policy fields are configurable placeholders (thresholds TBD, BR-P5). **States:** §0.2.

# S18 · LUXEGENIE in-room screens (device)
- **Purpose:** guest-facing in-room experience (companion set; drives dashboard events).
- **Primary user:** guest/member.
- **Screens:** **B1 Reserved/idle** (Welcome to Quorum · Reserved for {name} · slot · Room No · `[ Start Meeting ]`); **B2 In-meeting home** (Wi-Fi · Assistance · F&B · Services · Explore · Bill Request · Review · Room No); **B3 Tap actions** (Wi-Fi QR; service request pattern; F&B cart; Services incl. Extend; Explore; Bill Request → mode → ratings); **B4 End-of-meeting** (Ending Soon: Extend/Confirm/Cancel/Home — **no auto-end**; Guest End Meeting; Meeting Ended: total/QR/ratings).
- **Components:** device screen frames (🔵 new but simple; mirror flow §5.2/§5.3/§5.6).
- **Component states:** per §7 of the spec; request confirmation (3s cancel), "Request Sent" (auto-home 10s).
- **Business rules:** BR-S1/S2 (Reserved/Start), BR-SR1..SR5 (service pattern), BR-F2 (F&B), BR-E3 (extend request), BR-PAY (bill), BR-END1 (no auto-end — guest may End Meeting).
- **Edge cases:** guest inaction at end → device shows ended prompt, dashboard notifies management (no auto-close). **Dependencies:** device APIs, Pusher. **States:** device-appropriate (loading/offline).

## Future Work

- Any layout question not answered by the frozen docs is logged per-wireframe as an *open question*; none may introduce new functionality.

## Related Documents

- [Wireframe_Principles](Wireframe_Principles.md) · [Wireframe_Checklist](Wireframe_Checklist.md) · [Wireframe_Handoff](Wireframe_Handoff.md) · [wireframes/](wireframes/)
