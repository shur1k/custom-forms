---
status: Reviewed
owner: 'Oleksandr Vorovchenko'
reviewers: ['Tech Lead', 'Security Lead']
updated_at: '2026-08-28'
feature_size: '<TBD by sdlc:classify-size>'
stage: '03'
ticket: '<TBD>'
---

# PRD — designer/forms-editor

> **Inputs (required):** [project idea-brief](../../../idea-brief.md) · [project CONTEXT](../../../CONTEXT.md) · [designer overview](../PRD.md)
> **Split note (2026-08-28):** extracted from the original `custom-forms` PRD (US-04, AC-07–AC-10b) when the project docs were reorganized into `docs/PROJECT.md` + per-feature docs. Content below is unchanged from that PRD, not re-derived.
> **Reference module:** git commit `0a09af4` — `server/api/src/app/schemas/*`, `client/apps/designer/src/app/form-editor.ts`.

## 1. Context

A Creator (or Admin) assembles a form screen by placing curated components onto a canvas and publishes it when ready — this is Designer's core authoring flow (see [designer overview](../PRD.md) §1).

## 2. Goals

- A Creator assembles a working form screen from the curated component library without writing code, in under 30 minutes.

## 3. Non-goals

See [designer overview](../PRD.md) §3 (custom UI beyond curated components, page/dashboard schema types, concurrent editing, versioning beyond publish-snapshot).

## 4. User stories

### US-04: Assemble a form screen

**As a** Creator or Admin
**I want** to assemble a form screen by placing curated components (Text/Number/Select/Date fields) onto a canvas, and publish it when ready
**So that** I can capture the data a business requirement needs, without writing code

## 5. Acceptance criteria

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

## 6. Non-functional requirements

See [designer overview](../PRD.md) §6 (Designer save latency p95 ≤ 500 ms, component-library change safety).

## 6.1 Security / privacy

- **Abuse case — component-library tampering:** a Creator attempts to reference a component outside the curated library — the system makes this impossible at selection time (AC-08).

## 7. Metrics / KPIs

See [designer overview](../PRD.md) §7 (screen-build time, adoption).

## 8. Open questions

- [ ] What is the concrete migration strategy when the curated component library itself changes after forms have already been published — distinct from a Creator editing their own form's schema, which AC-10b already resolves? — owner: Oleksandr Vorovchenko, due: `/sdlc-architecture-design designer/forms-editor`
