# S12 · Members / Guests + CSV Import [wireframe]

> Internal Member DB (CSV-seeded, editable) + derived guests (FD-18). Feeds S5 member lookup. Spec: [Wireframe_Specification §S12](../Wireframe_Specification.md).

## Default — Members tab

```
┌─ App Shell ─ title: "Members / Guests" · subtitle: "Member database" ───────────────────┐
│  ⌕ Search member id / name / mobile…      [ Import CSV ]      [ ＋ Add Member ]*        │
│  ( •Members )( Guests )                                                                 │
│  ──────────────────────────────────────────────────────────────────────────────────── │
│  ┌ M-1024 · Priya Mehta      90000 00000    Q Pay ✓     {Active}     ✎   🗑          ┐ │
│  ┌ M-1025 · Dev Sharma       —              Q Pay ✓     {Active}     ✎   🗑          ┐ │
│  └───────────────────────────────────────────────────────────────────────────────────┘ │
│  (Guests tab = read-only, derived from bookings: name · mobile · visits)               │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

## CSV Import (modal — upload → preview → validate → import → result)

```
┌─ Import Members (CSV) ──────────────────────────── ✕ ┐
│ Step 1  [ ⬆ Choose CSV ]   sample: member_id,name,mobile,q_pay │
│ Step 2  PREVIEW (first rows)                          │
│   M-2001 · Rao · 98… · Y                              │
│   M-2002 · Iyer · — · N                               │
│ Step 3  VALIDATION                                    │
│   ⚠ 2 rows: duplicate member_id (will be skipped)     │
│   ⚠ 1 row: missing name (will be skipped)             │
│ ──────────────────────────────────────────────────── │
│                     [ Cancel ]    [ Import 148 rows ]*│
└───────────────────────────────────────────────────────┘
        → result: "✓ 148 imported · 3 skipped (see report)"
```

## Add / Edit Member (modal)
```
┌─ Add Member ───────────── ✕ ┐
│ Member ID * 〔 M-2050 〕      │
│ Name * 〔 〕  Mobile 〔 〕     │
│ ☑ Q Pay eligible             │
│         [ Cancel ] [ Save ]* │
└───────────────────────────────┘
```

## States
- **Loading:** list skeleton; import step spinners. **Empty:** `— no members —  [ Import CSV ] / [ ＋ Add Member ]`.
- **Success:** import/add/edit → toast + list update; import shows result summary.
- **Error:** malformed CSV → validation list (skip + report); duplicate IDs reported; save fail inline.
- **Notification:** N/A. **Maintenance:** N/A. **Permission:** global.

## Edge cases
Duplicate IDs on import (skip+report), malformed rows (skip+report), guests read-only, invalid member used in S5 is blocked there (BR-MEM3).

---

### Traceability
- **States:** member active/deleted; import idle/uploading/preview/errors/success.
- **Business rules:** BR-MEM1 (CSV+editable), BR-MEM2 (lookup used by S5), BR-MEM3 (invalid blocks booking — enforced in S5), BR-MEM4 (future external-sync seam).
- **Components:** Members list 🟡 (extends Guest List), CSV Import modal 🔵, Member editor 🔵.
- **Flows:** onboarding (import) → editing → consumed by [S5 member lookup](05-new-booking.md).

### CHECKLIST — S12 Members / CSV
□ Business rules — BR-MEM1..MEM4 ✔ · □ State machine — member + import states ✔ · □ User flow — import/add/edit; feeds S5 ✔
□ Empty ✔ · □ Loading ✔ · □ Error (CSV validation) ✔ · □ Success (result summary) ✔ · □ Notification — N/A ✔ · □ Maintenance — N/A ✔ · □ Permission ✔
□ Edge cases — dup IDs, malformed rows, read-only guests ✔ · □ Navigation — modals ✔
□ CTA hierarchy — ＋Add Member / Import primary ✔ · □ Reuse — extends Guest List ✔ · □ Patterns — consistent ✔
**RESULT: PASS**
