# Exploration Session Log

Running log of reverse-engineering sessions. Newest entries at the bottom of each session.

---

## Session 1 — 2026-07-12

**Goal:** Understand the existing Restaurant Manager Dashboard and begin the knowledge base.

**Environment note:** The `claude-in-chrome` extension reported **no connected Chrome browser**. Exploration is therefore being run in the in-app Browser pane (`dashboard.mywoobly.com`). The user authenticates manually inside that pane; credentials are never handled by the assistant.

### Timeline

- Inspected repository — found only `CLAUDE.md` and an Obsidian vault config (`.obsidian/`). No prior documentation existed.
- Scaffolded documentation structure (`docs/{analysis,architecture,pages,components,ux,research}`, `assets/{screenshots,diagrams}`, `temp/`).
- Navigated to `https://dashboard.mywoobly.com/login`.
  - **Observed:** Woobly-branded manager login. Two-column dark/gold layout. Documented in [`../pages/00-login.md`](../pages/00-login.md).
- User authenticated manually. Landed on `/restaurant/tables` as **Manager** (`manager@malakaspice.com`, `role: admin`), venue **Malaka Spice** (restaurant_id **3**, Pune, INR).
- **Key infrastructure finding:** SPA (Vite + React + Tailwind v4) calling REST API `https://api.mywoobly.com/api/v1/`; real-time via **Pusher**; media on **AWS CloudFront**. `localStorage` exposed `auth_token`, `auth_user`, `restaurant_data`, `pusherTransportTLS`.
- Enumerated **10 modules** under `/restaurant/*`; captured live API schemas (read-only GETs) for tables, reservations, users, devices, chef-specials, sessions/activities, guests, and settings tabs.
- Documented all 10 pages + login ([pages/](../pages/)), then synthesized: [IA](../architecture/information-architecture.md), [domain model](../architecture/domain-model.md), [state machines](../architecture/state-machines.md), [real-time](../architecture/real-time.md), [roles](../architecture/roles-and-permissions.md), [API observations](../architecture/api-observations.md), [design language](../ux/design-language.md), [UX conventions](../ux/conventions.md), [components](../components/), and [product philosophy](../analysis/product-philosophy.md).

### Method notes
- Explored in the **in-app Browser pane** (the `claude-in-chrome` extension had no connected browser). Auth done manually by the user; assistant never handled credentials.
- API bodies read via the page's own authenticated `fetch` (auth_token kept in-page, never logged). **Only GET/read operations** were performed — no create/update/delete/reboot/shutdown/transfer was executed against the live system.
- Forms (New Reservation, Add User, Add Chef Special, Add Table) were opened to capture fields, then **cancelled**.

### Not exercised (needs data/permissions) — see [open-questions](../analysis/open-questions.md)
- Live session transfer (no active session present), device reboot/shutdown (hardware), dashboard "View History", "View all activities" route, non-admin role surfaces, multi-venue, exact mutation endpoints & response schemas with real data.

### Status: **Reverse-engineering pass complete** for the accessible admin surface.
