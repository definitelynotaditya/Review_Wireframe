# Architecture Decision Register

Master architectural decision log for the Meeting Room Manager Dashboard module.

**Audience:** Founder, Product, Design, Engineering  
**Baseline:** Existing LUXEGENIE Restaurant Manager Dashboard documentation is the platform foundation. Meeting Room PRD and Features Flow are the functional source of truth.  
**Purpose:** Record unresolved architectural decisions with recommended defaults so Product Architecture, Reference Wireframes, and Engineering Blueprint can proceed without hidden assumptions.

## Decision Summary

| Decision ID | Decision | Recommendation | Priority |
|---|---|---|---|
| ADR-001 | Product module and navigation model | Keep one Manager Dashboard shell; introduce Meeting Room modules as a parallel product area using the existing flat IA grammar. | Critical |
| ADR-002 | Core domain entity strategy | Create explicit Meeting Room domain entities; reuse Restaurant patterns/components, not Restaurant entity names. | Critical |
| ADR-003 | Live operations surface | Make `Meeting Rooms` the live operational landing surface, equivalent to Restaurant `Tables`. | High |
| ADR-004 | Booking interface strategy | Use Reservations-style list/cards plus a booking modal with availability slot selection; defer standalone calendar unless approved. | High |
| ADR-005 | Booking, room, and session lifecycle ownership | Booking owns schedule; Room owns current availability/status; Session owns active runtime; Activity owns requests. | Critical |
| ADR-006 | Availability and conflict rules | Backend calendar is the source of truth; no overlapping bookings; extensions allowed only to the next unavailable boundary. | Critical |
| ADR-007 | Recurring booking model | Store recurrence rule plus generated occurrences within the 6-month horizon; support occurrence vs series decisions. | Critical |
| ADR-008 | LG to Dashboard synchronization | Preserve REST hydration plus Pusher; backend is canonical; LG and Dashboard are clients. | Critical |
| ADR-009 | Service request architecture | Model all LG actions as typed Activities with pending/accepted/completed/cancelled states. | High |
| ADR-010 | F&B ordering boundary | Implement F&B orders as Meeting Room Activity payloads with staff review/edit and `Order punched` closure; do not assume full POS/kitchen automation. | Critical |
| ADR-011 | Payment and billing ownership | Dashboard records amount, selected mode, and staff confirmation; external payment/POS settlement requires explicit integration. | Critical |
| ADR-012 | Member identity and Q Pay eligibility | Treat Member ID as manual/lookup-ready until a member system is specified; do not infer validation. | High |
| ADR-013 | Roles and permissions | Extend existing roles with a Meeting Room permission matrix; do not add roles unless required. | Critical |
| ADR-014 | Settings organization | Add Meeting Room settings for payment modes, cancellation, reminders, extension increments, and rating toggles; keep room attributes in Manage Rooms. | High |
| ADR-015 | Analytics and history placement | Reuse Dashboard period/KPI patterns; keep detailed history inside bookings/sessions until reporting is explicitly scoped. | Medium |
| ADR-016 | New component boundary | Extend existing components first; introduce only availability picker, recurrence control, order review, payment panel, and extension control. | Medium |
| ADR-017 | API and event contract style | Follow existing REST/Pusher conventions under a Meeting Room resource namespace with tenant-scoped paths and soft-delete semantics. | Critical |

## Decisions

### ADR-001

**Decision ID:** ADR-001

**Decision:** Product module and navigation model

**Context:** The Restaurant platform uses one authenticated App Shell, a flat sidebar, and route namespace `/restaurant/*`. Meeting Room must feel native to this platform, not like a separate app.

**Why it matters:** Navigation determines the architecture and route map that Product Architecture and Wireframes will build around.

**Recommendation:** Keep one Manager Dashboard shell. Introduce Meeting Room modules as a parallel product area using the same flat IA grammar: Dashboard, Meeting Rooms, Bookings, Users, LUXEGENIE, F&B/Menu where needed, Manage Rooms, Booking/Session History if approved, Guest/Member List, Settings.

**Reasoning:** The Restaurant docs show flat navigation and a configuration-vs-operation split as core product philosophy. Meeting Rooms needs the same mental model.

