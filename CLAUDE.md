
# CLAUDE.md

## Repository Philosophy

This repository defines the Meeting Room Management product built on top of the Woobly platform.

The objective is NOT to create isolated UI screens.

The objective is to build one coherent operational system.

Every document should contribute toward that goal.

---

## Source Priority

When conflicts occur, use this priority:

1. source-inputs/*
2. Meeting Room Features Flow
3. Meeting Room Management
4. DESIGN.md
5. Wireframe Specification
6. Individual Screen Specs

Never preserve outdated behaviour simply because an older markdown file says so.

---

## Product Principles

Optimize for:

- operational speed
- low cognitive load
- predictable workflows
- staff efficiency
- consistency
- reuse

Avoid visual experimentation.

Avoid Dribbble-style layouts.

Avoid decorative UI.

---

## Design Principles

Before creating anything new:

Reuse.

Before adding a component:

Search whether one already exists.

Every screen should reuse:

Buttons

Inputs

Tables

Drawers

Cards

Headers

Search

Pagination

Status chips

Step indicators

Empty states

Loading states

Error states

---

## Workflow Principles

Every workflow should have:

happy path

edge cases

error states

loading states

permission states

empty states

confirmation states

If one is missing, design it.

---

## Design Review

Whenever editing a screen:

Compare it against every other screen.

Ask:

Does this spacing match?

Does this typography match?

Does this drawer width match?

Does this button match?

Does this interaction already exist elsewhere?

Never allow divergence.

---

## Business Logic

The UI must never invent business rules.

Business logic comes from:

source-inputs

If business logic is unclear:

identify it

explain it

propose options

do not silently assume.

---

## Documentation

Update existing files whenever possible.

Do not duplicate documentation.

Keep markdown internally consistent.

---

## Deliverables

Every substantial change should leave the repository more consistent than before.

Think like a Design Lead preparing a design review—not an AI completing isolated tasks.
