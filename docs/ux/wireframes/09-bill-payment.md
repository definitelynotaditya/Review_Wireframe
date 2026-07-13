# S9 · Bill / Payment Panel (drawer) [wireframe]

> Enter POS amount → drive LG display → confirm → close meeting. Dashboard **records**, does not process (BR-PAY5). Spec: [Wireframe_Specification §S9](../Wireframe_Specification.md). Lifecycle: [State_Machines §7](../../architecture/State_Machines.md#7-bill--payment-lifecycle).

## Default — bill requested by guest

```
« board behind »        ┌─ Bill · R03 · Priya Mehta            {Billing}   ✕ ┐
                        │ Meeting 14:00–15:00 · Member M-1024 · Q Pay ✓        │
                        │──────────────────────────────────────────────────── │
                        │ PAYMENT MODE (chosen on LUXEGENIE)                    │
                        │   ● Q Pay   (member only, BR-PAY7)                    │
                        │──────────────────────────────────────────────────── │
                        │ BILL AMOUNT (from POS / Touche)                       │
                        │   ₹ 〔 0.00 〕            [ Save Amount ] → shows on LG│
                        │──────────────────────────────────────────────────── │
                        │ STATUS: amount pending → instructions shown → confirm │
                        │                              [ Confirm Payment ]*     │
                        └───────────────────────────────────────────────────────┘
```

- **Flow:** enter amount → `[ Save Amount ]` (LG shows total + per-mode instruction) → guest pays externally → `[ Confirm Payment ]` → meeting ends, room → Available + **next booking surfaced** (BR-END3/END4).
- `[ Confirm Payment ]` disabled until amount saved.

## Variant — manual closure (guest left, no bill request; BR-END5)
```
┌─ Generate Bill · R09 (manual closure)         ✕ ┐
│ No guest bill request. Select mode:              │
│  ( Q Pay* )( Scan )( Link )( Card )( •Cash )     │   *Q Pay only if member
│  ₹ 〔 0.00 〕  [ Save Amount ]                    │
│                          [ Confirm Payment ]*    │
└──────────────────────────────────────────────────┘
```

## Payment-mode → LG instruction (reference, shown to staff)
| Mode | LG shows |
|---|---|
| Q Pay (member) | Total + "please wait to sign the bill" |
| Scan to Pay | Total + QR |
| Payment Link | Total + "link sent shortly" |
| Card / Cash | Total + "your host is on the way" |

## States
- **Loading:** summary skeleton. **Empty:** N/A (always tied to a session). 
- **Success:** confirm → toast "Payment confirmed · R03 available" + drawer closes; card flips.
- **Error:** save/confirm fails → inline `⚠`, amount preserved.
- **Notification:** `updated-bill-amount` / `payment-confirmed` events reflected; `⌚` if closure needs attention.
- **Maintenance:** N/A. **Permission:** global (§0.2).

## Edge cases
Q Pay hidden for non-member; amount editable before confirm (BR emits `edited-bill-amount`); closing drawer before confirm keeps `{Billing}`.

---

### Traceability
- **States:** bill_requested → amount_entered → instructions_shown → payment_confirmed → closed.
- **Business rules:** BR-PAY1..PAY7, BR-END3/END4/END5.
- **Components:** Bill/Payment Panel 🟡 (extends BillRequestAndSessionDetailsModal), amount field, mode display, Drawer 🟡.
- **Flows:** [User_Flows §6](../User_Flows.md#6-billing--payment-flow).

### CHECKLIST — S9 Bill/Payment
□ Business rules — BR-PAY*, BR-END* ✔ · □ State machine — full bill/payment lifecycle ✔ · □ User flow — request→amount→confirm→close ✔
□ Empty — N/A (session-bound) ✔ · □ Loading ✔ · □ Error ✔ · □ Success ✔ · □ Notification ✔ · □ Maintenance — N/A ✔ · □ Permission ✔
□ Edge cases — Q Pay member-gate, manual closure, edit-before-confirm ✔ · □ Navigation — drawer overlay ✔
□ CTA hierarchy — Confirm Payment primary (gated); Save Amount secondary ✔ · □ Reuse — extends restaurant bill modal ✔ · □ Patterns — consistent ✔
**RESULT: PASS**
