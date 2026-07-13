# Wireframe Principles — the Constitution

> **Status:** Canonical (Phase 4) · **Version:** 1.0 · **Last updated:** 2026-07-13
> **Governs:** every wireframe and diagram in [`wireframes/`](wireframes/) and the [Wireframe_Specification](Wireframe_Specification.md).

## Purpose

The non-negotiable rules every Meeting Room ("Quorum") wireframe obeys. Wireframes **translate** the frozen V3 product documentation into structure; they never redesign it. If a wireframe and this document disagree, this document wins; if this document and a frozen product doc disagree, the **product doc wins** and the contradiction is logged, not silently resolved.

## Scope

Applies to all engineer-first, low-fidelity reference wireframes for the Meeting Room module (manager dashboard + LUXEGENIE in-room screens). Visual design (colour, type, spacing, motion) is explicitly **out of scope** — that is the later Figma phase.

## Dependencies (the frozen source of truth)

- [MeetingRoom_Product_Spec](../product/MeetingRoom_Product_Spec.md) · [Business_Rules](../product/Business_Rules.md) · [Founder_Decision_Log](../product/Founder_Decision_Log.md)
- [Information_Architecture](../architecture/Information_Architecture.md) · [Dashboard_Architecture](../architecture/Dashboard_Architecture.md) · [State_Machines](../architecture/State_Machines.md) · [Component_Mapping](../architecture/Component_Mapping.md)
- [Screen_Inventory](Screen_Inventory.md) · [User_Flows](User_Flows.md) · [Interaction_Patterns](Interaction_Patterns.md)

---

## Part A — Product principles (inherited, non-negotiable)

These come straight from the frozen docs. Wireframes must **visibly embody** them.

1. **Extension, not a new app (FD-01).** Every screen sits inside the existing App Shell (sidebar + top bar). No new navigation paradigm, no separate product frame.
2. **Reduce staff effort (FD-22) — the tie-breaker.** When two layouts are possible, choose the one with fewer clicks, less scanning, more auto-fill, and a single obvious next action. This principle decides every ambiguous case.
3. **Room-first dashboard (FD-12).** The landing surface is the live room board; it answers "what needs attention right now" before anything else.
4. **Calendar-first booking (FD-13).** Booking is a guided constraint→availability sequence (Date → Duration → Time Slot → Seats → Available Rooms → Details → Confirm), not a free-form form.
5. **Operational-first analytics (FD-20).** Operational surfaces show today/attention; revenue analytics live in View History, never on the live board.
6. **Meetings never auto-end (FD-21).** End is always an explicit action; wireframes must show the "meeting ended — action needed" state, never an automatic close.
7. **State drives everything (FD-24).** The room's state (Available → Reserved → In-Use → Ending Soon → Billing → Available, + Under Maintenance) governs what each screen shows.

## Part B — Wireframe craft principles

