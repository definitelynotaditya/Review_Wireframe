# Reference & Archive

> Supporting evidence and history. **None of this is the canonical spec** — the canonical docs live in [`../product/`](../product/), [`../architecture/`](../architecture/), [`../ux/`](../ux/), and [`../engineering/`](../engineering/).

## What's here

| Folder | What it is | Status |
|---|---|---|
| [`restaurant-dashboard/`](restaurant-dashboard/) | Detailed reverse-engineering of the existing Restaurant Manager Dashboard (page-by-page, components, API observations). | **Live reference** — still accurate for the *restaurant* product; cited by [Restaurant_Current_State](../product/Restaurant_Current_State.md). |
| [`source-inputs/`](source-inputs/) | Raw, unedited inputs: the Meeting Room PRD, Founder call notes, and the canonical Features Flow. | **Provenance** — the primary sources the canonical docs are built from. |
| [`_archive/`](_archive/) | Superseded V1 material + exact duplicate files found during hygiene passes. | **Historical only** — see the two tables below. |

### source-inputs — which Features Flow is authoritative?

| File | Status |
|---|---|
| `Meeting_Room_Features_Flow_v3_CANONICAL.md` | **Definitive** functional flow (the "Cleaned Updated Features Flow"). This is the one every canonical doc cites. |
| `Meeting Room Management.md` | Original PRD-style feature list — provenance. |
| `Founder_Call_Raw_Notes.md` | Founder interview answers (V2/V3). |

### `_archive/` — what's superseded, and by what

| Archived | Superseded by | Status |
|---|---|---|
| [`v1-restaurant-kb/`](_archive/v1-restaurant-kb/) | The current `docs/product/`, `docs/architecture/`, `docs/ux/` canonical docs | V1 synthesis docs from the first reverse-engineering pass. Kept for history. |
| [`v1-meeting-room-analysis/`](_archive/v1-meeting-room-analysis/) | [Founder_Decision_Log](../product/Founder_Decision_Log.md), [MeetingRoom_Product_Spec](../product/MeetingRoom_Product_Spec.md), [Business_Rules](../product/Business_Rules.md) | V1 Meeting Room analysis (ADRs, Requirements Gap Analysis, Founder Call Guide). Folded into the docs listed. Kept for history. |
| [`duplicated-copies/`](_archive/duplicated-copies/) | `source-inputs/Founder_Call_Raw_Notes.md` · `source-inputs/Meeting_Room_Features_Flow_v3_CANONICAL.md` | Exact, byte-for-byte duplicates found during the repository hygiene pass — a stray root-level copy of the founder-call notes, and a second, identically-worded copy of the Features Flow that had drifted to a confusingly similar filename. No content was unique; archived to remove ambiguity about which file is canonical. |

## Rules of use

- If a `_archive/` doc disagrees with a canonical doc, **the canonical doc wins.** The archive reflects earlier reasoning (e.g. the pre-interview permission-matrix assumption, since overridden by FD-07).
- `restaurant-dashboard/` and `source-inputs/` are safe to cite as evidence.
- Do not edit archived docs; if their content becomes relevant again, promote it into a canonical doc.

## Mapping: where did each V1 Meeting Room doc go?

| V1 (archived) | Superseded by |
|---|---|
| `Architecture_Decisions.md` (ADR-001…017) | [Founder_Decision_Log](../product/Founder_Decision_Log.md) + [Component_Mapping](../architecture/Component_Mapping.md) + [Business_Rules](../product/Business_Rules.md) |
| `Requirements_Gap_Analysis.md` | [PROJECT_STATUS](../PROJECT_STATUS.md) (risks) + [Engineering_Assumptions](../engineering/Engineering_Assumptions.md) |
| `Founder_Call_Guide.md` | [Founder_Decision_Log](../product/Founder_Decision_Log.md) (answers captured as decisions) |
