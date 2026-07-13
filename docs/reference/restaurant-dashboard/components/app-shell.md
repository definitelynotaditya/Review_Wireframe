# Component: App Shell

The persistent chrome around every authenticated page. **Evidence:** Observed.

## Structure

```
┌───────────────────────────────────────────────────────────┐
│ [☰]  <Page Title (serif)>              [☀︎] [🔔³] [👤 Manager]│  ← Top bar
│      <muted subtitle>                          <name/email> │
├──────────────┬────────────────────────────────────────────┤
│  Sidebar     │                                             │
│  (crown +    │           Page content                      │
│   WOOBLY)    │                                             │
│  • 10 items  │                                             │
│  ...         │                                             │
│  [👤 logout] │                                             │
└──────────────┴────────────────────────────────────────────┘
```

## Sidebar (collapsible)

- Toggled by the **hamburger** (☰); overlays content when open.
- **Brand:** crown logo + "WOOBLY" / "Manager Dashboard".
- **Nav items** (icon + label), active item highlighted gold: Dashboard, Tables, Reservations, Users, LUXEGENIE, Chef's Specials, Manage Tables, Transfer Sessions, Guest List, Settings.
- **Footer:** profile (avatar, "Manager", email) + **logout** (↪) button.

## Top bar

- **Left:** page **title** (Chronicle Display serif) + **subtitle** (muted). Set per page.
- **Right controls:**
  - **Theme toggle** (☀︎/☾) — light/dark; persisted `localStorage.woobly-theme`.
  - **Notifications bell** — unread badge (e.g. `3`); opens a dropdown of recent [activities](../pages/08-transfer-sessions.md#the-session--activity-model-observed) ("Table T01 requested a power bank", "…requested chef's special with selections: Flora x1…") with a **"View all activities"** link.
  - **Profile** — name + email; entry to account/logout.

## Behaviour

- Shell is constant across routes; only title/subtitle and content swap (SPA client routing under `/restaurant/*`).
- Notifications and any live badges update via [Pusher](../../_archive/v1-restaurant-kb/real-time.md).

## Reuse guidance

Any new module should render inside this shell: provide a `title`, `subtitle`, and a content area; inherit the top-bar controls and sidebar entry.
