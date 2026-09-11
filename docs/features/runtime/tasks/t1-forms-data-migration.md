---
id: T1
title: 'Add forms_data table to Drizzle schema + migration'
layer: 'migration'
deps: []
acs: ['AC-17', 'AC-20']
files_hint:
  [
    'server/api/src/db/schema.ts',
    'docs/features/runtime/migrations/01_forms_data/',
  ]
owner: 'Backend Lead'
estimate: 'S'
status: 'todo'
---

# T1 — Add forms_data table to Drizzle schema + migration

## Why

`forms_data` is a new entity absent from the brownfield (no such storage exists yet) — derives from [PRD §1](../PRD.md) "new scope this iteration" and [ADR-0001](../../../adr/0001-dedicated-forms-data-and-templates-tables.md) (dedicated table, not folded into `schemas`).

## What

Add a `forms_data` table to `server/api/src/db/schema.ts`, modelled on the existing `schemas`/`schemasVersions` tables (UUID v4 PK, `defaultRandom()`, `timestamp('...', { withTimezone: true })`):

- `id` — uuid PK
- `schemaId` — uuid, FK → `schemas.id`, `onDelete: 'cascade'`
- `userId` — uuid, FK → `users.id`, `onDelete: 'cascade'`
- `values` — jsonb, the User's submitted field values
- `createdAt` / `updatedAt` — timestamps
- **unique constraint on `(schemaId, userId)`** — this is what makes AC-17's "one record per User per form, upsert not history" enforceable at the DB layer, not just in application code

Add the corresponding relation (`formsDataRelations`) alongside the existing `schemasRelations` pattern. Generate the migration with `drizzle-kit generate`, stage the up/down pair under `docs/features/runtime/migrations/01_forms_data/` (no `data-model.md` exists for this feature yet — this task defines the shape directly from PRD §1 + ADR-0001 rather than promoting from a pre-authored data model).

## Definition of Done

- [ ] `forms_data` table + relation added to `schema.ts`
- [ ] staged migration (up + down) generated and reviewed
- [ ] migration applies and reverts cleanly against the dev DB (`db:migrate`)
- [ ] unique `(schema_id, user_id)` constraint present and verified with a manual insert/upsert check

## Notes

No `data-model.md` exists for `runtime` — if one is authored later, reconcile this table definition against it rather than duplicating a second source of truth.
