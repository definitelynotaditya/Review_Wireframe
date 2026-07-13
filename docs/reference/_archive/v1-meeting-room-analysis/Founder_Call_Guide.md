# Founder Call Guide — Meeting Room Manager Dashboard

**Purpose of this document:** A conversational script for a 30–45 minute call with the founder. It is built entirely from the already-completed [Architecture_Decisions.md](Architecture_Decisions.md) and [Requirements_Gap_Analysis.md](Requirements_Gap_Analysis.md) — no new analysis, no new requirements gathering.

**Audience for this document:** You, preparing for and running the call. Not the founder.

---

## CALL OBJECTIVE

- We already did the technical homework. This call is to **validate or adjust decisions we've already made** — not to start from scratch or collect a new wishlist.
- The founder doesn't need to understand the architecture. He needs to confirm that our decisions match how his business actually runs.
- **5 decisions genuinely need his answer** before engineering can safely proceed — these are the CRITICAL topics below. Everything else is nice-to-confirm, not blocking.
- **3 HIGH topics** are worth 2–3 minutes each — they shape what staff will see and use daily, and he'll have real opinions.
- **1 MEDIUM topic** is included only because it's genuinely useful (what to measure) — skip it if time runs short.
- What can wait: exact wording, screen layouts, colors, component-level design — none of that needs his input today.
- What to avoid discussing: database structure, API design, code architecture, entity naming, engineering estimates/timelines. If the conversation drifts there, redirect to the business question underneath it.
- Keep it a conversation, not a checklist read-aloud. Let him talk; you're there to extract a decision, not to present a deck.
- Budget roughly: 5 CRITICAL topics (~5 min each = 25 min) + 3 HIGH topics (~3 min each = 9 min) + buffer/optional questions if time remains.

---

## CRITICAL

### Topic: How Meeting Rooms Fits Into the Dashboard

**Recommended Direction**
Keep Meeting Rooms inside the same LUXEGENIE dashboard staff already use for the restaurant — same menu, same look. When staff open the Meeting Rooms section, the first thing they see is a live status board of every room (open, booked, in use), just like the "Tables" screen works today.

**Why this is recommended**
This keeps the product familiar, minimizes what staff have to relearn, and reuses engineering work already proven in the restaurant module. Splitting it into a separate app would double the learning curve and the build cost for no clear benefit.

**How to explain this to the founder**
"We're planning to make Meeting Rooms feel like a new tab inside the same dashboard you already use for the restaurant — same menu, same feel. When staff open it, the first thing they'd see is a live board showing every room's status, the same way the Tables screen works today. Does that match how you picture your team using it?"

**Questions to ask**
- Does this match how you picture staff using it day to day?
- Should Meeting Rooms feel connected to the restaurant product, or more like its own thing?
- Is seeing "which rooms are free right now" the first thing staff need — or is it more important to see today's bookings first?

**Things to note down**
Navigation feel / Landing screen preference / Anything to avoid

---

### Topic: Recurring Bookings

**Recommended Direction**
Support recurring bookings (e.g. "every Monday for 8 weeks") up to 6 months ahead. When someone wants to change or cancel, ask whether it's "just this one" or "the whole series" — don't force an all-or-nothing rule.

**Why this is recommended**
Recurring bookings are one of the most complex pieces to build correctly. If we guess the rules wrong now, the underlying booking data has to be rebuilt later — expensive to fix after the fact.

**How to explain this to the founder**
"For repeat bookings — like a client's weekly team meeting — we want people to be able to set up a whole series in one go, up to 6 months ahead. If they later need to cancel or move just one date, we won't force them to touch the entire series. Does that match what your regular clients actually need?"

**Questions to ask**
- What repeat patterns do you actually see from clients — weekly, monthly, something else?
- Is 6 months far enough ahead, or do some clients book further out than that?
- If a repeat date happens to clash with something else already booked, should we just skip that one date, or flag it for staff to sort out?

**Things to note down**
Recurrence patterns actually needed / Booking horizon / How conflicts should be handled

---

### Topic: Food & Beverage Ordering in Meeting Rooms

**Recommended Direction**
Keep it lightweight to start: the guest orders from a tablet menu, a staff member reviews (and can edit) the order in the dashboard, then taps "punched" once it's been sent to the kitchen. No automatic kitchen-printer or POS integration in this first phase.

**Why this is recommended**
A full POS/kitchen integration is a much bigger, riskier project with its own contract and timeline. This approach satisfies the actual requirement (staff can review and confirm orders) without inventing a POS system that doesn't exist yet.

