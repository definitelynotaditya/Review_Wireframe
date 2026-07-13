# Design Review — Finalization Audit (Phase 4.5)

> **Status:** Canonical · **Version:** 4.5 · **Date:** 2026-07-13
> **Scope of this pass:** a full cross-repository design-and-consistency review of the frozen V3 documentation, executed as a *design freeze before implementation*. Every issue found was **fixed in place**. This document records what was reviewed, what was contradictory, what changed and why, and the exact state of readiness for founder review and Figma generation.

This complements — it does not replace — the [REPOSITORY_AUDIT](REPOSITORY_AUDIT.md) (the V3-freeze content audit). Where that certified the *product logic* as internally consistent, this pass certifies the *design system, terminology, and presentation layer* as consistent, and delivers the two missing pieces needed before Figma: a **complete design-token system** and a **founder-review visual package**.

---

## 1. Executive summary

The repository arrived at a genuine, high-quality **V3 freeze**: the logic spine ([Business_Rules](product/Business_Rules.md), [Founder_Decision_Log](product/Founder_Decision_Log.md), [State_Machines](architecture/State_Machines.md), [Data_Model](engineering/Data_Model.md)) is excellent, self-consistent, and traceable via `BR-*`/`FD-*` IDs. The review confirmed the product logic holds.

The **drift was concentrated in the presentation layer** — chiefly [DESIGN.md](DESIGN.md), which had been written somewhat independently of the V3 reconciliation and carried stale CTA labels and one stale F&B model. Two structural gaps blocked the stated end-goal ("another AI generates production Figma with minimal additional design decisions"):

1. **DESIGN.md described the visual system qualitatively** ("Warm Brushed Brass") with no concrete, machine-ingestible tokens for type sizes, spacing, elevation, or component dimensions — so a Figma builder would have had to invent most visual decisions.
2. **No founder-facing visual artifact existed** — only engineer-first ASCII wireframes, which the brief explicitly deemed unsuitable for founder review.

Both are now closed. The repository is **coherent end-to-end**, **founder-review-ready**, and **Figma-generation-ready with minimal remaining design decisions.**

**Net changes this pass:** 10 canonical docs edited for consistency; DESIGN.md extended with a complete token appendix (§15); the stale top-level README rewritten; a new **founder-review HTML package** (`docs/founder-review/`) — a navigable 16-screen prototype covering every canonical wireframe (S0–S18); this audit.

---

## 2. Repository audit (what was reviewed)

Read in full and cross-referenced against the canonical [`source-inputs/`](reference/source-inputs/): all 4 source inputs; both READMEs; all `product/`, `architecture/`, `engineering/`, and `ux/` docs; all 18 wireframes + App Shell + component appendix + diagrams; DESIGN.md; PROJECT_STATUS; REPOSITORY_AUDIT.

**Health after this pass:**

| Check | Result |
|---|---|
| Product logic (BR/FD) internally consistent | ✅ confirmed (unchanged; already sound) |
| Terminology consistent across **presentation** docs | ✅ fixed (was drifting in DESIGN.md) |
| Room-state CTAs match the canonical component table | ✅ fixed |
| Navigation order consistent everywhere | ✅ standardized (room-first) |
| Design system is concretely tokenized (Figma-ready) | ✅ added (DESIGN.md §15) |
| Founder-review visual artifact exists | ✅ added (`founder-review/`) |
| Top-level README matches the actual repo | ✅ rewritten (was stale) |
| Screen-numbering schemes reconcilable | ✅ crosswalk added |

---

## 3. Contradictions found

Each was verified against the canonical source-inputs and the frozen `BR-*`/`FD-*` rules before correcting.