**Default assumption:** Use a Meeting Room route namespace, for example `/meeting-rooms/*`, while preserving shell, components, and route semantics from `/restaurant/*`.

**Owner:** Founder + Product Architecture  
**Blocks Product Architecture?** Yes  
**Blocks Wireframes?** Yes  
**Blocks Engineering?** Yes  
**Priority:** Critical

### ADR-002

**Decision ID:** ADR-002

**Decision:** Core domain entity strategy

**Context:** Restaurant has `Table`, `Reservation`, `Session`, `Activity`, `User`, and `LUXEGENIE Device`. Meeting Rooms resemble tables operationally but have distinct booking, pricing, member, payment, and F&B flows.

**Why it matters:** Overloading Restaurant entities would speed early work but create ambiguity in APIs, analytics, permissions, and future scalability.

**Recommendation:** Create explicit Meeting Room domain entities while reusing the Restaurant architectural pattern.

**Reasoning:** A Meeting Room is not just a table with a different label. It has hourly/half-day/full-day pricing, member/non-member bookings, recurring schedules, extension constraints, and payment modes.

**Default assumption:** Define `MeetingRoom`, `RoomBooking`, `MeetingSession`, `MeetingActivity`, `RoomPricing`, `RoomBillPayment`, `MeetingFnbOrder`, and optional `MemberReference`. Reuse component and API conventions, not raw Restaurant table semantics.

**Owner:** Product Architecture + Engineering  
**Blocks Product Architecture?** Yes  
**Blocks Wireframes?** Mostly  
**Blocks Engineering?** Yes  
**Priority:** Critical

### ADR-003

**Decision ID:** ADR-003

**Decision:** Live operations surface

**Context:** Restaurant landing route is `Tables`, the real-time floor radar. Meeting Room PRD starts with room status and live LG prompts.

**Why it matters:** Operators need one default page that answers which rooms are available, reserved, in use, ending soon, requesting service, or awaiting payment.

**Recommendation:** Make `Meeting Rooms` the live operational landing surface, equivalent to Restaurant `Tables`.

**Reasoning:** This preserves the product's real-time-first philosophy. Booking management belongs nearby but should not replace the live room radar.

**Default assumption:** Live room cards show room number/name, seats, current status, current guest/member if available, slot/duration, ending-soon messages, request badges, and primary action for pending staff work.

**Owner:** Product Architecture  
**Blocks Product Architecture?** Yes  
**Blocks Wireframes?** Yes  
**Blocks Engineering?** Mostly  
**Priority:** High

### ADR-004

**Decision ID:** ADR-004

**Decision:** Booking interface strategy

**Context:** Meeting Room PRD requires booking, member/guest/walk-in/recurring types, modify/reschedule, cancel, 6-month horizon, date/duration/slot, and estimated price. Restaurant Reservations uses a list/card surface with filters and a New Reservation modal.

**Why it matters:** A standalone calendar would change the IA and component model. A modal-only approach may hide availability too much.

**Recommendation:** Use the existing Reservations-style page as the primary Bookings surface, with search, scope tabs, filters, booking cards, and a New Booking modal that includes availability slot selection.

**Reasoning:** This fits the established platform and covers the PRD. A full calendar can be added later only if the founder approves it as a distinct operational need.

**Default assumption:** No standalone Calendar nav item in the first architecture. Availability appears inside create/reschedule flows and on booking cards.

**Owner:** Product + Design  
**Blocks Product Architecture?** Yes  
**Blocks Wireframes?** Yes  
**Blocks Engineering?** Mostly  
**Priority:** High

### ADR-005

**Decision ID:** ADR-005

**Decision:** Booking, room, and session lifecycle ownership

**Context:** The Meeting Room flow states that a room becomes `Reserved` at meeting time, then `In-Use` when the guest taps Start Meeting on LG. Existing Restaurant docs separate Reservation, Table, Session, and Activity.

**Why it matters:** Without ownership rules, LG, Dashboard, and backend can disagree about whether a room is booked, active, ended, or payable.

**Recommendation:** Booking owns scheduled intent. MeetingRoom owns current operational status. MeetingSession owns active runtime after LG Start Meeting. Activity owns service/order/bill/extension events.

