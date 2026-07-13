# S13 · View History (secondary analytics) [wireframe]

> Analytics live here, OFF the operational dashboard (FD-20). Spec: [Wireframe_Specification §S13](../Wireframe_Specification.md).

## Default

```
┌─ App Shell ─ title: "View History" · subtitle: "Historical analytics" ──────────────────┐
│  ( •Today )( Yesterday )( Week )( Month )( Custom )                    [ Dashboard ]     │
│  ( •Rooms )( Bookings )( Staff )( Payments )( F&B )( Ratings )                          │
│  ──────────────────────────────────────────────────────────────────────────────────── │
│  RANK  ROOM   BOOKINGS   HOURS   REVENUE   RENT   F&B                                   │
│  1     R03    12         26h     ₹—        ₹—     ₹—                                    │
│  2     R01    9          18h     ₹—        ₹—     ₹—                                    │
│  …                                                                                      │
│  Summary: Total Revenue ₹— · Room Rent ₹— · F&B ₹— · Bookings — · Duration —h ·         │
│           Avg Rating (Quorum —/5 · LUXEGENIE —/5) · Preferred mode: Cash 40%            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

- Period `Custom` → date-range modal (C6). Domain tabs swap the table + summary.
- Metrics per FD-11 (deferred to this surface): Total Revenue, Room Rent, F&B Revenue, Ratings (Quorum + LUXEGENIE), Total Bookings, Total Duration, Preferred Payment Mode %.

## States
- **Loading:** table skeleton. **Empty (no data in period):** `— no data for this period —`. **Error:** `⚠ … [ Retry ]`.
- **Success:** N/A (read-only analytics). **Notification:** N/A. **Maintenance:** N/A. **Permission:** global.

## Edge cases
Custom range validation (from ≤ to); empty period is valid; large tables paginate.

---

### Traceability
- **States:** period+domain selection; loading/empty/error.
- **Business rules:** FD-11 / FD-20 (analytics here, not on live board).
- **Components:** period tabs 🟢, CustomDateRange modal 🟢, history tables 🟡.
- **Flows:** Dashboard → View History → analyze.

### CHECKLIST — S13 View History
□ Business rules — FD-11/FD-20 ✔ · □ State machine — N/A (read-only) ✔ · □ User flow — dashboard→history→filter ✔
□ Empty ✔ · □ Loading ✔ · □ Error ✔ · □ Success — N/A (read-only) ✔ · □ Notification — N/A ✔ · □ Maintenance — N/A ✔ · □ Permission ✔
□ Edge cases — custom range, empty period, pagination ✔ · □ Navigation — period+domain tabs; back to Dashboard ✔
□ CTA hierarchy — no primary; Dashboard link + Custom ✔ · □ Reuse — restaurant View History verbatim ✔ · □ Patterns — consistent ✔
**RESULT: PASS**
