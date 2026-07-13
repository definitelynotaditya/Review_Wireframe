# S7 · Room Editor + Maintenance (modal) [wireframe]

> Add/edit a room's identity, capacity, pricing bands; toggle maintenance with reroute. Modal C6. Spec: [Wireframe_Specification §S7](../Wireframe_Specification.md).

## Add / Edit

```
┌─ Add Room ─────────────────────────────────────── ✕ ┐
│  IDENTITY                                             │
│   Room number *  〔 R13 〕   Name 〔 Boardroom 〕     │
│   Sitting area  ▾ ( Floor 1 )   Capacity *  〔 8 〕   │
│  ──────────────────────────────────────────────────  │
│  PRICING (BR-P1)                                      │
│   Hourly ₹〔 〕   Half-Day ₹〔 〕   Full-Day ₹〔 〕   │
│  ──────────────────────────────────────────────────  │
│  DEVICE                                               │
│   LUXEGENIE  ▾ ( unassigned )                         │
│  ──────────────────────────────────────────────────  │
│                              [ Cancel ]   [ Save ]*   │
└───────────────────────────────────────────────────────┘
```

## Maintenance section (from `⋮ Mark Under Maintenance`) — BR-M1..M4

```
┌─ R11 · Under Maintenance ──────────────────────── ✕ ┐
│  ☑ Under Maintenance                                 │
│  ⚠ New bookings blocked for 24h (until 15 Jul 14:00) │  ← BR-M3
│  ──────────────────────────────────────────────────  │
│  EXISTING BOOKINGS TO REROUTE (kept, BR-M2)          │
│   • 14 Jul 15:00 · Sana (Guest)     [ Reroute ]      │
│   • 15 Jul 10:00 · Dev (Member)     [ Reroute ]      │
│  ──────────────────────────────────────────────────  │
│                       [ Cancel ]  [ Confirm Maintenance ]│
└───────────────────────────────────────────────────────┘
```
- Existing bookings are **not** cancelled; each offers `[ Reroute ]` (→ opens S5 constrained to move that booking).
- `[ Clear ]` (from S6/S1) removes maintenance and unblocks.

## States
- **Loading:** affected-bookings list `⟳`. **Empty:** N/A (modal). 
- **Success:** save/confirm → toast + S6 list updates.
- **Error:** validation (blank pricing/capacity) inline; save fail → `⚠`, inputs kept.
- **Notification:** N/A. **Maintenance:** this modal *is* the maintenance control. **Permission:** global; management-authority confirm.

## Edge cases
Blank required fields → validation; maintenance with zero existing bookings → reroute list empty, just 24h block; re-marking already-maintained room.

---

### Traceability
- **States:** form valid/invalid; maintenance off/on(24h+reroute).
- **Business rules:** BR-P1 (bands), BR-M1..M4 (management-only, existing kept, 24h block, availability exclusion).
- **Components:** Add Room modal 🟡, Pricing inputs 🟡, Maintenance toggle + affected-bookings list 🔵.
- **Flows:** [User_Flows §8](../User_Flows.md#8-maintenance-flow--fd-14).

### CHECKLIST — S7 Room Editor + Maintenance
□ Business rules — BR-P1, BR-M1..M4 ✔ · □ State machine — active↔maintenance ✔ · □ User flow — add/edit; mark/clear maintenance + reroute ✔
□ Empty — N/A (modal) ✔ · □ Loading ✔ · □ Error (validation) ✔ · □ Success ✔ · □ Notification — N/A ✔ · □ Maintenance ✔ · □ Permission ✔
□ Edge cases — blank fields, no-bookings maintenance, re-mark ✔ · □ Navigation — modal; Reroute→S5 ✔
□ CTA hierarchy — Save/Confirm primary; Cancel secondary ✔ · □ Reuse — extends Add Table modal ✔ · □ Patterns — consistent ✔
**RESULT: PASS**
