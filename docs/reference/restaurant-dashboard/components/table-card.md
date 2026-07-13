# Component: Table Card

Represents one `Table`. Appears in three contexts with progressively less chrome. **Evidence:** Observed.

## Variants

| Context | Shows | Interaction |
|---|---|---|
| **[Tables](../pages/02-tables.md)** (live floor) | number, `n seats`, request badges, VACANT/ALLOTED pill | monitor; (respond to requests — Inferred) |
| **[Manage Tables](../pages/07-manage-tables.md)** (config) | number, area, `Capacity n guests`, `Area`, status | ✏️ edit / 🗑️ delete |
| **[Transfer Sessions](../pages/08-transfer-sessions.md)** | number, `n seats`, area, coloured **status dot** | click to select for transfer |

## Anatomy (live floor)

```
┌───────────────────────────┐
│ T01                       │
│ 4 seats                   │
│ [Chef's Specials Requested]│  ← request badge(s), when flags set
│                   [VACANT] │  ← status pill (gold) / [ALLOTED] (red)
└───────────────────────────┘
```

## Inputs (from Table object)

`table_number`, `capacity`, `sitting_area`, `table_status`, and the boolean **request flags** → each true flag renders a badge (service, physical menu, power bank, chef's special, chef's-special customization, manager's attention, bill).

## Status → visual

- `vacant` → gold "VACANT" pill / 🟡 dot.
- `alloted` → red "ALLOTED" pill.
- active session → 🟢 dot ("Active"); reservation hold → 🟣 dot ("Reserved").

See [status-badge.md](status-badge.md).
