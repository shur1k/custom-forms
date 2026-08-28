---
status: Reviewed
owner: 'Oleksandr Vorovchenko'
reviewers: ['Tech Lead', 'Security Lead']
updated_at: '2026-08-28'
feature_size: '<TBD by sdlc:classify-size>'
stage: '03'
ticket: '<TBD>'
---

# PRD — designer/schema-viewer

> **Inputs (required):** [project idea-brief](../../../idea-brief.md) · [project CONTEXT](../../../CONTEXT.md) · [designer overview](../PRD.md)
> **Split note (2026-08-28):** extracted from the original `custom-forms` PRD (US-05/06, AC-11–AC-13) when the project docs were reorganized into `docs/PROJECT.md` + per-feature docs. Content below is unchanged from that PRD, not re-derived.
> **Reference module:** git commit `0a09af4` — `client/apps/designer/src/app/form-list.ts` (existing schema/template browser, extended by this PRD to also show templates).

## 1. Context

Designer's own schema/template browser (a fixed, built-in list + detail view — not something a Creator assembles from components) already exists in an early form (`form-list.ts`) and is extended by this PRD to also show templates.

## 2. Goals

See [designer overview](../PRD.md) §2.

## 3. Non-goals

See [designer overview](../PRD.md) §3.

## 4. User stories

### US-05: Browse existing forms schemas and templates

**As a** Creator or Admin
**I want** to see a list of all forms schemas and all saved templates in Designer
**So that** I can find and manage what already exists instead of losing track of it

### US-06: View a single forms schema or template

**As a** Creator or Admin
**I want** to open one forms schema or template and see its full field/layout definition
**So that** I can review it before editing, publishing, or reusing it

## 5. Acceptance criteria

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

## 6. Non-functional requirements

| Aspect                                | Target                                                                            | Measurement                      |
| ------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------- |
| Designer schemas/templates list scale | renders up to 500 combined schemas + templates without a UI freeze longer than 1s | load test with a realistic count |

## 6.1 Security / privacy

- AC-12 is itself the security-relevant invariant here: the schema/template browser must never leak forms data (submitted entries) into a shared-visibility list.

## 7. Metrics / KPIs

See [designer overview](../PRD.md) §7.

## 8. Open questions

None specific to schema-viewer beyond [designer overview](../PRD.md) §8.
