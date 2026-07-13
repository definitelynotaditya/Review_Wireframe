# Requirements Gap Analysis

Internal engineering and product readiness review for extending the existing LUXEGENIE Restaurant Manager Dashboard into a Meeting Room Manager Dashboard.

**Evidence basis:** Full repository review on 2026-07-12. Restaurant dashboard documentation is treated as the platform baseline. Meeting Room PRD and Meeting Room Features Flow are treated as the complete functional source of truth.

**Readiness lens:** This review does not judge whether more features are needed. It judges whether current documentation is sufficient to begin Product Architecture, Reference Wireframes, and Engineering Blueprint work without inventing architecture.

## Executive Summary

The Meeting Room functional scope is sufficient to start Product Architecture and Reference Wireframes if the team adopts the Restaurant platform as the operating model: a flat shell, live operational cards, configuration-vs-operations split, Activity-driven requests, Pusher synchronization, status badges, CRUD list patterns, and Dashboard analytics conventions.

Engineering is not fully unblocked yet. The largest remaining gaps are not feature gaps; they are architectural decisions about ownership and state: whether Meeting Rooms are modeled as a new domain entity or an extension of Tables, how Booking and Session lifecycles interact, how recurrence is represented, how payment/billing is owned across Dashboard, POS/Touche, and payment providers, how Member identity is sourced, and which roles may perform sensitive actions.

## Topic Review

### Navigation

**Current Status:** Partial  
**Source Documents:** `docs/architecture/information-architecture.md`, `docs/components/app-shell.md`, `docs/Meeting Room Management - PRD.md`, `docs/Meeting Room Features Flow.md`  
**Confidence:** High  
**Implementation Ready?** Mostly  
**Missing Information:** Exact Meeting Room route namespace and sidebar inventory are not specified. The Restaurant platform uses a flat sidebar under `/restaurant/*`; Meeting Room needs a parallel module map without becoming a separate-feeling app.  
**Potential Assumptions:** Use the same App Shell and flat navigation; add/rename modules only where the Meeting Room workflow requires them.  
**Risk:** Medium

### Information Architecture

**Current Status:** Mostly Complete  
**Source Documents:** `docs/architecture/information-architecture.md`, `docs/analysis/product-philosophy.md`, `docs/pages/01-dashboard.md`, `docs/pages/02-tables.md`, `docs/pages/03-reservations.md`, `docs/pages/07-manage-tables.md`, `docs/pages/08-transfer-sessions.md`  
**Confidence:** High  
**Implementation Ready?** Mostly  
**Missing Information:** The exact mapping from Restaurant modules to Meeting Room modules must be approved. The baseline split is clear: live operations, booking data, configuration, hardware, settings, analytics.  
**Potential Assumptions:** `Tables` becomes the live `Meeting Rooms` surface; `Manage Tables` becomes `Manage Rooms`; `Reservations` becomes `Bookings`; `Transfer Sessions` is replaced or narrowed to meeting extension/reschedule lifecycle; `Settings`, `Users`, `LUXEGENIE`, and `Dashboard` remain structurally equivalent.  
**Risk:** Medium

### Meeting Room Lifecycle

**Current Status:** Mostly Complete  
**Source Documents:** `docs/Meeting Room Management - PRD.md`, `docs/Meeting Room Features Flow.md`, `docs/architecture/state-machines.md`, `docs/pages/02-tables.md`, `docs/pages/08-transfer-sessions.md`  
**Confidence:** Medium  
**Implementation Ready?** Mostly  
**Missing Information:** Canonical enum names and transition ownership are not defined. The PRD defines `Available`, `Reserved`, and `In-Use`, but not all edge states such as no-show, ended-awaiting-payment, payment-confirmed, cancelled, auto-ended, or extension-pending.  
**Potential Assumptions:** Preserve the Restaurant state grammar: room status is the current operational state; session/activity records carry runtime events; booking records carry scheduled intent.  
**Risk:** High

### Booking Lifecycle

**Current Status:** Partial  
**Source Documents:** `docs/Meeting Room Management - PRD.md`, `docs/Meeting Room Features Flow.md`, `docs/pages/03-reservations.md`, `docs/architecture/state-machines.md`  
**Confidence:** Medium  
**Implementation Ready?** No  
**Missing Information:** Recurrence rules, reschedule behavior, cancellation configurability, cancellation effects on payment/billing, and whether modifications apply to one occurrence or a series. Booking channels are listed in the PRD, but not formalized as enums.  
**Potential Assumptions:** Reuse the Reservation lifecycle shape: create booking, assign room, start session, complete/end, cancel. Add recurrence as a booking concern rather than a live room concern.  
**Risk:** High

