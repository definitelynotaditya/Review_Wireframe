# API Observations

- **API base:** `https://api.mywoobly.com/api/v1/`
- **Frontend host:** `https://dashboard.mywoobly.com` (Vite SPA — `assets/index-*.js`, `assets/index-*.css`)
- **Tenant key:** requests are keyed by a numeric **restaurant id**. Observed venue "malakaspice" = id **`3`**.
- **Evidence:** Observed via `performance.getEntriesByType('resource')` while navigating the app, 2026-07-12. Response bodies not yet inspected unless noted.

> This is a live catalogue. Add endpoints as they are observed, with the page that triggered them.

## Namespaces observed

| Prefix | Purpose |
|---|---|
| `admin/dashboard/*` | Aggregated KPIs for the Dashboard page |
| `luxegenie/*` | LUXEGENIE guest-session domain (per-table sessions & activities) |

## Endpoint catalogue

### `admin/dashboard/*` (triggered by [Dashboard](pages/01-dashboard.md))

All take path segment `/{restaurantId}` and query `?period={today|yesterday|week|month|custom}`.

| Endpoint | Feeds |
|---|---|
| `GET admin/dashboard/revenue/{id}?period=` | Total Revenue KPI |
| `GET admin/dashboard/response-time/{id}?period=` | Avg Response Time KPI |
| `GET admin/dashboard/turnaround-time/{id}?period=` | Avg Table Turnaround Time (TAT) KPI |
| `GET admin/dashboard/tap-for-service/{id}?period=` | Service Calls KPI |
| `GET admin/dashboard/service-calls/{id}?period=` | (service-call metric) |
| `GET admin/dashboard/manager-attention/{id}?period=` | Manager Calls KPI |
| `GET admin/dashboard/powerbank-requests/{id}?period=` | Power-bank amenity requests |
| `GET admin/dashboard/ratings/{id}?period=` | Average Ratings (Food/Service/Experience) |
| `GET admin/dashboard/feedback-count/{id}?period=` | Feedback Summary (👍/👎) |
| `GET admin/dashboard/chef-specials/revenue-by-category/{id}?period=` | Chef's Specials revenue panel |
| `GET admin/dashboard/servers/top-performers/{id}?period=` | Top Performers leaderboard |

### `luxegenie/*`

| Endpoint | Feeds |
|---|---|
| `GET luxegenie/session/activities/for/restaurant/{id}` | Table/guest session activity feed |

### `admin/*` resource endpoints (per page)

| Endpoint | Page | Response envelope |
|---|---|---|
| `GET admin/table/restaurant/{id}` | [Tables](pages/02-tables.md) / [Manage Tables](pages/07-manage-tables.md) | `{success, data:{<area>:Table[]}, count}` |
| `GET admin/reservations/restaurant/{id}?filter_type=` | [Reservations](pages/03-reservations.md) | `{success, data:Reservation[], count, restaurant, filters}` |
| `GET admin/user/restaurant/{id}` | [Users](pages/04-users.md) | `{success, users:User[]}` |
| `GET admin/chef-special-dish/restaurant/{id}` | [Chef's Specials](pages/06-chef-specials.md) | `{success, data:Dish[]}` |
| `GET admin/guest/list/{id}` | [Guest List](pages/09-guest-list.md) | `{success, data:Guest[]}` |
| `GET admin/history/restaurant/{id}` | [Settings › History](pages/10-settings.md) | — |
| `GET admin/event/restaurant/{id}` | [Settings › Events](pages/10-settings.md) | — |
| `GET admin/chef/restaurant/{id}` | [Settings › Chefs](pages/10-settings.md) | — |
| `GET admin/loyalty-club/restaurant/{id}` | [Settings › Loyalty](pages/10-settings.md) | — |
| `GET admin/menu/restaurant/{id}` | [Settings › Menu](pages/10-settings.md) | — |
| `GET admin/wifi/restaurant/{id}` | [Settings › WiFi](pages/10-settings.md) | — |

### `luxegenie/*` (device & sessions)

| Endpoint | Page | Notes |
|---|---|---|
| `GET luxegenie/devices/get/all/{id}` | [LUXEGENIE](pages/05-luxegenie.md) | `{success, devices:Device[]}` |
| `GET luxegenie/session/activities/for/restaurant/{id}` | **every page** | `{success, activities:Activity[]}` — live feed |
| _(Inferred)_ device Reboot / Shutdown (single + all) | LUXEGENIE | hardware control |
| _(Inferred)_ session transfer | [Transfer Sessions](pages/08-transfer-sessions.md) | re-point `session_id` |

### Response envelope convention (Observed)

Two shapes seen — mostly `{ success: bool, data: T, count?: n }`, but **Users** uses `{ success, users }` (resource-named key). Not fully consistent.

## Conventions (Inferred)

- **REST, versioned** (`/api/v1/`), resource-oriented paths.
- **Tenant scoping** by trailing `/{restaurantId}` path segment rather than a header.
- **Time filtering** via `?period=` enum; "Custom" **Assumed** to add explicit date bounds (params TBD).
- **Auth (Assumed):** a bearer token or cookie set at login on `dashboard.mywoobly.com` / `api.mywoobly.com`. To be confirmed from request headers.

## To capture next

- Response bodies / schemas for each endpoint (need a venue/time window with data).
- Endpoints for: tables, reservations, users, chef-specials CRUD, sessions/transfer, guest list, settings.
