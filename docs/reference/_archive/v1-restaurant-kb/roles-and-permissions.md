# Roles & Permissions

- **Evidence:** Observed (`auth_user.role`, Users API `role` values, Add User role select). Permission *effects* are largely **Inferred** (only the admin/manager surface was accessible).

## Roles observed

| Role | Source | Notes |
|---|---|---|
| `admin` | logged-in `auth_user.role` | The **Manager Dashboard** user. Also has a `server_code` (22) → can act on the floor. Not assignable via Add User. |
| `server` | Users data + Add User | Waitstaff; appear in Top Performers; handle activities. |
| `host` | Users data + Add User | Front-of-house / seating. |
| `steward` | Users data + Add User | Support staff. |
| `chef` | Add User | Kitchen. |
| `captain` | Add User | Senior floor staff. |

## Access model (Inferred)

- The dashboard at `dashboard.mywoobly.com` is the **admin/manager** surface. The logged-in user is `role: admin`.
- Non-admin roles (`server`, `host`, `steward`, `chef`, `captain`) are **operational staff** who act through the **LUXEGENIE device / a separate staff app**, not this dashboard — evidenced by `server_code`, `name` ("Display name for device"), and activities being attributed to a `server_code`/`server_name`.
- API paths are under `admin/*` → this dashboard assumes an admin-scoped token.

## What this dashboard's user can do (Observed)

Full CRUD/monitoring across: tables (floor + config), reservations, users, devices, chef specials, sessions (transfer), guests (read), settings. No permission gating was visible **within** the dashboard for the admin user.

## Access gaps (need other accounts to confirm)

- Behaviour/permissions of `server`/`host`/etc. accounts (likely device-side, not dashboard).
- Whether multiple admins exist and whether any settings are owner-only.
- Multi-venue: token is single-restaurant (`restaurant_id: 3`); multi-venue switching not observed.

See [open-questions](../analysis/open-questions.md).
