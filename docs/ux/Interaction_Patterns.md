# Interaction Patterns & Design Language

> **Status:** Canonical · **Version:** 3.0 · **Last updated:** 2026-07-13
> **Evidence:** Observed live + in `GITHUB REP/src/` (Tailwind classes, `ThemeContext`, `Sidebar.jsx`).
> V3 adds the **core design principle (reduce staff effort)**, the **calendar-first booking pattern**, and the extra room-status colours.

## Purpose

The reusable UX "grammar" and visual language of the platform. Any Meeting Room screen must follow these so it feels built by the same team. Combines what were separate design-language and conventions docs.

## Scope

Design tokens, the page/interaction grammar, status colour vocabulary, and Meeting-Room-specific additions. Screen list is in [Screen_Inventory](Screen_Inventory.md).

## Dependencies

[Component_Mapping](../architecture/Component_Mapping.md) · restaurant component reference [`../reference/restaurant-dashboard/components/`](../reference/restaurant-dashboard/components/).

## Assumptions

Meeting Room adds no new design system; it extends the token/colour vocabulary minimally (one new status colour).

---

## 0. Core design principle — REDUCE STAFF EFFORT (FD-22)

> The primary operational risk is **staff resistance to additional manual work.** Every UX decision must **minimize staff effort.** When two solutions exist, **prefer less effort over more functionality.**

Practical implications (apply to every screen and the next wireframing phase):
- **One primary action per state.** A room card in a given state exposes the single most likely next action (Accept / View Order / Enter Bill / End Meeting) — not a menu of options.
- **Surface work, don't make staff hunt for it.** Attention-needing rooms sort to the top; escalations reach the smartwatch (FD-19) so staff don't watch the screen.
- **Auto-fill over re-typing.** Member ID auto-fills details (BR-MEM2); availability + pricing are computed, not entered.
- **Defaults over decisions.** Pre-select the likely payment mode / duration; make overrides possible but not required.
- **Fewer steps.** The booking flow is a guided sequence with the engine doing the matching (FD-13); staff never scan a room list manually.
- **No unnecessary analytics** on operational screens (FD-20) — keep the operator focused on now.

This principle is the tie-breaker referenced throughout [Dashboard_Architecture](../architecture/Dashboard_Architecture.md), [Screen_Inventory](Screen_Inventory.md), and [User_Flows](User_Flows.md).

## 1. Design tokens (Observed)

| Token | Value | Use |
|---|---|---|
| App background | `slate-900` (`oklch(0.208 0.042 265.755)`) | page |
| Surface/card | lighter navy (`slate-800`-family) | cards, rows, panels |
| **Primary action gold** | `#B69549` (antique gold) | Save/Add/primary buttons, active tab, active nav |
| Accent gold (bright) | `#EAB308` / `#F5D76E` | emphasis, login CTA, active highlights |
| Text primary | white / `#F8FAFC` | headings, values |
| Text muted | `slate-400` `#94A3B8` | labels, subtitles, units |
| Brand serif | "Chronicle Display" | wordmark, page titles, display headings |
| UI sans | system sans | labels, inputs, tables, buttons |

- Dark-first; a light theme toggle exists (`ThemeContext`, `woobly-theme`). Both themes must be supported.
- Gold is the identity colour — used **sparingly** for emphasis against the dark field.

## 2. Status colour vocabulary (Observed + extension)

The room lifecycle (FD-24) has six states + one interrupt; each needs a distinct, consistent colour:

| Colour | Room state | Notes |
|---|---|---|
| 🟡 Gold | **Available** | ready to book/seat |
| 🟣 Purple | **Reserved** | slot started, awaiting Start Meeting |
| 🔴 Red | **In-Use** | meeting active |
| 🟠 Amber | **Ending Soon** | 10-min warning (attention) |
| 🔵 Blue | **Billing** | bill requested / amount entered |
| ⚪️ Grey | **Under Maintenance** | interrupt; 24h booking block |
| 🟢 Green | success / positive | Accept confirmations, ratings |

> Keep colour→meaning consistent so operators read status by colour at a glance (supports FD-22). Amber (Ending Soon) and Blue (Billing) are the V3 additions beyond restaurant's set; grey = Under Maintenance.

