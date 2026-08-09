---
status: Reviewed
owner: "Oleksandr Vorovchenko"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-08-06"
feature_size: "L"
stage: "03"
ticket: "<TBD>"
---

# PRD — custom-forms

> **Inputs (required):** [idea-brief](./idea-brief.md) · [CONTEXT](./CONTEXT.md)
> **Reference module:** git commit `0a09af4` ("[CF-13] Designer") — the last commit before the working tree was cleared in `[CF-14] Cleanup`. Read for this revision: `server/api/src/db/schema.ts` (the `schemas` / `schemas_types` / `schemas_versions` tables), `server/api/src/app/schemas/*` (CRUD + publish endpoints), `client/apps/designer/src/app/form-schema.types.ts` and `form-list.ts`/`form-editor.ts`. This existing code is treated as a real, already-built starting point — not just historical color — since it already implements the freeform JSON-Schema-per-screen model this revision formalizes.
> **External context channels used:** None beyond CONTEXT + idea-brief + the reference module above.

## 1. Context

**2026-08-05 revision note:** this PRD replaces an earlier draft framed around "CRM screens" and a fixed "record type" model. Clarification work surfaced that the real product direction is broader and already partly implemented: Designer is a no-code authoring tool where a Creator builds individual screens (forms, for this iteration) as freeform JSON Schema documents; Runtime is where a User fills in a published form and sees their own previously-entered data again on return — there is no shared, browsable list of everyone's submitted data. The earlier "record type" language is retired; see `CONTEXT.md` for `forms schema` / `forms data` / `template`.

Consultants who understand a client's business requirements cannot currently assemble a working screen themselves — every screen requires a developer to hand-code it, so delivery speed is bottlenecked on the development queue. This PRD targets the Creator role (technical, implementation-facing consultants) who need to assemble screens fast, without writing code (idea-brief §2 Problem, §3 Users).

This work starts now because it is the first product step toward a broader no-code application-building capability — validated as technically sound in the ideation phase (a working `schemas`/`schemas_versions` backend and a first Designer canvas already exist per the reference module above), and now committed to as a real, incrementally-shipped feature. Access is controlled by three roles — Admin, Creator, User (idea-brief §13 Recommendation, CONTEXT.md).

**Data model (already implemented, this PRD documents + extends it):**
- A **forms schema** is the JSON-Schema-based definition of one form's fields and layout, built by a Creator in Designer from the curated component set. It is stored as its own row (the existing `schemas` table, `type = form`).
- **Forms data** is the set of values a specific User actually enters into a published form. Storing forms data is new scope this iteration — no such storage exists yet in the reference module.
- A **template** is a named, reusable copy of a forms schema that a Creator or Admin explicitly saves for future reuse; starting a new form from a template pre-fills its fields/layout with no ongoing link back to the template or to other forms created from it. Templates are new scope this iteration — no `templates` entity exists yet in the reference module.
- Designer's own schema/template browser (a fixed, built-in list + detail view — not something a Creator assembles from components) already exists in an early form (`form-list.ts`) and is extended by this PRD to also show templates.

Build-sequence note: the feature owner asked that authentication and role administration (US-01, US-02, US-03 below) be delivered before Designer/Runtime capabilities (US-04 onward), so that screens with different roles can be tested from day one. `break-tasks` should respect this ordering when it sequences the task graph.

## 2. Goals

- A Creator assembles a working form screen from the curated component library without writing code, in under 30 minutes (idea-brief §13, §11 outcome metric).
- Runtime renders every Creator-saved, published form correctly against real data — not just the sample data shown during design (idea-brief §10 Risks — false-confidence). "Correctly" means no component raises an uncaught error or fails to resolve its bound data (see AC-16); such a failure must show a visible error placeholder rather than a blank screen.
- A User who returns to a published form sees their own previously-submitted values again, without re-entering them from scratch.
- An Admin controls who can access Designer and what role each user holds, so Designer access stays centrally governed from day one.

