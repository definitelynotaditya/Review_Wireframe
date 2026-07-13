
# DESIGN.md

This document serves as the canonical visual and interaction specification for the **Quorum** Meeting Room platform. It defines the design system, spatial layouts, visual hierarchy, and interactive mechanics of the product. Written in an implementation-agnostic format, it is optimized for ingest by human product designers, front-end engineers, and AI-assisted interface generators.

---

## 1. Product Overview

* **Platform:** **Woobly** — the smart-hospitality platform that provides this product. The product is **Woobly Meeting Room Management**.
* **Client / venue brand:** **Quorum** — the members' club that operates the meeting rooms. "Quorum" is the guest-facing brand shown on LUXEGENIE ("Welcome to Quorum"). Do not confuse platform branding (Woobly) with customer branding (Quorum).
* **Device:** **LUXEGENIE / LG** — the in-room guest tablet, pre-configured per room.
* **Purpose:** An operationally focused management dashboard and companion in-room guest tablet system (LUXEGENIE) to schedule, monitor, service, and close meeting room sessions.
* **Primary Users:** Venue Managers and Operations Staff (Dashboard); Corporate Members and Walk-in Guests (LUXEGENIE In-Room Screen).
* **Product Philosophy:** An extension of the existing Woobly restaurant platform, not a standalone application. Every design decision must minimize staff effort and reduce manual operational friction.
* **Primary Operating Mode:** Desktop-first management dashboard (fixed sidebar, high density) paired with fixed-orientation, dedicated in-room hardware devices (LUXEGENIE tablets).
* **Future Roadmap:** Direct, automated calendar blocking from LUXEGENIE; Touche POS API integrations; automated billing and payment settlement; automated F&B kitchen routing; RF-based staff notifications.

---

## 2. Creative Direction: The Sovereign Lounge

The visual identity of Quorum is anchored in the spatial quietness and structural elegance of a premium, member-only architectural lounge. The interface must not feel like a typical piece of enterprise software; it must feel like a natural digital extension of physical luxury hospitality.

### The Atmosphere
The interface resembles a dimly lit private workspace where physical elements are constructed from premium, tactile materials. There is a strong sense of architectural weight, stillness, and absolute privacy. It is an environment of low light, warm ambient highlights, and clean, geometric order.

### The Operator's Feeling
The dashboard must instill a sense of absolute composure, control, and authority. In moments of peak operational load, the interface acts as a silent coordinator—never shouting, never crowding, and never demanding hectic scanning. Operating the dashboard should feel as deliberate and satisfying as adjusting a milled metal dial on a high-end physical console.

### Defining "Premium" for Quorum
Premium is expressed through restraint, not decoration. It is found in perfect spatial alignment, generous but highly functional structural boundaries, clean typographical contrast, and a total absence of trendy visual noise. Every element on the screen exists for operational utility, yet is finished with the elegance of a custom-milled physical component.

---

## 3. Emotional Design Principles

To ensure that venue staff remain composed and highly efficient during peak operating hours, the design must actively enforce these psychological states:

* **Calm Over Commotion:** Busy environments generate high stress. The dashboard must use a dark, low-energy palette to soothe the eyes. Bright colors are strictly quarantined, lighting up only to flag critical, time-sensitive guest dispatches.
* **Confidence Through Predictability:** An operator should never guess the outcome of a click. Layouts, action placements, and system feedbacks are strictly consistent across all modules. If a primary action resides in the bottom-right of a panel once, it must reside there always.
* **Zero Cognitive Hunting:** The interface actively displays the next physical task. Operators are spared from reading lines of secondary text or scanning dense, unstructured tables. The design surfaces the single most critical operational task automatically.
* **In Control, Always:** When scheduling conflicts or payment overrides occur, the interface displays clean, transparent options rather than dead-end error blocks. The software assists the operator's judgment; it never dictates it.

---

## 4. Brand & Visual References

