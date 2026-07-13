# S10 · F&B Order Review (drawer) [wireframe]

> Review/edit a placed order, then punch it. Manual review & punch — no POS/kitchen automation (BR-F4). Spec: [Wireframe_Specification §S10](../Wireframe_Specification.md).

## Default

```
« board behind »     ┌─ F&B Order · R01 · Anil K            {F&B Order Requested} ✕ ┐
                     │ Placed 13:42 · waiting 0m                                     │
                     │──────────────────────────────────────────────────────────── │
                     │  Item                         Qty        Price               │
                     │  Cold Coffee                  [− 2 +]     ₹—      [ 🗑 ]      │
                     │  Veg Sandwich                 [− 1 +]     ₹—      [ 🗑 ]      │
                     │  Masala Fries                 [− 1 +]     ₹—      [ 🗑 ]      │
                     │  ─────────────────────────────────────────────────────────  │
                     │  [ ＋ Add item ]   [ ＋ Add verbal order 〔        〕 ]      │
                     │──────────────────────────────────────────────────────────── │
                     │                                       [ Order Punched ]*     │
                     └───────────────────────────────────────────────────────────────┘
```

- Staff can **add/remove items, change qty, add verbal orders** (BR-F3) before punching.
- `[ ＋ Add item ]` → picker from the curated F&B catalogue (S8).

## Escalated (unattended > 1 min, BR-F5)
```
┌─ F&B Order · R01  {F&B Order Requested}{Escalated ⚠}  ✕ ┐   (card shakes + bell + ⌚)
```

## States
- **Loading:** line items skeleton. **Empty:** N/A (there is always ≥1 item to review).
- **Success:** `[ Order Punched ]` → toast + request closes; card returns to plain `{In-Use}`.
- **Error:** punch fails → inline `⚠`, edits preserved.
- **Notification:** arrival toast + bell; escalation `⚠` + `⌚`.
- **Maintenance:** N/A. **Permission:** global (§0.2).

## Edge cases
Item unavailable → remove/adjust qty; verbal-only additions with free-text; escalation after 1 min.

---

### Traceability
- **States:** placed → under_review(editing) → punched; escalated.
- **Business rules:** BR-F2/F3/F4/F5, BR-SR4 (escalation), BR-SR6 (response time).
- **Components:** Order Review 🟡 (extends ChefSpecialsOrdersModal), editable line rows, Drawer 🟡, catalogue picker (from S8).
- **Flows:** [User_Flows §4](../User_Flows.md#4-fb-order-flow).

### CHECKLIST — S10 F&B Order Review
□ Business rules — BR-F2/F3/F4/F5 ✔ · □ State machine — placed→review→punched ✔ · □ User flow — view→edit→punch ✔
□ Empty — N/A (order-bound) ✔ · □ Loading ✔ · □ Error ✔ · □ Success ✔ · □ Notification ✔ · □ Maintenance — N/A ✔ · □ Permission ✔
□ Edge cases — unavailable item, verbal order, escalation ✔ · □ Navigation — drawer overlay ✔
□ CTA hierarchy — Order Punched primary; edit controls secondary ✔ · □ Reuse — extends orders modal ✔ · □ Patterns — consistent ✔
**RESULT: PASS**