## 3. Non-goals

- Multiple Creators editing the same screen simultaneously — deferred, because concurrent-edit conflict resolution adds design and testing cost the MVP budget does not cover (idea-brief §5).
- Field-level or screen-level permission granularity beyond the three roles (Admin/Creator/User) — out of scope; role-level access is the only granularity this iteration supports (idea-brief §5).
- Versioning of forms schemas beyond the existing publish-snapshot mechanism (`schemas_versions`) — out of scope; no rollback/diff UI this iteration.
- Custom UI beyond the curated component set (Text/Number/Select/Date fields) — out of scope; Creators cannot add arbitrary markup or components outside the library (idea-brief §5).
- Assembling a "list" or "detail" screen from curated components — out of scope this iteration; the only Creator-buildable screen type is a form. Designer's own schema/template browser (US-05/US-06) is fixed, built-in UI, not something a Creator assembles.
- Building distinct behavior for the `page` and `dashboard` schema types (rows already exist in `schemas_types` for future use) — out of scope; only `form`-typed schemas are functional this iteration.
- Page routing / navigation between multiple screens of a built application — deferred to a future iteration (idea-brief §5, §15).
- Flexible, per-screen access rules beyond the three roles (idea-brief §5, §15) — deferred to a future iteration; conflicts with the role-level-only non-goal above if attempted now.
- Workflow automation and external system integrations — out of scope for this iteration (idea-brief §5).
- Sharing or browsing other Users' forms data through Designer — Designer never surfaces forms data at all (see AC-12); only Runtime, scoped to the User who submitted it, does.

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

**As a** Creator or Admin
**I want** to assemble a form screen by placing curated components (Text/Number/Select/Date fields) onto a canvas, and publish it when ready
**So that** I can capture the data a business requirement needs, without writing code

### US-05: Browse existing forms schemas and templates

**As a** Creator or Admin
**I want** to see a list of all forms schemas and all saved templates in Designer
**So that** I can find and manage what already exists instead of losing track of it

### US-06: View a single forms schema or template

**As a** Creator or Admin
**I want** to open one forms schema or template and see its full field/layout definition
**So that** I can review it before editing, publishing, or reusing it

### US-07: Fill in a published form in Runtime

**As a** User
**I want** to open a published form, fill it in, and see my own previously-entered values when I return to it later
**So that** I can submit and revisit my own data without losing it or seeing anyone else's

### US-08: Save a forms schema as a template

**As a** Creator or Admin
**I want** to save an existing forms schema as a named, reusable template
**So that** I (or another Creator) can start new forms from it later instead of rebuilding from scratch

### US-09: Create a new form from a template

**As a** Creator or Admin
**I want** to start a new form screen from an existing template
**So that** I get a head start with pre-filled fields/layout instead of an empty canvas

### US-10: Edit or delete a forms schema or template

**As a** Creator or Admin
**I want** to edit or delete any existing forms schema or template, not only ones I created
**So that** the team maintains a shared library without ownership bottlenecks

## 5. Acceptance criteria

### AC-01 (US-01) — happy path

**Given** a registered Admin, Creator, or User account
**When** the account holder logs in with correct credentials
**Then** the system authenticates them and grants access limited to their role's capabilities

### AC-02 (US-01) — error

**Given** a login attempt with an incorrect password or unknown account
**When** the attempt is submitted
**Then** the system rejects it with a generic "invalid credentials" message, without revealing whether the account exists

### AC-03 (US-01) — error / abuse defense

**Given** repeated failed login attempts on the same account (5 failed attempts within 15 minutes)
**When** the next attempt is made
**Then** the system locks further attempts on that account for 15 minutes from the 5th failed attempt, after which attempts are automatically allowed again (no Admin-override unlock this iteration), returning the same generic "invalid credentials" message throughout, without revealing that a lockout is in effect

