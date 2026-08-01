---
status: Reviewed
owner: "Oleksandr Vorovchenko"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-08-01"
feature_size: "M"
stage: "03"
ticket: "<TBD>"
---

# PRD — custom-forms

> **Inputs (required):** [idea-brief](./idea-brief.md) · [CONTEXT](./CONTEXT.md)
> **Reference module:** N/A — green-field mode. Prior git history (commits CF-1…CF-14) was skimmed only for domain-vocabulary grounding (e.g. that a form-building surface, a component picker, and a properties surface are natural parts of this domain) — it is explicitly NOT used as an implementation reference, since this PRD redesigns the feature from scratch via the SDLC pipeline.
> **External context channels used:** None — only CONTEXT + idea-brief.

## 1. Context

Consultants who understand a client's CRM requirements cannot currently assemble a working screen (a list, a form, or a detail view) themselves — every screen requires a developer to hand-code it, so CRM delivery speed is bottlenecked on the development queue. This PRD targets the Creator role (technical, implementation-facing consultants) who need to assemble CRM-style screens fast, without writing code (idea-brief §2 Problem, §3 Users).

This work starts now because it is the first product step toward a no-code CRM-building capability — validated as technically sound in the ideation phase, and now committed to as a real, incrementally-shipped feature rather than a one-off spike (idea-brief §4 Why now).

The committed approach is Approach C — Curated Component Kit: Creators assemble list, form, and detail screens from a small, curated set of pre-wired components in Designer; Runtime renders the saved screen for consultants and end-users. Access is controlled by three roles — Admin, Creator, User (idea-brief §13 Recommendation).

Build-sequence note: the feature owner asked that authentication and role administration (US-01, US-02, US-03 below) be delivered before Designer/Runtime capabilities (US-04…US-07), so that screens with different roles can be tested from day one. `break-tasks` should respect this ordering when it sequences the task graph.

## 2. Goals

- A Creator assembles a working CRM screen (list, form, or detail view) from the curated component library without writing code, in under 30 minutes (idea-brief §13, §11 outcome metric).
- Runtime renders every Creator-saved, published screen correctly against real data — not just the sample data shown during design (idea-brief §10 Risks — false-confidence).
- An Admin controls who can access Designer and what role each user holds, so Designer access stays centrally governed from day one.

## 3. Non-goals

- Multiple Creators editing the same screen simultaneously — deferred, because concurrent-edit conflict resolution adds design and testing cost the MVP budget does not cover (idea-brief §5).
- Field-level or screen-level permission granularity beyond the three roles (Admin/Creator/User) — out of scope; role-level access is the only granularity this iteration supports (idea-brief §5).
- Versioning of saved screen configurations — out of scope; only the current version of a screen is kept (idea-brief §5).
- Custom UI beyond the curated component set (Text/Number/Select/Date fields, Table/List) — out of scope; Creators cannot add arbitrary markup or components outside the library (idea-brief §5).
- Workflow automation and external system integrations — out of scope for this iteration (idea-brief §5).
- Non-CRM screen patterns (dashboards, portals, arbitrary page layouts) — out of scope; only list/form/detail CRM patterns are supported (idea-brief §5).

## 4. User stories

### US-01: Log into the application

**As a** Admin, Creator, or User
**I want** to log into the application with my credentials
**So that** I can access the parts of the system my role permits

### US-02: Manage user roles

**As a** Admin
**I want** to create user accounts and assign each one the Admin, Creator, or User role
**So that** I control who can build screens and who can only use them

### US-03: Restrict Designer to authorized roles

**As a** Admin
**I want** Designer to be reachable only by Admin and Creator accounts
**So that** the User role cannot alter or create screens, only use published ones

### US-04: Assemble a form screen

**As a** Creator
**I want** to assemble a form screen by placing curated components (Text/Number/Select/Date fields) onto a canvas
**So that** I can capture the data a business requirement needs, without writing code

### US-05: Assemble a list screen

**As a** Creator
**I want** to assemble a list screen bound to a record type, using the curated Table/List component
**So that** consultants and end-users can browse existing CRM records

### US-06: Assemble a detail screen

**As a** Creator
**I want** to assemble a detail screen that shows a single record's fields using curated components
**So that** consultants and end-users can review one CRM record in full

### US-07: Use a published screen in Runtime

**As a** Creator or User
**I want** to open a screen that has been published
**So that** I can view or fill in CRM data through the screen the Creator built

## 5. Acceptance criteria

### AC-01 (US-01) — happy path

**Given** a registered Admin, Creator, or User account
**When** the account holder logs in with correct credentials
**Then** the system authenticates them and grants access limited to their role's capabilities

### AC-02 (US-01) — error

**Given** a login attempt with an incorrect password or unknown account
**When** the attempt is submitted
**Then** the system rejects it with a generic "invalid credentials" message, without revealing whether the account exists

### AC-03 (US-02) — happy path

**Given** an authorized Admin
**When** the Admin creates a new user account and assigns it the Creator role
**Then** the system records the account with the Creator role and confirms to the Admin