| # | Contradiction | Canonical truth | Severity |
|---|---|---|---|
| C1 | **DESIGN.md S10** named "F&B **Fulfillment** Drawer / **Kitchen dispatch** panel", CTA `[ Order Dispatched ]` | F&B is **manually reviewed and punched**; closure verb is **Order Punched**; no kitchen automation in V1 (BR-F3/F4, FD-05; founder call: "manual staff review & punch") | High — invented a business model (kitchen dispatch) the product does not have |
| C2 | **DESIGN.md S1**: `{Reserved} → [ Start Meeting ]` as a **dashboard** button | **Start Meeting is a guest action on LUXEGENIE** (BR-S2). The dashboard's Reserved-card action is `[ View ]` (99-components C1) | High — implied a non-existent operator control |
| C3 | **DESIGN.md S11** extension CTA `[ Extend Block ]` | Canonical verb is `[ Extend +30 ]` (BR-E1) | Medium — label drift |
| C4 | **Bookings wireframe (S4)** primary action `[ Seat ]` | No staff "seat/start" transition exists — Reserved is **time-triggered** (BR-S1), In-Use is **guest-triggered** (BR-S2). Action should be `[ View ]` | Medium — implied a non-existent transition |
| C5 | **App Shell wireframe** drew "Dashboard" first in the sidebar, contradicting its own note and the room-first principle | Landing = Meeting Rooms live board (FD-12); it should be the first nav item | Medium — internal contradiction within one file |
| C6 | **Nav order differed across three files** (App Shell vs Information_Architecture vs diagrams) | One canonical sidebar order is required | Medium |
| C7 | **Domain_Model** `MeetingRoom.status` listed **4** states; Data_Model + State_Machines use **6** | The room's displayed status is the full 6-state lifecycle (FD-24); `ending_soon`/`billing` are session-derived | Low — modeling under-specification |
| C8 | **User_Flows §4** F&B action shown as "Eye" | Canonical label is **View Order** | Low — icon vs label |
| C9 | **Top-level `README.md`** described the restaurant-only reverse-engineering scope, said "Meeting Room work is explicitly out of scope," and linked to folders that no longer exist (`docs/analysis/`, `docs/pages/`, …) | The repository *is* the Meeting Room product | High — the front door contradicted the whole repo |
| C10 | Three screen-numbering schemes (A/B, S0–S18, 00–18) with no map | A crosswalk is needed for cross-referencing | Low |

**Gaps (not contradictions, but blockers to the goal):**
- **G1** — DESIGN.md had no concrete design tokens (type sizes, spacing scale, elevation, component dimensions, motion).
- **G2** — No founder-review visual package existed.

---

## 4. Corrections made

| Ref | Fix | Files touched |
|---|---|---|
| C1 | Renamed **S10 → "F&B Order Review Drawer"**; CTA → `[ Order Punched ]`; removed "kitchen dispatch"; reframed the future-considerations entry as "Automatic F&B routing (future)" | [DESIGN.md](DESIGN.md) |
| C2 | S1 Reserved-card CTA → `[ View ]`; enumerated the full canonical per-state CTA set (Walk-in / View / Accept / View Order / Seen / Extend +30 / Enter Bill / End Meeting / Clear) with the note that Start Meeting is a guest LG action | [DESIGN.md](DESIGN.md) |
| C3 | S11 → `[ Extend +30 ]` / `[ Seen ]`; clarified inline-first + blocked-panel behaviour | [DESIGN.md](DESIGN.md) |
| C4 | Booking-card action `[ Seat ]` → `[ View ]`, with an explicit note that no staff seat/start action exists | [04-bookings-list](ux/wireframes/04-bookings-list.md), [Wireframe_Specification](ux/Wireframe_Specification.md), [Interaction_Patterns](ux/Interaction_Patterns.md) |
| C5, C6 | Standardized the **canonical sidebar order** (room-first) and applied it everywhere it is drawn; stated it explicitly in the IA doc | [00-app-shell](ux/wireframes/00-app-shell.md), [Information_Architecture](architecture/Information_Architecture.md), [DESIGN.md](DESIGN.md), founder-review HTML |
| C7 | `MeetingRoom.status` now lists all 6 states with a note that `ending_soon`/`billing` derive from the session | [Domain_Model](architecture/Domain_Model.md) |
| C8 | "Eye" → "View Order" | [User_Flows](ux/User_Flows.md) |
| C9 | Rewrote the top-level README for the Meeting Room product (branding, layout, product summary, reference-implementation pointer) | [README.md](../README.md) |
| C10 | Added a **Screen-ID crosswalk** (A/B ↔ S0–S18 ↔ wireframe file) | [Screen_Inventory](ux/Screen_Inventory.md) |
| G1 | Added **DESIGN.md §15 — Design Tokens (Figma-ready appendix)**: semantic colour (dark + light), the room-status palette with hex, a full type scale, a 4px spacing scale, radius/border, elevation, component dimensions, motion, breakpoints, z-index | [DESIGN.md](DESIGN.md) |
| G2 | Created **`docs/founder-review/`** — a navigable prototype of **16 self-contained grayscale HTML screens** (every S0–S18 wireframe) + index + README; sidebar, notification bell, and major CTAs are wired so a founder never opens Finder | [founder-review/](founder-review/) |
| — | Wired the new artifacts into the docs index, reading order, and project status | [docs/README.md](README.md), [PROJECT_STATUS.md](PROJECT_STATUS.md) |
| — | Aligned "Reservation" → "Booking" terminology in DESIGN.md component/screen names | [DESIGN.md](DESIGN.md) |

---

## 5. Workflow improvements