To generate consistent layouts, the design borrows specific structural and visual qualities from premium consumer and professional references:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DESIGN SYSTEM REVENUE                          │
├───────────────────┬─────────────────────────────────────────────────────┤
│ Reference         │ Aesthetic Quality to Borrow                         │
├───────────────────┼─────────────────────────────────────────────────────┤
│ Leica             │ Milled metal tactile precision, extreme contrast,   │
│                   │ tactile mechanical dials, tiny intentional accents. │
├───────────────────┼─────────────────────────────────────────────────────┤
│ Aman Hotels       │ Monolithic spatial quietness, stone-like structures,│
│                   │ absolute privacy, warm ambient lighting.            │
├───────────────────┼─────────────────────────────────────────────────────┤
│ Stripe Dashboard  │ Structured ledgers, precise grids, high tabular     │
│                   │ hierarchy, clean numeric layouts.                   │
├───────────────────┼─────────────────────────────────────────────────────┤
│ Linear            │ High-density keyboard-friendly flows, structural    │
│                   │ borders, silent command structures.                 │
├───────────────────┼─────────────────────────────────────────────────────┤
│ Cron / Amie       │ Beautiful, timeline-based reservation layouts.       │
├───────────────────┼─────────────────────────────────────────────────────┤
│ Apple Business    │ Structural clarity, effortless readability under     │
│                   │ high stress, generous negative space.               │
├───────────────────┼─────────────────────────────────────────────────────┤
│ Raycast           │ Direct, single-command utility, zero wasted motion, │
│                   │ fast interface layouts.                             │
└───────────────────┴─────────────────────────────────────────────────────┘
```

---

## 5. Layout & Grid Principles

### Efficient Information Density
High density in Quorum must never be equated with crowding. We practice **Efficient Information Density**—an expensive, highly structured spatial layout where generous negative space is used deliberately to organize and isolate data blocks. 

* Squeezing or packing cards tightly is prohibited.
* Spacing must feel expansive and luxurious, yet highly functional. 
* Clarity is achieved by utilizing strict grid lines and precise typographical hierarchies to separate values, rather than relying on heavy visual borders or colorful background panels.

### Spacing & Measurement Scale
Layout structures are governed by a strict geometric spacing scale.

* **Layout Margin:** Generous spacing (`24px` / `1.5rem`) to frame the core content area.
* **Container Padding:** Consistent internal padding (`16px` / `1rem`) to isolate content within panels.
* **Element Gap:** Dense, structured spacing (`8px` / `0.5rem` or `12px` / `0.75rem`) to keep associated data elements unified.
* **Border Radius:** Controls use sharp, precise corners (`6px`); cards and panels use a slightly softer radius (`8px`) to separate nested structures.

### Responsive Breakpoints & Sizing Targets
* **Desktop Layout:** Pinned left sidebar for high-density navigation. The workspace display organizes room grids in a multi-column pattern.
* **Tablet Layout:** The left sidebar collapses to slide overlay panels, triggered by a top-bar menu icon (`☰`). Grids scale down to two columns.
* **Mobile Layout:** Single-column layout. Drawers expand to fill the entire viewport width. Horizontal tab-bars convert to swipeable layouts (`overflow-x: auto`).
* **Interactive Touch Targets:** Sized generously (minimum `44px` on the Dashboard and `48px` on the guest-facing in-room LUXEGENIE screen) to prevent mis-taps.

---

## 6. Visual Language

### Color Token System
The color palette uses a dark-first base to minimize eye strain during long operational shifts.

```
[App Canvas Background] Deep Slate Canvas
    └── [Card / Panel Base Container] Architectural Surface
            └── [Elevated Overlay Drawer/Modal] Floating Sheet
```

* **Deep Slate Canvas:** A rich, dark architectural canvas (`#0F172A`) that recedes behind operational information, anchoring the workspace in absolute visual stability.
* **Architectural Surface:** Elevated container base (`#1E293B`) used for primary cards, tables, and content sections.
* **Floating Sheet:** Elevated overlay container (`#334155`) used for slide-out drawers and modal dialogs.
* **Warm Brushed Brass:** Used sparingly (`#B69549`) to communicate authority, focus active navigation, and signal primary execution steps.
* **Bright Accent Gold:** High-visibility highlight color (`#EAB308` / `#F5D76E`) used for active badges, toggles, and critical focus indicators.
* **High-Contrast Text:** Off-white, crisp text (`#F8FAFC`) used for primary headlines, values, and titles.
* **Muted Text:** Low-contrast grey (`#94A3B8`) used for background structural labels, secondary parameters, and timestamps.
* **Default Border Line:** Thin, subtle structural hairlines (`1px solid #334155`) that define bounding zones without adding visual mass.
* **Active Border Line:** Sharp, high-contrast gold outline (`1px solid #B69549`) used to isolate active or focused interfaces.

### Surface Materials
To enhance the premium hospitality feeling, components should resemble physical interior surfaces:
* **Matte Graphite:** The core background texture of all panels, designed to absorb bright ambient light and prevent operational eye fatigue.
* **Brushed Brass:** Reserved for highly focused action buttons, primary navigation items, and active structural borders.
* **Anodized Aluminium:** Light-grey structural dividers that define interior borders with metallic sharpness.
* **Smoked Glass Accents:** Applied to slide-out drawers and modal overlays, creating a rich visual depth that keeps the parent room board visible but elegantly out of focus.

### Lighting & Atmosphere
The interface is designed as if it exists inside a dimly lit physical space.
* **Soft Ambient Light:** Surfaces glow gently, avoiding harsh digital white backlights.
* **Warm Highlights:** Selected or active components cast subtle, gold-tinted drop shadows to indicate elevation.
* **Deep Intentional Shadows:** Overlays cast soft, broad-diffusion shadows onto the canvas, emphasizing spatial separation.
* **Minimal Reflections:** Glossy finishes and heavy, bright gradients are omitted to eliminate glare and distraction during night operations.

