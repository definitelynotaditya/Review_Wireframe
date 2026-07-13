# Page: LUXEGENIE (Device Fleet)

- **URL:** `/restaurant/luxegenies`
- **Header:** "LUXEGENIE" · subtitle "Manage your restaurant LUXEGENIE and preferences"
- **Evidence:** Observed (screenshot, DOM, live API), 2026-07-12
- **API:** `GET luxegenie/devices/get/all/3` → `{ success, devices: Device[] }`

## What LUXEGENIE is (Inferred from evidence)

**LUXEGENIE is the guest-facing smart table device** — a battery-powered table-side unit (tablet + configurable **LED**) that guests use to summon service. Each request type (service, physical menu, power bank, chef's special, manager's attention, bill) lights the LED a configurable colour and starts a countdown timer. This is the hardware behind every "request flag" seen on [Tables](02-tables.md) and every metric on the [Dashboard](01-dashboard.md).

This page is the **device fleet manager**.

## Purpose

- **Business objective:** Provision, monitor, assign, and remotely control the physical LUXEGENIE fleet.
- **User objective:** See device health (battery, assignment), assign devices to tables, and remotely reboot/shutdown.

## Layout

1. **Search devices…** input.
2. **Assignment tabs:** `All (6)` [default], `Assigned (0)`, `Unassigned (6)`.
3. **Fleet header:** "Devices (6)" + bulk actions **Shutdown All** (blue) and **Reboot All** (green).
4. **Device cards** (list):
   - `Device ID - 127`
   - `Battery: 0%` (red when low)
   - Assignment status: "Not assigned" (or table/area when assigned)
   - **⋮ kebab menu** → per-device **Shutdown**, **Reboot**.

## Device object (canonical schema — Observed)

| Field | Example | Meaning |
|---|---|---|
| `device_id` | 127 | PK / label |
| `restaurant_id` | 3 | tenant |
| `serial_number` | "5d05e153f4b81150" | hardware serial |
| `table_id` / `assigned_to_table_no` / `assigned_to_sitting_area` | null | table assignment |
| `cell_capacity` | 3200 | battery capacity (mAh) |
| `battery_percentage` | 0 | live charge |
| `led_brightness` | 255 | 0–255 |
| `update_type` | "latest" | firmware/OTA channel |

### LED colour mapping (per request type)
Each request lights the LED a configurable colour (color IDs reference a palette):

| Field | Default id |
|---|---|
| `service_request_color_id` | 3 |
| `physical_menu_request_color_id` | 3 |
| `powerbank_request_color_id` | 3 |
| `chefs_special_request_color_id` | 3 |
| `managers_attention_request_color_id` | 9 |
| `bill_request_color_id` | 3 |
| `reservation_screen_color_id` | 7 |
| `default_color_id` | 16 |

### Request timeouts (milliseconds)
| Field | Default |
|---|---|
| `waiter_service_call_waiting_time` | 60000 |
| `physical_menu_waiting_time` | 60000 |
| `power_bank_waiting_time` | 60000 |
| `waiter_take_order_waiting_time` | 60000 |
| `bill_request_waiting_time` | 10000 |
| `bill_paid_redirect_splash_screen_time` | 30000 |
| `order_data_clear_time` | 60000 |
| `cancel_request_time` | 3000 |

### Connectivity / config
| Field | Example |
|---|---|
| `led_url` | "http://localhost:8000/led" (on-device LED controller) |
| `base_url` / `backend_url` | "https://api.woobly.com" / "https://backend.woobly.com" |
| `pusher_app_key` / `pusher_cluster` | "…" / "ap2" (real-time channel, Asia-Pacific) |
| `is_deleted`, `created_at`, `updated_at` | | |

## Actions

| Action | Scope | Effect (Inferred) |
|---|---|---|
| **Reboot** / **Reboot All** | one / fleet | remote device restart |
| **Shutdown** / **Shutdown All** | one / fleet | remote power-off |
| **Assign** (Inferred) | one | bind `device_id` → `table_id` (moves it to Assigned tab) |

> These are **hardware-affecting** operations; not exercised during documentation.

## States

- **Assigned vs Unassigned** — tab filter on `table_id`. All 6 unassigned at capture.
- **Battery** — 0% shown red (devices likely offline/uncharged in this test venue).

## Relationships

- Device (`table_id`) ↔ **Table** (`luxegenie_device_id`, `is_luxegenie_assigned`) on [Tables](02-tables.md).
- Device colour/timeout config are the per-device counterpart of the global request settings in [Settings](10-settings.md).
- Device emits the request events aggregated on the [Dashboard](01-dashboard.md).

## Open questions

- The colour-id → colour palette mapping.
- The assign-to-table flow (dialog vs inline).
- Whether device config (colours/timeouts) is editable from this page or only Settings.