### AC-04 (US-02) — happy path

**Given** an authorized Admin
**When** the Admin creates a new user account and assigns it the Creator role
**Then** the system records the account with the Creator role and confirms to the Admin

### AC-05 (US-02) — authorization

**Given** an authenticated Creator or User account
**When** that account attempts to create a user or change a role assignment
**Then** the system denies the action and explains that only Admin accounts manage users

### AC-06 (US-03) — authorization

**Given** an authenticated User account
**When** the account attempts to open Designer
**Then** the system denies access and explains that Designer is limited to Admin and Creator roles

### AC-07 (US-04) — happy path

**Given** an authorized Creator or Admin in Designer
**When** they place curated components onto the canvas and save the screen
**Then** the system records the form schema as a draft and confirms to them

### AC-07b (US-04) — happy path / field configuration

**Given** a Creator or Admin placing a component onto the canvas
**When** they configure that field
**Then** they can mark it required or optional, and the system applies type-appropriate validation automatically (e.g. a Number field rejects non-numeric input) with no further configuration needed

### AC-08 (US-04) — domain invariant

**Given** a Creator or Admin assembling a screen in Designer
**When** they open the component picker
**Then** the system offers only components currently in the curated library — it is not possible to select or reference any component outside that library

### AC-09 (US-04) — error

**Given** a Creator or Admin attempting to publish a form with no components placed
**When** the publish action is submitted
**Then** the system blocks the publish and explains that at least one component must be added first

### AC-10 (US-04) — happy path / publish

**Given** a Creator or Admin with a draft form schema that has at least one component placed
**When** they submit the publish action
**Then** the system changes the form's state to published and confirms the action

### AC-10b (US-04) — domain invariant / edit after publish

**Given** a published form that already has forms data recorded against one or more of its fields
**When** a Creator or Admin edits that form's schema
**Then** they may add new fields freely, but may only remove a field if no forms data has been recorded against it — removing a field that has existing data is blocked

### AC-11 (US-05) — happy path

**Given** an authorized Creator or Admin in Designer
**When** they open the schemas/templates browser
**Then** the system lists every forms schema and every saved template created by any Creator or Admin — visibility is shared across accounts, not scoped to the creating account — clearly indicating which entries are templates

### AC-12 (US-05) — domain invariant

**Given** an authorized Creator or Admin browsing the schemas/templates list
**When** the list is displayed
**Then** the system never includes any forms data (submitted entries) in that list — Designer surfaces schema/template design metadata only

### AC-13 (US-06) — happy path

**Given** an authorized Creator or Admin in Designer
**When** they open one forms schema or template from the list
**Then** the system shows that item's full field and layout definition

### AC-14 (US-07) — cross-context

**Given** a form that a Creator has not yet published (still in draft)
**When** a User attempts to open that form in Runtime
**Then** the system does not show the form to the User — only forms a Creator or Admin has explicitly published are reachable in Runtime

### AC-15 (US-07) — domain invariant

**Given** a published form whose configuration includes a component with a text or link value
**When** the form renders in Runtime
**Then** the system displays that value as plain content and never executes it as active markup or code

### AC-16 (US-07) — domain invariant / rendering fallback

**Given** a published form whose configuration includes a component that fails to render (e.g. a broken data binding)
**Then** the system shows a visible error placeholder for that component in place of a blank screen or an uncaught error — a rendering failure is defined as any component that raises an uncaught error or cannot resolve its bound data; this failure mode also defines what counts against the §7 rendering-correctness KPI

### AC-17 (US-07) — happy path / submit

**Given** a User viewing a published form with all required fields completed
**When** they submit the form
**Then** the system saves the submitted values as that User's single forms-data record for that form (creating it on first submit, overwriting it on any later resubmit — one record per User per form, not a history) and confirms the submission

### AC-18 (US-07) — error / validation