**Reasoning:** This mirrors the Restaurant model and keeps analytics/event history reliable.

**Default assumption:** `RoomBooking.booked/reserved/cancelled/completed` is distinct from `MeetingRoom.available/reserved/in_use`; `MeetingSession.open/ending_soon/awaiting_payment/closed` drives runtime actions.

**Owner:** Product Architecture + Engineering  
**Blocks Product Architecture?** Yes  
**Blocks Wireframes?** Mostly  
**Blocks Engineering?** Yes  
**Priority:** Critical

### ADR-006

**Decision ID:** ADR-006

**Decision:** Availability and conflict rules

**Context:** The PRD defines selectable available meeting rooms, hourly slots, future bookings up to 6 months, and extension constraints when next slot is booked or partially available.

**Why it matters:** Availability must be deterministic across Dashboard and LG. Extensions can create booking conflicts if rules are not server-owned.

**Recommendation:** Backend booking calendar is the source of truth. Prevent overlapping bookings for the same room. Allow extension only up to the next unavailable boundary unless a staff override is explicitly approved.

**Reasoning:** The flow already distinguishes full availability, partial availability, and unavailable next slot. That should be encoded as backend availability rules, not UI logic.

**Default assumption:** Slot duration is calculated from configured increments, defaulting to 30-minute extension steps because the flow repeatedly references 30 minutes.

**Owner:** Product + Engineering  
**Blocks Product Architecture?** Yes  
**Blocks Wireframes?** Mostly  
**Blocks Engineering?** Yes  
**Priority:** Critical

### ADR-007

**Decision ID:** ADR-007

**Decision:** Recurring booking model

**Context:** The PRD includes Recurring Meeting Booking but does not define recurrence patterns, editing rules, cancellation rules, or conflict handling.

**Why it matters:** Recurrence is a data-model and UX multiplier. It affects availability, cancellation, modification, analytics, and notifications.

**Recommendation:** Store a recurrence rule plus generated booking occurrences within the 6-month booking horizon. Require the UI to distinguish "this booking only" vs "entire series" for modify/cancel.

**Reasoning:** This is the smallest robust recurrence architecture. It avoids infinite future schedules while honoring the PRD's 6-month limit.

**Default assumption:** Recurrence supports only patterns explicitly approved in the next architecture phase; do not infer daily/weekly/monthly choices without approval.

**Owner:** Founder + Product + Engineering  
**Blocks Product Architecture?** Yes  
**Blocks Wireframes?** Yes  
**Blocks Engineering?** Yes  
**Priority:** Critical

### ADR-008

**Decision ID:** ADR-008

**Decision:** LG to Dashboard synchronization

**Context:** Restaurant uses REST hydration plus Pusher. Meeting Room flow depends heavily on LG actions changing Dashboard state and Dashboard actions closing requests.

**Why it matters:** Real-time consistency is central to the product philosophy.

**Recommendation:** Preserve the existing sync architecture: LG sends actions to backend APIs; backend persists state and publishes Pusher events; Dashboard updates from Pusher and rehydrates from REST.

**Reasoning:** This is already proven by Restaurant docs and avoids client-to-client state coupling.

**Default assumption:** LG never directly mutates Dashboard-only state. Dashboard never treats local UI state as canonical.

**Owner:** Engineering  
**Blocks Product Architecture?** Mostly  
**Blocks Wireframes?** No  
**Blocks Engineering?** Yes  
**Priority:** Critical

### ADR-009

**Decision ID:** ADR-009

**Decision:** Service request architecture

**Context:** Meeting Room flow includes Assistance, IT Support, Power Bank, Other Service, Extend Meeting, F&B Order, and Bill Request. Restaurant uses Activity records and live request flags.

**Why it matters:** Requests must feed live cards, notifications, response-time analytics, and staff action history.

**Recommendation:** Model all LG actions as typed MeetingActivities with status, payload, timestamps, room/session/booking references, and assigned/resolving staff where applicable.

**Reasoning:** This preserves the Restaurant central loop: guest action -> Activity -> live card/notification -> staff action -> response time/analytics.

**Default assumption:** Request states are `requested`, `pending`, `accepted`, `completed`, and `cancelled`, with UI labels adapted per request type.