### Room Status Visual Palette
To ensure status readability independent of color (colorblind accessibility), every status badge must display explicit bracketed text alongside its color assignment.

* **Available:** Warm Brushed Brass text and outline, indicating an inviting and ready state. Displays `[Available]`.
* **Reserved:** Deep, rich purple, indicating an upcoming session. Displays `[Reserved]`.
* **In-Use:** Crimson Red alert color, indicating an occupied room. Displays `[In-Use]`.
* **Ending Soon:** Soft Amber warning color, indicating immediate operational attention is required. Displays `[Ending Soon]`.
* **Billing:** Clear operational blue, indicating payment processing. Displays `[Billing]`.
* **Under Maintenance:** Low-contrast grey, indicating a decommissioned state. Displays `[Maintenance]`.
* **System Success:** Emerald Green, used for successful confirmations and high guest ratings. Displays `[Success]`.

### Typography Scale
* **Display Titles:** Editorial-grade serif displaying high contrast, offset by gold highlights to establish brand prestige.
* **UI Interface Headings:** Clean, geometric sans-serif that ensures rapid legibility across varying view distances.
* **Body Text & Standard Data:** Crisp, readable sans-serif optimized for functional data density.
* **Metadata & Secondary Labels:** Small, tracking-wide uppercase characters to separate system labels from user data.

### Dynamic Global UI States

#### 1. Loading State (`⟳`)
Renders empty structural layout skeletons with a subtle opacity pulse. Keeps the parent app shell fully interactive.

#### 2. Empty State (`— empty —`)
Displays a centered layout structure within container bounds, presenting an empty state message paired with a primary creation action.

#### 3. Success State
Fires an overlay banner (toast) in the top-right corner. Updates the underlying UI state automatically via background synchronization.

#### 4. System Error State (`⚠`)
Displays an inline crimson banner within the affected panel, accompanied by a refresh icon. Form data is preserved during errors.

---

## 7. Iconography & Illustration Guidelines

### Iconography Rules
* **Thin Outline Profile:** Icons must use thin, uniform geometric lines. Solid glyphs are prohibited except as active badges.
* **Consistent Stroke Weight:** Every icon in the platform must share an identical visual weight.
* **Monochrome by Default:** Icons must match the typography color of their parent container. They inherit alert colors (amber, red) only when indicating an active request.
* **Support Labels:** Icons are design accents. They must always accompany text labels, never replace them.

### Illustration Rules
* **Minimal Line Aesthetics:** Illustrations must be constructed of simple, technical line art matching the architectural canvas.
* **Operational Focus:** Avoid marketing-style graphics, abstract shapes, or playful decorations. Use schematic or structural visual layouts instead.
* **No Mascots or Stock Photography:** Mascots and stock photography are strictly prohibited.
* **Limited Placement:** Illustrations are reserved exclusively for empty states or error panels.

---

## 8. Design Anti-Goals

To maintain Quorum's high-density operational utility and premium brand expression, the design must explicitly avoid patterns that resemble:

* **Generic Admin Dashboards & Bootstrap Templates:** Massive card wrappers, default primary blue buttons, and generic layout blocks feel cheap, industrial, and completely detached from the hospitality brand.
* **Tailwind Marketplace Templates:** Standard, over-spaced SaaS dashboards with massive paddings and rounded, friendly UI elements degrade the quiet authority and speed of interaction required by staff.
* **Dribbble Concepts:** Avoid visual-first designs that rely on bright gradients, excessive background blurs, oversized text blocks, and zero information density. The interface is a tool, not a marketing page.
* **Material Design Clones:** Standard floating actions, bright primary colors, shadow-based elevation cards, and circular ripple effects look generic and feel clinical.
* **Playful Rounded SaaS UIs:** Pastel shades, soft pill-shaped buttons, and cartoonish interactions look immature and undermine the premium members-club atmosphere.
* **Neon Cyberpunk / Sci-Fi Dashboards:** Glowing neon borders, high-intensity color blocks, and retro-futuristic styling introduce cognitive fatigue and reduce the readability of functional data under stress.

---

## 9. Interaction & Motion Philosophy

### Intentional Motion over Visual Entertainment
Motion in Quorum is a tool used strictly to direct the operator's attention and reinforce operational confidence. It must never feel decorative, playful, or slow down interactions.

* **Restrained & Physical:** Motion follows the laws of physical hardware. Elements translate with a crisp, weighted feel. There are no loose bounces or exaggerated arcs.
* **The Tactile Feedback Principle:** When an operator clicks a button or triggers a toggle, the UI responds with a subtle visual press. This reinforces physical mechanics and confirms execution instantly.
* **Deceleration Curves for Overlays:** Task drawers slide into view with a smooth, rapid deceleration curve. They feel heavy and grounded, sliding to a firm stop at the screen margin.
* **Visual Alerts as Operational Markers:** Visual animations—such as the horizontal card shake—are reserved exclusively for unacknowledged alerts. Once staff act upon the request, the animation stops instantly.

