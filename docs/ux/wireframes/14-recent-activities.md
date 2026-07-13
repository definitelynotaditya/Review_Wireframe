# S14 · Recent Activities [wireframe]

> Full chronological activity feed (the bell's "View all"). Spec: [Wireframe_Specification §S14](../Wireframe_Specification.md).

## Default

```
┌─ App Shell ─ title: "Recent Activities" · subtitle: "All requests & events" ────────────┐
│  Filter  Type ▾ ( All )   Room ▾ ( All )   Date 〔 〕                                    │
│  ──────────────────────────────────────────────────────────────────────────────────── │
│  14:26  R03  Assistance             — · {Pending 1m+ ⚠}      → [ Open room ]            │
│  14:22  R03  Assistance             Krishna · 15s ✓                                     │
│  14:10  R01  F&B Order              punched · Rao                                       │
│  13:55  R05  Bill Request           Cash · confirmed · Meera                            │
│  13:40  R07  Meeting Ending Soon    system                                              │
│  …  (infinite scroll / paginate)                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

- Rows show room · type · staff · status · response time · timestamp. Row → Room Detail (S2).

## States
- **Loading:** row skeleton. **Empty:** `— no activity yet —`. **Error:** `⚠ … [ Retry ]`.
- **Notification:** new activity prepends live (mirrors bell + `⌚`). **Success/Maintenance:** N/A. **Permission:** global.

## Edge cases
High volume → pagination/infinite scroll; unattended/escalated rows flagged `⚠`.

---

### Traceability
- **States:** activity requested/pending/escalated/complete; empty/loading/error/notification.
- **Business rules:** BR-SR6 (response time), BR-SR4 (escalation), FD-19 (feed).
- **Components:** activity list 🟢 (reuse RecentActivities), filters 🟢.
- **Flows:** bell → all activities → open room.

### CHECKLIST — S14 Recent Activities
□ Business rules — BR-SR4/SR6, FD-19 ✔ · □ State machine — activity states ✔ · □ User flow — bell→feed→open room ✔
□ Empty ✔ · □ Loading ✔ · □ Error ✔ · □ Success — N/A ✔ · □ Notification (live prepend) ✔ · □ Maintenance — N/A ✔ · □ Permission ✔
□ Edge cases — volume/pagination, escalated flag ✔ · □ Navigation — row→S2 ✔
□ CTA hierarchy — no primary; filters + row link ✔ · □ Reuse — restaurant feed verbatim ✔ · □ Patterns — consistent ✔
**RESULT: PASS**
