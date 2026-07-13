# Page: Users (Staff Management)

- **URL:** `/restaurant/users/all`
- **Header:** "Users" · subtitle "Manage restaurant users and their permissions"
- **Evidence:** Observed (screenshot, DOM, live API), 2026-07-12
- **API:** `GET admin/user/restaurant/3` → `{ success, users: User[] }`

## Purpose

- **Business objective:** Manage the roster of staff accounts that operate the guest-facing devices/app and appear in performance analytics.
- **User objective:** Add, edit, activate/deactivate, and search staff members; assign roles and server codes.

## Layout

1. **Search users…** input.
2. **+ Add User** primary button (gold, full-width).
3. **Status tabs:** `Active (16)` [default], `Inactive (0)`, `All (16)` — counts reflect `active` flag.
4. **User table** — columns `USER`, `USER DETAILS`, `ACTIONS`.

### Row anatomy (Observed)
- **USER:** circular avatar (initials, or `img_url` photo) + `name` + `role` (e.g. Server, Host, steward).
- **USER DETAILS:** `server_code` (e.g. 59) + `contact` phone.
- **ACTIONS:** active toggle (green check = active) + ✏️ edit.

## User object (canonical schema — Observed)

| Field | Example | Notes |
|---|---|---|
| `id` | 25 | numeric PK |
| `user_id` | "USRuser_id_755486356898" | external string id |
| `restaurant_id` | 3 | tenant |
| `username` | "adduser" | login handle (email for admins) |
| `password` | `$2b$12$…` | **bcrypt hash — returned by the API** (see note) |
| `name` | "adduser" | display name (shown on device) |
| `contact` | "4376967898" | phone |
| `server_code` | "59" | short code identifying the staffer on devices/orders |
| `role` | "server" | `admin \| server \| host \| steward \| chef \| captain` |
| `img_url` | null | avatar |
| `active` | true | activation toggle |
| `is_deleted` | false | soft delete |
| `timestamp` | ISO ts | created |

> **Security observation (Observed, neutral):** `GET admin/user/restaurant/{id}` includes each user's bcrypt `password` hash in the response body. Recorded for accuracy; not a recommendation.

## Roles (Observed)

- Present in data: `admin` (managers), `server`, `host`, `steward`.
- Assignable via **Add User** role select: **Host, Server, Steward, Chef, Captain**.
- `admin` is the manager/dashboard role (the logged-in "Manager" is `role: admin` with `server_code: 22`) and is **not** offered in the Add User form.

See [architecture/roles-and-permissions.md](../../_archive/v1-restaurant-kb/roles-and-permissions.md).

## Add New User dialog (Observed)

- **User Photo** (optional; cropped square; max 10MB)
- **Username** (text)
- **Name** — "Display name for device"
- **Contact Number** (10-digit)
- **Server Code** (e.g., "01")
- **Role** (select): Host, Server, Steward, Chef, Captain
- **Password** / **Confirm Password**
- Actions: **Cancel** / **Add User**

## States

- **Active/Inactive** filter driven by `active` flag; `Inactive (0)` at capture.
- Edit (✏️) **Inferred** to open the same form pre-filled.
- Deactivation is **Inferred** to be a soft state (`active=false`), distinct from soft-delete (`is_deleted`).

## Relationships

- User (`server_code`) → appears as **SERVER** in [Dashboard](01-dashboard.md) Top Performers and on orders/sessions.
- User (`role`) → governs what the guest-facing device/app allows (Inferred).