---

## 10. Component Library & Visual Personalities

Every component in the library has a designated visual personality that instructs how it should be rendered.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          COMPONENT PERSONALITIES                        │
├───────────────────┬─────────────────────────────────────────────────────┤
│ Component         │ Intended Visual Personality                         │
├───────────────────┼─────────────────────────────────────────────────────┤
│ Room Cards        │ Architectural, premium, grounded, physical.         │
│                   │ Feels like a solid object placed on the canvas.     │
├───────────────────┼─────────────────────────────────────────────────────┤
│ Buttons           │ Deliberate, tactile, impossible to press            │
│                   │ accidentally. Requires focused interaction weight.   │
├───────────────────┼─────────────────────────────────────────────────────┤
│ Tables            │ Operational, highly structured, monochromatic,      │
│                   │ quiet. Speaks only when active alerts exist.        │
├───────────────────┼─────────────────────────────────────────────────────┤
│ Forms             │ Invisible until needed, lightweight, confidence-     │
│                   │ inspiring. Pre-populated, focused.                  │
├───────────────────┼─────────────────────────────────────────────────────┤
│ Status Badges     │ Informative rather than decorative. Brackets        │
│                   │ emphasize textual data clarity.                     │
└───────────────────┴─────────────────────────────────────────────────────┘
```

### Room Card Component
* **Purpose:** High-density, real-time status card displaying room state and primary next action.

```
┌────────────────────────────────────────────────────────┐
│ R01 (Main Lounge)                      [ Ending Soon ] │
│ Caps: 8 Seats · Rate: ₹1500/hr                         │
│                                                        │
│ Guest: J. Peterson · Slot: 14:00 - 16:00               │
│ Alerts: [ Assistance ] [ F&B Order ⚠ ]                 │
├────────────────────────────────────────────────────────┤
│ [ Extend +30 ]*                                      ⋮ │
└────────────────────────────────────────────────────────┘
```
* **Visual Zones:**
  1. *Header Zone:* Room identifier, room capacity, base rate, and active state badge.
  2. *Status Zone:* Current occupant, active scheduled booking window, and color-coded guest alert badges.
  3. *Action Zone:* One prominent, state-specific primary action button and an overflow actions icon (`⋮`).

### Booking Wizard (Stepper)
* **Purpose:** Calendar-first booking wrapper (the 7-step guided sequence: Date → Duration → Time Slot → Seats → Available Rooms → Details → Confirm).
* **Visual Zones:**
  1. *Progress Tracker:* Monochromatic step bar showing completed and active stages.
  2. *Interactive Picker Panel:* Clean timeline grids showing active bookings and available openings.
  3. *Pricing Summary:* Real-time, calculated visual invoice showing hourly and package totals.
  4. *Lookup Card:* Member validation input that auto-fills contact information or displays error states.

### Inline Extension Control
* **Purpose:** Single-click operational extension panel.
* **Visual Behavior:** Applies a +30-minute block instantly when the upcoming slot is clear. If blocked by another booking, it displays a clear list of scheduling conflicts with manual override options.

---

## 11. Screen Directory

### S0 · App Shell
* **Purpose:** Permanent layout frame containing global navigation and utilities.
* **Primary CTA:** None.
* **Visual Hierarchy:** Pinned left navigation bar $\rightarrow$ Header Title $\rightarrow$ Central Content Grid.

### S1 · Meeting Rooms Live Board (Landing Surface)
* **Purpose:** Core operational room control board.
* **Primary CTA:** Exactly **one** contextual action per card, driven by room state (canonical set — see [99-components C1](ux/wireframes/99-components.md#c1--room-card--extends-restaurant-table-card--the-atomic-unit-of-the-live-board)):
  * `{Available}` $\rightarrow$ `[ Walk-in ]` *(instant same-time booking of this free room; scheduled bookings go through Bookings → New Booking to preserve calendar-first)*
  * `{Reserved}` $\rightarrow$ `[ View ]` *(**Start Meeting is a guest action on LUXEGENIE**, never a dashboard button — BR-S2)*
  * `{In-Use}` (no request) $\rightarrow$ `[ View ]`
  * `{In-Use}` + service request $\rightarrow$ `[ Accept ]`
  * `{In-Use}` + F&B order $\rightarrow$ `[ View Order ]`
  * `{In-Use}` + LG extension request $\rightarrow$ `[ Seen ]`
  * `{Ending Soon}` $\rightarrow$ `[ Extend +30 ]`
  * `{Billing}` $\rightarrow$ `[ Enter Bill ]`
  * `{Ended — action needed}` $\rightarrow$ `[ End Meeting ]`
  * `{Under Maintenance}` $\rightarrow$ `[ Clear ]`
* **Critical Elements:** Grids of room cards, **attention-sorted** (open/escalated requests, ended-unbilled, ending-soon rise to the top), then in-use/reserved, available, and maintenance.

### S2 · Room Detail Drawer
* **Purpose:** Sliding contextual panel displaying session history and active alerts for a single room.
* **Primary CTA:** Dynamic context action.
* **Critical Elements:** Current guest profile, active timers, historical request log, upcoming booking.

### S3 · Dashboard — Operational KPIs (nav label: "Dashboard")
* **Purpose:** Live operational summary of **today** — active utilization and pending alerts. Revenue/ratings analytics are **not** here; they live in View History (S13), per FD-20.
* **Primary CTA:** `[ View History Log ]`
* **Critical Elements:** Active occupancy levels, open and escalated service request queues.

### S4 · Bookings — List (nav label: "Bookings")
* **Purpose:** Central list of all room bookings; the entry to the calendar-first create flow.
* **Primary CTA:** `[ ＋ New Booking ]`
* **Critical Elements:** Tab filters (Upcoming, Today, Past, All), search inputs, tabular list of guest information, schedule blocks, and status values.

### S5 · Booking Drawer Wizard
* **Purpose:** Multi-step booking panel (calendar-first guided sequence).
* **Primary CTA:** `[ Confirm Reservation ]` (on final step).
* **Critical Elements:** Interactive slot timeline picker, live pricing estimator, member lookup/validation card.

### S6 · Manage Rooms Configurations
* **Purpose:** Administrative catalog of configured spaces and active rates.
* **Primary CTA:** `[ ＋ Add Room ]`
* **Critical Elements:** Room properties, assigned device statuses, base rate values.

### S7 · Room Configuration Modal
* **Purpose:** Form overlay to edit room details, pricing structures, or schedule maintenance blocks.
* **Primary CTA:** `[ Save Room Details ]`
* **Critical Elements:** Pricing input fields (Hourly, Half-Day, Full-Day), maintenance toggle, conflict-rerouting visual panel.

### S8 · F&B Catalogue Editor
* **Purpose:** Manage the dedicated in-room meeting-space food and beverage menu.
* **Primary CTA:** `[ ＋ Add New Item ]`
* **Critical Elements:** Product list, item tags (Veg, Non-Veg), category filters.

### S9 · Billing & Payment Panel Drawer
* **Purpose:** Capture physical POS receipt totals and close out active room sessions.
* **Primary CTA:** `[ Confirm Payment ]`
* **Critical Elements:** Session totals, manual invoice inputs, payment mode selector deck (Q Pay, Card, Cash, Payment Link, QR).

### S10 · F&B Order Review Drawer
* **Purpose:** **Manual** review-and-punch panel for an incoming guest F&B order. There is **no automatic kitchen/POS routing in V1** — staff review the order and punch it into the POS themselves (FD-05; auto-F&B is future, FD-23).
* **Primary CTA:** `[ Order Punched ]`
* **Critical Elements:** Editable order lines (add / remove / change quantity), an **Add verbal order** field, and the escalation state (`{Escalated ⚠}` after 1 min unattended).

### S11 · Meeting Extension Control
* **Purpose:** The two extension paths (FD-17) — the **dashboard-authoritative `[ Extend +30 ]`** (immediate, one-click when the window is free) and the **LUXEGENIE request** handled with `[ Seen ]`. A conflict panel appears **only when the extension is blocked**.
* **Primary CTA:** `[ Extend +30 ]` (dashboard, immediate) / `[ Seen ]` (LG request).
* **Critical Elements:** Current end time → proposed new end, conflicting booking details, and an `[ Override ]` for the blocked case.

### S12 · Member & Guest Directory
* **Purpose:** Search and edit corporate member profiles.
* **Primary CTA:** `[ Add Member Profile ]`
* **Critical Elements:** CSV batch uploader, dynamic member search table.

### S13 · View History (Analytics)
* **Purpose:** Deep visual inspection of past performance logs (kept separate from live views).
* **Critical Elements:** Custom date range filters, tabular data logs tracking revenue totals, room utilization, average ratings, and payment split percentages.

### S14 · Recent Activities Stream
* **Purpose:** Real-time audit log of all system alerts, dispatches, and staff actions.
* **Critical Elements:** Dynamic chronological event list with staff response times.

### S15 · Staff Management
* **Purpose:** CRUD interface for staff access profiles and operational keys.
* **Primary CTA:** `[ Create User ]`

### S16 · LUXEGENIE Device Fleet
* **Purpose:** Track and manage the connection status of physical in-room tablets.
* **Critical Elements:** Battery status indicators, Wi-Fi signal strengths, assigned room numbers.

### S17 · Settings Configurator
* **Purpose:** Manage policy limits and dynamic business configurations.
* **Critical Elements:** Cancellation rules, dynamic pricing policies, Wi-Fi parameters, default reminder configurations.

### S18 · LUXEGENIE In-Room Tablet Screen
* **Purpose:** Clean, high-contrast, guest-facing tablet UI (companion set that drives dashboard events).
* **Primary CTA:** Dynamic context action per screen (e.g., `[ Start Meeting ]` on the Reserved screen, `[ Bill Request ]` from home, `[ End Meeting ]` at the end). The guest **pays externally** — LUXEGENIE never captures payment; it shows the total plus a per-mode instruction while staff confirm payment on the dashboard (BR-PAY5).
* **Critical Elements:** Reserved/idle screen, in-meeting home grid, Wi-Fi QR display, F&B cart controls, the single service-request pattern, per-mode bill instructions, ratings capture, and ending-soon prompts (**no auto-end** — BR-END1).

---

## 12. Accessibility

* **Screen-Reader Optimization:** Every non-text element, active icon, and visual status indicator must carry a descriptive, high-contrast screen reader label.
* **Visual State Independence:** Color must never be the sole indicator of a room's state or system changes. Status labels must be presented in clear, written text alongside color tags.
* **Touch-Target Safeguards:** To ensure reliable control in fast-paced workspaces, interactive buttons and toggles must maintain generous, clear tap bounds on both administrator and guest interfaces.

---

## 13. Responsive Layout Architectures

### Desktop Grid Structure
The system uses a persistent left navigation bar on large screens to anchor the primary workspace.

The sidebar order is **room-first** (FD-12): the live Meeting Rooms board is the landing surface and the first nav item. Canonical order — **Meeting Rooms · Dashboard · Bookings · Manage Rooms · F&B Menu · Members · LUXEGENIE · Users · Settings** (View History and Recent Activities are reached by buttons, not the sidebar). See [Information_Architecture](architecture/Information_Architecture.md).

```
┌──────────────────────────────────────────────────────────────┐
│ ◇ WOOBLY         │ Meeting Rooms                       🔔 👤 │
│ Manager Dash     ├──────────────────────────────────────────┤
│                  │ ⌕ Search   Status (•All)(Avail)(In-Use)  │
│ ▸ Meeting Rooms• │                     (Ending)(Billing)(Mt)│
│ ▸ Dashboard      ├──────────────────────────────────────────┤
│ ▸ Bookings       │ ┌─────────────┐ ┌─────────────┐          │
│ ▸ Manage Rooms   │ │ R01         │ │ R02         │          │
│ ▸ F&B Menu       │ │ {Available} │ │ {In-Use}    │          │
│ ▸ Members        │ └─────────────┘ └─────────────┘          │
│ ▸ LUXEGENIE      │                                          │
│ ▸ Users          │                                          │
│ ▸ Settings       │                                          │
└──────────────────────────────────────────────────────────────┘
```

### Guest-Facing Tablet Structure
A persistent header anchors the screen, framing service selection cards that are optimized for quick touch interactions.

```
┌────────────────────────────────────────────────────────┐
│  ROOM 101                 QUORUM         14:32  [52%]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Welcome, J. Peterson                                  │
│  Remaining Time: 01:28:12                              │
│                                                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │  Tap for     │ │  Request     │ │  F&B Menu    │    │
│  │  Wi-Fi Code  │ │  Assistance  │ │  Orders      │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │  Meeting     │ │  Events &    │ │  Request     │    │
│  │  Services    │ │  Loyalty     │ │  Bill        │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 14. Future Design Considerations

