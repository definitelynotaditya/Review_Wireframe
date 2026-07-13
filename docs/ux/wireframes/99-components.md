# Component Appendix (drawn once, referenced everywhere)

> Shared components drawn a single time here (Principle 16). Screens reference them by name and list only per-screen props/states. Class: 🟢 reuse · 🟡 extend · 🔵 new (per [Component_Mapping](../../architecture/Component_Mapping.md)).

---

## C1 · Room Card (🟡 extends restaurant Table Card) — the atomic unit of the live board

One card, one room, **one primary action per state**. State token top-right; occupant/slot middle; attention badges; single CTA in the action slot.

```
┌───────────────────────────────┐   ┌───────────────────────────────┐
│ R01            {Available}    │   │ R03            {In-Use}       │
│ 8 seats · ₹—/hr               │   │ 8 seats · ₹—/hr               │
│                               │   │ Priya M. · 14:00–15:00 (28m)  │
│                               │   │ {Assistance Requested}        │
│ ┌───────────┐            ⋮   │   │ ┌───────────┐            ⋮   │
│ │ [ Walk-in]│                │   │ │ [ Accept ]│                │
│ └───────────┘                │   │ └───────────┘                │
└───────────────────────────────┘   └───────────────────────────────┘
```

### All card states (state token + primary action)
| State token | Middle content | Primary action | Source |
|---|---|---|---|
| `{Available}` | — | `[ Walk-in ]` | BR-S5 |
| `{Reserved}` | occupant · slot (upcoming) | `[ View ]` | BR-S1 |
| `{In-Use}` | occupant · slot · elapsed | *(context / request)* | BR-S2 |
| `{In-Use}` + `{… Requested}` | + request label | `[ Accept ]` | BR-SR3 |
| `{In-Use}` + `{F&B Order Requested}` | + order | `[ View Order ]` | BR-F3 |
| `{In-Use}` + `{Extension Requested}` | + duration | `[ Seen ]` | BR-E3 |
| `{… Requested}` + `{Escalated ⚠}` | request > 1 min | `[ Accept ]` (shake + ⌚) | BR-SR4 |
| `{Ending Soon}` | remaining ≤10 min | `[ Extend +30 ]` | BR-S3/E1 |
| `{Billing}` `{Bill Requested}` | selected mode | `[ Enter Bill ]` | BR-S4/PAY1 |
| `{Ended — action needed}` | ended, unbilled | `[ End Meeting ]` | BR-END1 |
| `{Under Maintenance}` | blocked-until | `[ Clear ]` | BR-M1 |

> Multiple concurrent requests on one In-Use card **stack badges**; primary CTA targets the **oldest unattended** request. Tap card body → Room Detail (S2).

## C2 · Status Badge (🟡)
A bracketed **text** token (colour deferred). Vocabulary = the room-state set + request sub-states + booking states. Always visible; never colour-only. Placement: card top-right (rooms) / row-end (lists).

## C3 · Segmented Tabs (🟢)
```
( •Upcoming )( Today )( Past )( All )     ← active marked •; counts optional: (Active 16)
```
Used for status/scope/area/category/period. Active = filled slot. Swipable `overflow-x` on mobile.

## C4 · Search (🟢)
```
⌕ Search rooms / bookings / members…
```
Left-aligned in the ActionBar; searches the screen's natural keys.

## C5 · Primary/Secondary CTA (🟢)
`[ Label ]` = button. Primary annotated `*` and placed bottom-right (modal/drawer) or top-right (`＋ New`) or the card action slot. Secondary/Cancel to its left; destructive in `⋮` or left with confirm.

## C6 · Modal (🟢) — blocking task
```
        ┌─ Title ───────────────────────── ✕ ┐
        │  «grouped form sections»            │
        │  Field *  〔            〕          │
        │  ────────────────────────────────── │
        │                 [ Cancel ]  [ Save ]*│
        └──────────────────────────────────────┘
```
Dismiss: ✕ / Cancel / Esc / backdrop. Unsaved-changes confirm.

## C7 · Drawer (🟡) — contextual side panel (keeps list visible)
```
                         ┌─ Header ─────────── ✕ ┐
   « list behind »       │  «body»                │
                         │                        │
                         │  ────────────────────  │
                         │        [ Secondary ] [ Primary ]* │
                         └────────────────────────┘
```
Right side; Esc/✕ dismiss; overlays (does not navigate). Full-screen sheet <768px.

## C8 · KPI Card (🟢 StatCard)
```
┌──────────────────────┐
│ TODAY'S BOOKINGS   ▤ │   ← uppercase label + icon slot
│  12                  │   ← large value
│  next 15:00 · R03    │   ← optional context line
└──────────────────────┘
```

## C9 · Entity List Row (🟢) — table/list variant
```
┌ Name ───────────── Details ─────────── {State} ──── Actions ─┐
│ R01 · Boardroom    8 seats · ₹—/₹—/₹—   {Active}   ✎  🗑  ⋮ │
└──────────────────────────────────────────────────────────────┘
```

## C10 · Availability Slot Picker (🔵) — booking Steps 1–5
```
Step 1 Date      〔 dd/mm/yyyy ▾ 〕
Step 2 Duration  ( 1h )( 2h )( Half-Day )( Full-Day )( Custom 〔 〕)
Step 3 Time Slot ( 09:00 )( 10:00• )( 11:00 ) …   ← hourly
Step 4 Seats     〔 6 〕
Step 5 ─ Available Rooms (capacity ≥ 6, free whole window, not maintenance/booked) ─
        ┌ R06 · 6 seats · est ₹— ┐  ┌ R08 · 8 seats · est ₹— ┐  ┌ R10 · 10 · ₹— ┐
        │        [ Select ]       │  │        [ Select ]       │  │   [ Select ]  │
        └────────────────────────┘  └────────────────────────┘  └───────────────┘
```
Enforces BR-A2/A3 (all constraints; seats ≥) + BR-P2 (auto estimate). Empty → "No rooms match — adjust constraints".

## C11 · Recurrence Control (🔵)
```
☑ Recurring   Pattern ( Weekly• )( Monthly )   Until 〔 dd/mm/yyyy ≤6mo 〕
```
BR-R1/R2. On save, clashing occurrences reported (BR-R4).

## C12 · Member Lookup field (🔵)
```
Member ID 〔 M-1024 〕 [ Lookup ]   → ✓ "Priya Mehta · Q Pay ✓"  (auto-filled)
                                    → ⚠ "Invalid Member ID — booking blocked" (BR-MEM3)
```

## C13 · Empty / Loading / Error primitives
```
— empty —        ⟳ loading (skeleton rows/cards)        ⚠ Error: <msg>  [ Retry ]
```

## C14 · Notification surfaces
- **Toast** (top-right): transient, icon + message (colour deferred).
- **Bell** `[🔔 n]`: badge + peek list → S14.
- **Smartwatch** `⌚`: mirror of attention/escalation events (BR-N1).

---

### Reuse ledger
| Component | Class | Origin |
|---|---|---|
| Room Card, Status Badge, Drawer, KPI-context, End Meeting | 🟡 | extended from restaurant |
| Tabs, Search, CTA, Modal, KPI Card, Entity Row, toasts, bell | 🟢 | restaurant verbatim |
| Availability Picker, Recurrence, Member Lookup, CSV Import, Maintenance toggle, Extension Control | 🔵 | new (justified by new interaction) |

See [Component_Mapping](../../architecture/Component_Mapping.md) for the full mapping and the logical Booking-Engine components.
