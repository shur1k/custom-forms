---
id: T13
title: 'Wire Runtime routing into the shell'
layer: 'ui'
deps: ['T9', 'T12']
acs: []
files_hint:
  [
    'client/apps/runtime/src/app/app.routes.ts',
    'client/apps/runtime/federation.config.js',
  ]
owner: 'Frontend Lead'
estimate: 'S'
status: 'todo'
---

# T13 — Wire Runtime routing into the shell

## Why

Per [architecture-map.md](../../../architecture-map.md), `client/apps/runtime` currently exposes minimal/empty routes. T9's form-list and T12's completed form-viewer need real routes for a User to actually reach them through the shell.

## What

Add `form-list` and `form-viewer/:schemaId` routes to `client/apps/runtime/src/app/app.routes.ts`, following the pattern already exposed by `client/apps/designer/federation.config.js:6-8` (`./Routes`). No change to the shell's federation wiring itself should be needed beyond confirming the existing `runtime` remote registration in `client/apps/shell/federation.config.js:8` resolves the new routes.

## Definition of Done

- [ ] a User can navigate shell → Runtime → form-list → a specific form-viewer via URL/link, not just direct deep-link
- [ ] existing shell role-based guard still applies (no new bypass introduced)

## Notes

Small, wiring-only task — do not fold new UI logic into it.
