# LUXEGENIE — Product Knowledge Base

> **Version 3.0 — FROZEN** · 2026-07-13 · Single source of truth for the **Meeting Room ("Quorum")** module and the **Restaurant Manager Dashboard** it extends.
> Product docs are **canonical & frozen**. **Phase 4 (Engineer-First Reference Wireframes) is complete** → see [`ux/wireframes/`](ux/wireframes/). Next phase: **Figma Reference File Generation** ([PROJECT_STATUS](PROJECT_STATUS.md)).

This repository is the canonical knowledge base for engineering, design, product, and future AI sessions. It answers four questions:

1. **What does the product do?** → [`product/`](product/)
2. **How does it work?** → [`architecture/`](architecture/)
3. **Why was it designed this way?** → [`product/Founder_Decision_Log.md`](product/Founder_Decision_Log.md)
4. **How should engineers build it?** → [`engineering/`](engineering/) + [`ux/`](ux/)

Someone joining tomorrow should be able to read this and contribute **without** reading any prior chat or the raw PRD.

---

## Start here (reading order)

| If you are a… | Read, in order |
|---|---|
| **Product Manager** | [MeetingRoom_Product_Spec](product/MeetingRoom_Product_Spec.md) → [Founder_Decision_Log](product/Founder_Decision_Log.md) → [Business_Rules](product/Business_Rules.md) → [PROJECT_STATUS](PROJECT_STATUS.md) |
| **Designer** | **[DESIGN.md](DESIGN.md)** (design system + Figma-ready tokens) → [Dashboard_Architecture](architecture/Dashboard_Architecture.md) → [Screen_Inventory](ux/Screen_Inventory.md) → [User_Flows](ux/User_Flows.md) → [Interaction_Patterns](ux/Interaction_Patterns.md) → **[Wireframes](ux/wireframes/)** ([Principles](ux/Wireframe_Principles.md) · [Spec](ux/Wireframe_Specification.md)) → **[Founder-review HTML](founder-review/)** → [DESIGN_REVIEW](DESIGN_REVIEW.md) |
| **Engineer** | [Restaurant_Current_State](product/Restaurant_Current_State.md) → [Tech_Stack](architecture/Tech_Stack.md) → [Domain_Model](architecture/Domain_Model.md) → [State_Machines](architecture/State_Machines.md) → [Data_Model](engineering/Data_Model.md) → [RealTime_And_Sync](architecture/RealTime_And_Sync.md) → [Engineering_Assumptions](engineering/Engineering_Assumptions.md) → [Integration_Points](engineering/Integration_Points.md) |
| **New joiner (any role)** | This README → [MeetingRoom_Product_Spec](product/MeetingRoom_Product_Spec.md) → [Component_Mapping](architecture/Component_Mapping.md) → [REPOSITORY_AUDIT](REPOSITORY_AUDIT.md) |

## The one-paragraph orientation

**Woobly** is a smart-hospitality platform. Guests use a table-side **LUXEGENIE** device to make requests; each becomes an **Activity** in a **Session**, handled by staff, measured, and pushed live (Pusher) to the **Manager Dashboard**. **Quorum** is the new **Meeting Room** product — a parallel module inside the *same* dashboard. The dashboard is **room-first** (an operational live board is the landing surface); **bookings are calendar-first** (a guided Date→Duration→Slot→Seats→rooms flow backed by an availability + pricing engine). Management runs meetings via the in-room LUXEGENIE, services requests, takes curated F&B orders, and handles POS-based billing. **Meetings never auto-end** — management or the guest closes them. Members come from an **internal database (CSV-seeded)**; there is a **single management access level**; payments are **recorded, not processed**; and every UX choice is optimized to **reduce staff effort**. It is an **extension** of the restaurant dashboard — majority reuse/extend, with new surface concentrated in the booking engine, extension, member DB, and maintenance.

## Repository map

