---
status: Reviewed
owner: 'Oleksandr Vorovchenko'
reviewers: ['Tech Lead', 'Security Lead']
updated_at: '2026-08-28'
feature_size: '<TBD by sdlc:classify-size>'
stage: '03'
ticket: '<TBD>'
---

# PRD — designer/template-actions

> **Inputs (required):** [project idea-brief](../../../idea-brief.md) · [project CONTEXT](../../../CONTEXT.md) · [designer overview](../PRD.md)
> **Split note (2026-08-28):** extracted from the original `custom-forms` PRD (US-08/09/10, AC-21–AC-28) when the project docs were reorganized into `docs/PROJECT.md` + per-feature docs. Content below is unchanged from that PRD, not re-derived.
> **Reference module:** `client/apps/designer/src/app/` — NEW `template-actions/` module (save-as-template, create-from-template), per sad.md §5.

## 1. Context

A **template** is a named, reusable copy of a forms schema that a Creator or Admin explicitly saves for future reuse; starting a new form from a template pre-fills its fields/layout with no ongoing link back to the template or to other forms created from it. Templates are new scope introduced by this PRD — no `templates` entity exists in the reference brownfield.

## 2. Goals

See [designer overview](../PRD.md) §2.

## 3. Non-goals

See [designer overview](../PRD.md) §3.

## 4. User stories

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
**Then** the system lets them modify it and saves the changes — subject to the field-removal guard in forms-editor AC-10b when the target is a published form with existing forms data

### AC-26 (US-10) — happy path / delete template

**Given** a Creator or Admin viewing an existing template (regardless of who created it)
**When** they choose to delete it
**Then** the system removes it and confirms — templates carry no forms data, so no data-guard applies

### AC-27 (US-10) — error / delete form blocked by data

**Given** a Creator or Admin attempting to delete a forms schema that has forms data recorded against it
**When** the delete action is submitted
**Then** the system blocks the deletion and explains that the form's data must be removed first (see runtime AC-29)

### AC-28 (US-10) — happy path / delete form allowed

**Given** a Creator or Admin attempting to delete a forms schema that has no forms data recorded against it
**When** the delete action is submitted
**Then** the system removes it and confirms

## 6. Non-functional requirements

See [designer overview](../PRD.md) §6.

## 6.1 Security / privacy

- **AuthZ:** template save/edit/delete is limited to Admin + Creator (Designer access gate, see user-administration AC-06).

## 7. Metrics / KPIs

See [designer overview](../PRD.md) §7.

## 8. Open questions

- [ ] Template-mechanism ownership: who exactly can save/see templates beyond the shared-visibility default already reflected in AC-21/AC-26? — owner: Oleksandr Vorovchenko, due: roadmap review
