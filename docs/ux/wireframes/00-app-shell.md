# S0 · App Shell (wireframe)

> Grayscale, structure-only. Notation: [Wireframe_Principles Part C](../Wireframe_Principles.md#part-c--notation-standard-applies-to-every-ascii-wireframe). Spec: [Wireframe_Specification §S0](../Wireframe_Specification.md).

The persistent frame every dashboard screen renders inside. Reused from the restaurant dashboard (🟢).

## Default (desktop ≥1024px)

```
┌──────────────────┬──────────────────────────────────────────────────────────┐
│  ◇ WOOBLY        │  Meeting Rooms                       [☀]  [🔔 3]  [👤 ▾]   │  ← TopBar
│  Manager Dash    │  See live room status                                     │
│                  ├──────────────────────────────────────────────────────────┤
│  ▸ Meeting Rooms•│                                                          ▲ │
│  ▸ Dashboard     │                                                          │ │
│  ▸ Bookings      │                                                          │ │
│  ▸ Manage Rooms  │                    « CONTENT ZONE »                      │ │
│  ▸ F&B Menu      │            (each screen renders its body here)           │ │
│  ▸ Members       │                                                          │ │
│  ▸ LUXEGENIE     │                                                          │ │
│  ▸ Users         │                                                          │ │
│  ▸ Settings      │                                                          ▼ │
│                  │                                                            │
│  ┌────────────┐  │                                                            │
│  │ 👤 Manager │  │                                                            │
│  │ ...@venue  │  │                                                            │
│  │        [⏻] │  │                                                            │
│  └────────────┘  │                                                            │
└──────────────────┴──────────────────────────────────────────────────────────┘
   Sidebar (fixed)                         Content (scroll)
```
- `•` = active nav item. Top bar: page **title** + **subtitle** (per screen), theme toggle `[☀]`, notifications `[🔔 n]` → S14, profile `[👤]` → logout confirm.
- Sidebar order follows [Information_Architecture](../../architecture/Information_Architecture.md) (room-first: Meeting Rooms high; Dashboard = operational KPIs).

## Collapsed (768–1023px) — sidebar slide-in

```
┌────────────────────────────────────────────┐
│ [☰]  Meeting Rooms        [☀] [🔔3] [👤▾]  │
│      See live room status                  │
├────────────────────────────────────────────┤
│              « CONTENT ZONE »              │
└────────────────────────────────────────────┘
  [☰] toggles the sidebar as an overlay drawer.
```

## Mobile (<768px)
Single column; `[☰]` hamburger opens sidebar as full-height slide-in; content stacks; filter tabs swipe horizontally.

## States
- **Loading:** shell renders instantly; content zone shows skeleton (`⟳`). Nav + bell interactive.
- **Notification:** `[🔔 n]` badge increments on any Pusher activity; attention/escalation also fire a staff-smartwatch `⌚` mirror. Toasts appear top-right.
- **Error (global):** 401 → logout → `/login`; network error → content zone inline retry (shell persists).
- **Permission:** single management access level — any authenticated user sees all nav (BR-PERM1). Unauth → redirect `/login`.
- **Empty / Success:** N/A at shell level (per-screen).

## Notification affordance detail

```
[🔔 3]  ── click ──►  ┌─ Recent (peek) ─────────────┐
                      │ • R03 Assistance requested  │
                      │ • R01 F&B Order requested   │
                      │ • R05 Ending Soon           │
                      │        [ View all → S14 ]   │
                      └─────────────────────────────┘
```

---

### Traceability
- **States:** loading, notification, error(401/network), permission(single-access).
- **Business rules:** BR-PERM1/PERM2 (single access level), BR-N1 (dashboard + smartwatch).
- **Components:** Sidebar 🟢, TopBar/Header 🟢, NotificationsBell 🟢, ProfileMenu/Logout 🟢 (all reused).
- **Flows:** entry frame for every dashboard user flow.
- **Open questions:** restaurant/meeting-room top-level coexistence (one sidebar vs product switcher) — [REPOSITORY_AUDIT Q9](../../REPOSITORY_AUDIT.md#outstanding-questions). Drawn here as one combined sidebar (recommended default).

### CHECKLIST — S0 App Shell
□ Business rules represented — BR-PERM1/PERM2, BR-N1 ✔
□ State machine represented — N/A (frame; hosts stateful screens) ✔
□ User flow complete — provides entry for all flows ✔
□ Empty — N/A (per-screen) ✔ · □ Loading — skeleton ✔ · □ Error — 401/network ✔ · □ Success — N/A ✔
□ Notification — bell + toast + ⌚ ✔
□ Maintenance — N/A (no room concept) ✔
□ Permission — single access level + auth redirect ✔
□ Edge cases — long name truncation, 99+ badge, offline ✔
□ Navigation consistent — this defines it ✔
□ CTA hierarchy — nav + global controls only ✔
□ Component reuse — 100% reused (🟢) ✔
□ Interaction patterns — matches restaurant shell ✔
**RESULT: PASS**
