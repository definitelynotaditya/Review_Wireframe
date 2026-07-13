# S18 · LUXEGENIE In-Room Screens (device) [wireframe]

> Guest-facing device screens that **drive** the dashboard events. Companion set; validates that every device state has a matching dashboard state. Spec: [Wireframe_Specification §S18](../Wireframe_Specification.md). Flow: [Cleaned Updated Features Flow](../../reference/source-inputs/Meeting_Room_Features_Flow_v3_CANONICAL.md).

Device is a tablet (portrait), pre-configured per room. No management permission model (guest device).

## B1 · Reserved / idle  (room {Reserved})
```
┌───────────────────────────┐
│      Welcome to Quorum     │
│                           │
│   Reserved for:           │
│      Priya Mehta          │
│   14:00 – 15:00 (Half-Day)│
│   Meeting Room: R03       │
│                           │
│     ┌───────────────┐     │
│     │ [ Start Meeting]     │  → dashboard: Reserved → In-Use (BR-S2)
│     └───────────────┘     │
└───────────────────────────┘
   shown from ~10 min before start; Start available at/after slot start
```

## B2 · In-meeting home  (room {In-Use})
```
┌───────────────────────────┐
│   Welcome, Priya          │
│  ┌──────────┐ ┌──────────┐ │
│  │ Tap Wi-Fi│ │Assistance│ │   Wi-Fi / Explore / Review = no DB action
│  ├──────────┤ ├──────────┤ │
│  │ F&B Order│ │ Services │ │
│  ├──────────┤ ├──────────┤ │
│  │ Explore  │ │Bill Reqst│ │
│  ├──────────┤ └──────────┘ │
│  │ Review Q │   Room: R03  │
│  └──────────┘              │
└───────────────────────────┘
```

## B3 · Tap actions
**B3a Wi-Fi (no DB):** `QR + username/password`.
**B3b Service request (one pattern — Assistance/IT/Power Bank/Other, BR-SR1..SR5):**
```
tap → "Someone will assist you shortly"  [ Cancel (3s) ]
     → (not cancelled) "Request Sent"  [ Home ]  (auto-home 10s)
     → dashboard card: {… Requested} + [ Accept ] ; >1 min → shake + bell + ⌚
```
**B3c F&B Order (BR-F2):**
```
( All )( Veg )( Non-Veg )   categories →   items [ + ]     🛒 cart
🛒 → line items → [ Place Order ] → "served shortly" [ Home ]
   → dashboard: {F&B Order Requested} + [ View Order ] (S10)
```
**B3d Services:** IT Support · Power Bank · **Extend Meeting** (guest request → "management will contact you"; dashboard {Extension Requested}+[Seen], BR-E3) · Other Service.
**B3e Explore (no DB):** 2–3 upcoming events.
**B3f Bill Request (BR-PAY):**
```
"How would you like to pay?"  ( Q Pay* )( Scan )( Link )( Card )( Cash )   *member only
 → "Bill on the way" + rate: Quorum ★  ·  LUXEGENIE ★
 → (staff enters amount) → per-mode: total + instruction (QR / wait / host on the way)
```

## B4 · End-of-meeting (NO auto-end, BR-END1)
```
Ending Soon (−10m):  [ Extend ] [ Confirm ] [ Cancel ] [ Home ]
   ↳ no action → meeting does NOT end; dashboard notifies management
Guest may [ End Meeting ] anytime.
Meeting Ended:  Total ₹— · QR · [ other mode ] · "host on the way" · rate ★ (optional)
```

## States (device)
- **Loading/offline:** device shows connecting/offline placeholder (Wi-Fi dependence; RF is future FD-19).
- **Reserved-block:** if room is Under Maintenance, device shows idle/not-bookable (managed dashboard-side).
- **Success/Error:** request confirmations / retry.
- **Permission:** N/A (guest device — no management auth).

---

### Traceability
- **States:** Reserved/idle, in-meeting home, per-tap-action, ending-soon, ended.
- **Business rules:** BR-S1/S2 (reserved/start), BR-SR1..SR5 (service pattern), BR-F2 (F&B), BR-E3 (extend request), BR-PAY1..PAY7 (bill/ratings), BR-END1 (no auto-end — guest End Meeting).
- **Components:** device screen frames 🔵 (simple; mirror flow §5.2/§5.3/§5.6).
- **Flows:** every dashboard runtime surface (S9/S10/S11) has a matching device state here.

### CHECKLIST — S18 LUXEGENIE In-Room
□ Business rules — BR-S*, BR-SR*, BR-F2, BR-E3, BR-PAY*, BR-END1 ✔ · □ State machine — device states map to room states ✔ · □ User flow — start→request→bill→end ✔
□ Empty — N/A (device) ✔ · □ Loading/offline ✔ · □ Error (request retry) ✔ · □ Success (confirmations) ✔ · □ Notification — device prompts ✔ · □ Maintenance (reserved-block/idle) ✔ · □ Permission — N/A (guest) ✔
□ Edge cases — guest inaction at end (no auto-close), 3s cancel, 10s auto-home ✔ · □ Navigation — device home returns ✔
□ CTA hierarchy — one action per device screen ✔ · □ Reuse — mirrors restaurant LG family ✔ · □ Patterns — one service pattern (not repeated) ✔
**RESULT: PASS**