* **Integrated POS Hook Design:** Configuration pages and billing drawers are designed with dedicated layout areas to display automated invoice items and digital POS details once payment gateway integrations are finalized.
* **Direct Guest Extension Interface:** LUXEGENIE screens are built to accommodate direct session extensions initiated from the guest tablet once the scheduling engine integrates automatic calendar blocking.
* **Automatic F&B Routing (future):** In V1, F&B orders are **manually reviewed and punched** by staff (no kitchen/POS automation). The F&B Order Review drawer is laid out so that, when the future **Automatic F&B** integration lands (FD-23), automated ticket routing to the kitchen can be added without restructuring the panel.

---

## 15. Design Tokens (Figma-ready appendix)

> **Purpose:** the concrete, machine-ingestible values behind §5 (Layout & Grid) and §6 (Visual Language). This is the single source of truth for colour, type, spacing, radius, elevation, component dimensions, and motion, so the next phase (Figma generation) requires **no additional visual-design decisions** — only assembly. Values are expressed as CSS custom properties; a Figma builder maps each to a variable/style. **Dark theme is canonical; a light theme is provided for the toggle (both must be supported).** Colour is deferred in the grayscale reference wireframes — these tokens are applied at the Figma/high-fidelity stage.

### 15.1 Colour — semantic tokens