### Primary Booking Interface

**Current Status:** Partial  
**Source Documents:** `docs/Meeting Room Management - PRD.md`, `docs/Meeting Room Features Flow.md`, `docs/pages/03-reservations.md`, `docs/ux/conventions.md`, `docs/components/entity-crud-list.md`  
**Confidence:** Medium  
**Implementation Ready?** Mostly  
**Missing Information:** Calendar/list strategy is not specified. The PRD requires date, duration, hourly slot, availability, price estimate, and future bookings up to 6 months, but not whether the primary interface is a list, calendar, availability picker, or hybrid.  
**Potential Assumptions:** Use the existing Reservations page pattern for search, tabs, filters, cards, and New Booking modal; add an availability picker inside the modal if needed.  
**Risk:** Medium

### Dashboard Behaviour

**Current Status:** Partial  
**Source Documents:** `docs/pages/01-dashboard.md`, `docs/Meeting Room Management - PRD.md`, `docs/Meeting Room Features Flow.md`, `docs/components/kpi-card.md`  
**Confidence:** Medium  
**Implementation Ready?** Mostly  
**Missing Information:** Meeting Room-specific KPIs are not defined beyond room status and operational prompts. Existing Dashboard conventions are strong, but metric definitions need approval before engineering.  
**Potential Assumptions:** Keep the period filter, KPI cards, ratings panel, and top-performer patterns. Metrics should derive from booking/session/activity records rather than from UI-only state.  
**Risk:** Medium

### LG to Dashboard Synchronization

**Current Status:** Mostly Complete  
**Source Documents:** `docs/Meeting Room Features Flow.md`, `docs/architecture/real-time.md`, `docs/architecture/domain-model.md`, `docs/pages/05-luxegenie.md`, `docs/pages/08-transfer-sessions.md`  
**Confidence:** High  
**Implementation Ready?** Mostly  
**Missing Information:** Exact event contracts, channel names, retry/offline behavior, and source of truth are not specified.  
**Potential Assumptions:** Preserve Restaurant architecture: backend is the canonical state owner; LG sends actions to API; API persists Activity/Session changes; Pusher updates Dashboard; Dashboard hydrates from REST.  
**Risk:** High

### Notifications

**Current Status:** Mostly Complete  
**Source Documents:** `docs/Meeting Room Management - PRD.md`, `docs/Meeting Room Features Flow.md`, `docs/components/app-shell.md`, `docs/architecture/real-time.md`, `docs/pages/02-tables.md`  
**Confidence:** Medium  
**Implementation Ready?** Mostly  
**Missing Information:** Recipient rules and persistence are unclear. The Meeting Room flow specifies 10-minute start/end reminders, 1-minute unaccepted request escalation, bell notification, and card shake behavior, but not which user roles receive each notification.  
**Potential Assumptions:** Reuse the global bell/activity feed and live room card attention states. Treat reminders and unaccepted requests as Activity events with urgency metadata.  
**Risk:** Medium

### Service Requests

**Current Status:** Mostly Complete  
**Source Documents:** `docs/Meeting Room Features Flow.md`, `docs/pages/02-tables.md`, `docs/pages/08-transfer-sessions.md`, `docs/architecture/domain-model.md`, `docs/architecture/state-machines.md`  
**Confidence:** High  
**Implementation Ready?** Mostly  
**Missing Information:** Exact activity type enum names and role assignment rules are not defined.  
**Potential Assumptions:** Assistance, IT Support, Power Bank, Other Service, Bill Request, F&B Order, and Extension Request should be modeled as Meeting Room Activity types, matching Restaurant request flags and pending-to-complete lifecycle.  
**Risk:** Medium

### F&B Ordering

**Current Status:** Partial  
**Source Documents:** `docs/Meeting Room Features Flow.md`, `docs/pages/06-chef-specials.md`, `docs/architecture/domain-model.md`, `docs/components/entity-crud-list.md`  
**Confidence:** Medium  
**Implementation Ready?** No  
**Missing Information:** The source of the F&B catalogue is not defined. The Restaurant platform has Chef's Specials and Menu QR, but no full structured ordering module. The Meeting Room flow requires categories, veg/non-veg filters, cart, order detail review/edit on Dashboard, and `Order punched` closure.  
**Potential Assumptions:** Reuse the existing dish/category model where possible, but create an explicit Meeting Room F&B order payload so staff can edit quantities/items before punching the order.  
**Risk:** High

