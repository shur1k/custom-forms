---
id: T12
title: 'Wire form-viewer to forms-data endpoints (prefill/submit/delete)'
layer: 'ui'
deps: ['T11', 'T8']
acs: ['AC-17', 'AC-19', 'AC-29']
files_hint: ['client/apps/runtime/src/app/form-viewer/']
owner: 'Frontend Lead'
estimate: 'M'
status: 'todo'
---

# T12 — Wire form-viewer to forms-data endpoints (prefill/submit/delete)

## Why

Derives from [PRD AC-17/AC-19/AC-29](../PRD.md) and [sad §6 flow](../sad.md) "User fills, submits, and later returns to a published form" — the data round-trip that makes T10's renderer and T11's validation actually persist and reload a User's own data.

## What

- On load: call T4's `GET` (via T8's client) and prefill the renderer with the returned values, or leave it empty if none exist (AC-19)
- On valid submit (post-T11): call T4's `PUT`, show a submission-confirmed state
- On delete: call T4's `DELETE`, revert the form to its empty state (AC-29)

## Definition of Done

- [ ] returning to a form with prior data shows that data prefilled
- [ ] a fresh submit and a resubmit both succeed and the second overwrites (not duplicates) visibly
- [ ] delete reverts the form to empty and confirms
- [ ] component test covers prefill/submit/delete against a mocked HTTP client (moved to full coverage in T14)

## Notes

Shares `form-viewer/` files with T10/T11 — natural continuation, same PR is fine if the whole chain stays within the ≤1 day budget; split if it doesn't.
