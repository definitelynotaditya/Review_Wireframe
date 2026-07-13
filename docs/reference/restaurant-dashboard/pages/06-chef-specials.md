# Page: Chef's Specials (Featured Menu)

- **URL:** `/restaurant/chef-specials`
- **Header:** "Chef's Specials" · subtitle "Manage your chef's specials and featured dishes"
- **Evidence:** Observed (screenshot, DOM, live API), 2026-07-12
- **API:** `GET admin/chef-special-dish/restaurant/3` → `{ success, data: Dish[] }`

## Purpose

- **Business objective:** Curate a promotable menu of featured dishes ("chef's specials") that guests can browse and request from the LUXEGENIE device; revenue is tracked by category.
- **User objective:** Add, edit, activate/deactivate, categorise, and search featured dishes.

## Layout

1. **Search chef specials…** input.
2. **+ Add Chef Special** primary button (gold).
3. **Status tabs:** `Active (28)` [default], `Inactive (0)`, `All (28)`.
4. **Category tabs:** `All (28)`, `Drinks (8)`, `Mains (10)`, `Starters (8)`, `Desserts (2)`.
5. **Dish cards** (grid, 1–2 col):
   - Hero image; **Veg/Non-Veg** badge (green/red); **price** (top-right, e.g. `610.00`).
   - Dish name (heading) + description; category label; a numeric counter (right — Inferred: units sold / order count).
   - **Active** (green) status button + **Edit** (gold) button.

## Dish object (canonical schema — Observed)

| Field | Example | Notes |
|---|---|---|
| `chef_special_id` | 2 | PK |
| `restaurant_id` | 3 | tenant |
| `dish_name` | "A Beautiful Mess" | |
| `dish_description` | "…Mulberry Infused…" | free text |
| `dish_img` | CloudFront URL | `d2w73ixm4tgqv3.cloudfront.net/restaurants/3/…` |
| `dish_price` | "610.00" | string decimal (₹) |
| `veg_nonveg` | "veg" | `veg` \| `non-veg` |
| `menu_category_name` | "Drinks" | Drinks/Starters/Mains/Desserts |
| `menu_sub_category_name` | "Cocktails" | free/sub-category |
| `calories` | 0 | optional |
| `active` | true | activation |
| `is_deleted` | false | soft delete |
| `created_at` | ts | |

## Add New Chef Special dialog (Observed)

- **Dish Image** \* (cropped square, max 10MB → CloudFront)
- **Dish Name** \*
- **Price** \*
- **Description** \*
- **Menu Category** \* (select): `Drinks, Starters, Mains, Desserts`
- **Type** \* (select): `Vegetarian, Non-Vegetarian`
- **Calories** (optional)
- Actions: **Cancel** / **Add**

> No customization builder appears in this dialog. Guest-side **customization** is a separate request (`chefs_special_customization_request` on the [Table](02-tables.md)); the venue has `is_chef_specials_customization: true` (see [Settings](10-settings.md)).

## Media pipeline (Observed)

Images are uploaded (client-cropped to square, ≤10MB) and served from **AWS CloudFront** under `restaurants/{id}/…`. Same pattern as user avatars.

## Relationships

- Dish → **Dashboard** "Chef's Specials revenue by category" (`admin/dashboard/chef-specials/revenue-by-category`).
- Dish → surfaced on the LUXEGENIE device for guest browsing/requests.

## Open questions

- Meaning of the per-card numeric counter (units sold vs. requests).
- Sub-category management (how `menu_sub_category_name` is set — not in Add form observed).