### Payments

**Current Status:** Partial  
**Source Documents:** `docs/Meeting Room Management - PRD.md`, `docs/Meeting Room Features Flow.md`, `docs/pages/10-settings.md`, `docs/architecture/domain-model.md`  
**Confidence:** Medium  
**Implementation Ready?** No  
**Missing Information:** Payment ownership is unresolved. The PRD lists Q Pay, Payment Link, Scan to Pay, Card, and Cash, and states preferred modes are configurable. The flow says staff enters bill amount retrieved from POS or Touche, and staff confirms payment in Dashboard, but settlement integration details are absent.  
**Potential Assumptions:** Dashboard should initially record selected payment mode, amount, and staff confirmation; it should not assume direct payment settlement unless a provider contract exists.  
**Risk:** High

### Billing

**Current Status:** Partial  
**Source Documents:** `docs/Meeting Room Features Flow.md`, `docs/Meeting Room Management - PRD.md`, `docs/pages/01-dashboard.md`, `docs/architecture/api-observations.md`  
**Confidence:** Medium  
**Implementation Ready?** No  
**Missing Information:** Billing source of truth, bill line items, tax/service charges, estimate vs final amount, invoice/receipt behavior, and POS/Touche retrieval contract are not specified.  
**Potential Assumptions:** Booking estimate is calculated from room pricing and duration; final bill amount is entered or retrieved by staff before payment display on LG.  
**Risk:** High

### Analytics

**Current Status:** Partial  
**Source Documents:** `docs/pages/01-dashboard.md`, `docs/Meeting Room Management - PRD.md`, `docs/Meeting Room Features Flow.md`, `docs/components/kpi-card.md`  
**Confidence:** Medium  
**Implementation Ready?** Mostly  
**Missing Information:** Meeting Room metric definitions are absent. Existing Dashboard infrastructure is sufficient, but the product must choose which metrics matter: room utilization, booking revenue, response time, extension count, cancellations, no-shows, F&B revenue, payment modes, ratings, or staff handling.  
**Potential Assumptions:** Use the Restaurant KPI grammar and period filters; do not invent executive reporting beyond metrics directly derivable from specified flows.  
**Risk:** Medium

### Reporting

**Current Status:** Missing  
**Source Documents:** `docs/pages/01-dashboard.md`, `docs/analysis/product-philosophy.md`, `docs/Meeting Room Management - PRD.md`  
**Confidence:** Medium  
**Implementation Ready?** No  
**Missing Information:** The PRD does not define exportable reports, scheduled reports, or report pages. Existing Restaurant documentation has Dashboard metrics but no reporting module.  
**Potential Assumptions:** Treat reporting as out of scope unless founder explicitly wants a reporting surface. Historical analysis can follow Dashboard `View History` precedent if clarified.  
**Risk:** Low

### Calendar

**Current Status:** Partial  
**Source Documents:** `docs/Meeting Room Management - PRD.md`, `docs/Meeting Room Features Flow.md`, `docs/pages/03-reservations.md`  
**Confidence:** Medium  
**Implementation Ready?** No  
**Missing Information:** Calendar grid, room timeline, day/week/month views, conflict visualization, and recurrence presentation are not specified.  
**Potential Assumptions:** A calendar-like availability picker is needed inside booking/reschedule flows, but a standalone Calendar nav item is not required unless approved.  
**Risk:** Medium

### Search

**Current Status:** Mostly Complete  
**Source Documents:** `docs/ux/conventions.md`, `docs/components/entity-crud-list.md`, `docs/pages/03-reservations.md`, `docs/pages/04-users.md`, `docs/pages/09-guest-list.md`  
**Confidence:** High  
**Implementation Ready?** Yes  
**Missing Information:** Exact searchable fields for each Meeting Room entity are not listed.  
**Potential Assumptions:** Follow the Restaurant pattern: search by natural identifiers such as room number/name, member ID, guest name, mobile number, booking ID, payment mode, and status.  
**Risk:** Low

### Filters

