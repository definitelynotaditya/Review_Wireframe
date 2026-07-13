# S2 · Meeting Room Detail (drawer) [wireframe]

> Progressive-disclosure detail for one room without leaving the board (Principle 11). Drawer C7. Spec: [Wireframe_Specification §S2](../Wireframe_Specification.md).

## Default — In-Use room with activity

```
« Live board (S1) behind »          ┌─ R03 · Boardroom            {In-Use}   ✕ ┐
                                     │ 8 seats · ₹—/hr · Floor 1                │
                                     │──────────────────────────────────────── │
                                     │ CURRENT MEETING                          │
                                     │ Priya Mehta (Member M-1024 · Q Pay ✓)    │
                                     │ Slot 14:00–15:00 · elapsed 28m · rem 32m │
                                     │──────────────────────────────────────── │
                                     │ ACTIVITY LOG (this session)              │
                                     │ • 14:22 Assistance  · Krishna · 15s ✓    │
                                     │ • 14:10 Physical menu · Krishna · 37s ✓  │
                                     │ • 14:26 Assistance  · — · {Pending 1m+ ⚠}│
                                     │──────────────────────────────────────── │
                                     │ NEXT BOOKING                             │
                                     │ 15:00 · Sana (Guest) · 6 pax             │
                                     │──────────────────────────────────────── │
                                     │ [ Accept req ] [ Extend +30 ] [ ⋮ More ] │
                                     │                          [ Generate Bill]│
                                     └──────────────────────────────────────────┘
   ⋮ More → End Meeting · Mark Maintenance · View full history
```

## Variant — Available room
```
┌─ R08                          {Available}  ✕ ┐
│ 8 seats · ₹—/hr · Floor 1                     │
│ No active meeting.                            │
│ NEXT BOOKING: 15:30 · Dev (Member) · 4 pax    │
│                         [ Walk-in ] [ ⋮ ]     │
└───────────────────────────────────────────────┘
```

## Variant — Billing / Ended-action-needed
```
┌─ R05                {Billing}{Bill Requested} ✕ ┐   ┌─ R09  {Ended — action needed} ✕ ┐
│ Meera · mode: Cash · amount pending             │   │ guest left · unbilled           │
│              [ Enter Bill ] → S9                 │   │  [ End Meeting ] [ Generate Bill]│
└─────────────────────────────────────────────────┘   └──────────────────────────────────┘
```

## States
- **Loading:** header resolves first; Activity Log skeleton.
- **Empty:** Activity Log `— no requests yet —`; Next Booking `— none —`.
- **Success:** action → toast + drawer reflects new state (e.g. Accept → pending row becomes `✓`).
- **Error:** action fails → inline `⚠` in ActionBar, inputs kept.
- **Notification:** live request for this room appends to Activity Log + toast; escalation adds `⚠` + `⌚`.
- **Maintenance:** if room set to maintenance, header shows `{Under Maintenance}` + blocked-until + reroute link.
- **Permission:** global (§0.2).

---

### Traceability
- **States:** In-Use/Available/Reserved/Ending Soon/Billing/Ended-action-needed/Under Maintenance; activity pending/complete/escalated.
- **Business rules:** BR-SR6 (response times), BR-END2/END5 (manual close), BR-E1/E3 (extend), BR-END4 (next booking), BR-M* (maintenance).
- **Components:** Drawer 🟡, Status Badge 🟡, Activity row 🟢 (from S14), CTA 🟢.
- **Flows:** board → detail → serve/extend/bill/end.
- **Edge cases:** room turns Available while open (shows next booking / prompts close); concurrent edit reconciled by refetch.

### CHECKLIST — S2 Room Detail
□ Business rules — BR-SR6, BR-END, BR-E, BR-M ✔ · □ State machine — all room states ✔ · □ User flow — open→act→close ✔
□ Empty ✔ · □ Loading ✔ · □ Error ✔ · □ Success ✔ · □ Notification ✔ · □ Maintenance ✔ · □ Permission ✔
□ Edge cases — becomes-available, concurrent action ✔ · □ Navigation — drawer overlay, no nav-away ✔
□ CTA hierarchy — state-appropriate primary; extras in ⋮ ✔ · □ Reuse — drawer+rows reused/extended ✔ · □ Patterns — consistent ✔
**RESULT: PASS**
