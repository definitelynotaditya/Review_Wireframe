# Design Language

- **Evidence:** Observed (screenshots + computed styles), 2026-07-12. Hex approximations from `oklch`/`rgb` samples.

## Positioning

Luxury / "**bespoke**" hospitality. Brand promise on login: "BESPOKE EXPERIENCE". Recurring **crown** motif, gold-on-near-black, serif display type. The dashboard reads as premium back-office tooling, not utilitarian SaaS.

## Colour

Dark theme is primary (`localStorage.woobly-theme = "dark"`; a light toggle exists in the top bar).

| Token | Value (observed) | Use |
|---|---|---|
| Background (app) | `oklch(0.208 0.042 265.755)` ≈ **slate-900 `#0F172A`** | page background |
| Surface / card | slightly lighter navy (`#1E293B`-family) | KPI cards, panels, list rows |
| **Primary gold (CTA)** | bright amber/yellow ≈ **`#EAB308` / `#F5D76E`** | Sign In, primary buttons, active tab |
| **Antique gold (action)** | **`rgb(182,149,73)` = `#B69549`** | Save/Add buttons, brand accents, icons |
| Text primary | white / `#F8FAFC` | headings, values |
| Text muted | slate-400 `#94A3B8` | labels, subtitles, units |
| Success | green `#22C55E` | Active status, 👍, Reboot |
| Danger | red `#EF4444` | ALLOTED pill, delete, 👎 |
| Info | blue `#3B82F6` | Shutdown, some icons |
| Reserved | purple `#A855F7` | Transfer-Sessions "Reserved" |

Gold is the identity colour and is used **sparingly for emphasis** (CTAs, active states, accents) against the dark field.

## Typography

| Face | Where |
|---|---|
| **Chronicle Display** (serif, `Chronicle Display Black.otf`) | Brand wordmark, page titles ("Dashboard", "Tables"), display headings |
| System sans (`ui-sans-serif, system-ui`) | All UI text — labels, tables, inputs, buttons |

Pattern: **serif for brand/headings, sans for function.** Section titles are UPPERCASE, letter-spaced, muted.

## Iconography

- Line icons throughout (Lucide/Feather-style), gold or muted.
- **Crown** = brand mark (login, sidebar).
- Per-domain glyphs: 🍴 food, 🛎/bell service, 🔋 power bank, 👨‍🍳 chef's specials, 🏆 top performers, ⭐ ratings, 👍/👎 feedback.

## Layout & spacing

- Generous rounded corners (`rounded-xl`/`2xl`), soft borders, subtle elevation on dark surfaces.
- Card grids (tables, chef specials, devices); single-column stacked panels (dashboard, settings).
- Consistent page header block: **serif title + muted subtitle** top-left; global controls top-right.

## Motion & feedback (Observed/Inferred)

- Primary gold buttons have a soft outer **glow** (login "Sign In").
- Toggles (Visible in LUXEGENIE) are pill switches, gold when on.
- Real-time updates arrive without page reload (see [real-time](../architecture/real-time.md)).

## Tech signal (Observed)

- **Vite + React SPA**, **Tailwind CSS v4** (oklch color space), Lucide-style icons, Pusher client. Not a design-token/CSS-variable system — styling is Tailwind utility classes.

## Voice (UX copy)

- Titles are plain nouns ("Tables", "Reservations"); subtitles are short value statements ("Real-time restaurant performance insights", "Manage and monitor all reservations in your restaurant").
- Empty states: "No data available".
- See [ux/conventions.md](conventions.md).