### AC-04 (US-02) — authorization

**Given** an authenticated Creator or User account
**When** that account attempts to create a user or change a role assignment
**Then** the system denies the action and explains that only Admin accounts manage users

### AC-05 (US-03) — authorization

**Given** an authenticated User account
**When** the account attempts to open Designer
**Then** the system denies access and explains that Designer is limited to Admin and Creator roles

### AC-06 (US-04) — happy path

**Given** an authorized Creator in Designer
**When** the Creator places curated components onto the canvas and saves the screen
**Then** the system records the form screen as a draft and confirms to the Creator

### AC-07 (US-04) — domain invariant

**Given** a Creator assembling a screen in Designer
**When** the Creator opens the component picker
**Then** the system offers only components currently in the curated library — it is not possible to select or reference any component outside that library

### AC-08 (US-04) — error

**Given** a Creator attempting to publish a screen with no components placed
**When** the Creator submits the publish action
**Then** the system blocks the publish and explains that at least one component must be added first

### AC-09 (US-05) — happy path

**Given** an authorized Creator in Designer
**When** the Creator assembles a list screen bound to a record type using the curated Table/List component
**Then** the system records the list screen as a draft and confirms to the Creator

### AC-10 (US-06) — happy path

**Given** an authorized Creator in Designer
**When** the Creator assembles a detail screen for a record type using curated components
**Then** the system records the detail screen as a draft and confirms to the Creator

### AC-11 (US-07) — cross-context

**Given** a screen that a Creator has not yet published (still in draft)
**When** a User attempts to open that screen in Runtime
**Then** the system does not show the screen to the User — only screens a Creator or Admin has explicitly published are reachable in Runtime

### AC-12 (US-07) — domain invariant

**Given** a published screen whose configuration includes a component with a text or link value
**When** the screen renders in Runtime
**Then** the system displays that value as plain content and never executes it as active markup or code

## 6. Non-functional requirements

| Aspect | Target | Measurement |
|---|---|---|
| Latency p95 — Designer save action | ≤ 500 ms | API response telemetry |
| Latency p95 — Runtime screen render | ≤ 300 ms | client-side render timing telemetry |
| Throughput | ≥ 5 req/s per instance | smoke test in CI |
| Availability | 99.0% | monthly SLO window (internal MVP tool, business hours) |
| List rendering scale | renders lists of up to 5,000 records without a UI freeze longer than 1s | load test with a realistic record count |
| Component-library change safety | a screen already published before the curated library changes must never silently break or render blank in Runtime | manual regression check whenever a component in the library changes |

## 6.1 Security / privacy

- **Data classification:** internal — business CRM data assembled and viewed by internal consultants and their end-users.
- **Personal data touched:** possibly — the exact fields a Creator places on a form (e.g. a customer's name or email) are not fixed by this PRD; see Open Question below.
- **AuthZ/AuthN impact:** introduces the three-role model (Admin/Creator/User). Designer access is limited to Admin + Creator; user administration is limited to Admin; Runtime is reachable by all three roles, scoped to published screens.
- **Abuse cases:**
  - **Config injection (XSS):** a Creator (or a compromised Creator account) places a text/link value in a component that contains markup or script — the system always escapes/sanitizes config-provided text before rendering it in Runtime, never interpreting it as executable code.
  - **Draft/data leak:** a User opens a screen a Creator has not published yet — the system hides unpublished screens from the User role entirely (see AC-11).
  - **Component-library tampering:** a Creator attempts to reference a component outside the curated library — the system makes this impossible at selection time (see AC-07).
  - **Spam screen creation:** a Creator script-saves an excessive number of screens — the system rate-limits screen-save actions to 30 per minute per account.
- **Security review:** Required — new authz boundary (three roles) and unresolved question about personal-data fields.

## 7. Metrics / KPIs

- **Screen-build time** — baseline: ~1 day (developer-assisted), target: under 30 minutes solo, measured across Creators within the first 30 days of Designer availability.
- **Rendering correctness** — baseline: N/A (new capability), target: ≥95% of published screens render without a rendering error, tracked over the first 30 days post-release.
- **Adoption** — baseline: 0%, target: ≥75% of Creator accounts publish at least one screen within 30 days of rollout.

## 8. Open questions

- [ ] What is the complete, final list of curated components for the first release (beyond Text/Number/Select/Date fields and Table/List)? Default now: the 6 named types above. — owner: Oleksandr Vorovchenko, due: before `/sdlc-break-tasks custom-forms`
- [ ] Do any of the fields Creators place on forms capture personal data (e.g. customer name/email), and if so what data-classification/retention applies? — owner: Oleksandr Vorovchenko, due: before the architecture-design security review
- [ ] What is the concrete migration strategy (beyond the §6 non-breakage constraint) when the curated component library changes after screens have already been published (idea-brief §10 config-migration risk)? — owner: Oleksandr Vorovchenko, due: `/sdlc-architecture-design custom-forms`