**Current Status:** Mostly Complete  
**Source Documents:** `docs/ux/conventions.md`, `docs/pages/01-dashboard.md`, `docs/pages/03-reservations.md`, `docs/pages/07-manage-tables.md`, `docs/pages/05-luxegenie.md`  
**Confidence:** High  
**Implementation Ready?** Mostly  
**Missing Information:** Meeting Room filter sets are not explicitly approved.  
**Potential Assumptions:** Use segmented tabs with counts for room status, booking scope, room area/type, payment mode, and request status. Use date and dropdown filters where Restaurant Reservations already does.  
**Risk:** Low

### User Roles

**Current Status:** Partial  
**Source Documents:** `docs/architecture/roles-and-permissions.md`, `docs/pages/04-users.md`, `docs/Meeting Room Features Flow.md`  
**Confidence:** Medium  
**Implementation Ready?** No  
**Missing Information:** Which roles can create bookings, modify/reschedule/cancel, accept service requests, edit F&B orders, enter bill amounts, and confirm payment is not defined.  
**Potential Assumptions:** Preserve existing roles and add Meeting Room permissions to them rather than introducing new roles immediately.  
**Risk:** High

### Permissions

**Current Status:** Partial  
**Source Documents:** `docs/architecture/roles-and-permissions.md`, `docs/pages/04-users.md`  
**Confidence:** Low  
**Implementation Ready?** No  
**Missing Information:** Restaurant permission effects were not observed for non-admin accounts; Meeting Room permissions are unspecified. Engineering cannot safely implement sensitive actions without an explicit permission matrix.  
**Potential Assumptions:** Admin/manager has full control; host/admin can book and modify; staff can accept requests; only admin/authorized host can cancel or confirm payment. Must be approved.  
**Risk:** High

### Configuration

**Current Status:** Partial  
**Source Documents:** `docs/pages/10-settings.md`, `docs/Meeting Room Management - PRD.md`, `docs/Meeting Room Features Flow.md`, `docs/components/content-section-editor.md`  
**Confidence:** Medium  
**Implementation Ready?** Mostly  
**Missing Information:** Settings organization is not specified for Meeting Room-specific configuration: payment modes, preferred payment mode, cancellation configurability, extension increments, reminder timings, room pricing defaults, and rating visibility.  
**Potential Assumptions:** Use a Meeting Room Settings section that follows the existing Settings content/config pattern. Keep room-specific data in Manage Rooms, not global Settings.  
**Risk:** Medium

### Room Resources

**Current Status:** Partial  
**Source Documents:** `docs/Meeting Room Management - PRD.md`, `docs/Meeting Room Features Flow.md`, `docs/pages/07-manage-tables.md`, `docs/pages/05-luxegenie.md`  
**Confidence:** Medium  
**Implementation Ready?** Mostly  
**Missing Information:** The PRD specifies seats and pricing bands but does not define equipment/resources such as AV, projector, whiteboard, video conferencing, room photos, or amenities. These should not be invented.  
**Potential Assumptions:** Initial room resource model should include only specified fields: room identity, capacity/seats, pricing tabs, status, and LG device assignment.  
**Risk:** Low

### Domain Model

**Current Status:** Partial  
**Source Documents:** `docs/architecture/domain-model.md`, `docs/Meeting Room Management - PRD.md`, `docs/Meeting Room Features Flow.md`  
**Confidence:** Medium  
**Implementation Ready?** No  
**Missing Information:** Meeting Room entities and relationships are not formally defined. Required entities likely include MeetingRoom, Booking, MeetingSession, Activity, Payment/Bill, F&B Order, Member/Guest, RoomPricing, and RoomDeviceAssignment.  
**Potential Assumptions:** Reuse Restaurant conventions: tenant scoping, soft delete, ISO UTC timestamps, INR money strings, Activity event stream, Session runtime wrapper, REST endpoints, and Pusher.  
**Risk:** High

### Entities

**Current Status:** Partial  
**Source Documents:** `docs/architecture/domain-model.md`, `docs/pages/03-reservations.md`, `docs/pages/08-transfer-sessions.md`, `docs/Meeting Room Features Flow.md`  
**Confidence:** Medium  
**Implementation Ready?** No  
**Missing Information:** Entity schemas are absent for bookings, recurrence, members, F&B order items, payments, room pricing, and room status history.  
**Potential Assumptions:** Existing Restaurant `Reservation`, `Session`, `Activity`, `Table`, `User`, `LUXEGENIE Device`, and `Settings` patterns provide schema style but not exact Meeting Room schemas.  
**Risk:** High

