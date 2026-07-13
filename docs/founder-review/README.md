# Founder Review — HTML Wireframes

Presentation-quality, **low-fidelity, grayscale** HTML wireframes of the **Woobly Meeting Room Management** product (client venue: **Quorum**; in-room device: **LUXEGENIE**).

These exist to communicate the product **visually** to a founder — layout, hierarchy, workflow, information architecture, navigation, and component placement — one step before high-fidelity Figma. They are **not** finished UI and carry no branding, colour, or polish (colour, type, and elevation are specified for the Figma stage in [`../DESIGN.md` §15](../DESIGN.md#15-design-tokens-figma-ready-appendix)).

## How to open

Open **[`index.html`](index.html)** in any browser and click through — this package is a **navigable prototype**, not a folder of loose files. No build step, no server, no dependencies (each file is self-contained semantic HTML + embedded CSS). The founder never needs to open Finder: every screen is reachable from `index.html`, the **sidebar navigates between all nine modules on every screen**, the **notifications bell opens Recent Activities**, and the major CTAs behave like the real product (see *Prototype flows* below).

## What's inside — all 18 canonical screens

| File | Screen | Canonical ID |
|---|---|---|
| `index.html` | Cover, product summary, legend, master screen index | — |
| `01-live-board.html` | Meeting Rooms — Live Board (landing) + Room Detail drawer | S1 / S2 · (S0 shell) |
| `02-dashboard.html` | Operational Dashboard (today's status / attention / bookings) | S3 |
| `03-bookings.html` | Bookings — List | S4 |
| `04-new-booking.html` | New Booking — calendar-first guided drawer | S5 |
| `05-manage-rooms.html` | Manage Rooms + Room Editor / Maintenance modal | S6 / S7 |
| `06-bill-payment.html` | Bill / Payment drawer | S9 |
| `07-fnb-order-review.html` | F&B Order Review drawer | S10 |
| `08-members.html` | Members / Guests + CSV Import modal | S12 |
| `09-view-history.html` | View History (analytics) | S13 |
| `10-settings.html` | Settings | S17 |
| `11-luxegenie.html` | LUXEGENIE in-room guest device screens | S18 |
| `12-users.html` | Users — staff accounts + add/edit modal + all states | S15 |
| `13-fnb-menu.html` | F&B Menu — curated catalogue + add-item modal | S8 |
| `14-recent-activities.html` | Recent Activities — full audit feed | S14 |
| `15-luxegenie-devices.html` | LUXEGENIE Devices — device fleet management | S16 |
| `16-extension.html` | Extension Control — one-click / blocked / Seen paths | S11 |

Every canonical wireframe in [`../ux/wireframes/`](../ux/wireframes/) (S0–S18) has an HTML equivalent here. The App Shell (S0) is the shared frame on every screen; the Room Detail drawer (S2) is shown open on the live board; the Room Editor / Maintenance modal (S7) is shown on Manage Rooms.

## Prototype flows (clickable, mirroring the real product)

- **Sidebar** → any of the nine modules, from every screen.
- **Notifications bell** (any screen) → Recent Activities (S14).
- **Bookings → ＋ New Booking** → guided flow (S5); **Dashboard → ＋ New Booking / All bookings →** → S5 / Bookings.
- **Live Board → View Order** → F&B Order Review; **→ Enter Bill / Generate Bill** → Bill / Payment; **→ Extend +30** → Extension Control.
- **Dashboard → Open / View Order / End · Bill / View History →** → the live board, order review, bill panel, and analytics.
- **F&B Menu ⇄ F&B Order Review** (review queued orders, and back).
- **LUXEGENIE Devices → View in-room screens** → the guest device (S18).

## Consistency (one coherent system)

Every screen shares the exact same shell and design language:

- **Sidebar** 232px, room-first order: Meeting Rooms · Dashboard · Bookings · Manage Rooms · F&B Menu · Members · LUXEGENIE · Users · Settings.
- **Top bar** 60px: page title + subtitle (left); theme, notifications bell, profile (right).
- **State tokens** are always textual (`{In-Use}`, `{Ending Soon}`) — status is never colour-only.
- **One primary action** per surface/state, rendered as the single dark-filled button.
- **Drawers** dock right and keep the surface visible behind; **modals** center over a dimmed backdrop; neither navigates away.
- Consistent spacing, card radius, table rhythm, and an annotation strip at the bottom of each screen tracing the business rules it embodies.

## Traceability

Every screen's footer cites the founder decisions (`FD-*`) and business rules (`BR-*`) it represents, so each wireframe traces back to the frozen spec:

- [Business_Rules](../product/Business_Rules.md) · [Founder_Decision_Log](../product/Founder_Decision_Log.md) · [MeetingRoom_Product_Spec](../product/MeetingRoom_Product_Spec.md)
- [Wireframe_Specification](../ux/Wireframe_Specification.md) · [DESIGN.md](../DESIGN.md) · [DESIGN_REVIEW.md](../DESIGN_REVIEW.md)

These pages are the immediate predecessor to the production Figma reference file.