**Owner:** Product Architecture + Engineering  
**Blocks Product Architecture?** Mostly  
**Blocks Wireframes?** Mostly  
**Blocks Engineering?** Yes  
**Priority:** High

### ADR-010

**Decision ID:** ADR-010

**Decision:** F&B ordering boundary

**Context:** Meeting Room flow requires guests to browse filters/categories, add items to cart, place order, and let staff review/edit the order on Dashboard before pressing `Order punched`. Restaurant has Chef's Specials and Menu QR, but no full POS/kitchen module in this dashboard.

**Why it matters:** If treated as POS/kitchen integration, scope expands. If treated as a simple activity payload, the PRD can be satisfied without inventing an ordering platform.

**Recommendation:** Implement F&B orders as Meeting Room Activity payloads with order items, quantities, staff edits, and `Order punched` closure. Do not assume kitchen/POS automation unless specified.

**Reasoning:** This matches the PRD exactly: Dashboard can view/change order details and mark punched. It also preserves the Restaurant platform's pragmatic lightweight-integration style.

**Default assumption:** F&B catalogue source must be defined before engineering. Until then, use the existing dish/category model as the closest baseline, but do not assume Chef's Specials alone equals the full F&B menu.

**Owner:** Founder + Product + Engineering  
**Blocks Product Architecture?** Yes  
**Blocks Wireframes?** Yes  
**Blocks Engineering?** Yes  
**Priority:** Critical

### ADR-011

**Decision ID:** ADR-011

**Decision:** Payment and billing ownership

**Context:** PRD lists payment modes and configurable preferred payment mode. Flow says staff enters bill amount retrieved from POS or Touche, LG displays payment instructions, and staff confirms payment in Dashboard.

**Why it matters:** Payment is high-risk. Engineering cannot infer settlement, provider behavior, or legal receipt logic.

**Recommendation:** In the first architecture, Dashboard owns bill request workflow, entered/retrieved amount, selected mode, display state, and staff confirmation. External settlement and POS/Touche retrieval are integration adapters requiring explicit contracts.

**Reasoning:** This satisfies the specified operational flow without pretending payment processing exists in the current Restaurant platform.

**Default assumption:** Payment states are `bill_requested`, `amount_entered`, `payment_instructions_shown`, `payment_confirmed`, and `meeting_closed`.

**Owner:** Founder + Engineering  
**Blocks Product Architecture?** Yes  
**Blocks Wireframes?** Yes  
**Blocks Engineering?** Yes  
**Priority:** Critical

### ADR-012

**Decision ID:** ADR-012

**Decision:** Member identity and Q Pay eligibility

**Context:** Meeting Room booking supports Member Booking with Member ID and Q Pay for members. Existing Restaurant Guest List is derived from reservations and has no member system.

**Why it matters:** Member identity affects booking fields, payment eligibility, guest display, and data ownership.

**Recommendation:** Treat Member ID as a manually entered or lookup-ready field until a member source is specified. Do not infer member validation, account balance, or Q Pay settlement.

**Reasoning:** The PRD requires Member ID, not a full membership integration. Engineering should not invent one.

**Default assumption:** Member bookings store `member_id`, `member_name`, optional mobile number, and guest count. Q Pay is available only when booking type is Member.

**Owner:** Founder + Product  
**Blocks Product Architecture?** Mostly  
**Blocks Wireframes?** Mostly  
**Blocks Engineering?** Yes  
**Priority:** High

### ADR-013

**Decision ID:** ADR-013

**Decision:** Roles and permissions

**Context:** Restaurant observes `admin`, `server`, `host`, `steward`, `chef`, and `captain`, but only the admin Dashboard surface was inspected. Meeting Room adds sensitive actions: cancel booking, edit F&B order, enter bill amount, confirm payment, accept extension.

**Why it matters:** Permissions affect UI availability, API authorization, audit logs, and operational risk.

**Recommendation:** Extend existing roles with Meeting Room permissions. Do not introduce new roles unless the founder identifies an operator type not covered by current roles.

**Reasoning:** Existing roles are broad enough for Meeting Room operations. The gap is permission effects, not role names.

**Default assumption:** Admin has full control; host/admin can create/modify/reschedule bookings; staff roles can accept service requests; only admin/authorized host can cancel, enter final bill amount, confirm payment, or accept extensions.