**Given** a User submitting a published form with a required field left empty or an invalid value for a field's type
**When** the submit action is triggered
**Then** the system blocks the submission, indicates which field(s) failed validation, and does not save any partial data

### AC-19 (US-07) — happy path / returning user

**Given** a User who has previously submitted forms data for a published form
**When** they open that same form again
**Then** the system pre-fills the form with their own previously submitted values

### AC-20 (US-07) — domain invariant / isolation

**Given** two different accounts — of any role, including Admin and Creator — who have both submitted forms data for the same published form
**When** either account opens that form in Runtime
**Then** the system shows that account only its own forms data — never another account's; no role gets a cross-account view of forms data through Runtime this iteration

### AC-29 (US-07) — happy path / delete own forms data

**Given** a User viewing a published form for which they have previously submitted forms data
**When** they choose to delete their forms data
**Then** the system removes it, confirms, and the form reverts to its empty state for that User

### AC-30 (US-07) — happy path / temporary discovery

**Given** a User account with no in-app page navigation available (page routing is out of scope this iteration — §3)
**When** they look for published forms they can access
**Then** the system shows them a list of published forms available to them; this list is an explicit stopgap and is expected to be retired once page routing ships (tracked in §8)

### AC-21 (US-08) — happy path

**Given** a Creator or Admin with a forms schema open in Designer
**When** they choose to save it as a template and provide a name
**Then** the system stores a new, independent template entry under that name and confirms

### AC-22 (US-08) — error

**Given** a Creator or Admin attempting to save a template using a name already used by an existing template (name comparison is case-insensitive; template names are unique across the whole instance, not scoped per-Creator)
**When** the save-as-template action is submitted
**Then** the system blocks the save and asks for a different name

### AC-23 (US-09) — happy path

**Given** a Creator or Admin starting a new form
**When** they choose an existing template instead of a blank canvas
**Then** the system pre-fills the new form's fields and layout from the template

### AC-24 (US-09) — domain invariant

**Given** a form created from a template
**When** the source template is later edited or deleted
**Then** the already-created form keeps its own independent copy of the schema, unaffected by the template's later state

### AC-25 (US-10) — happy path / edit

**Given** a Creator or Admin viewing an existing forms schema or template (regardless of who created it)
**When** they choose to edit it
**Then** the system lets them modify it and saves the changes — subject to the field-removal guard in AC-10b when the target is a published form with existing forms data

### AC-26 (US-10) — happy path / delete template

**Given** a Creator or Admin viewing an existing template (regardless of who created it)
**When** they choose to delete it
**Then** the system removes it and confirms — templates carry no forms data, so no data-guard applies

### AC-27 (US-10) — error / delete form blocked by data

**Given** a Creator or Admin attempting to delete a forms schema that has forms data recorded against it
**When** the delete action is submitted
**Then** the system blocks the deletion and explains that the form's data must be removed first (see AC-29)

### AC-28 (US-10) — happy path / delete form allowed

**Given** a Creator or Admin attempting to delete a forms schema that has no forms data recorded against it
**When** the delete action is submitted
**Then** the system removes it and confirms

## 6. Non-functional requirements

| Aspect | Target | Measurement |
|---|---|---|
| Latency p95 — Designer save action | ≤ 500 ms | API response telemetry |
| Latency p95 — Runtime screen render | ≤ 300 ms | client-side render timing telemetry |
| Throughput | ≥ 5 req/s per instance | smoke test in CI |
| Availability | 99.0% | monthly SLO window (internal MVP tool, business hours) |
| Designer schemas/templates list scale | renders up to 500 combined schemas + templates without a UI freeze longer than 1s | load test with a realistic count |
| Component-library change safety | 0 published forms render blank or break silently in Runtime after a curated-library change | manual regression check across all published forms whenever a component in the library changes |

## 6.1 Security / privacy