- **Booking → room state, clarified:** removed the implied "staff seats a booking" step (C4). The booking list now correctly leads only to **View/edit**; the state transition to Reserved is automatic and to In-Use is guest-driven. This aligns the Bookings surface with the state machine and removes a phantom action a developer might otherwise have built.
- **Extension workflow, unified label:** `[ Extend +30 ]` is now the single verb across DESIGN.md, the wireframes, Interaction_Patterns, and the founder HTML, with the two-path model (dashboard-authoritative vs LG "Seen" request) stated consistently.
- **F&B workflow, corrected model:** the whole F&B surface now consistently describes **manual review + Order Punched** (no kitchen/POS automation), matching the founder's stated V1 scope and keeping auto-F&B clearly labeled as future.
- **Founder-review package makes every core workflow legible in a browser:** booking (calendar-first stepper), billing (POS amount → LG display → confirm → close), F&B punch, maintenance + reroute, CSV member import, and the full guest journey on LUXEGENIE — each on one page, each traced to its rules.

## 6. UX improvements

- **One-primary-action discipline made explicit in the design system:** DESIGN.md S1 now lists exactly one CTA per room state (previously it mixed "Open Details"/"Start Meeting"), matching the reduce-staff-effort principle (FD-22) and the component appendix.
- **Concrete interaction affordances for Figma:** button/input heights, drawer/modal widths, badge sizing, and touch-target minimums (44px dashboard / 48px LUXEGENIE) are now specified, so the high-fidelity stage inherits calm, consistent spacing rather than re-deriving it.
- **Status is legible without colour:** the founder HTML renders every state as a bracketed text token (per Principle 12), proving the interface reads under grayscale before any colour is applied.

## 7. IA improvements

- **Single canonical, room-first sidebar order**: **Meeting Rooms · Dashboard · Bookings · Manage Rooms · F&B Menu · Members / Guests · LUXEGENIE · Users · Settings** — now identical across the App Shell wireframe, the navigation diagram, DESIGN.md, and every founder-review screen. Previously three files disagreed.
- **Screen-ID crosswalk** removes the friction of three parallel numbering schemes; any reader can map an `A9b` reference to `S10`/`10-fnb-order-review` instantly.
- **Front door fixed:** the top-level README now routes a new reader correctly into `docs/` instead of describing a superseded restaurant-only project.

## 8. Component standardization

- **Canonical CTA vocabulary locked** (used verbatim everywhere): **Walk-in · View · Accept · View Order · Order Punched · Seen · Extend +30 · Enter Bill · Confirm Payment · End Meeting · Clear**.
- **Component dimensions unified** in DESIGN.md §15.7 (Room Card, KPI Card, Drawer, Modal, Button, Input, Tab, Status Badge, Table row, Icon) — one spec per component, matching the "one canonical definition" requirement.
- **Overlay behaviour standardized**: drawers dock right and keep the surface visible; modals center over a dimmed backdrop; neither navigates away. The founder HTML demonstrates both patterns identically across screens.

## 9. Terminology standardization

| Standard term | Retired / drift forms |
|---|---|
| **Order Punched** | "Order Dispatched", "Fulfillment", "kitchen dispatch" |
| **Extend +30** | "Extend Block" |
| **View** (Reserved card, booking card) | "Start Meeting" (as a dashboard action), "Seat" |
| **View Order** | "Eye" |
| **Booking** (entity/screens) | "Reservation" (in DESIGN.md component/screen names) |
| **Woobly** = platform · **Quorum** = client venue · **LUXEGENIE** = device | conflation of platform/customer branding |

Terminology was also re-affirmed as already-correct-and-consistent for: the 6-state room lifecycle, the seven room-status colours, payment modes (Q Pay members-only, Scan to Pay, Payment Link, Card, Cash), and the `BR-*`/`FD-*` ID system.

## 10. Founder-decision reconciliations

This pass did **not** re-open any founder decision; every fix *enforces* an existing FD/BR that a presentation doc had drifted from:

- **FD-05** (manual F&B punch) enforced in DESIGN.md (was violated by "kitchen dispatch").
- **FD-17** (`Extend +30`, two paths) enforced in DESIGN.md (was "Extend Block").
- **FD-12** (room-first) enforced in nav order (App Shell drew Dashboard first).
- **BR-S1/BR-S2** (time-/guest-triggered transitions) enforced by removing the dashboard "Start Meeting"/"Seat" actions.
- **FD-24** (6-state lifecycle) enforced in Domain_Model's status enum.