**How to explain this to the founder**
"For food orders placed from a meeting room, we're planning to keep it simple at first — the guest orders from the tablet, a staff member reviews it on the dashboard and can adjust it, then marks it 'punched' once it's sent to the kitchen. Think of it like a digital order pad, not a direct connection to your kitchen printer or POS. Is that workable, or does this need to plug directly into your existing system from day one?"

**Questions to ask**
- Is manual staff review-and-punch good enough, or must it connect directly into your kitchen/POS system?
- Should guests order from the same menu as the restaurant, or a separate meeting-room menu?
- Who handles this today — front desk, a dedicated host, or nobody yet because meeting rooms don't have this feature currently?

**Things to note down**
POS integration required (yes/no) / Menu source / Staff role responsible

---

### Topic: Payments & Billing

**Recommended Direction**
Staff types in or looks up the final bill amount, the guest sees payment options on the tablet, and staff confirms in the dashboard once paid. We are **not** planning to actually process payments through the dashboard in this phase — that requires a separate integration with your existing payment/POS systems.

**Why this is recommended**
Payments are the highest-risk part of this whole project — mistakes here have real financial and legal consequences. We will not guess how your settlement, POS, or payment provider works; that has to come from you.

**How to explain this to the founder**
"This is the one area where we really don't want to assume anything. Our plan is: staff enters or looks up the final bill amount, the guest sees payment options on the tablet — like Q Pay, card, or cash — and staff confirms once it's paid, all recorded in the dashboard. We're **not** planning to actually process the payment itself through this system in this first phase. Does that match how billing works today, and where does that final amount usually come from — your POS, Touche, or somewhere else?"

**Questions to ask**
- Where does the final bill amount come from today — your POS, Touche, or a manual calculation?
- Which payment methods do you actually want to offer for meeting rooms — Q Pay, card, cash, payment link, some combination?
- Is a staff member always present to confirm payment, or does this ever need to happen without staff involved?

**Things to note down**
Where the bill amount comes from / Payment methods to support / Who confirms payment

---

### Topic: Staff Roles & Permissions

**Recommended Direction**
Reuse the staff roles you already have (admin, host, server, etc.) instead of inventing new ones. Give full control to admin/manager. Let hosts create and modify bookings. Restrict cancelling a booking, entering the final bill, and confirming payment to admin or a specifically trusted host.

**Why this is recommended**
Getting this wrong either blocks staff from doing their job, or lets the wrong person cancel a paying client's booking or mark a bill as paid incorrectly. This is a trust/risk question only you can answer — we can't infer it from the product.

**How to explain this to the founder**
"We want to reuse the staff roles you already have — admin, host, server, and so on — rather than inventing new ones just for Meeting Rooms. Our default plan: anyone can accept a service request like 'bring a power bank,' but only a manager or a trusted host can cancel a booking or confirm that a bill's been paid. Does that match how much you'd trust different staff levels with this?"

**Questions to ask**
- Who should be allowed to cancel a confirmed booking?
- Who should be able to confirm a payment was received?
- Is there any staff group that shouldn't be able to see or touch bookings at all?

**Things to note down**
Who can cancel / Who confirms payment / Any staff to restrict entirely

---

## HIGH

### Topic: Booking Screen — List vs. Calendar

**Recommended Direction**
Start with a searchable list, the same style as today's restaurant Reservations screen — search, filters, and a "New Booking" button that shows you which times are free. No full visual calendar grid in this first phase.

