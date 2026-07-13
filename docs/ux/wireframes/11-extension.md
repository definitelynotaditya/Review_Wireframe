# S11 · Extension Control (inline-first, panel on block) [wireframe]

> Two paths (FD-17): dashboard-authoritative **+30 immediate** (one click, FD-22) and LG **request** handled with "Seen". Spec: [Wireframe_Specification §S11](../Wireframe_Specification.md).

## Path A — Dashboard extension (happy path = one click)

On an `{In-Use}`/`{Ending Soon}` card or in Room Detail:
```
[ Extend +30 ]  ── click ──►  ✓ toast "R03 extended to 15:30"   (end time updated immediately,
                                                                  slot re-blocked — BR-E1/E4)
```
No drawer on the happy path. Repeated taps add further +30 (each re-checked against availability).

## Path A (blocked) — panel appears only when not free

```
┌─ Extend R03 ──────────────────────── ✕ ┐
│ Current end 15:00 → proposed 15:30      │
│ ⚠ Next slot (15:30 R03 · Sana) blocks   │   ← BR-E2 guard
│   this extension.                        │
│ Options:                                 │
│   • Partial: free until 15:20 → +20 min  │
│   [ Cancel ]   [ Extend +20 ]  [ Override ⚠ ]│  ← Override = deliberate (BR-CF2)
└──────────────────────────────────────────┘
```

## Path B — LG-originated request (notify → Seen → extend)

Card shows `{Extension Requested}`:
```
┌ R03  {In-Use}{Extension Requested}  ┐
│ guest requested +30                  │
│ [ Seen ]   ⋮                         │   ← [ Seen ] closes the request (BR-E3)
└──────────────────────────────────────┘
   after Seen → management uses Path A [ Extend +30 ] to actually extend
```
LG side shows "management will contact you shortly" (no direct LG extension in V1; BR-E5 future).

## States
- **Loading:** availability check `⟳` (fast; inline).
- **Empty:** N/A. **Success:** inline toast + new end time on card/detail.
- **Error:** check/apply fails → inline `⚠`, no change.
- **Notification:** LG request arrival → card badge + toast + `⌚`.
- **Maintenance:** N/A. **Permission:** global (§0.2).

## Edge cases
Next slot fully booked → Override or refuse; partial availability → reduced-window offer; multiple consecutive extensions.

---

### Traceability
- **States:** extendable→applied (inline); blocked→panel→override/partial/refuse; request→seen.
- **Business rules:** BR-E1 (immediate +30, updates end+availability), BR-E2 (guard), BR-E3 (LG request→Seen), BR-E4 (re-block), BR-E5 (future).
- **Components:** Extension Control 🔵 (inline + block-panel), Extension Request + Seen 🔵, shared Availability Engine read-out.
- **Flows:** [User_Flows §5](../User_Flows.md#5-extension-flows--fd-17-two-paths).

### CHECKLIST — S11 Extension
□ Business rules — BR-E1..E5, BR-CF2 (override) ✔ · □ State machine — extension lifecycle (both paths) ✔ · □ User flow — extend / seen→extend ✔
□ Empty — N/A ✔ · □ Loading (check) ✔ · □ Error ✔ · □ Success (inline) ✔ · □ Notification (LG request) ✔ · □ Maintenance — N/A ✔ · □ Permission ✔
□ Edge cases — blocked/partial/override, repeated extends ✔ · □ Navigation — inline; panel only on block ✔
□ CTA hierarchy — one-click Extend primary; Override secondary ✔ · □ Reuse — new but minimal; shares availability engine ✔ · □ Patterns — FD-22 minimal-click ✔
**RESULT: PASS**
