# Methodology & Evidence Discipline

## Purpose

This knowledge base is produced by reverse-engineering a live production application through its UI. To keep it trustworthy, every non-trivial statement carries an evidence tag.

## Evidence tags

| Tag | Meaning | Example |
|---|---|---|
| **Observed** | Directly witnessed in the live app — screenshot, DOM accessibility tree, or network response. | "The login form has Username and Password fields and a Sign In submit button." |
| **Inferred** | A conclusion drawn by combining several Observed facts. Reasonable, but not directly stated by the UI. | "Orders and Tables are linked entities because an order row shows a table number." |
| **Assumed** | A working hypothesis not yet confirmed. Must be validated before it is relied upon. | "There is probably a role hierarchy above 'Manager'." |

When in doubt, downgrade the tag. Prefer "Inferred" over "Observed" and "Assumed" over "Inferred" if there is any uncertainty.

## Sourcing rules

- The **live application is the only source of truth.** No feature is documented unless it is visible in the UI or returned by the app's own network calls.
- Screenshots are captured **only when they materially improve documentation** (evidence of layout, state, or a component). They live in [`../../assets/screenshots/`](../../assets/screenshots/) and are referenced from the relevant page doc.
- Network/API observations (endpoints, payload shapes) are recorded in [`../architecture/api-observations.md`](../architecture/api-observations.md) with the tag **Observed** and the originating page.

## Documentation conventions

- One file per **major page** under `docs/pages/`, named `NN-<page-slug>.md`.
- Reusable components get their own file under `docs/components/`.
- Diagrams use **Mermaid**, inlined in the relevant doc.
- Cross-link liberally with relative Markdown links.
- Do not redesign, critique, optimise, or compare to competitors. Only understand, document, explain, model.
