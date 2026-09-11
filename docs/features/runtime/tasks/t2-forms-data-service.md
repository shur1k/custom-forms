---
id: T2
title: 'Implement FormsDataService (prefill, upsert submit, delete own)'
layer: 'app'
deps: ['T1']
acs: ['AC-17', 'AC-19', 'AC-20', 'AC-29']
files_hint: ['server/api/src/app/forms-data/forms-data.service.ts']
owner: 'Backend Lead'
estimate: 'M'
status: 'todo'
---

# T2 — Implement FormsDataService (prefill, upsert submit, delete own)

## Why

Derives from [PRD AC-17, AC-19, AC-20, AC-29](../PRD.md) and [sad §5](../sad.md) (`server/api/src/app/forms-data/` — per-User submitted values, upsert-on-resubmit). Modelled on `server/api/src/app/schemas/schemas.service.ts`'s pattern of injecting `DRIZZLE_DB` and using relational queries.

## What

Create `forms-data.service.ts` with three methods, every one scoped by `userId`:

- `getOwn(schemaId, userId)` — reads the caller's own row for this schema (or `undefined` if none), used for prefill (AC-19)
- `submit(schemaId, userId, values)` — upserts by the `(schema_id, user_id)` unique constraint from T1 (insert on first submit, overwrite on resubmit — AC-17)
- `deleteOwn(schemaId, userId)` — deletes the caller's own row only (AC-29)

No method takes a `userId` from anywhere but the authenticated request — this is the AC-20 isolation guarantee, and it must hold even for Admin/Creator accounts (no cross-account view this iteration).

## Definition of Done

- [ ] unit tests: `submit` creates on first call, overwrites (not duplicates) on a second call for the same user+schema
- [ ] unit tests: `getOwn`/`deleteOwn` only ever touch the row matching the given `userId`
- [ ] lint + vet clean

## Notes

Keep validation of the submitted `values` shape out of this service — that's T4/T11's job (DTO validation, then client-side validation against the schema's field types). This service trusts its caller already validated.
