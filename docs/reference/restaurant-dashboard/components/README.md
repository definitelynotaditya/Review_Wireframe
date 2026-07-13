# Component & Pattern Library

Reusable UI building blocks reverse-engineered from the dashboard. These are **inferred component boundaries** (the source is a compiled Vite bundle; names are ours). Each is used across multiple pages and should be reused by any new module.

| Component | Used by | Doc |
|---|---|---|
| **App Shell** (sidebar + top bar) | all pages | [app-shell.md](app-shell.md) |
| **Page Header** (title/subtitle + actions) | all pages | in [app-shell.md](app-shell.md) |
| **Entity CRUD List/Grid** (search + tabs + cards + inline actions) | Users, Chef Specials, Manage Tables, Reservations, LUXEGENIE, Guest List | [entity-crud-list.md](entity-crud-list.md) |
| **Create/Edit Modal** | Reservations, Users, Chef Specials, Manage Tables, Settings | [entity-crud-list.md](entity-crud-list.md#createedit-modal) |
| **Table Card** | Tables, Manage Tables, Transfer Sessions | [table-card.md](table-card.md) |
| **Status Badge / Pill** | everywhere | [status-badge.md](status-badge.md) |
| **KPI Stat Card** | Dashboard | [kpi-card.md](kpi-card.md) |
| **Content Section Editor** ("Visible in LUXEGENIE" cards) | Settings | [content-section-editor.md](content-section-editor.md) |
| **Segmented Tab Filter** | most list pages | described in [../ux/conventions.md](../../_archive/v1-restaurant-kb/conventions.md) |
| **Image Upload (crop-to-square, ≤10MB)** | Users, Chef Specials, Settings | described in [content-section-editor.md](content-section-editor.md) |

See [../ux/conventions.md](../../_archive/v1-restaurant-kb/conventions.md) for the interaction grammar these implement, and [../ux/design-language.md](../../_archive/v1-restaurant-kb/design-language.md) for tokens.