**Owner:** Founder + Product + Engineering  
**Blocks Product Architecture?** Yes  
**Blocks Wireframes?** Mostly  
**Blocks Engineering?** Yes  
**Priority:** Critical

### ADR-014

**Decision ID:** ADR-014

**Decision:** Settings organization

**Context:** Restaurant Settings manages guest-facing LUXEGENIE content and venue utilities. Meeting Room requires configurable payment modes, cancellation, extension duration, reminders, rating visibility, and maybe preferred payment mode.

**Why it matters:** Settings can become a dumping ground unless global settings are separated from room-level configuration.

**Recommendation:** Add a Meeting Room Settings area using existing Settings patterns. Keep global policies there; keep room-specific attributes in Manage Rooms.

**Reasoning:** This preserves the Restaurant configuration pattern and avoids mixing operational room records with venue policy.

**Default assumption:** Meeting Room Settings include payment modes, default preferred payment mode, cancellation enabled/disabled, extension increment/default, reminder timings, rating visibility, Wi-Fi visibility reuse, and notification fan-out.

**Owner:** Product Architecture + Design  
**Blocks Product Architecture?** Mostly  
**Blocks Wireframes?** Yes  
**Blocks Engineering?** Mostly  
**Priority:** High

### ADR-015

**Decision ID:** ADR-015

**Decision:** Analytics and history placement

**Context:** Restaurant Dashboard has period filters, KPI cards, ratings, revenue, response-time metrics, and top performers. Meeting Room PRD does not define reporting.

**Why it matters:** Analytics can be wireframed once metric choices are known. Reporting should not be invented as a new module.

**Recommendation:** Reuse the Dashboard pattern for Meeting Room analytics. Keep detailed booking/session history inside Bookings or a history view only if explicitly approved.

**Reasoning:** The existing platform measures the core operating loop. Meeting Room should measure the specified loop: bookings, room usage, requests, response time, payments, F&B orders, extensions, and ratings.

**Default assumption:** No standalone Reporting nav item in first architecture.

**Owner:** Founder + Product  
**Blocks Product Architecture?** Mostly  
**Blocks Wireframes?** Mostly  
**Blocks Engineering?** Mostly  
**Priority:** Medium

### ADR-016

**Decision ID:** ADR-016

**Decision:** New component boundary

**Context:** Existing components cover most needs: shell, CRUD list, modal, status badge, KPI card, room/table card, settings editor. Meeting Room adds availability, recurrence, F&B order details, payment flow, and extension selection.

**Why it matters:** New components should be justified by new interaction requirements, not visual redesign.

**Recommendation:** Extend existing components first. Introduce only the components required by Meeting Room-specific interactions.

**Reasoning:** The product philosophy values one consistent grammar. Too many new components would make the module feel separate.

**Default assumption:** New components are limited to Availability Slot Picker, Recurrence Control, Order Detail Review Modal, Payment Amount/Mode Panel, and Extension Duration Control.

**Owner:** Product Architecture + Design + Engineering  
**Blocks Product Architecture?** No  
**Blocks Wireframes?** Mostly  
**Blocks Engineering?** Mostly  
**Priority:** Medium

### ADR-017

**Decision ID:** ADR-017

**Decision:** API and event contract style

**Context:** Existing API conventions use `/api/v1/`, tenant id path segments, `admin/*` resources, `luxegenie/*` session/device resources, soft deletes, and Pusher.

**Why it matters:** Engineering Blueprint requires endpoint families, schemas, mutation contracts, and event names.

**Recommendation:** Follow existing REST/Pusher conventions under explicit Meeting Room resource names.

**Reasoning:** This is the lowest-risk way to make the module native while keeping the domain clear.

**Default assumption:** Use endpoint families such as `admin/meeting-room/venue/{id}`, `admin/meeting-room-booking/venue/{id}`, `admin/meeting-room-dashboard/*`, and `luxegenie/meeting-session/*`. Final names can change, but the separation should remain.

**Owner:** Engineering  
**Blocks Product Architecture?** Mostly  
**Blocks Wireframes?** No  
**Blocks Engineering?** Yes  
**Priority:** Critical
