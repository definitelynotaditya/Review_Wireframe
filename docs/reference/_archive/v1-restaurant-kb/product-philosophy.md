# Product Philosophy (Synthesis)

Higher-level reading of *what the Restaurant Manager Dashboard is for* and the principles it embodies. **Inferred** from the full exploration; grounded in the page and architecture docs.

## What the product is

**Woobly** is a smart-hospitality platform built around the **LUXEGENIE** — a battery-powered, LED-equipped table device guests tap to request service (waiter, bill, physical menu, power bank, chef's special, manager). The **Manager Dashboard** documented here is the back-office control plane for that system at a single venue.

The dashboard's job: **turn a stream of guest table-requests into managed operations and measured performance.**

## Core loop

Guest taps device → **Activity** logged in a table **Session**, attributed to a **server**, with a **response time** → pushed live (Pusher) to the floor view, KPIs, and notifications → aggregated into revenue, turnaround, and staff leaderboards.

Everything in the app orbits this loop: it either **configures** it (Manage Tables, Chef's Specials, Users, Settings, LUXEGENIE), **runs** it live (Tables, Transfer Sessions), or **measures** it (Dashboard, Guest List).

## Principles (Inferred)

1. **Real-time first.** The floor and metrics update without refresh; the bell is an ambient activity feed. Managers watch, they don't poll.
2. **Configuration ↔ operation split.** The same entity often has a calm config surface and a live ops surface (Table: Manage Tables vs Tables; content: Settings vs device). Reduces cognitive load during service.
3. **One consistent grammar.** Search + segmented tabs + card/row lists + gold primary CTA + Add/Edit modal + colour-coded status badges, repeated everywhere (see [ux/conventions](../ux/conventions.md)). Learn one module, know them all.
4. **The device is the product's edge; the dashboard is its brain.** Much of Settings exists purely to control what the guest device displays ("Visible in LUXEGENIE").
5. **Lightweight integrations.** Menu / WiFi / Loyalty are delivered as uploaded **QR images**; reservation sources include aggregators (Zomato/Swiggy/etc.) as simple enum tags — pragmatic over deeply-integrated.
6. **Premium brand, functional tool.** Serif + gold + crown signal "bespoke luxury"; the UI underneath is efficient Tailwind tooling.
7. **Staff performance is a first-class concern.** Servers are ranked (TAT, calls, revenue); response time is measured per activity.
8. **Single-tenant scoping, soft deletes, INR/Asia defaults.** Every entity carries `restaurant_id` and `is_deleted`; the observed venue is India-localised.

## What is NOT here (Observed absence)

- No POS/ordering/kitchen-ticket module in this dashboard (ordering appears to happen device-side / elsewhere; the dashboard tracks revenue and requests, not order entry).
- No payment processing UI (UPI/QR are stored config, not a checkout).
- No multi-venue switcher (token is single-restaurant).
- No in-dashboard role gating visible for the admin user.

These absences are boundaries of *this* surface, not necessarily of the platform. See [open-questions](open-questions.md).