8. **Engineer-first layouts.** Optimise for implementation clarity: explicit zones, named components, enumerated states. A wireframe is read by a developer, not admired by a stakeholder.
9. **Information hierarchy over aesthetics.** Rank content by operational importance; the most action-critical element is the most prominent by *position and size*, never by colour or type (those are deferred).
10. **Reuse existing interaction patterns.** Default to the restaurant dashboard's grammar (search + segmented tabs + card/row lists + gold-slot primary CTA + Add/Edit modal + status badge). Only introduce a new pattern when [Component_Mapping](../architecture/Component_Mapping.md) marks it 🔵 New.
11. **Progressive disclosure.** Show the minimum to act; reveal detail on demand (drawer/expand/modal). The live board shows a room's essentials; the detail drawer shows the rest.
12. **Explicit state visibility.** Every stateful element renders its state as a visible label/badge (e.g. `[Reserved]`, `[Ending Soon]`, `[Bill Requested]`). No hidden or colour-only state (colour is deferred, so state must be textual/positional in wireframes).
13. **Minimal clicks / one primary action per state.** Each card/screen in a given state exposes exactly **one** primary CTA (the most likely next action) plus at most a small set of secondary actions behind a menu.
14. **Consistent CTA placement.** Primary CTA: bottom-right of a modal/drawer, or the card's dedicated action slot, or top-right of a page for "＋ New/Add". Secondary/destructive: left of primary or in a `⋮` menu. Never move the primary CTA between analogous screens.
15. **Predictable navigation.** Sidebar is the only top-level nav; modules never deep-link away unexpectedly; drawers/modals overlay (they do not navigate); a back affordance always returns to the originating list.
16. **Reusable components.** Draw a component **once** in the component appendix; on screens, reference it by name and list only its per-screen props/states. No component is redrawn in full twice.
17. **Every state is drawn, not implied.** For each screen, the default plus its **empty, loading, success, error, permission, and (where relevant) maintenance/notification** states must exist as separate frames or explicit annotations (per [Wireframe_Checklist](Wireframe_Checklist.md)).
18. **Grayscale, structure-only.** No colour, no brand, no typography, no polish. Use text labels, boxes, and position to convey meaning. Status is shown by a bracketed text token, not a colour.
19. **Extensible for future modules.** Layouts must not hardcode meeting-room-only assumptions where the restaurant/other modules share the pattern; keep the shell and shared components generic (supports future modules per FD-23).
20. **Traceability.** Every wireframe annotates the **business rules (BR-*)**, **state(s)**, and **components (reuse/extend/new)** it represents, so a reviewer can trace it back to the frozen spec without guessing.

## Part C — Notation standard (applies to every ASCII wireframe)

To keep wireframes machine-consistent and Figma-translatable, all wireframes use this fixed vocabulary:

| Notation | Meaning |
|---|---|
| `┌─ … ─┐` box | A container / zone / card / panel |
| `[ Label ]` | A **button** (primary CTA if annotated `*`, e.g. `[ Confirm ]*`) |
| `( Tab )` / `(•Tab)` | A segmented filter tab; `•` marks the active tab |
| `〔 field 〕` | An input field (text/number/date) |
| `▾` | A dropdown/select |
| `☐ / ☑` | Checkbox / toggle (off/on) |
| `{State}` | A visible **state token** (e.g. `{Reserved}`, `{Ending Soon}`) |
| `⋮` | Overflow/secondary-action menu |
| `⌕` | Search input |
| `▸ / ▾` | Collapsed / expanded disclosure |
| `«Drawer»` / `«Modal»` | Overlay surface, annotated with trigger + dismissal |
| `— empty —` | Empty-state placeholder region |
| `⟳` | Loading/skeleton region |
| `⚠` | Error/attention marker (text, not colour) |
| `⌚` | Staff-smartwatch mirror of a notification |

Every wireframe file ends with a **Traceability block** (states · BR-* · components · flows) and its **checklist result**.

## Part D — Decision rules for ambiguity (in priority order)

When the frozen spec leaves a layout choice open, resolve in this order:
1. **Does a frozen doc already answer it?** Use that. (Do not reinterpret.)
2. **Does the restaurant dashboard already do it?** Reuse that pattern (principle 10).
3. **Which option reduces staff effort?** Choose it (FD-22, principle 2).
4. **Which option is more extensible/consistent?** Choose it (principles 16, 19).
5. **Still ambiguous?** Draw the simplest option and log it as an *open question* in the wireframe's Traceability block — never invent new functionality.

## Future Work

- These principles are frozen for Phase 4. Colour/type/spacing decisions are deferred to the Figma phase and must not be pre-empted here.

## Related Documents

- [Wireframe_Specification](Wireframe_Specification.md) · [Wireframe_Checklist](Wireframe_Checklist.md) · [Wireframe_Handoff](Wireframe_Handoff.md) · [wireframes/](wireframes/)
