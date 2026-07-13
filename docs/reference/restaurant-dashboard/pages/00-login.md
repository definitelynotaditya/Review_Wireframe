# Page: Login

- **URL:** `https://dashboard.mywoobly.com/login`
- **Evidence:** Observed (screenshot + DOM), 2026-07-12
- **Auth:** Public (pre-authentication entry point)

## Purpose

- **Business objective:** Gate access to the manager-facing dashboard; only authorised restaurant managers reach the product.
- **User objective:** Authenticate and land in the Manager Dashboard.

## Layout

Two-column, full-viewport, dark theme.

- **Left panel (brand):** Wordmark treatment — "BESPOKE / EXPERIENCE" in a gold serif display face, a horizontal gold rule, and a crown motif. Pure brand real-estate; no interactive elements.
- **Right panel (auth):** Centered card-less form.
  - Crown logo mark
  - Heading **WOOBLY** (serif)
  - Subheading: "Access Your Manager Dashboard"
  - `Username` label + textbox — placeholder "Enter your username or email" (`type=text`)
  - `Password` label + textbox — placeholder "Enter your password" (`type=password`)
  - Password-visibility toggle button (eye icon, `type=button`) inside the password field
  - **Sign In** primary button (`type=submit`), full-width, gold fill with glow
  - Footer: "© 2025 Woobly. All rights reserved."

## Components observed

| Component | Notes |
|---|---|
| Text input | Rounded, dark fill, subtle border; label sits above field |
| Password input + reveal toggle | Eye icon button toggles masking |
| Primary button | Gold (`#f5d76e`-ish) fill, black text, full-width, soft outer glow |
| Brand lockup | Crown mark + serif "WOOBLY" wordmark |

## Behaviour

- **Observed:** Form has a single submit action ("Sign In"). Username accepts username **or** email.
- **Assumed:** Standard credential auth returns a session/token and redirects to a dashboard home route. (To be confirmed post-login.)

## Design signals (for the design-language doc)

- **Palette:** Deep navy/near-black background, gold (`#EAD196`-family) accents, white serif headings.
- **Typography:** Serif display for brand ("WOOBLY", "BESPOKE EXPERIENCE"); sans-serif for form labels and inputs.
- **Motif:** Crown — recurring brand symbol. Luxury / "bespoke" positioning.

See [`../ux/design-language.md`](../../_archive/v1-restaurant-kb/design-language.md).

## Open questions

- Is there password-reset / "forgot password" flow? (Not visible on this screen.)
- Is there SSO or multi-tenant selection after login?
- What roles exist beyond "Manager"? See [`../analysis/open-questions.md`](../../_archive/v1-restaurant-kb/open-questions.md).
