# Woobly Meeting Room Management — Design Repository

Canonical product, UX, architecture, and design-system documentation for **Woobly Meeting Room Management** — the meeting-room product on the **Woobly** smart-hospitality platform, operated by the client venue **Quorum** and served in-room through **LUXEGENIE** guest tablets.

This repository is the **single source of truth** for the product. It is written so that engineering, product, design, and future AI sessions can build the system — and generate a production Figma reference — **without any prior chat or the raw PRD**.

> **Branding:** *Woobly* = the platform (vendor). *Quorum* = the client venue / guest-facing brand ("Welcome to Quorum"). *LUXEGENIE* = the in-room device. Do not confuse platform branding with customer branding.

## Start here

**→ [`docs/README.md`](docs/README.md)** is the documentation index and role-based reading order.

| I want to… | Go to |
|---|---|
| Understand the product | [`docs/product/MeetingRoom_Product_Spec.md`](docs/product/MeetingRoom_Product_Spec.md) |
| See the decisions & rules | [`docs/product/Founder_Decision_Log.md`](docs/product/Founder_Decision_Log.md) · [`docs/product/Business_Rules.md`](docs/product/Business_Rules.md) |
| See the design system | [`docs/DESIGN.md`](docs/DESIGN.md) |
| See the screens (engineer wireframes) | [`docs/ux/wireframes/`](docs/ux/wireframes/) |
| See the screens (founder review) | [`docs/founder-review/`](docs/founder-review/) — open `index.html` in a browser |
| Check repository health | [`docs/REPOSITORY_AUDIT.md`](docs/REPOSITORY_AUDIT.md) · [`docs/DESIGN_REVIEW.md`](docs/DESIGN_REVIEW.md) · [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md) |

## Repository layout

```
.
├── README.md                     ← you are here
├── CLAUDE.md                     ← working guidance for AI sessions on this repo
├── docs/                         ← the canonical knowledge base (start at docs/README.md)
│   ├── DESIGN.md                     canonical design system + Figma-ready tokens
│   ├── DESIGN_REVIEW.md              final design/consistency audit
│   ├── PROJECT_STATUS.md · REPOSITORY_AUDIT.md
│   ├── product/  architecture/  engineering/  ux/
│   ├── ux/wireframes/                18 engineer-first grayscale wireframes + shell + components
│   ├── founder-review/               presentation-quality low-fi HTML wireframes (open in a browser)
│   └── reference/                    evidence & raw inputs (source-inputs/, restaurant-dashboard/, _archive/)
└── GITHUB REP/                   ← the existing Restaurant Manager Dashboard (React) this product extends/reuses
```

## What this product is

**Woobly Meeting Room Management** is an operational control system, not a generic SaaS dashboard. Management books rooms through a guided **calendar-first** flow (Date → Duration → Time Slot → Seats → available rooms → details → confirm) backed by an availability + pricing engine. The manager dashboard is **room-first**: a live board of room cards is the landing surface, attention-sorted so work rises to the top. At the scheduled time a room shows **Reserved** and LUXEGENIE shows "Welcome to Quorum / Start Meeting"; the guest taps **Start Meeting** → **In-Use**. Guests request Wi-Fi, assistance, IT support, a power bank, curated F&B, extensions, and the bill from LUXEGENIE; staff service each from the dashboard. **Meetings never auto-end** — management or the guest closes them, then the room returns to **Available** and the next booking surfaces. Members come from an **internal CSV-seeded database**; there is a **single management access level**; payments are **recorded, not processed**. It is an **extension** of the Woobly Restaurant Manager Dashboard — majority reuse/extend — with new surface concentrated in the booking engine, extension, member DB, and maintenance.

The room lifecycle is the backbone: **Available → Reserved → In-Use → Ending Soon → Billing → Available**, with **Under Maintenance** as an interrupt.

## Reference implementation

[`GITHUB REP/`](GITHUB%20REP/) contains the existing **Restaurant Manager Dashboard** (Vite + React) that this product extends. It is the reuse baseline referenced throughout [`docs/architecture/Component_Mapping.md`](docs/architecture/Component_Mapping.md); it is **evidence**, not the meeting-room spec.
