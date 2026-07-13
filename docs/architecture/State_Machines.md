# State Machines & Lifecycles — Meeting Room

> **Status:** Canonical · **Version:** 3.0 · **Last updated:** 2026-07-13
> **Goal:** an engineer implements backend state logic from this document alone. Every transition names its **trigger** and **actor** — **[G]** guest/LG, **[S]** staff/dashboard, **[T]** system/time.

## Purpose

Formalize states, transitions, triggers, and guards for every stateful Meeting Room concept. Updated for V3: the canonical Room lifecycle now includes **Ending Soon** and **Billing**; meetings **never auto-end**; extension is dashboard-authoritative; maintenance is a 24h interrupt.

## Scope

Backend state logic for: **Room, Booking, Meeting Session, Service Request, F&B Order, Extension, Bill/Payment, Notification**. UI representation is in [Screen_Inventory](../ux/Screen_Inventory.md); guards are the `BR-*` rules in [Business_Rules](../product/Business_Rules.md).

## Dependencies

[Business_Rules](../product/Business_Rules.md) · [Founder_Decision_Log](../product/Founder_Decision_Log.md) · [Domain_Model](Domain_Model.md)

## Assumptions

Transitions tagged **(assumed)** need confirmation (see [REPOSITORY_AUDIT](../REPOSITORY_AUDIT.md#outstanding-questions)).

---

## 1. Room lifecycle (canonical) — FD-24

```mermaid
stateDiagram-v2
    [*] --> Available
    Available --> Reserved: [T] scheduled slot start (BR-S1)
    Reserved --> InUse: [G] Start Meeting on LG (BR-S2)
    InUse --> EndingSoon: [T] 10 min before end (BR-S3)
    EndingSoon --> InUse: [S] extend meeting (BR-E1)
    InUse --> Billing: [G] Bill Request / [S] Generate Bill (BR-S4)
    EndingSoon --> Billing: [G] Bill Request / [S] Generate Bill
    Billing --> Available: [S] confirm payment / End Meeting (BR-END3)
    InUse --> Available: [S]/[G] End Meeting (manual, no bill)
    EndingSoon --> Available: [S]/[G] End Meeting
    Reserved --> Available: [S] cancel / no-show reroute (assumed)

    Available --> UnderMaintenance: [S] Management marks maintenance (BR-M1)
    UnderMaintenance --> Available: [S] Management clears maintenance
    note right of UnderMaintenance
      INTERRUPT STATE (FD-14):
      • existing bookings remain (manual reroute, BR-M2)
      • new bookings blocked 24h from start (BR-M3)
    end note
    note right of Billing
      Meetings NEVER auto-end (BR-END1).
      On end → Available immediately + show next booking (BR-END4).
    end note
```

| From | To | Trigger | Actor |
|---|---|---|---|
| Available | Reserved | scheduled slot start time | [T] |
| Reserved | In-Use | Start Meeting on LG | [G] |
| In-Use | Ending Soon | 10 min before end | [T] |
| Ending Soon | In-Use | extension applied | [S] |
| In-Use / Ending Soon | Billing | bill requested / generated | [G]/[S] |
| Billing | Available | payment confirmed / meeting ended | [S] |
| In-Use / Ending Soon | Available | End Meeting (manual, no bill) | [S]/[G] |
| Available ↔ Under Maintenance | interrupt | management toggle | [S] |

## 2. Booking lifecycle

```mermaid
stateDiagram-v2
    [*] --> Booked: [S] create booking (first-save-wins, BR-CF1)
    Booked --> Rescheduled: [S] modify → Booked
    Rescheduled --> Booked
    Booked --> Cancelled: [S] cancel (BR-C1)
    Booked --> Active: [G] Start Meeting (session opens)
    Active --> Completed: meeting ends (BR-END2)
    Booked --> Rerouted: [S] maintenance manual reroute (BR-M2)
    Booked --> NoShow: [T] slot elapsed, never started (assumed)
    Cancelled --> [*]
    Completed --> [*]
    Rerouted --> Booked
    NoShow --> [*]
    note right of Booked
      Concurrent save → loser rejected (BR-CF1).
      Manual override can force-book (BR-CF2).
      Recurring: each occurrence runs this lifecycle;
      clashing occurrence is Flagged (BR-R4).
    end note
```

## 3. Meeting Session lifecycle

```mermaid
stateDiagram-v2
    [*] --> Open: [G] Start Meeting (BR-S2)
    Open --> Open: accumulate activities
    Open --> EndingSoon: [T] 10 min before end (BR-S3)
    EndingSoon --> Extended: [S] extend +30 (BR-E1)
    Extended --> Open
    Open --> Billing: [G]/[S] bill (BR-S4)
    EndingSoon --> Billing: [G]/[S] bill
    Billing --> Closed: [S] confirm payment (BR-PAY6)
    Open --> Closed: [S]/[G] End Meeting (manual)
    EndingSoon --> Closed: [S]/[G] End Meeting
    Closed --> [*]
    note right of Closed
      No auto-close (BR-END1). Management is notified at
      end time and closes explicitly, or guest ends on LG.
    end note
```

## 4. Service Request lifecycle (one pattern) — BR-SR*

Applies to **Assistance, IT Support, Power Bank, Other Service** (single workflow, FD-22). F&B and Extension are variants (§5, §6).

```mermaid
stateDiagram-v2
    [*] --> Initiated: [G] tap request
    Initiated --> Cancelled: [G] cancel within 3s (BR-SR2)
    Initiated --> Pending: [T] 3s elapsed → sent (BR-SR3)
    Pending --> Escalated: [T] unattended > 1 min (BR-SR4)
    Escalated --> Pending
    Pending --> Complete: [S] Accept (BR-SR5)
    Escalated --> Complete: [S] Accept
    Cancelled --> [*]
    Complete --> [*]
    note right of Escalated
      Escalated = bell + animated CTA (dashboard) + smartwatch.
      Response time (Initiated→Complete) recorded (BR-SR6).
    end note
```

| Variant | Closure action |
|---|---|
| Assistance / IT Support / Power Bank / Other | **Accept** |
| F&B Order | **Order Punched** (staff may edit lines first) |
| Extension request (from LG) | **Seen** (then management extends via dashboard) |

## 5. F&B Order lifecycle

```mermaid
stateDiagram-v2
    [*] --> Building: [G] add items to cart
    Building --> Placed: [G] place order (BR-F2)
    Placed --> UnderReview: [S] View Order
    UnderReview --> UnderReview: [S] add/remove/qty/verbal (BR-F3)
    Placed --> Escalated: [T] unattended > 1 min (BR-F5)
    Escalated --> UnderReview
    UnderReview --> Punched: [S] Order Punched (BR-F4)
    Punched --> [*]
```

## 6. Extension lifecycle — FD-17

Two paths. **Authoritative** (dashboard) vs **request** (LG).

```mermaid
stateDiagram-v2
    state "Dashboard extension (authoritative)" as DA {
      [*] --> ExtendClicked: [S] Extend Meeting +30 (BR-E1)
      ExtendClicked --> Applied: end time updated immediately + slot re-blocked (BR-E4)
      ExtendClicked --> Blocked: next slot/maintenance conflict → needs override (BR-E2)
      Blocked --> Applied: [S] override (BR-CF2)
      Applied --> [*]
    }
    state "LG extension request (notify only)" as LG {
      [*] --> Requested: [G] Extend on LG (BR-E3)
      Requested --> Seen: [S] click Seen → closes
      Seen --> [*]
      note right of Seen : management then extends via dashboard (DA)
    }
```

Guard BR-E2: extension only if the room is free for the extended window; otherwise override or refuse. Future: direct LG extension (BR-E5).

## 7. Bill / Payment lifecycle

```mermaid
stateDiagram-v2
    [*] --> BillRequested: [G] Bill Request + choose mode (BR-PAY2)
    BillRequested --> RatingCaptured: [G] rate Quorum + LUXEGENIE (BR-PAY4)
    RatingCaptured --> AmountEntered: [S] enter POS/Touche amount (BR-PAY1) → room=Billing
    AmountEntered --> InstructionsShown: [T] LG shows per-mode instructions
    InstructionsShown --> PaymentConfirmed: [S] confirm payment (BR-PAY5)
    PaymentConfirmed --> MeetingClosed: room → Available + next booking shown (BR-END3/4)
    MeetingClosed --> [*]
    note right of BillRequested
      Also reachable via manual closure (BR-END5):
      [S] Generate Bill without a guest bill request.
    end note
```

Q Pay only for members (BR-PAY7). Dashboard records only (BR-PAY5).

## 8. Notification lifecycle — FD-19

```mermaid
stateDiagram-v2
    [*] --> Scheduled
    Scheduled --> Fired: [T] condition met (end-10min / unattended>1min / meeting-ended)
    Fired --> Delivered: dashboard + staff smartwatch (BR-N1)
    Delivered --> Acknowledged: [S] act / [T] auto-clear
    Acknowledged --> [*]
    note right of Delivered : Future — RF transport (BR-N5)
```

## 9. Cross-entity happy path (sequence)

```mermaid
sequenceDiagram
    participant T as Time
    participant API as Backend
    participant DB as Dashboard
    participant LG as LUXEGENIE
    participant G as Guest
    participant S as Staff
    T->>API: slot start → Room=Reserved
    API-->>DB: room-reserved
    API-->>LG: "Welcome to Quorum / Start Meeting"
    G->>LG: Start Meeting
    LG->>API: meeting-started → Room=InUse, Session Open
    G->>LG: Services → Power Bank
    LG->>API: request Pending
    API-->>DB: card "Power Bank Requested" (+shake+watch after 1 min)
    S->>API: Accept → Complete
    T->>API: end-10min → Room=EndingSoon
    API-->>DB: "Ending Soon"; API-->>S: smartwatch
    Note over G,S: meeting does NOT auto-end (BR-END1)
    G->>LG: Bill Request + mode + ratings
    S->>API: enter POS amount → Room=Billing
    API-->>LG: total + per-mode instruction
    G->>G: pays externally
    S->>API: confirm payment → Room=Available + show next booking
```

## Future Work

- Confirm no-show handling, reserved-timing reconciliation (BR-S1), maintenance-reroute mechanics.

## Related Documents

- [Business_Rules](../product/Business_Rules.md) · [Domain_Model](Domain_Model.md) · [RealTime_And_Sync](RealTime_And_Sync.md) · [Data_Model](../engineering/Data_Model.md) · [User_Flows](../ux/User_Flows.md)
