# Page: Manage Tables (Configuration)

- **URL:** `/restaurant/manage-tables`
- **Header:** "Manage Tables" · subtitle "Manage your restaurant tables and seating arrangements"
- **Evidence:** Observed (screenshot, DOM), 2026-07-12
- **API:** shares `GET admin/table/restaurant/3` (see [Tables](02-tables.md)); mutations Inferred (`POST/PATCH/DELETE admin/table/*`).

## Purpose

- **Business objective:** Define the physical floor plan — the set of tables, their zones and capacities — that everything else (floor view, reservations, device assignment) references.
- **User objective:** Add, edit, and delete tables; organise them by sitting area.

## Manage Tables vs. Tables — the split (Inferred)

The product deliberately separates two concerns over the same `Table` entity:

| | [Tables](02-tables.md) (`/tables`) | Manage Tables (`/manage-tables`) |
|---|---|---|
| Role | **Live operations** floor view | **Configuration** / CRUD |
| Shows | occupancy + real-time request flags | static definition (number, area, capacity) |
| Actions | monitor / respond | add / edit / delete |
| Status pill | VACANT / ALLOTED (operational) | Vacant / alloted (informational) |

## Layout

1. **Search tables…** input.
2. **+ Add Table** primary button (gold, full-width).
3. **Sitting-area tabs:** `All (28)`, `Indoor (13)`, `Outdoor (13)`, `Terrace (1)`, `Test Area (1)`.
4. **Table cards** (2-col grid): `table_number` + area subtitle, status badge, **Capacity** (n guests), **Area**, and ✏️ edit / 🗑️ delete actions.

## Add New Table dialog (Observed)

- **Table Number** (text; placeholder "e.g., T01, A-5, etc.")
- **Sitting Area** (select): `Indoor, Outdoor, Terrace, Test Area`
- **Capacity** (number; "Number of guests")
- Actions: **Cancel** / **Add Table**

> Sitting areas are the same grouping keys used by `GET admin/table/restaurant/{id}` (`indoor`, `outdoor`, `terrace`, `test area`). "Test Area" suggests areas are free-form/admin-defined rather than a fixed enum.

## Fields written (maps to Table schema)

`table_number`, `sitting_area`, `capacity` — a subset of the full [Table object](02-tables.md#table-object-canonical-schema--observed). Merge/geometry fields (`is_merged`, `rectangle_count`) are managed elsewhere (table-merge flow / floor-plan; not seen in this dialog).

## Edge cases

- Deleting a table is **Inferred** to be a soft delete (`is_deleted=true`) consistent with other entities.
- Merged tables (`type: master`, `merged_from`) imply a merge action exists somewhere in ops (possibly on the live floor). Unconfirmed.

## Relationships

- Defines the `Table` records consumed by [Tables](02-tables.md), [Reservations](03-reservations.md) (seating), and [LUXEGENIE](05-luxegenie.md) (device assignment).
