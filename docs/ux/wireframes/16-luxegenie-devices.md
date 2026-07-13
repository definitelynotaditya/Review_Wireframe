# S16 · LUXEGENIE Devices [wireframe]

> Device fleet monitor/assign/reboot; devices are **fixed per room**. Reused from restaurant (🟢). Spec: [Wireframe_Specification §S16](../Wireframe_Specification.md). Reference: [restaurant LUXEGENIE](../../reference/restaurant-dashboard/pages/05-luxegenie.md).

## Default

```
┌─ App Shell ─ title: "LUXEGENIE" · subtitle: "Device fleet" ─────────────────────────────┐
│  ⌕ Search devices…            ( •All )( Assigned )( Unassigned )   [ Reboot All ][Shutdn]│
│  ──────────────────────────────────────────────────────────────────────────────────── │
│  ┌ Device 127 · Battery 82% · Room R03            ⋮ (Reboot/Shutdown/Unassign)        ┐ │
│  ┌ Device 105 · Battery 0% ⚠ · Unassigned         ⋮ (Assign to room)                  ┐ │
│  └───────────────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
Delta vs restaurant: assignment target is a **room** (not a table). Reboot/Shutdown per-device + bulk (confirm modals).

## States
Loading skeleton · Empty `— no devices —` · Error retry · Success toast (assign/reboot). Notification: battery/offline alerts (`⚠`/`⌚`). Maintenance N/A. Permission global.

## Edge cases
Low/zero battery `⚠`; offline device; reboot/shutdown confirmations (hardware — deliberate).

---

### Traceability
- **Business rules:** device config parity; assign-per-room. **Components:** device list 🟢, `⋮` actions 🟢, confirm modals 🟢.

### CHECKLIST — S16 LUXEGENIE Devices
□ Business rules — device parity ✔ · □ State machine — assigned/unassigned; battery ✔ · □ User flow — monitor/assign/reboot ✔
□ Empty ✔ · □ Loading ✔ · □ Error ✔ · □ Success ✔ · □ Notification (battery/offline) ✔ · □ Maintenance — N/A ✔ · □ Permission ✔
□ Edge cases — low battery, offline, reboot confirm ✔ · □ Navigation — confirm modals ✔ · □ CTA — bulk + per-device ⋮ ✔ · □ Reuse — 100% ✔ · □ Patterns — consistent ✔
**RESULT: PASS**