| Token | Dark (canonical) | Light | Role |
|---|---|---|---|
| `--canvas` | `#0F172A` | `#F8FAFC` | App background (Deep Slate Canvas) |
| `--surface` | `#1E293B` | `#FFFFFF` | Cards, tables, content panels (Architectural Surface) |
| `--surface-raised` | `#334155` | `#F1F5F9` | Drawers, modals, floating sheets (Smoked Glass) |
| `--surface-hover` | `#273449` | `#F1F5F9` | Row/card hover |
| `--border` | `#334155` | `#E2E8F0` | Hairline dividers (1px, Anodized Aluminium) |
| `--border-strong` | `#475569` | `#CBD5E1` | Emphasised dividers |
| `--border-active` | `#B69549` | `#B69549` | Focused/active outline (1px brass) |
| `--text` | `#F8FAFC` | `#0F172A` | Primary text, values, titles |
| `--text-muted` | `#94A3B8` | `#475569` | Labels, subtitles, units, timestamps |
| `--text-subtle` | `#64748B` | `#94A3B8` | De-emphasised metadata |
| `--brass` | `#B69549` | `#9A7B33` | Primary action, active nav/tab, brand (Brushed Brass) |
| `--brass-hover` | `#C5A65C` | `#B69549` | Primary hover |
| `--brass-pressed` | `#9C7F3E` | `#856A2C` | Primary pressed |
| `--on-brass` | `#0F172A` | `#0F172A` | Text/icon on a brass fill |
| `--gold-accent` | `#EAB308` | `#CA9A04` | High-emphasis highlight, login CTA |
| `--gold-accent-soft` | `#F5D76E` | `#EAB308` | Soft active highlight |
| `--focus-ring` | `rgba(182,149,73,0.45)` | `rgba(154,123,51,0.40)` | 2px focus ring |

