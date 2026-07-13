# S1 · Meeting Rooms — Live Board (landing) [wireframe]

> Room-first operational radar (FD-12). Grayscale, structure-only. Components from [99-components.md](99-components.md). Spec: [Wireframe_Specification §S1](../Wireframe_Specification.md). Card states: [C1](99-components.md#c1--room-card--extends-restaurant-table-card--the-atomic-unit-of-the-live-board).

## Default — populated (attention-sorted)

```
┌─ App Shell ─ title: "Meeting Rooms" · subtitle: "See live room status" ───────────────┐
│                                                                                        │
│  ⌕ Search rooms…        Area ( •All )( Floor 1 )( Floor 2 )   Status ( •All )( Avail )│
│                                              ( In-Use )( Ending )( Billing )( Maint )  │
│                                                                                        │
│  ── ① ATTENTION (sorted to top) ───────────────────────────────────────────────────── │
│  ┌ R03  {In-Use}{Escalated ⚠}┐ ┌ R01 {In-Use}{F&B Order Req}┐ ┌ R07 {Ending Soon}    ┐ │
│  │ 8 · Priya M · 14:00-15:00 │ │ 6 · Anil K · 13:30-15:30   │ │ 10 · Rao · ends 09m  │ │
│  │ Assistance · waiting 1m+  │ │ order placed               │ │                      │ │
│  │ [ Accept ]            ⋮  │ │ [ View Order ]         ⋮  │ │ [ Extend +30 ]    ⋮ │ │
│  └───────────────────────────┘ └────────────────────────────┘ └──────────────────────┘ │
│  ┌ R05 {Billing}{Bill Req}   ┐ ┌ R09 {Ended — action needed}┐                          │
│  │ 4 · Meera · mode: Cash    │ │ 6 · guest left · unbilled  │                          │
│  │ [ Enter Bill ]        ⋮  │ │ [ End Meeting ]        ⋮  │                          │
│  └───────────────────────────┘ └────────────────────────────┘                          │
│                                                                                        │
│  ── ② IN-USE / RESERVED ────────────────────────────────────────────────────────────  │
│  ┌ R02 {In-Use}             ┐ ┌ R04 {Reserved}             ┐ ┌ R06 {Reserved}        ┐ │
│  │ 8 · Dev S · 14:00-16:00  │ │ 6 · Sana · 15:00 (upcoming)│ │ 6 · next 15:30       │ │
│  │ [ View ]             ⋮  │ │ [ View ]              ⋮  │ │ [ View ]          ⋮ │ │
│  └───────────────────────────┘ └────────────────────────────┘ └──────────────────────┘ │
│                                                                                        │
│  ── ③ AVAILABLE ─────────────────────────────────────────────────────────────────────  │
│  ┌ R08 {Available}          ┐ ┌ R10 {Available}            ┐ ┌ R12 {Available}       ┐ │
│  │ 8 · ₹—/hr                │ │ 10 · ₹—/hr                 │ │ 12 · ₹—/hr           │ │
│  │ [ Walk-in ]          ⋮  │ │ [ Walk-in ]           ⋮  │ │ [ Walk-in ]       ⋮ │ │
│  └───────────────────────────┘ └────────────────────────────┘ └──────────────────────┘ │
│                                                                                        │
│  ── ⑤ UNDER MAINTENANCE ─────────────────────────────────────────────────────────────  │
│  ┌ R11 {Under Maintenance}  ┐                                                           │
│  │ blocked until 14:00 tmrw │  ⋮ → Reroute 2 bookings                                  │
│  │ [ Clear ]            ⋮  │                                                           │
│  └───────────────────────────┘                                                         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Sort:** attention (open+escalated requests, ended-unbilled, ending-soon) → in-use/reserved → available → maintenance. This is the FD-22 payoff: work rises to the top; the manager doesn't hunt.
- **One primary action per card** (C1). `⋮` holds secondary (Open Detail, New scheduled Booking, Mark/Clear Maintenance, Reroute).
- Card body tap → **Room Detail drawer (S2)**. Primary actions open S9/S10/S11 or act inline (Accept, Extend).

## Loading
```
⌕ …    ( tabs )
⟳ ┌ ▢▢▢ ┐ ┌ ▢▢▢ ┐ ┌ ▢▢▢ ┐   ← skeleton card grid; shell interactive
```

## Empty (no rooms configured)
```
                 — no meeting rooms configured —
                 [ ＋ Add Room ]   → S6 Manage Rooms
```

## Error (board fetch failed)
```
⚠ Couldn't load rooms.  [ Retry ]      (shell + nav remain usable)
```
Per-card action failure = inline `⚠` on that card only; the rest of the board stays live.

## Notification (real-time arrival)
```
toast▸ "R03 requested Assistance"      [🔔 +1]      ⌚ (escalation only)
       → R03 card gains {Assistance Requested}; after 1m unattended → {Escalated ⚠} + shake + ⌚
```

## Maintenance interaction
```
⋮ → Mark Under Maintenance ─► S7 modal (confirm; existing bookings listed to reroute; 24h block)
Card then renders {Under Maintenance} + [ Clear ]; excluded from booking availability (BR-A2/M4).
```

## System events reflected here
`room-reserved` (Available→Reserved) · `meeting-started` (Reserved→In-Use) · request activate/deactivate · `meeting-ending-soon` · `meeting-ended` (→Available + **surface next booking**, BR-END4) · `room-maintenance-set/-cleared`. **No auto-end** (BR-END1): an ended-but-unclosed meeting shows `{Ended — action needed}` until management/guest acts.

## Responsive
3-col ≥1024 / 2-col 768–1023 / 1-col <768 (tabs swipe). Drawers become full-screen sheets.

---

### Traceability
- **States shown:** all six room states + request sub-states + escalation + ended-action-needed + empty/loading/error/notification/maintenance.
- **Business rules:** BR-S1..S5, BR-SR3/SR4/SR6, BR-F3, BR-E1/E3, BR-END1/END3/END4, BR-M1..M4, FD-12, FD-20 (no analytics here), FD-22 (one action + attention sort).
- **Components:** Room Card 🟡, Status Badge 🟡, Tabs 🟢, Search 🟢, CTA 🟢, `⋮` menu 🟢, toast/bell/⌚ 🟢.
- **Flows:** landing → serve request / extend / bill / end / walk-in / maintenance ([User_Flows](../User_Flows.md) §3/§5/§6/§7/§8).
- **Open question:** whether S1 (board) and S3 (KPIs) are one screen or two — drawn as two ([REPOSITORY_AUDIT Q9](../../REPOSITORY_AUDIT.md#outstanding-questions)).

### CHECKLIST — S1 Live Board
□ Business rules — BR-S*, BR-SR*, BR-END*, BR-M*, BR-E1/E3, BR-F3 ✔
□ State machine — all room states rendered ✔
□ User flow — landing → each primary action → exit ✔
□ Empty ✔ · □ Loading ✔ · □ Error ✔ · □ Success (action toast + card flip) ✔
□ Notification — toast + bell + ⌚ ✔
□ Maintenance — {Under Maintenance} + reroute + 24h block ✔
□ Permission — global single-access (§0.2) ✔
□ Edge cases — multi-request stacking, ended-unbilled, maintenance w/ bookings ✔
□ Navigation — in shell; cards open drawers (no navigation away) ✔
□ CTA hierarchy — exactly one primary per card state ✔
□ Component reuse — Room Card/Badge extended; rest reused ✔
□ Interaction patterns — search+tabs+cards+badges + escalation pattern ✔
**RESULT: PASS**
