---
id: T9
title: 'Build Runtime form-list discovery screen'
layer: 'ui'
deps: ['T8']
acs: ['AC-30']
files_hint: ['client/apps/runtime/src/app/form-list/']
owner: 'Frontend Lead'
estimate: 'M'
status: 'todo'
---

# T9 — Build Runtime form-list discovery screen

## Why

Derives from [PRD AC-30](../PRD.md) and [sad §5](../sad.md) (`runtime/src/app/form-list/` — temporary discovery list of published forms, since page routing is out of scope this iteration).

## What

New `form-list/` screen under `client/apps/runtime/src/app/`, modelled on the closest existing precedent per [architecture-map.md](../../../architecture-map.md) §Frontend: `client/apps/designer/src/app/form-list/form-list.ts` (list/CRUD screen pattern — Angular Signals for local state, `BaseHttpService` via the api-client, `OnPush`). Reuse `client/libs/ui` primitives; do not introduce new styling or a new list-table pattern.

Calls T5's discovery endpoint (via T8's regenerated client) and links each row to `form-viewer` (T10).

## Definition of Done

- [ ] renders the published-forms list from the discovery endpoint
- [ ] built from existing `client/libs/ui` primitives, no new component library introduced
- [ ] component test covers the loaded-list render (moved to full coverage in T14)

## Notes

This screen is an explicit stopgap (PRD §8) — keep it minimal; it's expected to be retired once page routing ships.
