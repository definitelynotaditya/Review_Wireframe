# Data Model & API — Meeting Room (proposed)

> **Status:** Canonical (proposal) · **Version:** 3.0 · **Last updated:** 2026-07-13
> Field names and endpoints are **proposals** aligned to observed restaurant conventions; they may change, but the shapes/relationships should hold. Restaurant schemas are Observed; see [`../reference/restaurant-dashboard/`](../reference/restaurant-dashboard/).
> V3 adds: internal **Member DB** (CSV), **MaintenanceBlock**, booking `version` (first-save-wins), and the **Ending Soon / Billing** session states.

## Purpose

Give engineering concrete (proposed) entity schemas, API endpoint families, and event contracts for the Meeting Room module, consistent with the existing platform.

## Scope

Entity field schemas, REST endpoint families, response envelopes, Pusher events. Conceptual model is in [Domain_Model](../architecture/Domain_Model.md); state logic in [State_Machines](../architecture/State_Machines.md).

## Dependencies

[Domain_Model](../architecture/Domain_Model.md) · [RealTime_And_Sync](../architecture/RealTime_And_Sync.md) · [Business_Rules](../product/Business_Rules.md)

## Assumptions

Follows observed conventions: `restaurant_id` scoping, `is_deleted`, ISO-UTC timestamps, INR string money, `{success, data, count}` envelope.

---

## 1. Entity schemas (proposed)

### MeetingRoom
```jsonc
{
  "room_id": 0, "restaurant_id": 3,
  "room_number": "R01", "room_name": "Boardroom",
  "sitting_area": "Floor 1", "capacity": 8,
  "status": "available|reserved|in_use|ending_soon|billing|under_maintenance",
  "luxegenie_device_id": 0, "luxegenie_serial_number": null,
  "session_id": null, "current_booking_id": null, "next_booking_id": null,
  "is_deleted": false, "created_at": "ISO", "updated_at": "ISO"
}
```

### RoomPricing (consumed by the isolated Pricing Calculator — BR-P3)
```jsonc
{ "room_id": 0, "hourly": "500.00", "half_day": "2000.00", "full_day": "3500.00", "currency": "INR" }
```
> The **Pricing Calculator** is a config-driven module: `computeEstimate(duration, pricing, policy)` → e.g. 4h→half_day; 5h→half_day+1×hourly. Policy is configurable (FD-15); never hardcode band thresholds in booking UI.

### MaintenanceBlock (FD-14)
```jsonc
{ "block_id": 0, "room_id": 0, "restaurant_id": 3,
  "started_at": "ISO", "blocked_until": "ISO(=started_at+24h)",
  "set_by": "server_code", "cleared_at": null }
```

### RoomBooking
```jsonc
{
  "booking_id": 0, "restaurant_id": 3, "room_id": 0,
  "booking_type": "member|guest|walkin",
  "member_id": null, "guest_name": "…", "guest_honorifics": null,
  "contact": "…", "pax": null,
  "booking_channel": "phone|whatsapp|qr|email",
  "date": "ISO", "slot_start": "HH:mm", "duration_minutes": 60,
  "pricing_band": "hourly|half_day|full_day", "estimate": "500.00",
  "status": "booked|active|completed|cancelled|rerouted|no_show",
  "recurrence_id": null, "clash_flagged": false,
  "override": false, "override_by": null,
  "version": 1,   // optimistic concurrency for first-save-wins (BR-CF1)
  "is_deleted": false, "created_at": "ISO"
}
```

### RecurrenceRule
```jsonc
{ "recurrence_id": 0, "pattern": "weekly|monthly", "until": "ISO(≤6mo)",
  "occurrences": [{ "booking_id": 0, "date": "ISO", "clash_flagged": false }] }
```

### MeetingSession
```jsonc
{ "session_id": 0, "restaurant_id": 3, "room_id": 0, "booking_id": 0,
  "status": "open|ending_soon|billing|closed",
  "started_at": "ISO", "end_time": "ISO", "ended_at": null,
  "ended_by": null }   // "management" | "guest" — never auto (BR-END1)
```

### MeetingActivity
```jsonc
{
  "activity_id": 0, "session_id": 0, "room_id": 0, "restaurant_id": 3,
  "activity_type": "assistance|it_support|power_bank|other_service|fnb_order|extension|bill_request",
  "activity_status": "initiated|pending|escalated|complete|cancelled|punched",
  "payload": { }, "server_code": null, "server_name": null,
  "response_time": null, "created_at": "ISO"
}
```

### FnbItem (curated meeting-room catalogue)
```jsonc
{ "item_id": 0, "restaurant_id": 3, "name": "…", "description": "…",
  "price": "250.00", "veg_nonveg": "veg|non-veg",
  "category": "Beverages|Food|Specials", "image": "cloudfront-url",
  "active": true, "is_deleted": false }
```

### RoomBill + Payment
```jsonc
{ "bill_id": 0, "session_id": 0, "amount": "0.00", "source": "pos",
  "status": "requested|amount_entered|instructions_shown|confirmed",
  "payment": { "mode": "q_pay|payment_link|scan_to_pay|card|cash",
               "confirmed_by": "server_code", "confirmed_at": "ISO" } }
```