### State Machines

**Current Status:** Partial  
**Source Documents:** `docs/architecture/state-machines.md`, `docs/Meeting Room Management - PRD.md`, `docs/Meeting Room Features Flow.md`  
**Confidence:** Medium  
**Implementation Ready?** No  
**Missing Information:** Meeting Room-specific state machines must be formalized for Booking, Room, MeetingSession, Activity/Request, F&B Order, Bill/Payment, and Extension Request.  
**Potential Assumptions:** Each request follows `requested -> pending -> complete/cancelled`; room follows `available -> reserved -> in_use -> available`; payment follows `requested -> amount_entered -> displayed_to_guest -> confirmed`.  
**Risk:** High

### Component Reuse

**Current Status:** Complete  
**Source Documents:** `docs/components/README.md`, `docs/components/app-shell.md`, `docs/components/table-card.md`, `docs/components/entity-crud-list.md`, `docs/components/status-badge.md`, `docs/components/kpi-card.md`, `docs/components/content-section-editor.md`, `docs/ux/conventions.md`  
**Confidence:** High  
**Implementation Ready?** Yes  
**Missing Information:** None blocking.  
**Potential Assumptions:** Meeting Room should reuse App Shell, Page Header, Entity CRUD List/Grid, Create/Edit Modal, Room/Table Card, Status Badge, KPI Card, Content Section Editor, segmented tabs, search, and inline actions.  
**Risk:** Low

### Component Extensions

**Current Status:** Mostly Complete  
**Source Documents:** `docs/components/table-card.md`, `docs/components/entity-crud-list.md`, `docs/pages/02-tables.md`, `docs/Meeting Room Features Flow.md`  
**Confidence:** High  
**Implementation Ready?** Mostly  
**Missing Information:** Exact room card action set and booking modal flow need approval.  
**Potential Assumptions:** Extend Table Card into Meeting Room Card with status, capacity, booking/guest name, time slot, ending-soon messaging, request badges, and accept/view actions. Extend Reservation modal into Booking modal with member/guest fields and availability/pricing.  
**Risk:** Medium

### New Components

**Current Status:** Partial  
**Source Documents:** `docs/Meeting Room Features Flow.md`, `docs/components/README.md`, `docs/ux/conventions.md`  
**Confidence:** Medium  
**Implementation Ready?** Mostly  
**Missing Information:** Need architecture approval for any new components so design/engineering do not overbuild.  
**Potential Assumptions:** Only a few new components are justified: availability slot picker, recurrence control, order detail review modal, payment amount/mode panel, and extension duration control.  
**Risk:** Medium

### API Assumptions

**Current Status:** Partial  
**Source Documents:** `docs/architecture/api-observations.md`, `docs/architecture/domain-model.md`, `docs/architecture/real-time.md`, `docs/Meeting Room Features Flow.md`  
**Confidence:** Medium  
**Implementation Ready?** No  
**Missing Information:** No Meeting Room endpoint catalogue, request/response schemas, mutation contracts, Pusher events, or error conventions exist.  
**Potential Assumptions:** Follow existing API conventions: `/api/v1/`, tenant id in path, `admin/*` for manager resources, `luxegenie/*` for device/session resources, REST hydration plus Pusher push.  
**Risk:** High

### Future Scalability

**Current Status:** Partial  
**Source Documents:** `docs/Meeting Room Features Flow.md`, `docs/analysis/open-questions.md`, `docs/architecture/domain-model.md`  
**Confidence:** Medium  
**Implementation Ready?** Mostly  
**Missing Information:** Multi-venue, external calendar integrations, direct LG extension slot blocking, provider payment settlement, and POS/Touche integration depth are not specified.  
**Potential Assumptions:** Build the Meeting Room module with clean domain boundaries now, but do not implement unrequested future integrations. Preserve the flow note that direct backend slot blocking for LG extension is a future capability.  
**Risk:** Medium

### Data Ownership and Integrations

**Current Status:** Partial  
**Source Documents:** `docs/Meeting Room Features Flow.md`, `docs/architecture/api-observations.md`, `docs/analysis/product-philosophy.md`  
**Confidence:** Medium  
**Implementation Ready?** No  
**Missing Information:** Ownership is unresolved for Member records, room inventory, booking calendar, F&B catalogue, POS/Touche billing amount, payment settlement, and rating destinations.  
**Potential Assumptions:** LUXEGENIE backend owns Meeting Room operational state unless an external system is explicitly integrated. External systems should be recorded as sources/adapters, not hidden owners.  
**Risk:** High

