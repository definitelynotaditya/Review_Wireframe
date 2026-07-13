# UX & Interaction Conventions

Reusable patterns observed across the dashboard. These are the "grammar" a new module should follow to feel native. **Evidence:** Observed across ≥2 pages unless noted.

## Page anatomy (every module)

1. **Header block:** serif title + muted subtitle (left); theme toggle, notifications, profile (right).
2. **Search** input (full-width or left) where the page lists entities.
3. **Primary action** button, gold, top-right or full-width ("+ New/Add …").
4. **Filter row:** segmented **tabs** (often with counts, e.g. `Active (16)`) ± dropdowns/date.
5. **Content:** card grid or list; consistent empty state "No data available".

## Segmented tab filters

- Used for status (`Active/Inactive/All`), category (`Drinks/Mains/…`), time (`Today/Yesterday/Week/Month/Custom`), area (`Indoor/Outdoor/…`), reservation scope (`Upcoming/Today/Past/All`).
- Active tab = gold fill; counts shown in parentheses.

## Entity list/grid + inline actions

- Each entity is a **card** (or table row) with identity, key attributes, a **status badge**, and **inline actions** (✏️ edit, 🗑️ delete, activate toggle, or a primary verb like **Seat** / **Save**).
- Kebab (⋮) menu for secondary/destructive device actions.

## Create/Edit dialog

- Modal titled "Add New <Entity>" / "New <Entity>".
- Grouped sections with bold section headers (e.g. "Guest Information", "Reservation Details").
- Required fields marked `*`.
- **Image upload** slot ("Upload …, cropped to square, max 10MB") when the entity has media.
- Footer: **Cancel** (ghost) + **primary** (gold): "Create" / "Add" / "Add User".

## Status badges (colour = meaning)

| Colour | Meaning |
|---|---|
| Gold | Vacant / neutral-active tab |
| Red | Alloted / danger / delete |
| Green | Active / success / positive |
| Purple | Reserved |
| Blue | Info / shutdown |

## "Visible in LUXEGENIE" toggle

Content-configuration sections expose a master visibility switch controlling what the guest device shows. A distinctive product pattern (manager configures guest-device content in the same place they manage operations).

## QR-code as content

Menu, WiFi, and Loyalty Club are delivered to guests as **uploaded QR images** rather than structured data — a recurring lightweight-integration pattern.

## Real-time, no-refresh

Floor and metrics update live; the notifications bell is the ambient activity feed. Users are not expected to manually refresh.

## Naming conventions (Observed)

- Tables: `T01`, `T40`, `T50` (zero-padded, area-clustered numbering).
- Staff identified by short `server_code`.
- Money in ₹ with 2 decimals as strings.
- Slight nav/route/title mismatches exist (see [IA](../architecture/information-architecture.md)); spelling "**alloted**" (single-l) is the canonical status token in data and UI.
