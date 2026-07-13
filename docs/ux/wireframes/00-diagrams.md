# Architecture Diagrams (wireframe reference)

> **Phase 4 · Reference diagrams.** These complement the wireframes and are the shared mental model for building them. Canonical sources are cited; these are consolidated here so the wireframe set is self-contained.

Governed by [Wireframe_Principles](../Wireframe_Principles.md). Sources: [State_Machines](../../architecture/State_Machines.md), [Information_Architecture](../../architecture/Information_Architecture.md), [Dashboard_Architecture](../../architecture/Dashboard_Architecture.md), [User_Flows](../User_Flows.md).

---

## 1. Navigation map (screens, drawers, modals)

```mermaid
graph TD
    Login[/login/] -->|auth| Board
    subgraph Shell["App Shell (S0): sidebar + top bar"]
      Board["S1 Meeting Rooms — Live Board (landing)"]
      Dash["S3 Operational Dashboard"]
      Bookings["S4 Bookings — List"]
      ManageRooms["S6 Manage Rooms"]
      FnB["S8 F&B Menu"]
      Members["S12 Members / Guests"]
      Devices["S16 LUXEGENIE Devices"]
      Users["S15 Users"]
      Settings["S17 Settings"]
    end
    Board -. drawer .-> Detail["S2 Room Detail"]
    Board -. drawer .-> Bill["S9 Bill / Payment"]
    Board -. drawer .-> Order["S10 F&B Order Review"]
    Board -. inline/panel .-> Ext["S11 Extension"]
    Detail -. opens .-> Bill
    Detail -. opens .-> Order
    Detail -. opens .-> Ext
    Bookings -. drawer .-> NewBk["S5 New / Edit Booking (guided)"]
    NewBk -. uses .-> Members
    ManageRooms -. modal .-> RoomEd["S7 Room Editor + Maintenance"]
    Dash -. button .-> History["S13 View History"]
    Bell(["Bell"]) -.-> Recent["S14 Recent Activities"]
    Members -. modal .-> CSV["CSV Import"]
    Settings --> S1p[Payment Modes]
    Settings --> S2p[Cancellation & Extension]
    Settings --> S3p[Reminders]
    Settings --> S4p[Pricing Policy]
    Settings --> S5p[Wi-Fi / Events / About]
```

- **Solid** = sidebar navigation. **Dotted** = overlay (drawer/modal/inline) — overlays never navigate away (Principle 15).
- Landing = **S1 Live Board** (room-first, FD-12).

## 2. Booking flow (calendar-first) — FD-13 / BR-A2/A3, BR-P*, BR-MEM*, BR-CF*

```mermaid
flowchart TD
    A[Bookings → ＋ New Booking] --> B[Step 1: Date]
    B --> C[Step 2: Duration]
    C --> D[Step 3: Time Slot]
    D --> E[Step 4: Number of Seats]
    E --> F{{Availability Engine + Seat Filter + Pricing Calculator}}
    F --> G[Step 5: Available Rooms + rate/estimate]
    G -->|no match| B
    G --> H[Step 6: Booking Details]
    H --> I{Type}
    I -->|Member| J[Member ID → lookup]
    J -->|invalid| JX[⚠ Blocked — cannot proceed]
    J -->|valid| K[Auto-fill details]
    I -->|Guest| L[Guest Name + Mobile]
    K --> M[☐ Recurring? Weekly/Monthly ≤6mo]
    L --> M
    M --> N[Step 7: Confirm]
    N --> O{Save}
    O -->|first-save| P[✓ Booking created]
    O -->|conflict| Q[Override? BR-CF2]
    P --> R{Recurring clash?}
    R -->|yes| S[⚠ N occurrences flagged]
```

## 3. Room lifecycle — FD-24 / BR-S* / BR-M* / BR-END*

