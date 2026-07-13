# S17 · Settings [wireframe]

> Meeting-room policy + guest-device content. Reuses the restaurant Content Section Editor pattern (🟢). Spec: [Wireframe_Specification §S17](../Wireframe_Specification.md).

## Default (tabbed)

```
┌─ App Shell ─ title: "Settings" · subtitle: "Policy & device content" ───────────────────┐
│  ( •Payment Modes )( Cancellation & Extension )( Reminders )( Pricing Policy )          │
│  ( Wi-Fi )( Events / About Quorum )                                                     │
│  ──────────────────────────────────────────────────────────────────────────────────── │
│  PAYMENT MODES                                    Visible in LUXEGENIE [ ☑ ]           │
│   ☑ Q Pay (members)   ☑ Scan to Pay   ☑ Payment Link   ☑ Card   ☑ Cash                │
│   Preferred mode ▾ ( Cash )                                                             │
│                                                              [ Save ]*                  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

## Other tabs (structure)
- **Cancellation & Extension:** ☑ allow cancellation + cutoff 〔 〕; extension increment 〔 30 〕 min (BR-E1).
- **Reminders:** end reminder 〔 10 〕 min before (BR-N2); start reminder ☐ (deferred).
- **Pricing Policy:** configurable band rules (placeholders; thresholds TBD per BR-P5) — the isolated Pricing Calculator config (FD-15).
- **Wi-Fi:** SSID/password/QR + Visible-in-LUXEGENIE toggle (🟢).
- **Events / About Quorum:** content sections (🟢), each with visibility toggle.

## States
Per section {view|editing|saving|saved}. Loading skeleton · Error inline · Success toast per Save. Empty N/A. Notification/Maintenance N/A. Permission global.

## Edge cases
Pricing-policy fields configurable but thresholds unresolved (BR-P5 — flagged, not invented); disabling all payment modes → validation (keep ≥1).

---

### Traceability
- **Business rules:** BR-PAY3 (modes+preferred), BR-C1 (cancellation), BR-E1 (extension increment), BR-N2 (reminders), BR-P3/P5 (pricing policy configurable).
- **Components:** Content Section Editor 🟢, visibility toggles 🟢, policy forms 🟡.

### CHECKLIST — S17 Settings
□ Business rules — BR-PAY3, BR-C1, BR-E1, BR-N2, BR-P3 ✔ · □ State machine — section view/edit/save ✔ · □ User flow — edit→save per section ✔
□ Empty — N/A ✔ · □ Loading ✔ · □ Error ✔ · □ Success ✔ · □ Notification — N/A ✔ · □ Maintenance — N/A ✔ · □ Permission ✔
□ Edge cases — pricing thresholds TBD (flagged), keep ≥1 mode ✔ · □ Navigation — sub-tabs ✔ · □ CTA — per-section Save ✔ · □ Reuse — Content Section Editor ✔ · □ Patterns — consistent ✔
**RESULT: PASS**