The earlier V3 reconciliations (auto-end removed, extension two-path, member internal DB, operational-first KPIs, 6-state lifecycle) were reviewed and remain correctly applied — see [REPOSITORY_AUDIT §Contradictions](REPOSITORY_AUDIT.md#contradictions-found--resolved).

## 11. Significant design decisions & rationale

| Decision | Rationale |
|---|---|
| **Kept `[Available]` = brass/gold** (not recoloured) | Both canonical docs (DESIGN.md §6, Interaction_Patterns §2) already agree, and DESIGN.md specifies it as a **text+outline** treatment (not a fill), so it does not collide with brass **primary-action fills**. Brass reads as "ready/inviting"; the attention states (amber Ending-Soon, red In-Use) carry urgency. Recolouring would have introduced new inconsistency for a debatable gain. *Alternative noted for the Figma stage:* if the identity gold ever visually competes with primary buttons in practice, demote Available to a neutral outline. |
| **Booking card action = `[ View ]`** (not a "Start" button) | The canonical model has **no** staff seat/start transition; adding one would invent behaviour. `View` is safe, opens detail, and matches the Reserved-card action on the live board. |
| **Sidebar leads with Meeting Rooms** | FD-12 room-first; the live board is the landing route. Dashboard (operational KPIs) sits second as its companion. |
| **DESIGN.md dark theme is canonical, light provided** | Matches the observed product (`ThemeContext`, dark-first) and the "calm under pressure" emotional design; both themes are required, so both are tokenized. |
| **Founder package is grayscale, HTML, dependency-free** | The brief requires communication over implementation, no colour/branding, and files that open directly in a browser. Grayscale also proves the layout reads by structure alone before colour is applied. |
| **Tokens live in DESIGN.md, not a separate file** | The brief names DESIGN.md as the canonical design system; keeping tokens there preserves a single source of truth for the Figma stage. |

## 12. Remaining engineering dependencies

Unchanged by this pass (they are product/engineering unknowns, not design drift) — carried forward from [REPOSITORY_AUDIT §Engineering Risks](REPOSITORY_AUDIT.md#engineering-risks):

- **E1 — Scheduler** for time-triggered events (Reserved at slot start, Ending-Soon at −10 min, escalation at +1 min, 24h maintenance expiry). *No auto-end — the end-time trigger is a notification only.* Single biggest new backend dependency.
- **E2 — Atomic first-save-wins** concurrency (booking `version`) to prevent double-booking.
- **E3/E4** — isolated, config-driven **Pricing Calculator**; single **Availability Engine** authority shared by booking + extension.
- **E6** — POS/Touche, CSV member-import, and smartwatch contracts are unknown; build behind adapters with a manual-entry baseline.

## 13. Remaining product assumptions

Unchanged, centralized in [Business_Rules](product/Business_Rules.md) `(assumed)` tags and [REPOSITORY_AUDIT §Outstanding Questions](REPOSITORY_AUDIT.md#outstanding-questions):

1. **Reserved timing** — canonical rule adopted: Reserved at slot start; LG shows the Start screen ~10 min prior (BR-S1) — confirm.
2. **Pricing-band thresholds** beyond the two worked examples (BR-P5) — configurable, TBD.
3. **Maintenance reroute UX** — assisted suggestions vs fully manual (BR-M2).
4. **No-show handling** for bookings that reach start but never Start Meeting.
5. **CSV member schema** (columns, ID format, re-import de-dupe).
6. **Smartwatch transport** channel.

None of these blocks founder review or Figma generation; each is flagged at the point it surfaces.

## 14. Readiness for founder review

**READY.** [`docs/founder-review/`](founder-review/) presents the product as a coherent visual system a founder can validate without reading a spec: the room-first live board, operational dashboard, calendar-first booking, billing, F&B punch, maintenance, members/CSV, analytics, settings, and the full LUXEGENIE guest journey — one screen per page, consistent shell/spacing/typography, each traced to its `FD-*`/`BR-*`. Open `index.html`.

## 15. Readiness for Figma generation

**READY — minimal remaining design decisions.** The next session can go straight to building the Figma reference file:

- **Structure & states** — fully specified by [Wireframe_Specification](ux/Wireframe_Specification.md) + the 18 wireframes (unchanged, now consistent).
- **Visual tokens** — fully specified by [DESIGN.md §15](DESIGN.md#15-design-tokens-figma-ready-appendix): colour (incl. status palette + light theme), type scale, spacing, radius, elevation, component dimensions, motion, breakpoints. Map each to a Figma variable/style.
- **Visual reference** — [`founder-review/`](founder-review/) shows the intended layout/hierarchy at low fidelity.
- **Build order & component→variant mapping** — [Wireframe_Handoff](ux/Wireframe_Handoff.md).

The only decisions deliberately left to the Figma stage are true high-fidelity refinements (exact optical spacing, icon set selection, micro-interaction polish) — none of which affect structure, states, or flows.

---

## Related documents

- [DESIGN.md](DESIGN.md) · [REPOSITORY_AUDIT](REPOSITORY_AUDIT.md) · [PROJECT_STATUS](PROJECT_STATUS.md)
- [Business_Rules](product/Business_Rules.md) · [Founder_Decision_Log](product/Founder_Decision_Log.md) · [Wireframe_Specification](ux/Wireframe_Specification.md)
- [founder-review/](founder-review/) (open `index.html`)
