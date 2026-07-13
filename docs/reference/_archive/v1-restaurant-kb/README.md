# Knowledge Base Index

> **⚠️ Archived (V1).** This is a **historical, superseded** snapshot — see [`../README.md`](../README.md) for what replaced it. It was originally organized into subfolders (`analysis/`, `architecture/`, `ux/`, `components/`, `pages/`, `research/`); the files below were later flattened into this single folder, so some internal links in this document and its siblings point to paths that no longer exist (and a few — `pages/*.md`, `components/README.md`, `architecture/api-observations.md` — were never carried into the archive at all). Left unedited to preserve the original analysis; for live restaurant-dashboard reference use [`../../restaurant-dashboard/`](../../restaurant-dashboard/) instead.

Reverse-engineered documentation of the **Woobly Restaurant Manager Dashboard**. Start here.

## Read in this order

1. **[analysis/product-philosophy.md](analysis/product-philosophy.md)** — what the product is and why.
2. **[architecture/information-architecture.md](architecture/information-architecture.md)** — modules, routes, navigation, app shell.
3. **[architecture/domain-model.md](architecture/domain-model.md)** — entities & ERD (the vocabulary).
4. **Pages** — one file per module (below).
5. **[architecture/state-machines.md](architecture/state-machines.md)** — lifecycles.
6. **[components/](components/README.md)** + **[ux/](ux/design-language.md)** — how to build UI that matches.

## Pages

| # | Page | Route |
|---|---|---|
| 00 | [Login](pages/00-login.md) | `/login` |
| 01 | [Dashboard](pages/01-dashboard.md) | `/restaurant/dashboard` |
| 02 | [Tables (live floor)](pages/02-tables.md) | `/restaurant/tables` |
| 03 | [Reservations](pages/03-reservations.md) | `/restaurant/reservations` |
| 04 | [Users (staff)](pages/04-users.md) | `/restaurant/users/all` |
| 05 | [LUXEGENIE (devices)](pages/05-luxegenie.md) | `/restaurant/luxegenies` |
| 06 | [Chef's Specials](pages/06-chef-specials.md) | `/restaurant/chef-specials` |
| 07 | [Manage Tables (config)](pages/07-manage-tables.md) | `/restaurant/manage-tables` |
| 08 | [Transfer Sessions](pages/08-transfer-sessions.md) | `/restaurant/manage-sessions` |
| 09 | [Guest List](pages/09-guest-list.md) | `/restaurant/guest-list` |
| 10 | [Settings](pages/10-settings.md) | `/restaurant/settings` |

## Architecture

- [Information Architecture & Navigation](architecture/information-architecture.md)
- [Domain Model (ERD + schemas)](architecture/domain-model.md)
- [State Machines & Lifecycles](architecture/state-machines.md)
- [Real-Time Architecture (Pusher)](architecture/real-time.md)
- [Roles & Permissions](architecture/roles-and-permissions.md)
- [API Observations](architecture/api-observations.md)

## UX & Components

- [Design Language (tokens, type, colour)](ux/design-language.md)
- [UX & Interaction Conventions](ux/conventions.md)
- [Component & Pattern Library](components/README.md)

## Analysis & Research

- [Product Philosophy](analysis/product-philosophy.md)
- [Methodology & Evidence Discipline](analysis/methodology.md)
- [Open Questions & Access Gaps](analysis/open-questions.md)
- [Session Log](research/session-log.md)

## One-paragraph orientation

Woobly is a smart-hospitality platform. Guests use a table-side **LUXEGENIE** device to tap requests (service, bill, menu, power bank, chef's special, manager). Each tap becomes an **Activity** in a table **Session**, handled by a **server** with a measured response time, pushed live to this **Manager Dashboard**. The dashboard's 10 modules either **configure** that loop (Manage Tables, Chef's Specials, Users, Settings, LUXEGENIE), **run** it live (Tables, Transfer Sessions), or **measure** it (Dashboard, Guest List, Reservations). Single-tenant (`restaurant_id`), INR/India-localised, soft-delete everywhere, React+Tailwind+Pusher.
