# Dashboard Architecture — Room-First Operations

> **Status:** Canonical · **Version:** 3.0 · **Last updated:** 2026-07-13
> **New in V3.** Captures the founder's dashboard philosophy: the Manager Dashboard is **ROOM-FIRST** and **operational-first**.

## Purpose

Define how the Meeting Room dashboard is organized so managers instantly understand the operational state of the venue, and so booking/analytics are correctly positioned as secondary. This doc is the bridge between [Information_Architecture](Information_Architecture.md) (structure) and [Screen_Inventory](../ux/Screen_Inventory.md) (surfaces).

## Scope

The two primary operational surfaces — the **live Meeting Rooms board** (landing) and the **operational KPI dashboard** — and the principle that separates them from Bookings (calendar-first) and View History (analytics). Not visual design (that is the next Reference Wireframes phase).

## Dependencies

[Founder_Decision_Log](../product/Founder_Decision_Log.md) (FD-12, FD-20, FD-21, FD-22, FD-24) · [MeetingRoom_Product_Spec](../product/MeetingRoom_Product_Spec.md) · [State_Machines](State_Machines.md)

## Assumptions

Reuses the restaurant App Shell, KPI Card, and status-badge patterns ([Component_Mapping](Component_Mapping.md)).

---

## 1. Two dashboards, two jobs

| Surface | Question it answers | Bias |
|---|---|---|
| **Meeting Rooms (live board)** — landing | "What is happening **right now**, and where do I need to act?" | ROOM-FIRST (FD-12) |
| **Dashboard (KPIs)** | "How is **today** going operationally?" | OPERATIONAL-FIRST (FD-20) |
| Bookings | "Manage the schedule" | CALENDAR-FIRST (FD-13) — separate module |
| View History | "Analyze the past" | Analytics — secondary, not on the operational path |

**Principle (FD-22):** both operational surfaces are optimized to **reduce staff effort** — the manager should act in as few glances/clicks as possible.

## 2. Room-first live board (landing surface) — FD-12

The default post-login surface. It must let a manager immediately see:

- **Which rooms are Available** (ready to book/seat)
- **Which rooms are Occupied** (In-Use)
- **Which rooms require Attention** (open service/F&B/extension requests, escalated >1 min)
- **Which rooms are Ending Soon** (10-min warning)
- **Upcoming meetings** (next bookings per room / venue)

### Room card (the atomic unit)
Extends the restaurant Table Card. Content:
- Room number/name · seats · **rate** · **live status** (Available/Reserved/In-Use/Ending Soon/Billing/Under Maintenance)
- Current guest/member + slot/duration (when occupied)
- **Attention badges** — active request(s), escalation shake, "Ending Soon", "Bill Requested"
- **One primary action** for the current pending work (Accept / View Order / Enter Bill / End Meeting) — chosen to minimize clicks (FD-22)
- On meeting end, the card **immediately flips to Available and surfaces the next booking** (FD-21 / BR-END4)

### Grouping & signal
- Group/filter by area and status; sort so **rooms needing attention rise to the top** (reduce scanning effort).
- Colour vocabulary per [Interaction_Patterns §Status colours](../ux/Interaction_Patterns.md#2-status-colour-vocabulary) (adds grey = Under Maintenance).

## 3. Operational KPI dashboard — FD-20

Leads with **today** and **attention**, not revenue analytics. Recommended widgets (all derivable from booking/session/activity data — no invented analytics):

| Widget | Shows | Source |
|---|---|---|
| **Today's Status** | rooms available / occupied / ending soon / maintenance (counts) | rooms + sessions |
| **Today's Bookings** | today's schedule, upcoming next | bookings |
| **Meeting Room Status** | live per-room status roll-up | rooms |
| **Operational Attention** | open + escalated requests, unbilled ended meetings | activities |

**Deferred to [View History](../ux/Screen_Inventory.md#a10-view-history) (secondary):** Total Revenue, Meeting Room Rent, F&B Revenue, Average Ratings (Quorum + LUXEGENIE), Total Bookings, Total Duration, Preferred Payment Mode %. These remain valid metrics (FD-11) but are **not** on the primary operational surface (FD-20).

## 4. Real-time behaviour

Both surfaces update live via Pusher (invalidate-then-refetch) and never require manual refresh; escalations also fire smartwatch alerts (FD-19). See [RealTime_And_Sync](RealTime_And_Sync.md).

## 5. Why the split matters (rationale)

Mixing booking management and analytics into the live board would slow the manager down and increase effort — violating FD-22. Keeping the live board purely operational, bookings calendar-first, and analytics in History gives each surface a single job.

## Future Work

- Wireframe the room-first board and the operational KPI layout (next phase).
- Confirm attention-sort ordering and how "Upcoming meetings" is surfaced (per-room vs a venue timeline).

## Related Documents

- [Information_Architecture](Information_Architecture.md) · [Screen_Inventory](../ux/Screen_Inventory.md) · [Interaction_Patterns](../ux/Interaction_Patterns.md) · [Component_Mapping](Component_Mapping.md) · [State_Machines](State_Machines.md)
