# Wireframe Handoff — Build Order & Dependencies

> **Status:** Canonical (Phase 4) · **Version:** 1.0 · **Last updated:** 2026-07-13

## Purpose

Define the **order** in which wireframes are built so dependencies are satisfied before dependents, and explain how this set hands off to the next phase (Figma reference file generation via the Figma MCP).

## Scope

Sequencing and dependency rationale for [`wireframes/`](wireframes/). The screens themselves are specified in [Wireframe_Specification](Wireframe_Specification.md).

## Dependencies

[Wireframe_Specification](Wireframe_Specification.md) · [Component_Mapping](../architecture/Component_Mapping.md) · [Information_Architecture](../architecture/Information_Architecture.md).

---

## Ordering principle

Build **shared frames and components first**, then the **operational core** (the room-first loop), then the **booking engine**, then **config/records**, then **reuse/companion** screens. Each screen is only built after the screens/components it references exist. Diagrams are built first as the shared reference.

## Build order (with dependency rationale)

```
0. Architecture Diagrams  (wireframes/00-diagrams.md)
   └ shared reference for everything below

1. App Shell (S0)
   └ every dashboard screen renders inside it

2. Component Appendix (wireframes/99-components.md)
   └ Room Card, Status Badge, Tabs, Search, Modal, Drawer, KPI Card, list rows
     drawn ONCE; screens reference them

── OPERATIONAL CORE (the room-first loop) ──
3. Meeting Rooms — Live Board (S1)      ← landing; depends on Room Card, Status Badge
4. Meeting Room Detail (S2)             ← drawer opened from S1
5. Operational Dashboard (S3)           ← KPI cards; complements S1

── BOOKING ENGINE ──
6. Bookings — List (S4)                 ← entry to create flow
7. New / Edit Booking flow (S5)         ← depends on S4 + engine components + Members (S12 lookup)

── MEETING RUNTIME SURFACES (opened from S1/S2) ──
8. Bill / Payment Panel (S9)
9. F&B Order Review (S10)
10. Extension Control (S11)

── CONFIGURATION & RECORDS ──
11. Manage Rooms (S6)  →  Room Editor + Maintenance (S7)
12. F&B Menu (S8)                        ← feeds S10
13. Members / Guests + CSV Import (S12)  ← feeds S5 member lookup (build stub earlier if needed)
14. View History (S13)                   ← opened from S3
15. Recent Activities (S14)              ← opened from bell

── REUSE / COMPANION (lightest; mirror restaurant) ──
16. Users (S15)
17. LUXEGENIE Devices (S16)
18. Settings (S17)
19. LUXEGENIE in-room screens (S18)      ← companion; validates dashboard events
```

## Dependency notes

- **S5 (New Booking) depends on S12 (Members)** for the member-lookup/auto-fill step (BR-MEM2). If S12 isn't ready, build the member-lookup field as a stub referencing S12, then complete S12 before final QA.
- **S1/S2 primary actions open S9/S10/S11** — those drawers must exist before S1/S2 are checklist-complete (they're built right after the core).
- **S6→S7**: the Room Editor/Maintenance modal is part of Manage Rooms; build together.
- **S3→S13**: View History is reached only from the Dashboard "View History" button.
- **S8 feeds S10**: the F&B catalogue defines what the Order Review can contain.
- **Reuse screens (S15–S17)** carry the least risk (they mirror restaurant); build last.
- **S18 (LUXEGENIE)** is the guest device companion — build last; it mainly validates that dashboard states have matching device states.

## Why this order minimises rework

1. Diagrams + Shell + Components are pure prerequisites — everything references them, so drawing them first prevents redrawing.
2. The **operational core** is the product's spine (room-first, FD-12); getting Room Card + states right first means every downstream screen inherits a correct component.
3. The **booking engine** is the largest new surface; building it after the core lets it reuse the Room Card result component and the shell patterns.
4. **Config/records** depend on the entities the core/booking surfaces consume.
5. **Reuse/companion** screens are lowest-risk and validate consistency last.

## Handoff to the next phase (Figma MCP)

Each wireframe is written so it maps 1:1 to a Figma frame:
- **Zones → frames/auto-layout groups.**
- **Components (🟢/🟡/🔵) → Figma components/variants** (states become variants).
- **State tokens `{…}` → component variant properties.**
- **CTAs → button component instances** (primary/secondary variants).
- **Notation legend** ([Wireframe_Principles Part C](Wireframe_Principles.md#part-c--notation-standard-applies-to-every-ascii-wireframe)) gives the Figma builder an unambiguous mapping.

The next Claude/Figma-MCP session should build frames **in this same order**, create the shared components first (App Shell, Room Card, Status Badge, Tabs, Modal, Drawer, KPI Card), then assemble screens by referencing them — exactly as this wireframe set does.

## Related Documents

- [Wireframe_Specification](Wireframe_Specification.md) · [Wireframe_Principles](Wireframe_Principles.md) · [Wireframe_Checklist](Wireframe_Checklist.md) · [PROJECT_STATUS](../PROJECT_STATUS.md)
