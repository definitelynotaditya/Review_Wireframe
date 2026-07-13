# S3 · Operational Dashboard (KPIs) [wireframe]

> Operational-first, **today** only (FD-20). Revenue/ratings analytics are NOT here — they live in View History (S13). Spec: [Wireframe_Specification §S3](../Wireframe_Specification.md).

## Default

```
┌─ App Shell ─ title: "Dashboard" · subtitle: "Today's operations" ──────────────────────┐
│                                                                        [ View History ] │
│  ── TODAY'S STATUS ──────────────────────────────────────────────────────────────────  │
│  ┌ Available ┐ ┌ In-Use ┐ ┌ Ending Soon ┐ ┌ Billing ┐ ┌ Maintenance ┐ ┌ Reserved ┐    │
│  │    5      │ │   4    │ │      1      │ │    1    │ │      1      │ │    3     │    │
│  └───────────┘ └────────┘ └─────────────┘ └─────────┘ └─────────────┘ └──────────┘    │
│                                                                                        │
│  ── OPERATIONAL ATTENTION ───────────────────────────────────────────────────────────  │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐ │
│  │ ⚠ R03 · Assistance · waiting 1m+        → [ Open ]  (→ S2)                         │ │
│  │   R01 · F&B Order · placed              → [ View Order ] (→ S10)                   │ │
│  │   R09 · Ended — unbilled                → [ End / Bill ] (→ S9)                    │ │
│  └──────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                        │
│  ── TODAY'S BOOKINGS ─────────────────────────────────────────────────────────────────  │
│  ┌ 13:30 R01 Anil (In-Use) ┐ ┌ 14:00 R03 Priya (In-Use) ┐ ┌ 15:00 R04 Sana (next) ┐   │
│  └─────────────────────────┘ └──────────────────────────┘ └───────────────────────┘   │
│  … [ All bookings → S4 ]                                                                │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

- **No period tabs** here (this is "today"); historical periods live in S13.
- Attention rows are **deep links** to the room/bill (reduce clicks, FD-22).

## Loading
`⟳` KPI tiles skeleton + attention/bookings skeleton.

## Empty (no activity today — valid, not an error)
```
TODAY'S STATUS: all counts render (e.g. Available 8, rest 0)
OPERATIONAL ATTENTION:  — nothing needs attention —
TODAY'S BOOKINGS:       — no bookings today —   [ ＋ New Booking → S4 ]
```

## Error
`⚠ Couldn't load today's metrics. [ Retry ]` (per-panel; other panels stay).

## Notification
Counts + attention list update live via Pusher (a new request appears in Attention immediately; escalation adds `⚠` + `⌚`).

## Maintenance
Reflected as a **count** in Today's Status (`Maintenance 1`); no separate action here (managed on S1/S6).

---

### Traceability
- **States:** loading/empty(zero)/error/notification; maintenance as count.
- **Business rules:** FD-20 (operational-first, no revenue here), BR-END (unbilled ended surfaced), BR-SR4 (escalation).
- **Components:** KPI Card 🟢, Attention list 🟡, Bookings strip 🟡; no period control.
- **Flows:** monitor → deep-link to room/bill/bookings; → View History for analytics.
- **Open question:** one-vs-two screens with S1 (Q9).

### CHECKLIST — S3 Dashboard
□ Business rules — FD-20, BR-END, BR-SR4 ✔ · □ State machine — counts reflect room states ✔ · □ User flow — monitor→deep-link ✔
□ Empty (zero) ✔ · □ Loading ✔ · □ Error ✔ · □ Success — N/A (monitoring) ✔ · □ Notification ✔ · □ Maintenance (count) ✔ · □ Permission ✔
□ Edge cases — all-zero day is valid ✔ · □ Navigation — deep links, View History button ✔ · □ CTA — no primary; links only ✔
□ Reuse — KPI card reused ✔ · □ Patterns — consistent; no analytics on operational surface ✔
**RESULT: PASS**
