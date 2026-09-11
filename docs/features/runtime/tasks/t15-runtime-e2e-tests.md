---
id: T15
title: 'Runtime e2e happy path + edge cases'
layer: 'tests'
deps: ['T13', 'T14']
acs: ['AC-14', 'AC-17', 'AC-18', 'AC-19', 'AC-30']
files_hint: ['client/apps/runtime-e2e/']
owner: 'Frontend Lead'
estimate: 'M'
status: 'todo'
---

# T15 — Runtime e2e happy path + edge cases

## Why

Closes the loop end-to-end through the real routed UI (T13), per the repo's existing Playwright e2e convention ([architecture-map.md](../../../architecture-map.md): `nxE2EPreset`, paired `-e2e` project per app — `client/apps/designer-e2e/`). Component tests (T14) mock HTTP; this task exercises the real API + DB.

## What

Playwright specs in `client/apps/runtime-e2e/`:

- happy path: log in as a User, discover a published form (AC-30), fill and submit (AC-17), navigate away and back, confirm the same values are prefilled (AC-19)
- validation: submit with a required field empty, confirm the block and the error indication (AC-18)
- unpublished form: confirm a User cannot reach a draft form (AC-14) — e.g. via direct URL to an unpublished schema id

## Definition of Done

- [ ] all three scenarios pass headless against a seeded dev DB
- [ ] `nx e2e runtime-e2e` (or the equivalent target) is green

## Notes

Last task in the DAG — depends on the full routed UI (T13) and the component-level tests (T14) both being green first.
