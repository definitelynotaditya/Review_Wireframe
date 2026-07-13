# Project Status

> **Status:** Canonical · **Version:** 3.0 · **Last updated:** 2026-07-13

# Canonical Product Documentation — Version 3 (Frozen) · Phase 4 Wireframes Complete

The Meeting Room ("Quorum") product documentation is **complete, internally consistent, and frozen at V3** (unchanged by Phase 4). **Phase 4 — Engineer-First Reference Wireframes — is now complete**: the frozen spec has been translated into low-fidelity, grayscale, structure-only wireframes and supporting diagrams, ready for direct translation into an editable Figma reference file.

## Project Phase

**Phase 4 complete — Engineer-First Reference Wireframes.**

1. ✅ **Phase 0** — Reverse-engineering of the restaurant dashboard → [`reference/restaurant-dashboard/`](reference/restaurant-dashboard/).
2. ✅ **Phase 1** — Discovery: PRD + Features Flow + founder interview.
3. ✅ **Phase 2** — First canonical rebuild (V2).
4. ✅ **Phase 3** — **V3 freeze**: final founder decisions + Cleaned Updated Features Flow reconciled; audit passed.
5. ✅ **Phase 4** — **Engineer-First Reference Wireframes**: principles, specification, checklist, handoff, 18 screen wireframes + App Shell + component appendix + 7 Mermaid diagrams; every wireframe passes its checklist.
6. ✅ **Phase 4.5** — **Design Finalization**: cross-repository consistency pass (terminology/CTA/nav/lifecycle drift resolved — see [DESIGN_REVIEW](DESIGN_REVIEW.md)); **DESIGN.md upgraded to a complete Figma-ready token system** (§15); **presentation-quality founder-review HTML wireframes** delivered in [`founder-review/`](founder-review/).
7. ⏭️ **Phase 5 — Figma Reference File Generation (using Figma MCP)** (next).
8. ⏭️ **Phase 6 — Engineering Blueprint** (after blocking unknowns resolved).

## Completed

**Phases 0–3 (frozen product docs):**
- ✅ Founder decisions FD-01…FD-24 ([Founder_Decision_Log](product/Founder_Decision_Log.md)); one canonical spec + one rule set (`BR-*`).
- ✅ Room-first dashboard, calendar-first booking engine, 6-state room lifecycle, internal Member DB, maintenance 24h block, first-save-wins, isolated pricing, no auto-end.
- ✅ Full consistency audit ([REPOSITORY_AUDIT](REPOSITORY_AUDIT.md)).

**Phase 4 (wireframes):**
- ✅ [Wireframe_Principles](ux/Wireframe_Principles.md) — the constitution (20 principles + notation standard + ambiguity rules).
- ✅ [Wireframe_Specification](ux/Wireframe_Specification.md) — per-screen blueprint for all 18 screens + global conventions (states, permissions, responsive, overlays).
- ✅ [Wireframe_Checklist](ux/Wireframe_Checklist.md) — QA gate + screen→state matrix.
- ✅ [Wireframe_Handoff](ux/Wireframe_Handoff.md) — dependency-ordered build sequence + Figma mapping.
- ✅ [wireframes/](ux/wireframes/) — 18 screen wireframes + App Shell + [component appendix](ux/wireframes/99-components.md) + [7 Mermaid diagrams](ux/wireframes/00-diagrams.md). All grayscale, structure-only, each passing its per-screen checklist.
- ✅ Self-review performed (fixed: calendar-first contradiction on room cards; one-click extension); terminology + link QA passed.

## Pending (before Engineering Blueprint)

- ⏳ **Figma Reference File Generation** (Phase 5 — see below).
- ⏳ Resolve blocking unknowns: scheduler (E1), concurrency approach (E2), POS/CSV/scheduler confirmations (Q4/Q5/Q6).
- ⏳ Finalize field-level schemas & channel naming with the backend team.

## Known Risks

