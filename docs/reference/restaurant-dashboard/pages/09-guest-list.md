# Page: Guest List (Guest CRM)

- **URL:** `/restaurant/guest-list`
- **Header:** "Guest List" · subtitle "View restaurant's guest list"
- **Evidence:** Observed (screenshot, DOM, live API), 2026-07-12
- **API:** `GET admin/guest/list/3` → `{ success, data: Guest[] }`

## Purpose

- **Business objective:** A lightweight guest CRM — the deduplicated directory of everyone who has dined/reserved, with loyalty signal (visit frequency).
- **User objective:** Look up a guest by name/phone/email and see how often they return.

## Layout

1. **Search** input — "Search guests by name, phone, or email…".
2. **Guests (142)** count header.
3. **Guest cards** (list):
   - `guest_name` (heading)
   - **Returning Guest** badge (green) when they have prior visits
   - "`n` return visits" line
   - 📞 `contact` · ✉️ `email` (or muted "No email provided")
   - Right: **"`n` visits"** pill with a revisit icon.

## Guest object (Observed)

`GET admin/guest/list/{id}` returns an **aggregated** projection (not a raw table):

| Field | Example | Notes |
|---|---|---|
| `guest_name` | "Aakash" | |
| `contact` | "9191909292" | phone — the likely dedupe key |
| `email` | null | optional |
| `revisit_count` | 8 | number of prior visits → drives badge & "n return visits" |

> No `guest_id` in the payload → **Inferred** the list is derived/aggregated from [Reservations](03-reservations.md) (which carry `guest_name`, `contact`, `revisit_count`, `guest_type`) grouped by contact. This is a **read-only** view (no add/edit controls observed).

## Loyalty semantics (Inferred)

- `revisit_count > 0` → **Returning Guest** badge; `guest_type` on a reservation is `first` for new guests.
- Duplicate names with the same phone appear as separate cards in the raw list (e.g. several "Aakash") — dedupe appears to be by exact contact string, so data-entry variance can fragment a guest.

## Relationships

- Guest ⟵ derived from [Reservations](03-reservations.md).
- Feeds no downstream module observed; primarily a lookup/loyalty surface.

## Open questions

- Exact aggregation/dedupe key (contact vs name+contact).
- Whether tapping a guest opens visit history (no detail view observed).