**Why this is recommended**
A calendar/timeline view is a substantially bigger build than a list with an availability picker built in. The list approach covers the actual requirement (see what's free, book it) and matches the rest of the product.

**How to explain this to the founder**
"For managing bookings, we're planning to reuse the same list-style screen you already have for restaurant reservations — search, filters, and a button to create a new booking that shows you what times are actually free. A full visual calendar is possible down the road, but it's a much bigger build. Would a list like this work for how you'll manage the room schedule day to day, or do you really need a calendar/week view?"

**Questions to ask**
- Do you (or your team) naturally think in terms of a calendar/week view, or would a searchable list be enough?
- Roughly how many bookings a day are we talking about — a handful, or dozens?

**Things to note down**
List vs. calendar preference / Expected daily booking volume

---

### Topic: Membership & Q Pay

**Recommended Direction**
Treat "Member ID" as a simple field staff types in — not checked against any external system — unless you tell us there's a real membership database to connect to. Only show Q Pay as a payment option when a booking is tagged as a member booking.

**Why this is recommended**
If a real membership system exists somewhere, we need to know now so we can plan the connection. If it doesn't, we shouldn't build as if one does — that would be wasted, speculative work.

**How to explain this to the founder**
"For member bookings, unless you already have a membership system we should be checking against, our plan is to just let staff type in a Member ID as a reference. Q Pay would only appear as a payment option when a booking is marked as a member booking. Is there an actual membership database somewhere we should be connecting to?"

**Questions to ask**
- Is there an existing membership system or database we should be checking IDs against?
- How is Q Pay eligibility actually verified today — manually by staff, or through some system?

**Things to note down**
Membership system exists (yes/no) / How Q Pay eligibility is verified today

---

### Topic: Cancellation & Extension Rules

**Recommended Direction**
Make cancellation and extension rules configurable in Settings, the same way restaurant settings work today. Default to a flexible policy — extend in 30-minute steps up to the next booking, no cancellation cutoff — until you tell us otherwise.

**Why this is recommended**
These are pure business-policy questions. We can't guess your cancellation policy or how flexible you want to be with running-over meetings — but they're quick to set once you tell us.

**How to explain this to the founder**
"A couple of quick policy questions: do you want any restrictions on cancelling a booking — like a cutoff time before the meeting? And if a meeting runs over, how should extensions work? Right now our default is 'flexible — extend in 30-minute steps until the next booking starts.' Does that match your actual policy, or would you want something stricter?"

**Questions to ask**
- Should there be a cancellation cutoff (e.g. no free cancellation within X hours of the meeting)?
- If the next slot is already booked, should the guest simply not be able to extend, or should staff have a way to override it?
- How far in advance should reminders go out before a meeting starts or ends?

**Things to note down**
Cancellation policy / Extension rule / Reminder timing

---

## MEDIUM

### Topic: What We Track & Measure

**Recommended Direction**
Reuse the restaurant dashboard's style (key numbers up top, time-period filters) and start with the metrics people naturally ask about: how full the rooms are, booking revenue, cancellations/no-shows, and how fast staff respond to requests.

**Why this is recommended**
We can build the same kind of dashboard you already have for the restaurant, but only if we know which numbers you actually want to glance at. Better to confirm this now than build the wrong metrics and redo it later.

**How to explain this to the founder**
"Like the restaurant dashboard, we'll show you a handful of key numbers at a glance for Meeting Rooms. Our starting list is: how full the rooms are, revenue from bookings, cancellations, and how fast staff respond to requests. Is that the right list, or is there something else you'd actually check every day?"

**Questions to ask**
- What would you actually want to glance at every morning?
- Is revenue-per-room something worth tracking here, or is that handled elsewhere in your business?

**Things to note down**
Metrics that matter most / Anything to leave out

---

## CALL NOTES TEMPLATE

Copy everything below into TextEdit and fill in during the call.

```
FOUNDER CALL — MEETING ROOM DASHBOARD — [DATE]

--------------------------------

How Meeting Rooms Fits Into the Dashboard

Answer:

Notes:

--------------------------------

Recurring Bookings

Answer:

Notes:

--------------------------------

Food & Beverage Ordering

Answer:

Notes:

--------------------------------

Payments & Billing

Answer:

Notes:

--------------------------------

Staff Roles & Permissions

Answer:

Notes:

--------------------------------

Booking Screen: List vs. Calendar

Answer:

Notes:

--------------------------------

Membership & Q Pay

Answer:

Notes:

--------------------------------

Cancellation & Extension Rules

Answer:

Notes:

--------------------------------

What We Track & Measure

Answer:

Notes:

--------------------------------

OPTIONAL / IF TIME ALLOWED

Answer:

Notes:

--------------------------------

OPEN ITEMS / FOLLOW-UPS NEEDED

--------------------------------
```

---

## Questions I should ask only if there is time

These are optional, strategic, and **not blockers** — they help shape direction but nothing here holds up engineering. Keep them clearly separate from the topics above; only raise them if the call is running ahead of schedule.

- **Future roadmap:** Beyond this first version, is there a bigger vision for Meeting Rooms — more locations, a self-service booking portal outside the tablet, integration with external calendars (Outlook/Google)?
- **Competitive differentiation:** Have you seen other meeting-room booking products (competitors, or tools at other venues) you liked or disliked? What made them good or bad?
- **Version 2 ideas:** Would a full visual calendar/week view be worth it later, once volume picks up?
- **Kitchen/POS integration:** Down the road, is a direct connection to your kitchen or POS system for F&B orders something you'd actually want, or is manual review always going to be fine?
- **Guest feedback:** The restaurant has guest ratings (food/service/experience). Would you want something similar for meeting rooms — post-meeting ratings or feedback?
- **Reporting:** Beyond the live dashboard, would you ever want exportable reports (e.g. monthly revenue by room, usage trends) — or is the live view always going to be enough?
- **Multi-venue:** Is there any chance this expands to multiple locations/venues in the future, or is this always single-site?
