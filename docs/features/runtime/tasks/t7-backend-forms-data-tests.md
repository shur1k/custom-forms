---
id: T7
title: 'Backend tests for forms-data (isolation, validation, publish-gate)'
layer: 'tests'
deps: ['T4', 'T5']
acs: ['AC-14', 'AC-17', 'AC-18', 'AC-19', 'AC-20', 'AC-29']
files_hint:
  [
    'server/api/src/app/forms-data/forms-data.service.spec.ts',
    'server/api/src/app/forms-data/forms-data.controller.spec.ts',
  ]
owner: 'Backend Lead'
estimate: 'M'
status: 'todo'
---

# T7 — Backend tests for forms-data (isolation, validation, publish-gate)

## Why

Derives from [sad §10 Quality requirements](../sad.md): "Authorization & data-isolation integrity" explicitly calls for "a cross-account forms-data isolation test asserting account B's read never returns account A's submitted values" — this is a named, non-optional test, not incidental coverage.

## What

Jest specs with `Test.createTestingModule()` + a mocked `DRIZZLE_DB` (per the repo's existing pattern in `auth.service.spec.ts`):

- **Isolation (AC-20):** two accounts (including an Admin/Creator pair, not just two Users) each submit forms data for the same schema; assert each read only ever returns its own account's row
- **Upsert (AC-17):** submitting twice for the same user+schema overwrites, doesn't duplicate
- **Validation (AC-18):** an invalid/missing-required-field submit is rejected and nothing is persisted
- **Publish gate (AC-14):** `GET`/discovery never surface an unpublished form
- **Own-data prefill/delete (AC-19/AC-29):** covered as the natural counterpart of the isolation and upsert tests above

## Definition of Done

- [ ] all five test groups above pass
- [ ] coverage includes both the service and controller layers
- [ ] lint + vet clean

## Notes

This is the task that directly satisfies sad §10's named isolation test — don't let it shrink to "happy path only" coverage.
