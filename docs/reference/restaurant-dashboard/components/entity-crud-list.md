# Component: Entity CRUD List/Grid (+ Create/Edit Modal)

The dominant page template. Six modules are variations of it: [Users](../pages/04-users.md), [Chef's Specials](../pages/06-chef-specials.md), [Manage Tables](../pages/07-manage-tables.md), [Reservations](../pages/03-reservations.md), [LUXEGENIE](../pages/05-luxegenie.md), [Guest List](../pages/09-guest-list.md) (read-only variant). **Evidence:** Observed.

## Anatomy

```
Search…                                   [+ Add <Entity>]
[ Tab (n) ][ Tab (n) ][ Tab ] …  (± dropdowns / date)
────────────────────────────────────────────────────
<Entity card / row>   … status badge … [inline actions]
<Entity card / row>   …
```

- **Search** — by the entity's natural keys (name/phone/email/number).
- **Filter tabs** — status/category/scope, usually with counts.
- **Primary action** — gold "+ Add/New <Entity>" → opens the Create modal.
- **Items** — cards (grid) or rows (table). Each shows identity + key fields + a [status badge](status-badge.md) + inline actions (edit ✏️, delete 🗑️, activate toggle, or a verb button).

## Per-entity configuration

| Module | Item shape | Tabs | Inline actions |
|---|---|---|---|
| Users | table row (avatar/name/role, code/phone) | Active/Inactive/All | activate toggle, edit |
| Chef Specials | image card (name/price/veg badge) | status + category | Active toggle, Edit |
| Manage Tables | card (number/area/capacity) | sitting areas | edit, delete |
| Reservations | card (guest/table/time) | Upcoming/Today/Past/All + dropdowns + date | Seat, edit, delete |
| LUXEGENIE | row (device id/battery/assignment) | All/Assigned/Unassigned | kebab: Reboot/Shutdown |
| Guest List | card (name/visits) — **read only** | — | — |

## Create/Edit Modal

- Title "Add New <Entity>" / "New <Entity>"; ✕ to dismiss.
- **Grouped sections** with bold headers; required fields `*`.
- **Image upload** slot where applicable (crop-to-square, ≤10MB → CloudFront).
- **Selects** for enums (role, category, type, sitting area, reservation type, title).
- Footer: **Cancel** (ghost) + **primary gold** (Create/Add/Add User).
- Edit reuses the same form pre-filled (Inferred).

## Data contract

Backed by `GET admin/<resource>/restaurant/{id}` returning `{ success, data|<resource>, count }`. Mutations (`POST/PATCH/DELETE`) are Inferred (not exercised). See [api-observations](../api-observations.md).

## Reuse guidance

A new list module should: pick the item shape (card vs row), define filter tabs + search keys, wire the Create modal sections, and follow the badge/colour conventions.