Real-time request toasts keep their restaurant colours (see [RealTime_And_Sync §3](../architecture/RealTime_And_Sync.md#3-confirmed-restaurant-events-reference--pushercontextjsx)).

## 3. Page anatomy (every module)

1. **Header block:** serif title + muted subtitle (left); theme toggle, notifications bell, profile (right). Set via `Layout` props.
2. **Search** input where the page lists entities.
3. **Primary action** button (gold), top-right or full-width ("+ New/Add …").
4. **Filter row:** segmented **tabs** (often with counts) ± dropdowns/date.
5. **Content:** card grid or list; empty state "No data available".

## 4. Core interaction patterns

- **Segmented tab filters** — status (Available/…), scope (Upcoming/Today/Past/All), period (today/yesterday/last_7_days/this_month/custom), area, category. Active tab = gold fill; counts in parentheses.
- **Entity list/grid + inline actions** — card/row with identity + key attrs + status badge + inline actions (edit ✏️, delete 🗑️, toggle, or a verb like **Accept**, **View**, **Order Punched**). Kebab (⋮) for secondary/destructive device actions.
- **Create/Edit modal** — titled "Add New {Entity}"; grouped sections with bold headers; required fields `*`; image-upload slot (crop-square ≤10MB → CloudFront) when media; footer Cancel (ghost) + primary (gold).
- **Confirmation modals** — one component per destructive/stateful action (restaurant colocates these per domain, e.g. `TerminateSessionModal`, `MakeVacantConfirmationModal`).
- **Toasts** (`react-hot-toast`) — coloured, icon-led, for real-time request arrivals.
- **"Visible in LUXEGENIE" toggle** — content sections expose a master visibility switch controlling what the guest device shows.
- **Real-time, no-refresh** — floor + metrics update live; the bell is the ambient activity feed. Users never manually refresh.
- **QR-as-content** — Wi-Fi / Menu / Loyalty delivered as uploaded QR images (lightweight-integration pattern).
- **Guided flow (V3)** — the booking experience is a **step sequence** (not a single form), see §4a. Prefer guided flows where the system can compute the answer for the operator (FD-22).

## 4a. Calendar-first booking pattern (FD-13)

Booking is a **guided, engine-backed sequence**, documented once and reused for New Booking and Reschedule:

```
New Booking → Date → Duration → Time Slot → Number of Seats
   → [Availability Engine + Seat Filter + Pricing Calculator]
   → Display Available Rooms (with rates) → Booking Details → Confirm
```

- The operator supplies **constraints**; the **engine returns matching rooms with prices** (BR-A2/A3, BR-P2) — staff never scan a full room list.
- Member bookings **auto-fill** from Member ID (BR-MEM2); an invalid ID blocks progress (BR-MEM3).
- On confirm, **first-save-wins** (BR-CF1); a conflict surfaces the **override** option (BR-CF2) rather than a dead end.
- This pattern is the primary example of "less staff effort over more functionality" (FD-22).

## 5. Attention & escalation pattern (important for Meeting Room)

Requests that need staff action follow a consistent escalation:
- Room card shows the request + a **single primary action** — **Accept** (services), **View Order → Order Punched** (F&B), **Seen** (LG extension request), **Enter Bill** (billing), **End Meeting** (close).
- If **unattended > 1 minute**, the button **animates (shakes)**, a **bell notification** fires **and a Staff Smartwatch alert is sent** (FD-19) so staff needn't watch the screen.
- Acting closes the request; response time is measured.

This is the backbone of the live operations experience — reuse it verbatim for all Meeting Room service/F&B/extension requests. **Meetings never auto-end (FD-21):** at end time the manager gets an attention notification and chooses End Meeting / Generate Bill — the system never closes on its own.

## 6. Naming & formatting conventions

- Rooms: short labels (e.g. `R01` / room name), area-clustered.
- Staff: short `server_code`.
- Money: ₹ with 2 decimals, string.
- Status token spelling follows data; Meeting Room room states: `available`, `reserved`, `in_use`, `ending_soon`, `billing`, `under_maintenance`.
- Slight nav-label/route mismatches are tolerated (restaurant precedent) but avoid new ones.

## 7. Accessibility & responsiveness (Observed)

- Mobile: filter tabs become horizontally swipable (`overflow-x-auto`); sidebar collapses to a slide-in.
- Maintain both light/dark themes and adequate contrast (gold-on-navy passes; verify grey maintenance chip).

## Future Work

- Confirm the maintenance (grey) chip contrast in both themes.
- Design the Availability Picker, Recurrence Control, and Extension Control to fit this grammar (new components, familiar patterns).

## Related Documents

- [Screen_Inventory](Screen_Inventory.md) · [User_Flows](User_Flows.md) · [Component_Mapping](../architecture/Component_Mapping.md)
- Restaurant design reference: [`../reference/_archive/v1-restaurant-kb/design-language.md`](../reference/_archive/v1-restaurant-kb/design-language.md), [`../reference/_archive/v1-restaurant-kb/conventions.md`](../reference/_archive/v1-restaurant-kb/conventions.md)
