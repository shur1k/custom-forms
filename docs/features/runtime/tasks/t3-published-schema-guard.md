---
id: T3
title: 'Add SchemasService.findPublishedById (published-only gate)'
layer: 'app'
deps: []
acs: ['AC-14']
files_hint: ['server/api/src/app/schemas/schemas.service.ts']
owner: 'Backend Lead'
estimate: 'S'
status: 'todo'
---

# T3 — Add SchemasService.findPublishedById (published-only gate)

## Why

Derives from [PRD AC-14](../PRD.md) — a User must never be able to open a form a Creator hasn't published. This belongs on the existing `schemas` module (it already owns publish/versioning), reused by Runtime's ports (T4, T5) rather than duplicated into `forms-data`.

## What

Add `findPublishedById(id)` to `schemas.service.ts`: looks up the schema, checks it has a published version (via `schemasVersions`, per the existing publish/versioning logic), and throws `NotFoundException` if the schema doesn't exist or has never been published. Independent of T1/T2 — can start in parallel.

## Definition of Done

- [ ] unit test: an existing-but-unpublished schema throws `NotFoundException`
- [ ] unit test: a nonexistent schema id throws `NotFoundException`
- [ ] unit test: a published schema resolves successfully
- [ ] lint + vet clean

## Notes

This is the single choke point AC-14 depends on — every Runtime-facing read (T4's get, T5's discovery list) must route through this method rather than the general-purpose `findById` Designer uses (which intentionally does show unpublished drafts to their Creator).
