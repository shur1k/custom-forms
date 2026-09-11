---
id: T4
title: 'Add FormsDataController (get/submit/delete own forms data)'
layer: 'ports'
deps: ['T2', 'T3']
acs: ['AC-14', 'AC-17', 'AC-18', 'AC-19', 'AC-20', 'AC-29']
files_hint:
  [
    'server/api/src/app/forms-data/forms-data.controller.ts',
    'server/api/src/app/forms-data/dto/',
  ]
owner: 'Backend Lead'
estimate: 'M'
status: 'todo'
---

# T4 — Add FormsDataController (get/submit/delete own forms data)

## Why

Exposes T2's service over HTTP, gated by T3's publish check. Derives from [PRD AC-14/17/18/19/20/29](../PRD.md) and [sad §6 flows](../sad.md) (get form + own data, submit, delete own data).

## What

Add `forms-data.controller.ts` with three handlers under a schema-scoped route (e.g. `GET/PUT/DELETE /schemas/:schemaId/forms-data`):

- `GET` — calls T3's `findPublishedById` (404s an unpublished/missing form, AC-14), then T2's `getOwn(schemaId, req.user.id)` for prefill (AC-19)
- `PUT` — validates the submitted body against a DTO (required-field + type checks per the form's schema — AC-18: reject with field-level errors, save nothing partial), then calls T2's `submit`
- `DELETE` — calls T2's `deleteOwn`

Role guard per [ADR-0002](../../../adr/0002-per-endpoint-roles-guard-for-authorization.md): reachable by all three roles (User/Creator/Admin), always scoped to `req.user.id` — never a `userId` from the request body/params (AC-20).

## Definition of Done

- [ ] `GET` on an unpublished form returns 404 (AC-14)
- [ ] `PUT` with a required field missing returns a validation error and persists nothing (AC-18)
- [ ] `PUT`/`GET`/`DELETE` never accept a caller-supplied `userId` — always `req.user.id`
- [ ] handler-level tests pass (moved to full coverage in T7)
- [ ] lint + vet clean

## Notes

Shares the `forms-data.service.ts` file's directory with T2/T6 — serialize with them if working the same day (overlapping `files_hint`).
