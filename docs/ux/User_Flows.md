# User Flows — Meeting Room

> **Status:** Canonical · **Version:** 3.0 · **Last updated:** 2026-07-13
> V3: booking is the **calendar-first sequence** (Date→Duration→Slot→Seats→rooms); extension has a **dashboard-authoritative** path; meetings **never auto-end**; maintenance flow added.

## Purpose

Step-by-step end-to-end flows for every important Meeting Room task, spanning guest (LUXEGENIE) and staff (dashboard) surfaces. These are the sequences engineering wires up and design storyboards.

## Scope

Booking, meeting start, service request, F&B, extension, billing/payment, end-of-meeting. Backend state detail is in [State_Machines](../architecture/State_Machines.md); rules in [Business_Rules](../product/Business_Rules.md).

## Dependencies

[MeetingRoom_Product_Spec](../product/MeetingRoom_Product_Spec.md) · [State_Machines](../architecture/State_Machines.md) · [Business_Rules](../product/Business_Rules.md)

## Assumptions

Steps marked **(assumed)** need confirmation.

---

## 1. Booking flow (calendar-first) — FD-13

The guided sequence: **Date → Duration → Time Slot → Number of Seats → Available Rooms → Details → Confirm.** The engine does the matching (staff never scan a room list — FD-22).

```mermaid
flowchart TD
    A[Booking arrives via WhatsApp/Phone/Email] --> B[Staff: Bookings → New Booking]
    B --> C[Select Date]
    C --> D[Select Duration]
    D --> E[Select Time Slot]
    E --> F[Select Number of Seats]
    F --> G[Availability Engine + Seat Filter + Pricing Calculator]
    G --> H{Matching rooms?<br/>capacity≥seats AND free whole duration<br/>AND not maintenance AND not booked}
    H -- No --> C
    H -- Yes --> I[Display available rooms with rates]
    I --> J{Booking type}
    J -- Member --> K[Enter Member ID → lookup]
    K --> K2{Valid?}
    K2 -- No --> KX[Blocked: booking cannot proceed - BR-MEM3]
    K2 -- Yes --> L[Auto-fill member details; Q Pay eligible]
    J -- Guest --> M[Enter Guest Name + Mobile]
    L --> N[Booking Details + Recurring? Weekly/Monthly ≤6mo]
    M --> N
    N --> O[Confirm]
    O --> P{Save}
    P -- First save --> Q[Booking saved - booking-created]
    P -- Conflict --> R[First-save-wins: rejected → offer manual Override BR-CF2]
    Q --> S{Recurring clash?}
    S -- Yes --> T[Flag clashing occurrences for staff BR-R4]
```

Rules: BR-A2..A6, BR-B1..B6, BR-R1..R4, BR-P1..P5, BR-CF1..CF3, BR-MEM2/MEM3.

## 2. Meeting start flow

```mermaid
sequenceDiagram
    participant T as Time
    participant API as Backend
    participant DB as Dashboard
    participant LG as LUXEGENIE
    participant G as Guest
    T->>API: slot start time reached
    API->>API: Room → Reserved (BR-S1)
    API-->>DB: room-reserved (card shows Reserved)
    API-->>LG: Screen 1 "Welcome to Quorum / Reserved for {name}"
    G->>LG: tap Start Meeting
    LG->>API: meeting-started
    API->>API: Room → In-Use, Session Open (BR-S2)
    API-->>DB: card shows In-Use
    API-->>LG: Screen 2 in-meeting home
```

## 3. Service request flow (one pattern) — Assistance / IT Support / Power Bank / Other

```mermaid
flowchart TD
    A[Guest taps request on LG] --> B["'…shortly' + Cancel (3s)"]
    B --> C{Cancelled in 3s?}
    C -- Yes --> D[LG returns home; no DB effect]
    C -- No --> E[Request sent: Pending]
    E --> F[DB room card: '{Type} Requested' + Accept]
    E --> G[LG: '…shortly' + home; auto-home in 10s]
    F --> H{Accepted within 1 min?}
    H -- No --> I[Accept button shakes + bell]
    I --> F
    H -- Yes --> J[Staff Accept → Complete; response_time logged]
    J --> K[No effect on LG]
```

Rules: BR-SR1..SR6.

## 4. F&B order flow

