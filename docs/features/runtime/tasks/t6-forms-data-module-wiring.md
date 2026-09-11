---
id: T6
title: 'Wire FormsDataModule into the app'
layer: 'wiring'
deps: ['T1', 'T2', 'T4']
acs: []
files_hint:
  [
    'server/api/src/app/forms-data/forms-data.module.ts',
    'server/api/src/app/app.module.ts',
    'server/api/src/db/schema.ts',
  ]
owner: 'Backend Lead'
estimate: 'S'
status: 'todo'
---

# T6 — Wire FormsDataModule into the app

## Why

Registers the new domain module the same way every other domain module is wired, per [architecture-map.md](../../../architecture-map.md) convention: "one NestJS module per domain, `<domain>.module.ts` declares `controllers`/`providers`".

## What

- `forms-data.module.ts` — declares `FormsDataController` + `FormsDataService` as providers, modelled on `server/api/src/app/schemas/schemas.module.ts`
- Import `FormsDataModule` into `app.module.ts`
- Confirm the `formsDataRelations` added in T1 resolve correctly in Drizzle's relational query builder

## Definition of Done

- [ ] `npm run api:serve` boots with no DI errors
- [ ] a manual smoke request against a `forms-data` endpoint succeeds end-to-end
- [ ] lint + vet clean

## Notes

Pure composition — no new logic. Depends on T1 (table exists), T2 (service exists), T4 (controller exists).
