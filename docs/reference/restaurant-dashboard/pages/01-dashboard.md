# Page: Dashboard (Home)

- **URL:** `/restaurant/dashboard`
- **Landing route** after login is `/restaurant/tables`, but Dashboard is the first nav item.
- **Evidence:** Observed (screenshot, DOM, network), 2026-07-12
- **Header title:** "Dashboard" · subtitle "Real-time restaurant performance insights"

## Purpose

- **Business objective:** Give the manager an at-a-glance, real-time operational and financial health read of the venue for a chosen time window.
- **User objective:** Answer "how is service going right now / today?" — revenue, responsiveness, table efficiency, staff performance, and guest sentiment.

## Information hierarchy (top → bottom)

1. **Time-window filter bar** — segmented control: `Today` (default/active), `Yesterday`, `Week`, `Month`, `Custom`; plus a **View History** button (right-aligned, gold).
2. **KPI cards (primary metrics)** — 5 stat cards in two rows:
   - **Total Revenue** (₹, currency = INR)
   - **Avg Response Time** (sec)
   - **Avg Table Turnaround Time** (min)
   - **Service Calls** (count)
   - **Manager Calls** (count)
3. **Average Ratings** panel — header with star icon + total ratings count ("0 RATINGS"). Three sub-metrics, each `0.0 /5` with a progress bar:
   - **Food**, **Service**, **Experience**
   - **Feedback Summary** row: 👍 count (green) / 👎 count (red).
4. **Chef's Specials** panel — header with **All Stats** button (gold). Empty state: "No data available".
5. **Top Performers** panel — leaderboard table. Columns: `RANK`, `SERVER`, `TABLES`, `AVG TAT`, `CALLS`, `REVENUE`. Empty state: "No data available".

## Layout

- Single scrolling column of full-width panels on a dark background.
- KPI cards: rounded, dark-elevated surface, uppercase gray label + gold accent icon top-right, large value with small unit suffix.
- Consistent panel chrome: icon + uppercase section title, optional right-aligned action button.

## Metric → API mapping (Observed)

All dashboard data comes from `https://api.mywoobly.com/api/v1/admin/dashboard/*`, keyed by restaurant id `3`, with a `?period=<today|…>` query param. Observed endpoints fired on load:

| UI element | Endpoint (`…/admin/dashboard/`) |
|---|---|
| Total Revenue | `revenue/3?period=today` |
| Avg Response Time | `response-time/3?period=today` |
| Avg Table Turnaround Time | `turnaround-time/3?period=today` |
| Service Calls | `tap-for-service/3?period=today` |
| Manager Calls | `manager-attention/3?period=today` |
| Average Ratings (Food/Service/Experience) | `ratings/3?period=today` |
| Feedback Summary (👍/👎) | `feedback-count/3?period=today` |
| Chef's Specials | `chef-specials/revenue-by-category/3?period=today` |
| Top Performers | `servers/top-performers/3?period=today` |
| _(not surfaced as a card here)_ | `powerbank-requests/3?period=today` |
| _(not surfaced as a card here)_ | `service-calls/3?period=today` |

Also fired on this page: `luxegenie/session/activities/for/restaurant/3` (see [LUXEGENIE](05-luxegenie.md)).

See [API observations](../api-observations.md) for the full endpoint catalogue.

## Filters

- **Period** segmented control drives the `?period=` param. Observed value: `today`. Inferred values: `yesterday`, `week`, `month`, `custom` (Custom likely opens a date-range picker — **Assumed**).
- **View History** — Assumed to open historical/archived dashboards or a longer time series. Not yet opened.

## States

- **Empty state:** "No data available" for Chef's Specials and Top Performers; zeros across KPIs (this venue had no activity for `today` at capture time). This is the empty/zero baseline, useful as a reference for the metric formats (₹0, `0 sec`, `0 min`, `0.0 /5`).

## Domain signals surfaced here

The endpoint names expose core domain verbs of the product's guest-facing side:
- **tap-for-service** / **service-calls** — guests summon service from the table.
- **manager-attention** — guests escalate to a manager ("Manager Calls").
- **turnaround-time (TAT)** — table efficiency metric.
- **powerbank-requests** — an at-table amenity (guests request a power bank).
- **chef-specials revenue by category** — Chef's Specials are a sellable, revenue-tracked catalogue.
- **servers / top-performers** — staff ("servers") are ranked on tables handled, TAT, calls, revenue.
- **luxegenie session** — "LUXEGENIE" is a per-table guest session construct (see its page).

These feed the [domain model](../../_archive/v1-restaurant-kb/domain-model.md).

## Open questions

- Exact response shape of each endpoint (values were all zero/empty at capture).
- What "View History" opens.
- Whether "Service Calls" card maps to `tap-for-service` or `service-calls` endpoint (both exist).