```
docs/
├── README.md                      ← you are here
├── DESIGN.md                      ★ canonical design system + Figma-ready design tokens (§15)
├── DESIGN_REVIEW.md               ★ final design/consistency audit (this finalization pass)
├── PROJECT_STATUS.md              ← phase, risks, next steps, next-session prompt
├── REPOSITORY_AUDIT.md            ← V3-freeze health, contradictions resolved, readiness
│
├── product/                       ← WHAT & WHY
│   ├── Restaurant_Current_State.md
│   ├── MeetingRoom_Product_Spec.md    ★ canonical spec
│   ├── Founder_Decision_Log.md        ★ decisions + rationale (FD-*)
│   └── Business_Rules.md              ★ enforceable rules (BR-*)
│
├── architecture/                  ← HOW (structure)
│   ├── Information_Architecture.md
│   ├── Dashboard_Architecture.md      ★ room-first + operational KPIs
│   ├── Domain_Model.md
│   ├── Component_Mapping.md           ★ restaurant → meeting room
│   ├── State_Machines.md              ★ all lifecycles
│   ├── RealTime_And_Sync.md
│   └── Tech_Stack.md
│
├── ux/                            ← HOW (experience)
│   ├── Screen_Inventory.md
│   ├── User_Flows.md
│   ├── Interaction_Patterns.md
│   ├── Wireframe_Principles.md        ★ Phase 4: wireframe constitution
│   ├── Wireframe_Specification.md     ★ Phase 4: per-screen blueprint
│   ├── Wireframe_Checklist.md         · Phase 4: QA gate
│   ├── Wireframe_Handoff.md           · Phase 4: build order + Figma mapping
│   └── wireframes/                    ★ 18 screens + shell + components + diagrams
│
├── founder-review/                ★ presentation-quality low-fi HTML wireframes (open index.html)
│
├── engineering/                   ← HOW (build)
│   ├── Engineering_Assumptions.md
│   ├── Data_Model.md
│   ├── Integration_Points.md
│   └── Future_Considerations.md
│
└── reference/                     ← evidence & history (not the spec)
    ├── restaurant-dashboard/          detailed reverse-engineering (pages, components, API)
    ├── source-inputs/                 raw PRD, Features Flow, Founder notes
    └── _archive/                      superseded V1 docs (kept for provenance)
```

★ = the highest-value documents.

## Conventions used across this KB

- Every doc has: **Purpose · Scope · Dependencies · Assumptions · Main content · Future Work · Related Documents**.
- Evidence is tagged **Observed** / **Inferred** / **Assumed**; engineering readiness tagged **✅ Confirmed / 🟨 Assumed / 🔮 Future**.
- Rules are IDed `BR-*`; founder decisions `FD-*`; they are cross-referenced everywhere.
- Diagrams are **Mermaid**, inlined.
- **Terminology:** *Quorum* = meeting-room product brand · *LUXEGENIE/LG* = in-room device · *Dashboard/DB* = the management web app · *Room / Booking / Session / Activity* = the core meeting-room entities.

## Version history

- **V1** — reverse-engineering of the existing restaurant dashboard (now in [`reference/`](reference/)).
- **V2** — first canonical rebuild: merged PRD + Features Flow + founder answers; reorganized into product/architecture/ux/engineering.
- **V3 (FROZEN)** — folds in the **final founder decisions** and the **Cleaned Updated Features Flow**. Key changes: **room-first dashboard**, **calendar-first booking engine** (availability/seat/pricing/conflict), **internal Member DB (CSV)**, **maintenance 24h block**, **dashboard-authoritative +30 extension**, **meetings never auto-end**, **operational-first KPIs**, and the **reduce-staff-effort** design principle. Full delta: [Founder_Decision_Log §"What V3 changed"](product/Founder_Decision_Log.md#what-v3-changed-vs-v2-quick-reference); audit: [REPOSITORY_AUDIT](REPOSITORY_AUDIT.md).
- **Phase 4 (Wireframes)** — engineer-first, grayscale, structure-only reference wireframes translating the frozen V3 spec: [`ux/wireframes/`](ux/wireframes/) (18 screens + shell + component appendix + 7 diagrams), governed by [Wireframe_Principles](ux/Wireframe_Principles.md)/[Specification](ux/Wireframe_Specification.md)/[Checklist](ux/Wireframe_Checklist.md)/[Handoff](ux/Wireframe_Handoff.md). Next: Figma reference file generation.

## Related

- [PROJECT_STATUS](PROJECT_STATUS.md) — frozen status + the next phase (Reference Wireframes).
- [REPOSITORY_AUDIT](REPOSITORY_AUDIT.md) — consistency audit, risks, readiness.
- Raw source inputs: [`reference/source-inputs/`](reference/source-inputs/).
