---
id: T11
title: 'Add form-viewer submit validation'
layer: 'ui'
deps: ['T10']
acs: ['AC-18']
files_hint: ['client/apps/runtime/src/app/form-viewer/']
owner: 'Frontend Lead'
estimate: 'M'
status: 'todo'
---

# T11 — Add form-viewer submit validation

## Why

Derives from [PRD AC-18](../PRD.md) — blocking an invalid submit client-side gives immediate feedback; the backend's T4 DTO validation is the authoritative guard (never trust the client alone), but the UI must surface which field(s) failed.

## What

Add required-field and type validation to `form-viewer`, keyed off each component's schema definition (same field metadata Designer's properties-panel edits). On submit:

- required field empty → block, mark the field, show an inline error
- invalid value for the field's declared type → block, mark the field, show an inline error
- otherwise → proceed to T12's submit call

No partial save on a blocked submit.

## Definition of Done

- [ ] a required field left empty blocks submission and is visibly marked
- [ ] an invalid-type value blocks submission and is visibly marked
- [ ] a fully valid form proceeds to submit
- [ ] component test covers both blocked and passing submissions (moved to full coverage in T14)

## Notes

This is client-side UX only — the backend (T4) remains the source of truth and re-validates independently; don't skip T4's DTO validation on the assumption this task covers it.
