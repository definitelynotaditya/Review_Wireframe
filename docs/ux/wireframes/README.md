# Wireframes — Engineer-First Reference Set

> **Phase 4 deliverable.** Low-fidelity, grayscale, structure-only wireframes that translate the frozen V3 product docs. Not visual design. Built to map 1:1 to Figma frames in the next phase.

Read the governing docs first: [Wireframe_Principles](../Wireframe_Principles.md) · [Wireframe_Specification](../Wireframe_Specification.md) · [Wireframe_Checklist](../Wireframe_Checklist.md) · [Wireframe_Handoff](../Wireframe_Handoff.md).

## Index (build order)

| # | File | Screen | Type |
|---|---|---|---|
| — | [00-diagrams.md](00-diagrams.md) | Architecture diagrams (nav, booking, lifecycles, hierarchy) | reference |
| — | [99-components.md](99-components.md) | Component appendix (drawn once) | components |
| S0 | [00-app-shell.md](00-app-shell.md) | App Shell | frame |
| S1 | [01-live-board.md](01-live-board.md) | Meeting Rooms — Live Board (landing) | page |
| S2 | [02-room-detail.md](02-room-detail.md) | Meeting Room Detail | drawer |
| S3 | [03-dashboard.md](03-dashboard.md) | Operational Dashboard (KPIs) | page |
| S4 | [04-bookings-list.md](04-bookings-list.md) | Bookings — List | page |
| S5 | [05-new-booking.md](05-new-booking.md) | New / Edit Booking (guided) | drawer |
| S6 | [06-manage-rooms.md](06-manage-rooms.md) | Manage Rooms | page |
| S7 | [07-room-editor-maintenance.md](07-room-editor-maintenance.md) | Room Editor + Maintenance | modal |
| S8 | [08-fnb-menu.md](08-fnb-menu.md) | F&B Menu | page |
| S9 | [09-bill-payment.md](09-bill-payment.md) | Bill / Payment Panel | drawer |
| S10 | [10-fnb-order-review.md](10-fnb-order-review.md) | F&B Order Review | drawer |
| S11 | [11-extension.md](11-extension.md) | Extension Control | inline/panel |
| S12 | [12-members.md](12-members.md) | Members / Guests + CSV Import | page+modal |
| S13 | [13-view-history.md](13-view-history.md) | View History | page |
| S14 | [14-recent-activities.md](14-recent-activities.md) | Recent Activities | page |
| S15 | [15-users.md](15-users.md) | Users | page |
| S16 | [16-luxegenie-devices.md](16-luxegenie-devices.md) | LUXEGENIE Devices | page |
| S17 | [17-settings.md](17-settings.md) | Settings | page |
| S18 | [18-luxegenie-inroom.md](18-luxegenie-inroom.md) | LUXEGENIE In-Room Screens | device |

## How to read a wireframe file

Each screen file contains: the **default** frame + all applicable **states** (empty/loading/error/success/notification/maintenance) as separate ASCII frames, a **Traceability** block (states · BR-* · components · flows), and a filled **Per-Screen Checklist** ending in PASS.

Notation legend: [Wireframe_Principles Part C](../Wireframe_Principles.md#part-c--notation-standard-applies-to-every-ascii-wireframe).

## Coverage

All 18 spec screens + App Shell + component appendix + 7 Mermaid diagrams. Every file passes its checklist (see [Final QA](../Wireframe_Checklist.md#repository-wide-qa-run-once-at-the-end)).
