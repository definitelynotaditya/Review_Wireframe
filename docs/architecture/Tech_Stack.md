# Tech Stack & Frontend Architecture

> **Status:** Canonical · **Version:** 3.0 · **Last updated:** 2026-07-13
> **Evidence:** Observed in `GITHUB REP/` (`package.json`, `src/`). Unchanged by V3 decisions; the stack is confirmed and reused. V3 adds one **new backend dependency** (a scheduler for time-triggered events — see §4 and [Integration_Points §6](../engineering/Integration_Points.md#6-scheduler--time-triggered-notifications--new-infrastructure-biggest-new-backend-dependency)).

## Purpose

Record the confirmed technology stack and frontend architecture of the existing dashboard, so the Meeting Room module is built with the same tools and patterns (not a parallel stack).

## Scope

Frontend stack, state management, routing, real-time, build/deploy, PWA. Backend internals are not in this repo (inferred via API + events).

## Dependencies

[Restaurant_Current_State §2](../product/Restaurant_Current_State.md#2-tech-stack-observed-in-github-rep) · [RealTime_And_Sync](RealTime_And_Sync.md)

## Assumptions

Meeting Room ships inside this same codebase/app, not a separate deployment.

---

## 1. Stack (Observed)

| Concern | Choice | Evidence |
|---|---|---|
| Language/UI | React 18 (JSX) | `main.jsx`, `package.json` |
| Build | Vite | `vite.config.js`, `index.html` |
| Routing | `react-router-dom` v6 (`BrowserRouter`) | `main.jsx` |
| Server state / cache | `@tanstack/react-query` (staleTime 5m, retry 1) | `main.jsx` |
| Client state | `zustand` (per-domain stores) | `src/store/*.js` |
| Real-time | `pusher-js` (global provider) | `context/PusherContext.jsx` |
| HTTP | `axios` (interceptors) | `utils/apiClient.js` |
| Toasts | `react-hot-toast` | `main.jsx`, `PusherContext.jsx` |
| Styling | Tailwind CSS + theme context | `ThemeContext.jsx`, class usage |
| Fonts | "Chronicle Display" (brand serif) + system sans | `public/chronicle-display-cufonfonts/` |
| PWA | service worker + manifest, auto-update | `main.jsx`, `public/service-worker.js`, `manifest.json` |
| Deploy | GitHub Actions workflow | `.github/workflows/deploy.yaml` |

## 2. Frontend architecture patterns (Observed)

- **Page → Store → API:** each page (`src/pages/*.jsx`) uses a matching zustand store (`src/store/*.js`) whose actions call the axios client. Server data is cached/invalidated via React Query.
- **Global providers** wrap the router: `QueryClientProvider` → `PusherProvider` → `ThemeProvider` → `Router`.
- **`ProtectedRoute`** guards every `/restaurant/*` route (redirects to `/login` when unauthenticated; 401 interceptor also forces logout).
- **Layout** component provides the shell (`Sidebar`, `Header`) and takes `title`/`subtitle` props per page.
- **Modals** are colocated by domain (`src/components/modals/<domain>/`), one component per action (Add/Update/Delete/Confirm).
- **Env config:** `VITE_BASE_URL`, `VITE_PUSHER_APP_KEY`, `VITE_PUSHER_CLUSTER`.

## 3. What the Meeting Room module adds (proposed)

- New pages under `src/pages/meeting-rooms/` (or similar) mirroring the restaurant page set.
- New zustand stores: `mrRoomsStore`, `mrBookingStore`, `mrSessionStore`, `mrFnbStore`, `mrBillingStore`, `mrSettingsStore`.
- New React Query keys (`mr-rooms`, `mr-bookings`, …) wired into the existing `PusherProvider` (add Meeting Room event bindings).
- New routes under `/meeting-rooms/*` guarded by the same `ProtectedRoute`.
- **No new frameworks.** Reuse Tailwind theme, toasts, Layout, ProtectedRoute, axios client.

## 4. Backend (Inferred — not in this repo)

- REST API at `https://api.mywoobly.com/api/v1/` (versioned, tenant-scoped paths).
- Publishes Pusher events on state change.
- A **scheduler** is required for the new time-triggered Meeting Room events (Reserved-at-slot-start, reminders) — see [RealTime_And_Sync §5](RealTime_And_Sync.md#5-time-triggered-events-new-vs-restaurant).

## Future Work

- Confirm backend framework/hosting if it becomes relevant to Meeting Room API design.

## Related Documents

- [RealTime_And_Sync](RealTime_And_Sync.md) · [Data_Model](../engineering/Data_Model.md) · [Engineering_Assumptions](../engineering/Engineering_Assumptions.md)
