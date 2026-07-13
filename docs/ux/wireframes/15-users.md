# S15 · Users [wireframe]

> Staff accounts. **Reused verbatim from restaurant** (🟢). Single access level — roles are labels only (BR-PERM1/PERM2). Spec: [Wireframe_Specification §S15](../Wireframe_Specification.md). Reference: [restaurant Users](../../reference/restaurant-dashboard/pages/04-users.md).

## Default

```
┌─ App Shell ─ title: "Users" · subtitle: "Staff accounts" ──────────────────────────────┐
│  ⌕ Search users…                                             [ ＋ Add User ]*           │
│  ( •Active )( Inactive )( All )                                                         │
│  ──────────────────────────────────────────────────────────────────────────────────── │
│  ┌ (KR) Krishna     Host    · code 11 · 90000 00000        ☑ active      ✎           ┐ │
│  ┌ (RA) Rao         Server  · code 22 · —                  ☑ active      ✎           ┐ │
│  └───────────────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
Add/Edit User = restaurant modal (username, name, contact, server code, role label, password). **No functional delta** — roles do not gate dashboard actions (BR-PERM2).

## States
Loading skeleton · Empty `— no users — [ ＋ Add User ]` · Error retry · Success toast. Notification/Maintenance N/A. Permission global.

---

### Traceability
- **Business rules:** BR-PERM1/PERM2. **Components:** Users list + Add User modal 🟢 (reuse).

### CHECKLIST — S15 Users
□ Business rules — BR-PERM1/PERM2 ✔ · □ State machine — active/inactive ✔ · □ User flow — add/edit/toggle ✔
□ Empty ✔ · □ Loading ✔ · □ Error ✔ · □ Success ✔ · □ Notification — N/A ✔ · □ Maintenance — N/A ✔ · □ Permission ✔
□ Edge cases — activate/deactivate ✔ · □ Navigation — modal ✔ · □ CTA — ＋Add User primary ✔ · □ Reuse — 100% ✔ · □ Patterns — consistent ✔
**RESULT: PASS**