### 15.2 Colour — room-status palette (aligns 1:1 with [Interaction_Patterns §2](ux/Interaction_Patterns.md#2-status-colour-vocabulary))

Every status is shown as a **bracketed text token** *and* colour (never colour alone — accessibility, §12). Badge treatment on dark: text = hue at full strength, border = 1px hue, fill = hue @ ~14% alpha. `[Available]` is the calm identity state and uses a **brass outline/text (no fill)** so it never competes with brass **primary-action fills**.

| Room state | Hue token | Hex | Badge text token |
|---|---|---|---|
| **Available** | `--status-available` | `#B69549` (brass, outline only) | `[Available]` |
| **Reserved** | `--status-reserved` | `#8B5CF6` (violet) | `[Reserved]` |
| **In-Use** | `--status-inuse` | `#EF4444` (red) | `[In-Use]` |
| **Ending Soon** | `--status-ending` | `#F59E0B` (amber) | `[Ending Soon]` |
| **Billing** | `--status-billing` | `#3B82F6` (blue) | `[Billing]` |
| **Under Maintenance** | `--status-maintenance` | `#64748B` (grey) | `[Maintenance]` |
| **Success / positive** | `--status-success` | `#10B981` (emerald) | `[Success]` |

> Request sub-badges (`{Assistance Requested}`, `{F&B Order Requested}`, `{Escalated ⚠}`) use `--text-muted` by default; an **escalated** (>1 min) badge switches to `--status-inuse` + the shake animation (§15.8).

### 15.3 Typography

Two families only: a **serif** for brand/display/page titles (prestige), a **UI sans** for everything operational (density + legibility). Money and counts use **tabular figures**.

- `--font-serif: "Chronicle Display", Georgia, "Times New Roman", serif;`
- `--font-sans: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;`
- `--font-num: var(--font-sans); font-variant-numeric: tabular-nums;`

| Style token | Family | Size / line-height | Weight | Tracking | Use |
|---|---|---|---|---|---|
| `display-lg` | serif | 28 / 36px | 500 | −0.01em | Marketing/hero (rare) |
| `page-title` | serif | 22 / 30px | 500 | −0.005em | Screen title (top bar) |
| `section` | sans | 16 / 24px | 600 | 0 | Panel/section headers |
| `title` | sans | 15 / 22px | 600 | 0 | Card titles, room id |
| `body` | sans | 14 / 20px | 400 | 0 | Default text, table cells |
| `body-strong` | sans | 14 / 20px | 600 | 0 | Emphasised body, values |
| `label` | sans | 13 / 18px | 500 | 0 | Form labels, buttons |
| `meta` | sans | 12 / 16px | 500 | +0.06em, UPPERCASE | Metadata labels, badges, KPI captions |
| `number` | num | 20 / 28px | 600 | 0 | KPI values, money totals |

### 15.4 Spacing scale (4px base)

`--space-0_5: 2px` · `--space-1: 4px` · `--space-2: 8px` · `--space-3: 12px` · `--space-4: 16px` · `--space-5: 20px` · `--space-6: 24px` · `--space-8: 32px` · `--space-10: 40px` · `--space-12: 48px` · `--space-16: 64px`

- **Layout margin** (frames content): `--space-6` (24). **Container padding** (inside panels): `--space-4` (16). **Element gap** (associated data): `--space-2`/`--space-3` (8/12). **Grid gutter** (room/card grids): `--space-4` (16).

