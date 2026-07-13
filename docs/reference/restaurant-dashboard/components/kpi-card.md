# Component: KPI Stat Card

Compact metric tile used on the [Dashboard](../pages/01-dashboard.md). **Evidence:** Observed.

## Anatomy

```
┌─────────────────────────────┐
│ TOTAL REVENUE            ₹   │  ← uppercase muted label + gold accent icon
│ ₹0                          │  ← large value
│                    (unit)   │  ← optional small unit (sec / min)
└─────────────────────────────┘
```

## Props (Inferred)

- `label` (uppercase, muted), `icon` (gold, top-right), `value` (large), `unit` (small suffix — `sec`, `min`, `₹`), and the driving `period`.
- Value formats: currency `₹0`, duration `0 sec` / `0 min`, count `0`, rating `0.0 /5`.

## Instances on Dashboard

Total Revenue · Avg Response Time · Avg Table Turnaround Time · Service Calls · Manager Calls. Ratings render as a related three-up (`Food/Service/Experience` with progress bars). Each is fed by a `admin/dashboard/*` endpoint (see [Dashboard](../pages/01-dashboard.md#metric--api-mapping-observed)).

## Related panels

- **Average Ratings** — star header + 0–5 sub-metrics with progress bars + 👍/👎 feedback summary.
- **Leaderboard** — Top Performers table (RANK/SERVER/TABLES/AVG TAT/CALLS/REVENUE).
Both share the panel chrome (icon + uppercase title + optional right action button).
