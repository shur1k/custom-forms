---
status: Reviewed
owner: 'Oleksandr Vorovchenko'
reviewers: ['Tech Lead', 'Security Lead']
updated_at: '2026-08-28'
feature_size: '<TBD by sdlc:classify-size>'
stage: '03'
ticket: '<TBD>'
---

# PRD — runtime

> **Inputs (required):** [project idea-brief](../../idea-brief.md) · [project CONTEXT](../../CONTEXT.md)
> **Split note (2026-08-28):** extracted from the original `custom-forms` PRD (US-07, AC-14–AC-20, AC-29, AC-30) when the project docs were reorganized into `docs/PROJECT.md` + per-feature docs. Content below is unchanged from that PRD, not re-derived.
> **Reference module:** git commit `0a09af4` — `client/apps/runtime/src/app/` (currently empty routes, filled by this PRD).

## 1. Context

Runtime is where a User fills in a published form and sees their own previously-entered data again on return — there is no shared, browsable list of everyone's submitted data.

**Data model (new scope this iteration):**

- **Forms data** is the set of values a specific User actually enters into a published form. Storing forms data is new scope — no such storage exists in the reference brownfield.

## 2. Goals

- Runtime renders every Creator-saved, published form correctly against real data — not just the sample data shown during design. "Correctly" means no component raises an uncaught error or fails to resolve its bound data (see AC-16); such a failure must show a visible error placeholder rather than a blank screen.
- A User who returns to a published form sees their own previously-submitted values again, without re-entering them from scratch.

## 3. Non-goals

- Page routing / navigation between multiple screens of a built application — deferred to a future iteration.
- Sharing or browsing other Users' forms data through Designer — Designer never surfaces forms data at all; only Runtime, scoped to the User who submitted it, does.

## 4. User stories

### US-07: Fill in a published form in Runtime

**As a** User
**I want** to open a published form, fill it in, and see my own previously-entered values when I return to it later
**So that** I can submit and revisit my own data without losing it or seeing anyone else's

## 5. Acceptance criteria

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
**Then** the system shows a visible error placeholder for that component in place of a blank screen or an uncaught error — a rendering failure is defined as any component that raises an uncaught error or cannot resolve its bound data; this failure mode also defines what counts against the designer §7 rendering-correctness KPI

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

**Given** a User account with no in-app page navigation available (page routing is out of scope this iteration)
**When** they look for published forms they can access
**Then** the system shows them a list of published forms available to them; this list is an explicit stopgap and is expected to be retired once page routing ships (tracked in §8)

## 6. Non-functional requirements

| Aspect                              | Target                 | Measurement                                            |
| ----------------------------------- | ---------------------- | ------------------------------------------------------ |
| Latency p95 — Runtime screen render | ≤ 300 ms               | client-side render timing telemetry                    |
| Throughput                          | ≥ 5 req/s per instance | smoke test in CI                                       |
| Availability                        | 99.0%                  | monthly SLO window (internal MVP tool, business hours) |

## 6.1 Security / privacy

- **Data classification:** internal — business data assembled by internal consultants and entered by internal/external end-users.
- **Personal data touched:** possibly — the exact fields a Creator places on a form are not fixed by this PRD; see Open Question below.
- **AuthZ impact:** Runtime is reachable by all three roles, scoped to published forms and, for forms data, scoped to the submitting User only (AC-20).
- **Abuse cases:**
  - **Config injection (XSS):** the system always escapes/sanitizes config-provided text before rendering it in Runtime, never interpreting it as executable code (AC-15).
  - **Draft leak:** a User opens a form a Creator has not published yet — the system hides unpublished forms from the User role entirely (AC-14).
  - **Forms-data leak between Users:** a User's submitted data must never be shown to another User (AC-20).
- **Security review:** Required — new forms-data isolation guarantee, and unresolved question about personal-data fields.

## 7. Metrics / KPIs

- **Rendering correctness** — baseline: N/A (new capability), target: ≥95% of published forms render without a rendering error (an uncaught error or a component failing to resolve its bound data, per AC-16), tracked over the first 30 days post-release.

## 8. Open questions

- [ ] Do any of the fields Creators place on forms capture personal data (e.g. customer name/email), and if so what data-classification/retention applies? — owner: Oleksandr Vorovchenko, due: before the architecture-design security review
- [ ] Page routing/navigation between multiple screens of a built application, and any future flow-rules on top of it — when is this planned as a follow-on iteration? The AC-30 temporary published-forms discovery list should be retired once this ships. — owner: Oleksandr Vorovchenko, due: roadmap review
