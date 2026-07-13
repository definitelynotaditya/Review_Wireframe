# Component: Content Section Editor

The pattern behind every [Settings](../pages/10-settings.md) tab: an editor for a block of **guest-facing content** shown on the LUXEGENIE device. **Evidence:** Observed.

## Anatomy

```
<Section> Settings          Visible in LUXEGENIE [⬤]  [+ Add <Item>]
┌──────────────────────────────────────────────────────────────┐
│ <Item title>                         [💾 Save <Item>] [🗑]     │
│ <Media>  [ image upload / QR ]  Change · Remove               │
│ <field>  <field>  …                                           │
└──────────────────────────────────────────────────────────────┘
```

## Elements

- **"Visible in LUXEGENIE" master toggle** (gold pill switch) — gates whether the section renders on the guest device.
- **"+ Add <Item>"** for list-type sections (Events, Chefs, Loyalty Clubs).
- **Per-item card:** media slot + fields + **Save** (gold) + delete.
- **Media slot:** either an **image upload** (crop-to-square, ≤10MB → CloudFront) or a **QR-code image** (Menu, WiFi, Loyalty).

## Section instances

| Section | Type | Fields |
|---|---|---|
| History | single | name, image, long story text |
| Event Details | list | media, name, date, start/end time |
| Chef Details | list | photo, name, designation*, bio |
| Loyalty Club | list | QR, name, description |
| Menu | single | QR only |
| WiFi | single | SSID, password (masked+reveal), QR |

## Why it matters

This component is the seam where **back-office configuration meets the guest device**. Any new guest-device content type should be added as another Content Section (toggle + media + fields + Save), keeping the manager's mental model consistent.
