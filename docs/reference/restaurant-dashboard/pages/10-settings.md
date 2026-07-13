# Page: Settings

- **URL:** `/restaurant/settings`
- **Header:** "Settings" · subtitle "Manage your restaurant settings and preferences"
- **Evidence:** Observed (screenshots, DOM, network), 2026-07-12
- **APIs:** one per tab — `admin/history|event|chef|loyalty-club|menu|wifi/restaurant/3`

## Purpose

- **Business objective:** Configure the **guest-facing content** the LUXEGENIE device presents, plus venue identity and utilities (WiFi, menu, loyalty).
- **User objective:** Edit the restaurant's story, events, chefs, loyalty program, menu QR, and WiFi — and control what is "Visible in LUXEGENIE".

## Structure — sub-tab hub

Six sub-tabs (segmented control):

| Tab | API | Purpose |
|---|---|---|
| **History** | `admin/history/restaurant/3` | Venue identity & story |
| **Event Details** | `admin/event/restaurant/3` | Promotional events (list) |
| **Chef Details** | `admin/chef/restaurant/3` | Chef profiles (list) |
| **Loyalty Club** | `admin/loyalty-club/restaurant/3` | Loyalty programs (list, QR) |
| **Menu** | `admin/menu/restaurant/3` | Menu QR code |
| **WiFi** | `admin/wifi/restaurant/3` | Guest WiFi + QR |

**Recurring pattern:** most tabs have a **"Visible in LUXEGENIE"** master toggle (gold) controlling whether that section renders on the guest device, and list tabs have **"+ Add …"** plus per-item **Save** / 🗑️ delete.

## Tab details (Observed)

### History
- `Visible in LUXEGENIE` toggle.
- **Restaurant Name** (text) — "Malaka Spice".
- **Restaurant Image** (upload / Choose different image / Remove).
- **Restaurant History and Information** (long text) — e.g. *"Founded in 1997 by the couple – Praful and Cheeru Chandawarkar, Malaka Spice … Koregaon Park, Pune…"*.

### Event Details (list)
Per event: **Event Media** (image), **Event Name** ("Elite Meetups"), **Event Date**, **Start Time**, **End Time**. Actions: **Save Event** / delete; **+ Add Event**.

### Chef Details (list)
Per chef: **Chef Image**, **Chef Name** \*, **Designation** \* ("Executive Sous Chef"), **Information** (bio). Actions: Save / delete; **+ Add Chef**.

### Loyalty Club (list)
Per club: **QR Code Image**, **Loyalty Club Name** ("Gold Members Club"), **Description**. Actions: **Save Loyalty Club** / delete; **+ Add Loyalty Club**.

### Menu
- **Menu QR Code Image** only (Choose / Remove) + **Save Menu Settings**. (No visibility toggle observed — menu QR is core.) The digital menu itself lives behind the QR.

### WiFi
- `Visible in LUXEGENIE` toggle.
- **WiFi Network Name (SSID)** — "Malaka spice_5G".
- **WiFi Password** (masked, reveal toggle).
- **WiFi QR Code Image** (Choose / Remove) + **Save Wi-Fi Settings**.

## Relationship to `restaurant_data` (Observed)

Several settings map to flags on the [Restaurant object](../../_archive/v1-restaurant-kb/domain-model.md#restaurant) stored in `localStorage.restaurant_data`:

| Restaurant flag | Related setting |
|---|---|
| `show_access_wifi: true` | WiFi tab visibility |
| `is_chef_specials_customization: true` | Chef's-special customization requests |
| `notify_manager_about_bill` | (Inferred) bill-notification preference |
| `notify_all_server_about_requests` | (Inferred) request fan-out preference |
| `opening_time` / `closing_time` / `payment_upi_id` / `payment_qr_url` | (Inferred) editable venue config (tab not located) |

> Some restaurant-level fields (hours, payment UPI/QR, address, timezone) were **not** located in the six observed tabs — either edited elsewhere or on an unshown part of History. Tracked in [open-questions](../../_archive/v1-restaurant-kb/open-questions.md).

## Design pattern

This page is the canonical example of the product's **"content section" pattern**: a titled card with an image-upload slot, text fields, a visibility toggle, and Save/Add/Delete — repeated per content type. See [components/content-section-editor.md](../components/content-section-editor.md).