### Member and Guest Identity

**Current Status:** Partial  
**Source Documents:** `docs/Meeting Room Features Flow.md`, `docs/pages/09-guest-list.md`, `docs/pages/03-reservations.md`  
**Confidence:** Medium  
**Implementation Ready?** No  
**Missing Information:** Member ID validation, member profile source, Q Pay eligibility, and relationship between member bookings and guest list are not specified.  
**Potential Assumptions:** Guest/non-member booking can follow existing Guest projection conventions; Member booking needs either a manual member ID field or an integration decision.  
**Risk:** High

### Localization, Currency, and Time

**Current Status:** Complete  
**Source Documents:** `docs/architecture/domain-model.md`, `docs/pages/01-dashboard.md`, `docs/pages/03-reservations.md`, `docs/ux/conventions.md`  
**Confidence:** High  
**Implementation Ready?** Yes  
**Missing Information:** None blocking.  
**Potential Assumptions:** Preserve INR/rupee formatting, venue timezone, ISO UTC persistence, and existing date/time display conventions.  
**Risk:** Low

## Implementation Readiness Score

**Score: 72/100**

This is ready enough to begin Product Architecture and Reference Wireframes with explicit assumptions. It is not ready enough to begin Engineering Blueprint without resolving the high-risk ownership, lifecycle, payment, recurrence, role, and API decisions.

## Already Implementation Ready

- Existing App Shell, page header, sidebar, top bar, global notifications, theme/profile controls.
- UX grammar: search, tabs, cards, lists, modals, inline actions, status badges, empty states.
- Component reuse strategy for live room cards, booking lists, configuration lists, KPI cards, settings sections, and device fleet management.
- Core live-operations philosophy: LG creates operational events; Dashboard monitors and resolves them; analytics derives from activities and sessions.
- Tenant/time/currency conventions: single-venue tenant scoping, soft deletes, INR display, venue timezone, UTC timestamps.
- Real-time architecture direction: REST hydration plus Pusher updates.
- Base service request lifecycle: request appears on card and notification feed, staff accepts/completes, response time can be measured.

## What Should Be Inferred

- Meeting Rooms should be a native module inside the existing Manager Dashboard shell, not a visually or structurally separate app.
- Room configuration and live operations should remain separate, mirroring `Manage Tables` vs `Tables`.
- Booking management should reuse the Restaurant Reservations pattern unless a specific calendar decision requires an extension.
- Meeting Room requests should reuse the Activity/Session pattern rather than creating one-off UI state.
- Status colors and action grammar should follow existing Status Badge conventions.
- Settings should follow the existing `Visible in LUXEGENIE` and configuration-section pattern where guest-device behavior is configurable.

## What Should Never Be Inferred

- Payment settlement behavior, provider integrations, Q Pay mechanics, or POS/Touche contract.
- Member validation/source of truth.
- Recurring booking rules and modification/cancellation scope.
- Permission matrix for booking cancellation, billing, payment confirmation, or order punching.
- New room resources/equipment not named in the PRD.
- Standalone reporting or calendar modules beyond what the founder approves.
- Automatic LG extension that blocks slots directly, because the Meeting Room flow marks that as future.

## Blocks Product Architecture

Only genuine blockers:

- Decide Meeting Room module map and route/sidebar organization.
- Decide whether Meeting Room is modeled as a new domain module or an extension of Table/Reservation terminology.
- Decide primary booking/calendar strategy.
- Decide source of truth for booking/session/room status transitions.
- Decide where analytics/history belongs.

## Blocks Wireframes

Only genuine blockers:

- Primary booking interface shape: Reservation-style list with modal, calendar/timeline, or hybrid.
- Live Meeting Room card content/action hierarchy.
- F&B order review/edit surface on Dashboard.
- Payment/bill amount entry and confirmation surface.
- Settings organization for payment modes, cancellation, reminders, and extension increments.

## Blocks Engineering

Only genuine blockers:

- Formal Meeting Room domain model and entity schemas.
- Canonical state machines and enum names.
- Recurrence model and conflict/availability rules.
- Payment/billing ownership and integration boundaries.
- Member identity ownership and Q Pay eligibility.
- Role/permission matrix.
- API endpoint catalogue, mutation contracts, Pusher event contracts, and error rules.