Full detail in [REPOSITORY_AUDIT](REPOSITORY_AUDIT.md#engineering-risks). Top blockers:
- **E1 — Scheduler** for time-triggered events (Reserved, Ending-Soon, escalation, 24h maintenance expiry). *No auto-end — end-time trigger is a notification only.*
- **E2 — Atomic first-save-wins** concurrency to prevent double-booking.
- **P1 — Staff resistance** to manual work → mitigated by the reduce-effort principle (FD-22) across every surface.

## Known Assumptions

All `🟨 Assumed` items centralized in [Engineering_Assumptions §4](engineering/Engineering_Assumptions.md) and every `(assumed)` rule in [Business_Rules](product/Business_Rules.md). Key: scheduler exists, Reserved-timing reconciliation, pricing-band thresholds, maintenance-reroute UX, smartwatch transport, no-show handling.

## Resolved since V2

- ✅ **Member lookup** is no longer an external-integration blocker — it's an **internal DB (CSV)** (FD-18).
- ✅ **Extension** ambiguity resolved (dashboard-authoritative + LG request).
- ✅ **Auto-end** ambiguity resolved (never auto-ends).

## Phase 4 deliverables (complete)

The engineer-first reference wireframe set is delivered in [`ux/`](ux/):

| Deliverable | Location |
|---|---|
| Wireframe constitution | [Wireframe_Principles](ux/Wireframe_Principles.md) |
| Per-screen implementation blueprint | [Wireframe_Specification](ux/Wireframe_Specification.md) |
| QA gate + state matrix | [Wireframe_Checklist](ux/Wireframe_Checklist.md) |
| Build order + Figma mapping | [Wireframe_Handoff](ux/Wireframe_Handoff.md) |
| 18 screen wireframes + App Shell + component appendix | [wireframes/](ux/wireframes/) |
| 7 Mermaid diagrams (nav, booking, room/meeting/service lifecycles, dashboard hierarchy, coverage) | [wireframes/00-diagrams.md](ux/wireframes/00-diagrams.md) |

Every wireframe is grayscale, structure-only, preserves IA / User Flows / Business Rules / State Machines / Component Hierarchy / Interaction Patterns, and passes its per-screen checklist. Suitable for **founder review**, **engineering validation**, and **direct translation into editable Figma reference files**.

## Next Recommended Phase — Figma Reference File Generation (using Figma MCP)

**Objective:** turn the frozen wireframes into an **editable Figma reference file** via the Figma MCP — not a visual redesign, but a faithful, componentised Figma expression of the wireframe set.

- **Build order:** follow [Wireframe_Handoff](ux/Wireframe_Handoff.md) — diagrams/shell/components first, then operational core, booking engine, runtime surfaces, config/records, reuse/companion, device.
- **Componentisation:** create Figma components first (App Shell, Room Card, Status Badge, Tabs, Search, Modal, Drawer, KPI Card, Availability Picker, Recurrence, Member Lookup) with **state tokens `{…}` → variant properties**; then assemble screens by instancing them (per [Wireframe_Handoff §Handoff to the next phase](ux/Wireframe_Handoff.md#handoff-to-the-next-phase-figma-mcp)).
- **Fidelity:** low-fidelity/grayscale is acceptable for the reference file; colour/type/spacing decisions may begin here but must not alter structure, states, or flows.
- **Traceability:** keep each frame annotated with the `BR-*`, state, and component class from its wireframe file.
- **Auth note:** the Figma MCP server requires authorization before use (connect it via claude.ai connector settings or `claude mcp` in an interactive session).

## Success Criteria — met

- ✅ Wireframes preserve IA, User Flows, Business Rules, State Machines, Component Hierarchy, Interaction Patterns.
- ✅ Grayscale, structure-only, no branding/colour/type (deferred to Figma).
- ✅ Every screen + shell has all required states and passes its checklist.
- ✅ No new functionality introduced; frozen docs unchanged (self-review fixes were consistency-only).
- ✅ Directly translatable to Figma (notation → variant mapping documented).

---

## Recommended prompt for the next Claude session

```
You are starting Phase 5 of the LUXEGENIE Meeting Room ("Quorum") project:
FIGMA REFERENCE FILE GENERATION (using the Figma MCP).

Product docs are FROZEN at V3, the engineer-first wireframes are complete, and a
Design-Finalization pass (Phase 4.5) has landed:
  • docs/DESIGN.md §15 = a complete, Figma-ready design-token system
    (colour incl. status palette, type scale, spacing, radius, elevation,
    component dimensions, motion, breakpoints) — apply these; no need to invent them.
  • docs/founder-review/ = a navigable HTML prototype of all 18 canonical screens
    (open index.html; a faithful visual reference for the frames you will build).
  • docs/DESIGN_REVIEW.md = the finalization audit (what changed and why).
Start at docs/README.md, docs/PROJECT_STATUS.md, docs/ux/wireframes/README.md.
Treat docs/ as the source of truth — do NOT redesign or re-open decisions.

Build an editable Figma reference file that faithfully expresses the wireframes:
- Follow the build order in docs/ux/Wireframe_Handoff.md.
- Create Figma COMPONENTS first (App Shell, Room Card, Status Badge, Tabs, Search,
  Modal, Drawer, KPI Card, Availability Picker, Recurrence, Member Lookup); map each
  wireframe state token {…} to a component VARIANT property.
- Then assemble the 18 screens (docs/ux/wireframes/01–18) by instancing components.
- Apply DESIGN.md §15 tokens as Figma variables/styles; structure, states, and flows
  must NOT change. Annotate frames with BR-*, state, and component class.
- The Figma MCP needs authorization first (claude.ai connector settings or /mcp).

If you find a genuine contradiction in the frozen docs, fix it and note it; otherwise
do not modify them.
```

## Related Documents

- [README](README.md) · [REPOSITORY_AUDIT](REPOSITORY_AUDIT.md) · [Wireframe_Principles](ux/Wireframe_Principles.md) · [Wireframe_Specification](ux/Wireframe_Specification.md) · [Wireframe_Handoff](ux/Wireframe_Handoff.md) · [wireframes/](ux/wireframes/)
