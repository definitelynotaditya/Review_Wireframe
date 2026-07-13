# Wireframe Checklist — QA Gate

> **Status:** Canonical (Phase 4) · **Version:** 1.0 · **Last updated:** 2026-07-13
> No wireframe is "done" until it passes this checklist. Each wireframe file ends with a filled-in copy of the **Per-Screen Checklist**.

## Purpose

A hard QA gate ensuring every wireframe faithfully represents the frozen spec — all states, rules, and flows present; navigation and CTAs consistent; component reuse maximised. Fix failures; do not ship partial screens.

## Scope

Every file in [`wireframes/`](wireframes/). Also used in the final repository-wide QA pass.

## Dependencies

[Wireframe_Principles](Wireframe_Principles.md) · [Wireframe_Specification](Wireframe_Specification.md) · [Business_Rules](../product/Business_Rules.md) · [State_Machines](../architecture/State_Machines.md) · [User_Flows](User_Flows.md).

---

## Per-Screen Checklist (copy into each wireframe file)

```
CHECKLIST — <Screen ID / Name>
□ Business rules represented      (list BR-* shown)
□ State machine represented       (list states shown)
□ User flow complete              (entry → action → exit shown)
□ Empty state exists
□ Loading state exists
□ Error/Failure state exists
□ Success state exists
□ Notification state exists       (toast / bell / ⌚ smartwatch)
□ Maintenance state exists        (or N/A + reason)
□ Permission state exists         (global single-access-level per §0.2)
□ Edge cases handled              (list)
□ Navigation consistent           (shell + back/drawer behaviour)
□ CTA hierarchy correct           (one primary per state; placement per Principle 14)
□ Component reuse maximised        (🟢/🟡/🔵 tagged; nothing redrawn twice)
□ Interaction patterns consistent  (matches Interaction_Patterns.md)
RESULT: PASS / FIX (notes)
```

## How to apply each item

- **Business rules represented** — the wireframe visibly enforces the `BR-*` that govern it (e.g. seat filter shows ≥ seats; Q Pay only for members). List them.
- **State machine represented** — every state the screen can show (per [State_Machines](../architecture/State_Machines.md)) has a frame or annotation. For live screens this means the full room-state set where applicable.
- **User flow complete** — the wireframe shows the entry point, the primary action, and where it exits (matches [User_Flows](User_Flows.md)).
- **Empty / Loading / Error / Success** — all four present as frames or explicit annotations (skeleton, `— empty —`, inline error+retry, toast+update).
- **Notification state** — the screen shows how real-time arrivals appear (toast, bell badge, `⌚` smartwatch for attention/escalation).
- **Maintenance state** — for room-bearing screens, the `{Under Maintenance}` representation + 24h-block/reroute affordance; mark **N/A** with a reason where a screen has no room concept (e.g. Users).
- **Permission state** — confirm the **global single access level** applies (BR-PERM1); no per-action gating drawn. Unauth → login redirect noted once globally.
- **Edge cases handled** — the specific edge cases from the Specification for that screen are drawn/annotated.
- **Navigation consistent** — sits in the App Shell; drawers overlay (don't navigate); back returns to the originating list.
- **CTA hierarchy correct** — exactly one primary CTA per state, placed per Principle 14; secondary/destructive demoted.
- **Component reuse maximised** — components tagged 🟢 reuse / 🟡 extend / 🔵 new per [Component_Mapping](../architecture/Component_Mapping.md); shared components referenced, not redrawn.
- **Interaction patterns consistent** — search+tabs+cards+modal/drawer+badge grammar matches [Interaction_Patterns](Interaction_Patterns.md); honours FD-22 (reduce effort).

## Screen → mandatory-state matrix

Not every screen has every state; this matrix says which are **required** vs **N/A** so QA is unambiguous.

| Screen | Empty | Loading | Error | Success | Notif | Maintenance | Permission |
|---|---|---|---|---|---|---|---|
| S0 App Shell | N/A | ✓ | ✓ | N/A | ✓ | N/A | ✓ |
| S1 Live Board | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓(global) |
| S2 Room Detail | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| S3 Dashboard | ✓ | ✓ | ✓ | N/A | ✓ | ✓(count) | ✓ |
| S4 Bookings List | ✓ | ✓ | ✓ | ✓ | ✓ | N/A | ✓ |
| S5 New Booking | ✓(no-match) | ✓ | ✓ | ✓ | N/A | ✓(excluded) | ✓ |
| S6 Manage Rooms | ✓ | ✓ | ✓ | ✓ | N/A | ✓ | ✓ |
| S7 Room Editor | N/A | ✓ | ✓ | ✓ | N/A | ✓ | ✓ |
| S8 F&B Menu | ✓ | ✓ | ✓ | ✓ | N/A | N/A | ✓ |
| S9 Bill/Payment | N/A | ✓ | ✓ | ✓ | ✓ | N/A | ✓ |
| S10 F&B Review | N/A | ✓ | ✓ | ✓ | ✓ | N/A | ✓ |
| S11 Extension | N/A | ✓ | ✓ | ✓ | ✓ | N/A | ✓ |
| S12 Members/CSV | ✓ | ✓ | ✓ | ✓ | N/A | N/A | ✓ |
| S13 View History | ✓ | ✓ | ✓ | N/A | N/A | N/A | ✓ |
| S14 Recent Activities | ✓ | ✓ | ✓ | N/A | ✓ | N/A | ✓ |
| S15 Users | ✓ | ✓ | ✓ | ✓ | N/A | N/A | ✓ |
| S16 Devices | ✓ | ✓ | ✓ | ✓ | ✓ | N/A | ✓ |
| S17 Settings | N/A | ✓ | ✓ | ✓ | N/A | N/A | ✓ |
| S18 LUXEGENIE | N/A | ✓ | ✓ | ✓ | ✓ | ✓(reserved-block) | N/A(guest) |

"N/A" must be justified in the wireframe's checklist notes.

## Repository-wide QA (run once at the end)

```
□ Every screen in the Specification has a wireframe file
□ Every wireframe passes its Per-Screen Checklist
□ Terminology matches the frozen docs (Quorum/LUXEGENIE/room states/CTA verbs)
□ No new functionality introduced (only frozen spec expressed)
□ All internal links resolve
□ Component appendix has one canonical drawing per shared component
□ Mermaid diagrams present (nav, booking, room lifecycle, meeting lifecycle, dashboard hierarchy, state transitions)
□ Build order documented (Wireframe_Handoff.md)
```

## Related Documents

- [Wireframe_Principles](Wireframe_Principles.md) · [Wireframe_Specification](Wireframe_Specification.md) · [Wireframe_Handoff](Wireframe_Handoff.md)
