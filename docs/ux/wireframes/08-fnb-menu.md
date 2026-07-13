# S8 · F&B Menu [wireframe]

> The **separate curated meeting-room F&B catalogue** (not Chef's Specials, BR-F1). Reuses Chef's Specials CRUD grammar (🟢). Spec: [Wireframe_Specification §S8](../Wireframe_Specification.md).

## Default

```
┌─ App Shell ─ title: "F&B Menu" · subtitle: "Meeting-room catalogue" ────────────────────┐
│  ⌕ Search items…                                             [ ＋ Add Item ]*           │
│  ( •Active )( Inactive )( All )     ( •All )( Beverages )( Food )( Specials )           │
│  ──────────────────────────────────────────────────────────────────────────────────── │
│  ┌ [img] Cold Coffee     ┐ ┌ [img] Veg Sandwich   ┐ ┌ [img] Masala Fries  ┐            │
│  │ Beverages · Veg       │ │ Food · Veg           │ │ Food · Veg          │            │
│  │ ₹—        {Active}    │ │ ₹—       {Active}    │ │ ₹—      {Inactive}  │            │
│  │ [ ☑ Active ]  ✎  🗑  │ │ [ ☑ Active ]  ✎  🗑 │ │ [ ☐ Active ] ✎  🗑 │            │
│  └───────────────────────┘ └──────────────────────┘ └─────────────────────┘            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

## Add / Edit Item (modal C6)
```
┌─ Add Item ───────────────── ✕ ┐
│ Image  [ ⬆ upload (square ≤10MB) ]│
│ Name * 〔 〕   Price * ₹〔 〕      │
│ Category ▾ ( Beverages )          │
│ Type ( •Veg )( Non-Veg )          │
│              [ Cancel ] [ Save ]* │
└────────────────────────────────────┘
```

## States
- **Loading:** card grid skeleton. **Empty:** `— no items —  [ ＋ Add Item ]`. **Error:** `⚠ … [ Retry ]`.
- **Success:** add/edit/toggle/delete → toast + grid update.
- **Notification:** N/A. **Maintenance:** N/A. **Permission:** global.

## Edge cases
Image upload crop-square ≤10MB → CloudFront; empty category tab; toggle inactive hides item from LG ordering (S18).

---

### Traceability
- **States:** item active/inactive/deleted; empty/loading/error/success.
- **Business rules:** BR-F1 (separate curated catalogue).
- **Components:** Entity CRUD list + item cards 🟢 (Chef's Specials shape), Add Item modal 🟢, image upload 🟢.
- **Flows:** feeds S10 (order review) and S18/B3c (guest ordering).

### CHECKLIST — S8 F&B Menu
□ Business rules — BR-F1 ✔ · □ State machine — item active/inactive ✔ · □ User flow — add/edit/toggle/delete ✔
□ Empty ✔ · □ Loading ✔ · □ Error ✔ · □ Success ✔ · □ Notification — N/A ✔ · □ Maintenance — N/A ✔ · □ Permission ✔
□ Edge cases — image constraints, empty category, inactive-hides-on-LG ✔ · □ Navigation — modal ✔
□ CTA hierarchy — ＋Add Item primary; card toggle/✎/🗑 ✔ · □ Reuse — Chef's Specials verbatim ✔ · □ Patterns — consistent ✔
**RESULT: PASS**