```mermaid
flowchart TD
    A[Guest: F&B Order on LG] --> B[Filters All/Veg/Non-Veg + categories]
    B --> C[Add items to cart]
    C --> D[Review cart → Place Order]
    D --> E[LG: 'served shortly' + home]
    D --> F[DB card: 'F&B Order Requested' + View Order]
    F --> G[Staff opens order detail]
    G --> H[Edit items / qty / add verbal orders]
    H --> I[Order Punched → closes]
    F --> J{Accepted within 1 min?}
    J -- No --> K[shake + bell]
```

Rules: BR-F1..F6. Menu = curated meeting-room catalogue (FD-05).

## 5. Extension flows — FD-17 (two paths)

**5a. Authoritative — Dashboard (management acts directly):**
```mermaid
flowchart TD
    A[Manager: room card → Extend Meeting] --> B[+30 min]
    B --> C{Room free for extended window? BR-E2}
    C -- Yes --> D[End time updates IMMEDIATELY; slot re-blocked; availability updated]
    C -- No --> E[Blocked → manual Override BR-CF2 or refuse]
    E -- Override --> D
```

**5b. Request — LUXEGENIE (guest asks, management performs):**
```mermaid
flowchart TD
    A[Guest: Services → Extend Meeting] --> B[Choose duration, Confirm]
    B --> C[LG: 'management will contact you shortly']
    C --> D[DB card: 'Meeting Extension Requested + Duration + Seen']
    D --> E[Staff clicks Seen → request closes]
    E --> F[Management extends via 5a if appropriate]
```

Rules: BR-E1..E5. Future: direct LG extension that blocks the calendar automatically (BR-E5).

## 6. Billing & payment flow

```mermaid
sequenceDiagram
    participant G as Guest
    participant LG as LUXEGENIE
    participant API as Backend
    participant DB as Dashboard
    participant S as Staff
    G->>LG: Bill Request → choose one mode
    LG->>API: bill-requested (mode)
    LG->>G: ask ratings (Quorum + LUXEGENIE)
    API-->>DB: card 'Bill Requested'
    S->>DB: enter POS amount
    DB->>API: updated-bill-amount
    API-->>LG: show Total + per-mode instruction
    G->>G: pays externally (Q Pay/Link/Scan/Card/Cash)
    S->>DB: confirm payment
    DB->>API: payment-confirmed
    API->>API: Session Closed, Room → Available + show next booking
    API-->>LG: Meeting Ended screen
```

Rules: BR-PAY1..PAY7. Q Pay only for members (BR-PAY7). Room → Billing while amount pending. Dashboard records, does not process (FD-06).

## 7. End-of-meeting flow — meetings NEVER auto-end (FD-21)

```mermaid
flowchart TD
    A[10 min before end] --> B[DB: 'Ending Soon' + smartwatch]
    A --> C[LG: Extend / Confirm / Cancel / Home]
    C --> D{Guest action?}
    D -- Extend --> E[Extension flow §5]
    D -- None --> F[Time passes]
    F --> G[Meeting does NOT auto-end BR-END1]
    G --> H[DB notifies Management 'meeting ended — action needed']
    H --> I{Management / Guest action}
    I -- End Meeting --> J[Room → Available immediately + show next booking]
    I -- Generate Bill --> K[Billing flow §6 → close]
    I -- Extend --> E
    B2[Guest may End Meeting on LG at any time] --> J
```

**Manual closure (guest left without billing/ending — Flow §6):** Management can End Meeting, Generate Bill, Confirm Payment, Mark Room Available from the dashboard. Rules: BR-END1..END5, BR-N1..N2.

## 8. Maintenance flow — FD-14

```mermaid
flowchart TD
    A[Management: room → Mark Under Maintenance] --> B[Room → Under Maintenance interrupt]
    B --> C[New bookings blocked 24h from now BR-M3]
    B --> D{Existing bookings on this room?}
    D -- Yes --> E[List affected bookings → Management manually reroutes BR-M2]
    D -- No --> F[Done]
    B --> G[Management clears maintenance → room → Available]
```

Rules: BR-M1..M4.

## Future Work

- Confirm no-show handling and the maintenance-reroute UX (assisted vs fully manual).
- Add the recurring-clash resolution flow UX (FD-04 open question).

## Related Documents

- [State_Machines](../architecture/State_Machines.md) · [Screen_Inventory](Screen_Inventory.md) · [Business_Rules](../product/Business_Rules.md) · [MeetingRoom_Product_Spec](../product/MeetingRoom_Product_Spec.md)
