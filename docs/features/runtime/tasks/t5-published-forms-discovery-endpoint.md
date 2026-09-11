---
id: T5
title: 'Add published-forms discovery endpoint'
layer: 'ports'
deps: ['T3']
acs: ['AC-30']
files_hint:
  [
    'server/api/src/app/schemas/schemas.controller.ts',
    'server/api/src/app/schemas/schemas.service.ts',
  ]
owner: 'Backend Lead'
estimate: 'S'
status: 'todo'
---

# T5 — Add published-forms discovery endpoint

## Why

Derives from [PRD AC-30](../PRD.md) — a temporary stopgap list of published forms, since page routing/navigation is out of scope this iteration (retired once that ships, per PRD §8).

## What

Add a `GET /schemas/published` (or similar) handler to the existing `schemas.controller.ts`, backed by a `listPublished()` method on `schemas.service.ts` that reuses T3's "has a published version" logic to filter. Available to any authenticated role — this is a list of what's reachable, not a permission grant by itself (T3/T4 still gate the actual form access).

## Definition of Done

- [ ] endpoint returns only schemas with a published version, excluding drafts
- [ ] unit test covers a mix of published/unpublished schemas
- [ ] lint + vet clean

## Notes

Lives in the `schemas` module, not `forms-data` — it's schema metadata, not per-User submitted values. Independent of T1/T2/T4; only depends on T3.
