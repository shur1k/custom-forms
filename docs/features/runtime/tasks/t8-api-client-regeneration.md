---
id: T8
title: 'Regenerate client/libs/api-client for the new endpoints'
layer: 'infra'
deps: ['T4', 'T5']
acs: []
files_hint: ['client/libs/api-client/src/lib/']
owner: 'Frontend Lead'
estimate: 'S'
status: 'todo'
---

# T8 — Regenerate client/libs/api-client for the new endpoints

## Why

Per [architecture-map.md](../../../architecture-map.md) tech-debt note: `client/libs/api-client` is auto-generated from Swagger and must be manually regenerated after a backend DTO/route change, or the frontend types silently drift. T4/T5 add new routes and DTOs — Runtime's frontend needs typed access to them before any UI task can start.

## What

Run `npm run api:generate-client` against the running API (with T4/T5's endpoints live) and commit the regenerated `client/libs/api-client` output. Do not hand-edit the generated files.

## Definition of Done

- [ ] `npm run api:generate-client` runs clean
- [ ] the new forms-data + discovery endpoints have typed client methods
- [ ] no hand-edits to generated files

## Notes

Blocks every `ui` task (T9–T13) — this is the pinch point between backend and frontend work.
