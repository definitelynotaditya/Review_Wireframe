# S5 · New / Edit Booking — Guided Flow (drawer) [wireframe]

> Calendar-first, engine-backed (FD-13). Staff supply constraints; the engine returns rooms (FD-22 — no manual room scanning). Drawer C7; picker C10; recurrence C11; member lookup C12. Spec: [Wireframe_Specification §S5](../Wireframe_Specification.md).

## Stepper (right drawer over Bookings list)

```
┌─ New Booking ───────────────────────────────────────────── ✕ ┐
│  ①Date ─ ②Duration ─ ③Slot ─ ④Seats ─ ⑤Rooms ─ ⑥Details ─ ⑦Confirm │  ← progress
│───────────────────────────────────────────────────────────────│
│  STEP 1 · Date          〔 14/07/2026 ▾ 〕  (≤ 6 months, BR-A4) │
│  STEP 2 · Duration      ( 1h )( 2h )( •Half-Day )( Full-Day )   │
│  STEP 3 · Time Slot     ( 13:00 )( •14:00 )( 15:00 ) … hourly   │
│  STEP 4 · Number Seats  〔 6 〕                                 │
│───────────────────────────────────────────────────────────────│
│                                   [ Back ]        [ Next ]      │
└───────────────────────────────────────────────────────────────┘
```

## Step 5 — Available Rooms (engine result)

```
│  STEP 5 · Available Rooms   (capacity ≥ 6 · free 14:00–18:00 · not maint · not booked) │
│  ┌ R06 · 6 seats  est ₹— ┐ ┌ R08 · 8 seats  est ₹— ┐ ┌ R10 · 10 seats est ₹— ┐        │
│  │       [ Select ]       │ │       [ •Select ]      │ │        [ Select ]     │        │
│  └────────────────────────┘ └────────────────────────┘ └───────────────────────┘        │
│  (4-seaters excluded — below required seats, BR-A3)                                     │
```
Auto-estimate per room from Pricing Calculator (BR-P2, e.g. Half-Day + extra hour).

## Step 6 — Booking Details

```
│  Type   ( •Member )( Guest )                                                            │
│  ── Member ──                                                                            │
│  Member ID 〔 M-1024 〕 [ Lookup ]  → ✓ Priya Mehta · Q Pay ✓  (name auto-filled)       │
│  Mobile (opt) 〔 〕   No. of Guests (opt) 〔 6 〕                                         │
│  ── Recurring ──                                                                         │
│  ☐ Recurring   Pattern ( Weekly )( Monthly )   Until 〔 dd/mm/yyyy ≤6mo 〕               │
│  Booking channel ( Phone )( •WhatsApp )( Email )                                         │
```

## Step 7 — Confirm

```
│  R08 · 8 seats · 14 Jul · 14:00–18:00 (Half-Day) · est ₹—                               │
│  Member: Priya Mehta (M-1024) · 6 pax · via WhatsApp                                     │
│                                   [ Back ]        [ Confirm Booking ]*                   │
```

## Edge / failure states

**No rooms match (Step 5 empty):**
```
│  STEP 5 · Available Rooms                                                                │
│           — no rooms match these constraints —                                          │
│           [ Adjust constraints ]  (→ back to Step 1–4)                                   │
```
**Invalid Member ID (Step 6 — blocks Confirm, BR-MEM3):**
```
│  Member ID 〔 M-9999 〕 [ Lookup ]  → ⚠ Invalid Member ID — booking cannot proceed       │
│  [ Confirm Booking ] disabled                                                           │
```
**Conflict at save (first-save-wins, BR-CF1/CF2):**
```
┌ Booking conflict ─────────────────────────── ✕ ┐
│ R08 was just booked for this slot by another    │
│ manager. First save wins.                       │
│   [ Pick another room ]     [ Override ⚠ ]      │   ← Override = deliberate, logged (BR-CF3)
└─────────────────────────────────────────────────┘
```
**Recurring clash summary (post-save, BR-R4):**
```
✓ Booking series created.  ⚠ 2 of 12 occurrences clash → flagged for staff (see Bookings).
```

## States
- **Loading:** Step 5 availability skeleton (`⟳`) while engine runs.
- **Empty:** Step 5 no-match (above).
- **Success:** toast + drawer closes + Bookings list updates.
- **Error/Failure:** step-level inline `⚠`, entered values preserved; conflict handled via modal above.
- **Notification:** N/A (creation flow) — marked N/A.
- **Maintenance:** rooms under maintenance are **excluded** from Step 5 results (BR-A2/M4) — the "state" is expressed by absence + note.
- **Permission:** global (§0.2).

---

### Traceability
- **States:** step validation, availability searching/results/no-match, member found/invalid, save idle/saving/conflict/success, recurring clash.
- **Business rules:** BR-A2/A3 (availability + seats≥), BR-P1..P5 (auto pricing), BR-B2..B4 (fields/sequence), BR-MEM2/MEM3 (auto-fill/invalid-blocks), BR-R1..R4 (recurrence+clash), BR-CF1/CF2/CF3 (first-save-wins+override).
- **Components:** Availability Slot Picker 🔵, Recurrence Control 🔵, Member Lookup 🔵, Room result cards 🟡, Override modal 🟢, Drawer 🟡.
- **Flows:** [User_Flows §1](../User_Flows.md#1-booking-flow-calendar-first).

### CHECKLIST — S5 New Booking
□ Business rules — BR-A2/A3, BR-P*, BR-B*, BR-MEM*, BR-R*, BR-CF* ✔
□ State machine — booking creation path (→ Booked) ✔ · □ User flow — full 7-step sequence + exits ✔
□ Empty (no-match) ✔ · □ Loading (availability) ✔ · □ Error (step + conflict) ✔ · □ Success ✔
□ Notification — N/A (create flow) ✔ · □ Maintenance — rooms excluded from results ✔ · □ Permission ✔
□ Edge cases — no-match, invalid member (blocks), conflict/override, recurring clash ✔
□ Navigation — drawer over list; Back/Cancel; no nav-away ✔ · □ CTA hierarchy — one Next/Confirm per step ✔
□ Component reuse — engine components new; drawer/modal reused ✔ · □ Patterns — guided flow (Principle 4a, FD-22) ✔
**RESULT: PASS**