- **Data classification:** internal — business data assembled by internal consultants and entered by internal/external end-users.
- **Personal data touched:** possibly — the exact fields a Creator places on a form (e.g. a customer's name or email) are not fixed by this PRD; see Open Question below.
- **AuthZ/AuthN impact:** introduces the three-role model (Admin/Creator/User). Designer access is limited to Admin + Creator; user administration is limited to Admin; Runtime is reachable by all three roles, scoped to published forms and, for forms data, scoped to the submitting User only (AC-20).
- **Abuse cases:**
  - **Config injection (XSS):** a Creator (or a compromised Creator account) places a text/link value in a component that contains markup or script — the system always escapes/sanitizes config-provided text before rendering it in Runtime, never interpreting it as executable code (AC-15).
  - **Draft leak:** a User opens a form a Creator has not published yet — the system hides unpublished forms from the User role entirely (AC-14).
  - **Forms-data leak between Users:** a User's submitted data must never be shown to another User (AC-20), and Designer must never expose forms data at all (AC-12).
  - **Component-library tampering:** a Creator attempts to reference a component outside the curated library — the system makes this impossible at selection time (AC-08).
  - **Spam screen creation:** a Creator script-saves an excessive number of screens — the system rate-limits screen-save actions to 30 per minute per account.
- **Security review:** Required — new authz boundary (three roles), new forms-data isolation guarantee, and unresolved question about personal-data fields.

## 7. Metrics / KPIs

- **Screen-build time** — baseline: ~1 day (developer-assisted), target: under 30 minutes solo, measured across Creators within the first 30 days of Designer availability.
- **Rendering correctness** — baseline: N/A (new capability), target: ≥95% of published forms render without a rendering error (an uncaught error or a component failing to resolve its bound data, per AC-16), tracked over the first 30 days post-release.
- **Adoption** — baseline: 0%, target: ≥75% of Creator accounts publish at least one form within 30 days of rollout.

## 8. Open questions

- [ ] What is the complete, final list of curated components for the first release (beyond Text/Number/Select/Date fields)? Default now: the 4 named types above. — owner: Oleksandr Vorovchenko, due: before `/sdlc-break-tasks custom-forms`
- [ ] Do any of the fields Creators place on forms capture personal data (e.g. customer name/email), and if so what data-classification/retention applies? — owner: Oleksandr Vorovchenko, due: before the architecture-design security review
- [ ] What is the concrete migration strategy (beyond the §6 non-breakage constraint) when the curated component library itself changes after forms have already been published (idea-brief §10 config-migration risk) — note this is distinct from a Creator editing their own form's schema, which AC-10b already resolves? — owner: Oleksandr Vorovchenko, due: `/sdlc-architecture-design custom-forms`
- [ ] Is custom-forms a single shared internal instance, or does data/screens need per-client isolation (multi-tenancy)? Default now: not decided, no isolation currently guaranteed beyond per-account forms-data isolation (AC-20). — owner: Oleksandr Vorovchenko, due: before `/sdlc-architecture-design custom-forms` security review
- [ ] Per-screen access grants beyond the three fixed roles (e.g. an Admin/owner assigning a specific Creator edit vs. read-only access to one screen, or granting a specific User access to an otherwise-restricted screen) — raised during clarification but conflicts with the current §3 non-goal (role-level access only); kept out of this iteration's scope. Revisit as a candidate for a future iteration. — owner: Oleksandr Vorovchenko, due: next iteration scoping
- [ ] Page routing/navigation between multiple screens of a built application, and any future flow-rules on top of it (idea-brief §5, §15) — when is this planned as a follow-on iteration? The AC-30 temporary published-forms discovery list should be retired once this ships. — owner: Oleksandr Vorovchenko, due: roadmap review
- [ ] Whether/how the existing `page` and `dashboard` schema types (already present in `schemas_types`) get real behavior in a later iteration — owner: Oleksandr Vorovchenko, due: roadmap review