### 15.5 Radius & borders

`--radius-sm: 4px` (badges, tags) · `--radius-md: 6px` (buttons, inputs, controls) · `--radius-lg: 8px` (cards, panels, drawers) · `--radius-xl: 12px` (modals) · `--radius-pill: 999px` (avatars, toggles).
Borders: hairline `1px solid var(--border)`; active `1px solid var(--border-active)`; focus ring `0 0 0 2px var(--focus-ring)`.

### 15.6 Elevation (dark-first, soft broad-diffusion)

| Token | Shadow (dark) | Use |
|---|---|---|
| `--elev-0` | none | Flush surfaces, table rows |
| `--elev-1` | `0 1px 2px rgba(0,0,0,.30)` | Resting cards |
| `--elev-2` | `0 4px 12px rgba(0,0,0,.35)` | Hovered/raised cards, dropdowns |
| `--elev-3` | `0 16px 48px rgba(0,0,0,.45)` | Drawers, modals |
| `--elev-focus` | `0 0 0 1px var(--brass), 0 0 12px rgba(182,149,73,.25)` | Active/focused element (warm glow) |

Light theme uses the same offsets at lower alpha (`.10`/`.14`/`.20`). No glossy gradients or bright glows (§8 anti-goals).

### 15.7 Component dimensions

| Component | Spec |
|---|---|
| **Sidebar** | `240px` expanded; collapses to a slide-in overlay <1024px; nav item height `40px`, active = brass left-accent + brass text |
| **Top bar** | height `64px`; serif `page-title` + `meta` subtitle (left); theme toggle, bell, profile (right) |
| **Content area** | max-width fluid; padding `--space-6` (24); scrolls independently of the shell |
| **Room card** | padding `--space-4`; radius `--radius-lg`; min-height `140px`; grid `repeat(auto-fill, minmax(280px, 1fr))`, gutter `16px`; **one** primary action slot |
| **KPI card** | padding `--space-5`; radius `--radius-lg`; min-width `180px`; `meta` label + `number` value + optional context line |
| **Drawer** | width `420px` (standard) / `480px` (booking wizard); right-anchored; `--elev-3`; full-screen sheet <768px |
| **Modal** | width `400` (small) / `480` (standard) / `640` (large); radius `--radius-xl`; centered; `--elev-3`; backdrop `rgba(0,0,0,.5)` |
| **Button** | height `40px` (default), `32px` (compact); padding `0 16px`; radius `--radius-md`; `label` type. Primary = brass fill + `--on-brass`; Secondary = `--surface-raised` + `--text`; Ghost = transparent + `--text-muted` |
| **Input / select** | height `40px`; padding `0 12px`; radius `--radius-md`; `1px` border → `--border-active` on focus + focus ring |
| **Segmented tab** | height `34px`; padding `0 12px`; active slot = brass fill; counts in parentheses |
| **Status badge** | height `22px`; padding `0 8px`; radius `--radius-sm`; `meta` type; treatment per §15.2 |
| **Table row** | height `52px`; hairline row separators; hover = `--surface-hover` |
| **Icon** | `16px` inline / `20px` nav / `24px` prominent; stroke `1.5px`, monochrome (§7) |
| **Touch target** | ≥ `44px` (dashboard) · ≥ `48px` (LUXEGENIE) |

### 15.8 Motion

| Token | Value | Use |
|---|---|---|
| `--dur-fast` | `120ms` | Button press, toggle, tab switch |
| `--dur-base` | `200ms` | Hover, badge, small transitions |
| `--dur-overlay` | `280ms` | Drawer/modal slide |
| `--ease-standard` | `cubic-bezier(.2,0,0,1)` | Default (crisp decelerate) |
| `--ease-overlay` | `cubic-bezier(.2,0,0,1)` | Overlays — rapid decel, firm stop at margin (§9) |
| `shake` | horizontal ±4px, `400ms`, 3 cycles | **Only** for an unacknowledged/escalated alert; stops the instant staff act (§9) |

Motion is functional only (§9): no bounces, arcs, or decorative animation. Respect `prefers-reduced-motion` (disable shake → static `⚠`).

### 15.9 Layout grid & breakpoints

| Breakpoint | Range | Behaviour |
|---|---|---|
| **Desktop** | ≥ 1024px | Sidebar pinned (240px); room grid 3-col; drawers 420–480px |
| **Tablet** | 768–1023px | Sidebar → slide-in overlay (`☰`); grids 2-col |
| **Mobile** | < 768px | Single column; drawers/modals → full-screen sheets; segmented tabs scroll (`overflow-x:auto`) |

### 15.10 Z-index scale

`base 0` · `sticky (sidebar/top bar) 100` · `dropdown/menu 200` · `drawer 300` · `modal 400` · `toast 500`.

---

*Tokens above are the canonical hand-off for Figma generation. If a value must change during high-fidelity work, change it here first so this file stays the single source of truth.*
