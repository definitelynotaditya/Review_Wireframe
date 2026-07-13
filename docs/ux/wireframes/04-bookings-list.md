# S4 · Bookings — List [wireframe]

> Entry to the calendar-first create flow. Spec: [Wireframe_Specification §S4](../Wireframe_Specification.md).

## Default

```
┌─ App Shell ─ title: "Bookings" · subtitle: "Manage room bookings" ─────────────────────┐
│  ⌕ Search name / member ID / room / mobile…                     [ ＋ New Booking ]*     │
│  ( •Upcoming 4 )( Today 3 )( Past )( All )        Date 〔dd/mm/yyyy〕  Room ▾  Status ▾ │
│  ──────────────────────────────────────────────────────────────────────────────────── │
│  ┌ Priya Mehta (Member M-1024)              Room R03   {Booked}   via WhatsApp        ┐ │
│  │ 6 pax · 14 Jul · 14:00–15:00 · est ₹—                                             │ │
│  │ [ View ]                                                       ✎   🗑   ⋮        │ │
│  └───────────────────────────────────────────────────────────────────────────────────┘ │
│  ┌ Sana (Guest · 90000 00000)               Room R04   {Booked}   ↻ Weekly (series)  ┐ │
│  │ 6 pax · 14 Jul · 15:00–16:30 · est ₹—                                             │ │
│  │ [ View ]                                                       ✎   🗑   ⋮        │ │
│  └───────────────────────────────────────────────────────────────────────────────────┘ │
│  ┌ Rao (Guest)                              Room R07   {Clash-Flagged ⚠}  ↻ occurrence┐ │
│  │ 4 pax · 16 Jul · 10:00–11:00 · conflicts with existing booking                    │ │
│  │ [ Resolve ]                                                    ✎   🗑   ⋮        │ │
│  └───────────────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
   ⋮ → Reschedule (this occurrence / entire series) · Override · Cancel
```

- Card states: `{Booked}` `{Active}` `{Completed}` `{Cancelled}` `{Rerouted}` `{No-Show}` `{Clash-Flagged ⚠}`; recurring badge `↻ series|occurrence`.
- **View** opens the booking's detail (edit / reschedule / cancel). There is **no staff "seat/start" action** on a scheduled booking: a room becomes **Reserved automatically at slot start** (BR-S1, time-triggered) and **In-Use only when the guest taps Start Meeting on LUXEGENIE** (BR-S2). Past bookings are read-only; a clash-flagged occurrence shows `[ Resolve ]`.

## New Booking / Reschedule → opens S5 (drawer)
## Cancel → confirm modal (C6):
```
┌ Cancel booking? ─────────────── ✕ ┐
│ Priya Mehta · R03 · 14 Jul 14:00   │
│ ⚠ This cannot be undone.           │
│              [ Keep ]  [ Cancel it ]│
└────────────────────────────────────┘
```
## Recurring modify → scope modal:
```
┌ Apply change to… ────────────── ✕ ┐
│ ( • This occurrence )( Entire series)│
│              [ Cancel ]   [ Continue]│
└──────────────────────────────────────┘
```

## States
- **Loading:** list skeleton. **Empty:** `— no bookings —  [ ＋ New Booking ]`. **Error:** `⚠ … [ Retry ]`.
- **Success:** create/edit/cancel → toast + list update (Pusher `booking-*`).
- **Notification:** N/A on this screen (bookings aren't real-time attention; handled on S1). Marked N/A in checklist.
- **Maintenance:** N/A (no room-state concept on the list; conflicts surface via Clash-Flagged / availability in S5).
- **Permission:** global (§0.2).

## Edge cases
Clash-flagged occurrences shown distinctly with `[ Resolve ]` (→ reschedule/override); member vs guest card variants; series vs single indicator.

---

### Traceability
- **States:** all booking states + clash-flagged + recurring variants + empty/loading/error/success.
- **Business rules:** BR-B1..B6, BR-R1..R4, BR-CF1..CF3, BR-C1.
- **Components:** Entity cards 🟡, Tabs 🟢, Search 🟢, Modal 🟢, CTA 🟢.
- **Flows:** [User_Flows §1](../User_Flows.md#1-booking-flow-calendar-first) (create), reschedule/cancel/override.

### CHECKLIST — S4 Bookings List
□ Business rules — BR-B*, BR-R*, BR-CF*, BR-C1 ✔ · □ State machine — booking states ✔ · □ User flow — list→create/edit/cancel ✔
□ Empty ✔ · □ Loading ✔ · □ Error ✔ · □ Success ✔ · □ Notification — N/A (attention on S1) ✔ · □ Maintenance — N/A (no room state here) ✔ · □ Permission ✔
□ Edge cases — clash-flagged, series/occurrence, member/guest ✔ · □ Navigation — New/Edit→S5 drawer; confirms as modals ✔
□ CTA hierarchy — ＋New Booking primary; per-card View + ✎/🗑/⋮ ✔ · □ Reuse — restaurant reservation pattern ✔ · □ Patterns — consistent ✔
**RESULT: PASS**
