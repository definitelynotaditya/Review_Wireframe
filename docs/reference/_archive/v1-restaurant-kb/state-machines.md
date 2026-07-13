# State Machines & Lifecycles

Tag key: **Observed** states are seen in data/UI; **Inferred** states are reasoned from adjacent evidence (tabs, actions, field names).

## Table occupancy

```mermaid
stateDiagram-v2
    [*] --> Vacant
    Vacant --> Reserved: reservation alloted
    Reserved --> Allotted: guests seated (session opens)
    Vacant --> Allotted: walk-in seated
    Allotted --> Vacant: session closed / table turned
    Reserved --> Vacant: reservation cancelled / no-show
```
- **Observed** values: `table_status ∈ {vacant, alloted}`; Transfer-Sessions legend adds **Reserved** (🟣) and **Active** (🟢).
- Mapping: `vacant`=🟡, active session=🟢 Active, held by reservation=🟣 Reserved, `alloted`=UI red pill.

## Reservation

```mermaid
stateDiagram-v2
    [*] --> Booked: New Reservation
    Booked --> Alloted: assign table (Seat)
    Alloted --> Seated: guest arrives
    Seated --> Completed: session closed
    Booked --> Cancelled
    note right of Alloted : Only "alloted" observed in data;\nUpcoming/Today/Past tabs imply the rest
```

## Guest request / Activity

```mermaid
stateDiagram-v2
    [*] --> Requested: guest taps on LUXEGENIE
    Requested --> Pending: flag set on Table + notification
    Pending --> Complete: server responds (response_time recorded)
    Pending --> Cancelled: cancel_request_time elapses / guest cancels
    Complete --> [*]
```
- **Observed:** `activity_status: "complete"` with `response_time` in seconds.
- Device timeouts (`*_waiting_time`, `cancel_request_time`) bound these transitions.

## Session

```mermaid
stateDiagram-v2
    [*] --> Open: first activity / seating
    Open --> Open: accumulate activities
    Open --> Transferred: moved to another table (Transfer Sessions)
    Transferred --> Open
    Open --> Closed: bill paid / table turned
    Closed --> [*]
```
- A Session (`session_id`) spans a visit; **Transfer** re-points it to a new `table_id` without closing it.

## Power-bank amenity (Inferred sub-flow)

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Requested: power_bank_request=true
    Requested --> Issued: is_powerbank_issued=true
    Issued --> Idle: returned
```

## Device (LUXEGENIE)

```mermaid
stateDiagram-v2
    [*] --> Unassigned
    Unassigned --> Assigned: bind to table
    Assigned --> Unassigned: unbind
    Assigned --> Rebooting: Reboot
    Rebooting --> Assigned
    Assigned --> Off: Shutdown
    Off --> Assigned: power on
```
- **Observed:** Assigned/Unassigned tabs; Reboot/Shutdown (single + all). Battery is a live telemetry value, not a state.

## User (staff)

```mermaid
stateDiagram-v2
    [*] --> Active
    Active --> Inactive: deactivate (active=false)
    Inactive --> Active: reactivate
    Active --> Deleted: is_deleted=true
```