### Member (internal Member DB — FD-18)
```jsonc
{ "member_id": "M-1024", "restaurant_id": 3, "name": "…",
  "mobile": null, "q_pay_eligible": true,
  "source": "csv|manual", "is_deleted": false,
  "created_at": "ISO", "updated_at": "ISO" }
```
> Owned internally, seeded by **CSV import**, editable (BR-MEM1). Booking validates `member_id`; **invalid → block** (BR-MEM3). Access via a **repository interface** so a future external sync can swap the source without UX change (BR-MEM4). **Guest** (non-member) remains a derived projection from bookings.

## 2. API endpoint families (proposed)

Mirrors observed restaurant families (`admin/*`, `luxegenie/*`).

| Domain | Endpoint family |
|---|---|
| Rooms | `GET/POST/PATCH/DELETE admin/meeting-room/venue/{id}` |
| Room pricing | `admin/meeting-room/{roomId}/pricing` |
| **Maintenance** | `POST admin/meeting-room/{roomId}/maintenance` (set/clear; server computes 24h block) |
| Bookings | `admin/meeting-room-booking/venue/{id}?filter_type=upcoming|today|past|all` — **POST is atomic first-save-wins (BR-CF1); `?override=true` for BR-CF2** |
| Availability | `admin/meeting-room/availability/venue/{id}?date=&duration=&slot=&seats=` (Availability Engine; enforces BR-A2/A3, excludes maintenance) |
| Recurrence | `admin/meeting-room-booking/recurrence` |
| **Extension** | `POST admin/meeting-room-booking/{bookingId}/extend` (dashboard +30, immediate; BR-E1) · `POST …/extension-seen` (LG request close; BR-E3) |
| Sessions | `luxegenie/meeting-session/for/venue/{id}` |
| **Meeting close** | `POST luxegenie/meeting-session/{sessionId}/end` (management/guest; never auto — BR-END1) |
| Activities | `luxegenie/meeting-session/activities/for/venue/{id}` |
| F&B catalogue | `admin/meeting-room-fnb-item/venue/{id}` |
| F&B orders | `admin/meeting-room-fnb-order/venue/{id}` |
| Billing/payment | `admin/meeting-room-bill/session/{sessionId}` |
| Dashboard (operational) | `admin/meeting-room-dashboard/*/venue/{id}` (today status/bookings/attention — FD-20) |
| View history | `admin/meeting-room-history/{domain}/venue/{id}?period=` |
| **Member DB** | `GET/POST/PATCH/DELETE admin/meeting-room-member/venue/{id}` · **`POST …/member/import` (CSV)** · `GET …/member/{memberId}` (validate/auto-fill; BR-MEM2/3) |
| Settings | `admin/meeting-room-settings/venue/{id}` (incl. pricing policy) |

- **Period enum** (Observed in `ViewHistory.jsx`): `today | yesterday | last_7_days | this_month | custom` (+ `date_from`/`date_to`).
- **Envelope:** `{ success: bool, data|<resource>, count? }` (be consistent within a resource).
- **Member endpoint is internal** (not an external adapter) — see [Integration_Points §Member](Integration_Points.md#2-member-database--internal-in-v1).

## 3. Event contracts

See [RealTime_And_Sync §4](../architecture/RealTime_And_Sync.md#4-proposed-meeting-room-events) for the full proposed event list and the invalidate-then-refetch keys.

## 4. Notable data differences vs restaurant

| Aspect | Restaurant | Meeting Room |
|---|---|---|
| Time-based status | none (staff-driven) | **Reserved at slot start; Ending-Soon at −10 min** (scheduler) |
| Pricing | none on table | **per-room bands + isolated Pricing Calculator** |
| Recurrence | none | **weekly/monthly, 6-mo** |
| Concurrency | n/a | **first-save-wins (`version`) + override** |
| Maintenance | none | **24h new-booking block; existing bookings rerouted** |
| Extension | none | **dashboard +30 immediate; LG request-only** |
| Meeting end | make-vacant | **never auto; management/guest only** |
| Bill amount | inline session bill | **explicit RoomBill from POS/Touche** |
| Menu | Chef's Specials | **separate curated F&B catalogue** |
| Member | none (derived guests) | **internal Member DB (CSV), invalid ID blocks** |

## Future Work

- Finalize field names with backend; confirm availability query params; confirm envelope per resource.
- Define POS/Touche adapter contract and confirm CSV member-import schema ([Integration_Points](Integration_Points.md)).

## Related Documents

- [Domain_Model](../architecture/Domain_Model.md) · [State_Machines](../architecture/State_Machines.md) · [RealTime_And_Sync](../architecture/RealTime_And_Sync.md) · [Integration_Points](Integration_Points.md)
- Restaurant API reference: [`../reference/restaurant-dashboard/api-observations.md`](../reference/restaurant-dashboard/api-observations.md)