```mermaid
stateDiagram-v2
    [*] --> Available
    Available --> Reserved: [T] slot start (BR-S1)
    Reserved --> InUse: [G] Start Meeting (BR-S2)
    InUse --> EndingSoon: [T] -10 min (BR-S3)
    EndingSoon --> InUse: [S] Extend +30 (BR-E1)
    InUse --> Billing: bill (BR-S4)
    EndingSoon --> Billing: bill
    Billing --> Available: [S] confirm payment / End Meeting (BR-END3)
    InUse --> Available: [S]/[G] End Meeting (manual)
    EndingSoon --> Available: [S]/[G] End Meeting
    Reserved --> Available: [S] cancel / no-show reroute
    Available --> UnderMaintenance: [S] mark (BR-M1)
    UnderMaintenance --> Available: [S] clear
    note right of UnderMaintenance: 24h new-booking block, existing kept + rerouted (BR-M2/M3)
    note right of Billing: NEVER auto-ends (BR-END1), on end show next booking (BR-END4)
```

## 4. Meeting (session) lifecycle — BR-S* / BR-END*

```mermaid
stateDiagram-v2
    [*] --> Open: [G] Start Meeting
    Open --> Open: accumulate activities (service / F&B / extension)
    Open --> EndingSoon: [T] -10 min
    EndingSoon --> Extended: [S] +30 → Open
    Open --> Billing: bill requested / generated
    EndingSoon --> Billing
    Billing --> Closed: [S] confirm payment
    Open --> Closed: [S]/[G] End Meeting (manual)
    EndingSoon --> Closed: [S]/[G] End Meeting
    Closed --> [*]
    note right of Closed: no auto-close, management notified at end time (BR-END1)
```

## 5. Service-request lifecycle (one pattern) — BR-SR*

```mermaid
stateDiagram-v2
    [*] --> Initiated: [G] tap
    Initiated --> Cancelled: [G] cancel < 3s
    Initiated --> Pending: [T] sent
    Pending --> Escalated: [T] > 1 min → bell + ⌚ + shake
    Escalated --> Pending
    Pending --> Complete: [S] Accept
    Escalated --> Complete: [S] Accept
    Cancelled --> [*]
    Complete --> [*]
```
Variants: F&B closes on **Order Punched**; LG extension request closes on **Seen** (then dashboard extends).

## 6. Dashboard hierarchy (room-first) — FD-12 / FD-20

```mermaid
graph TD
    subgraph LiveBoard["S1 Live Board (landing) — operational radar"]
      Attn["① Attention rooms (requests, escalations, ended-unbilled) — sorted top"]
      Occ["② Occupied / In-Use / Ending Soon / Billing"]
      Res["③ Reserved (upcoming today)"]
      Avail["④ Available"]
      Maint["⑤ Under Maintenance"]
    end
    subgraph Dashboard["S3 Operational Dashboard (today only)"]
      K1["Today's Status (counts by state)"]
      K2["Operational Attention (open+escalated, unbilled)"]
      K3["Today's Bookings (timeline / next)"]
      K4["→ View History (analytics off the live path)"]
    end
    LiveBoard --> Dashboard
    K4 --> Hist["S13 View History: revenue, ratings, durations, payment-mode %"]
```

## 7. Screen-to-state coverage (what each live screen must render)

```mermaid
graph LR
    RoomStates["Room states: Available · Reserved · In-Use · Ending Soon · Billing · Under Maintenance"]
    RoomStates --> S1[S1 Live Board: all]
    RoomStates --> S2[S2 Room Detail: all]
    RoomStates --> S3[S3 Dashboard: counts]
    Reqs["Requests: Assistance · IT · Power Bank · Other · F&B · Extension · Bill"]
    Reqs --> S1
    Reqs --> S14[S14 Recent Activities]
```

## Related

- [Wireframe_Specification](../Wireframe_Specification.md) · [Wireframe_Handoff](../Wireframe_Handoff.md) · canonical [State_Machines](../../architecture/State_Machines.md)
