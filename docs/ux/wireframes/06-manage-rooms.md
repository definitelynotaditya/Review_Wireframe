# S6 · Manage Rooms [wireframe]

> CRUD rooms + pricing bands; entry to maintenance. Spec: [Wireframe_Specification §S6](../Wireframe_Specification.md).

## Default

```
┌─ App Shell ─ title: "Manage Rooms" · subtitle: "Rooms, pricing & maintenance" ─────────┐
│  ⌕ Search rooms…                                              [ ＋ Add Room ]*          │
│  ( •All )( Floor 1 )( Floor 2 )                                                         │
│  ──────────────────────────────────────────────────────────────────────────────────── │
│  ┌ R01 · Boardroom       Floor 1 · 8 seats   ₹—/hr · ₹—/half · ₹—/full  {Active}     ┐ │
│  │                                                                    ✎   🗑   ⋮     │ │
│  └───────────────────────────────────────────────────────────────────────────────────┘ │
│  ┌ R11 · Huddle          Floor 2 · 4 seats   ₹—/hr · ₹—/half · ₹—/full  {Under Maint}┐ │
│  │  blocked until 14:00 tmrw · 2 bookings to reroute                  ✎   🗑   ⋮     │ │
│  └───────────────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
   ⋮ → Mark/Clear Maintenance · Reroute bookings · Assign device
```

- `[ ＋ Add Room ]` / `✎` → **Room Editor modal (S7)**. `🗑` → delete confirm (blocked if future bookings → offer reroute).

## States
- **Loading:** row skeleton. **Empty:** `— no rooms —  [ ＋ Add Room ]`. **Error:** `⚠ … [ Retry ]`.
- **Success:** add/edit/delete → toast + list update (`room-created/-updated`).
- **Notification:** N/A (config surface). **Maintenance:** row renders `{Under Maintenance}` + blocked-until + reroute count.
- **Permission:** global; maintenance/delete are management-authority (confirm step).

## Edge cases
Delete room with future bookings → confirm + reroute; maintenance overlapping bookings → S7 reroute list.

---

### Traceability
- **States:** room active/under-maintenance/soft-deleted; empty/loading/error/success.
- **Business rules:** BR-P1 (pricing bands), BR-M1..M4 (maintenance).
- **Components:** Entity CRUD list 🟡, Room row 🟡, Add/Edit modal + Maintenance 🟡/🔵 (S7).
- **Flows:** [User_Flows §8](../User_Flows.md#8-maintenance-flow--fd-14).

### CHECKLIST — S6 Manage Rooms
□ Business rules — BR-P1, BR-M1..M4 ✔ · □ State machine — room config states ✔ · □ User flow — add/edit/delete/maintain ✔
□ Empty ✔ · □ Loading ✔ · □ Error ✔ · □ Success ✔ · □ Notification — N/A (config) ✔ · □ Maintenance ✔ · □ Permission ✔
□ Edge cases — delete-with-bookings, maintenance-with-bookings ✔ · □ Navigation — modal (S7) ✔
□ CTA hierarchy — ＋Add Room primary; row ✎/🗑/⋮ ✔ · □ Reuse — extends Manage Tables ✔ · □ Patterns — consistent ✔
**RESULT: PASS**
