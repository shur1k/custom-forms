---
id: T14
title: 'Frontend tests for form-list and form-viewer'
layer: 'tests'
deps: ['T9', 'T10', 'T11', 'T12']
acs: ['AC-15', 'AC-16', 'AC-18', 'AC-19', 'AC-29', 'AC-30']
files_hint:
  [
    'client/apps/runtime/src/app/form-list/',
    'client/apps/runtime/src/app/form-viewer/',
  ]
owner: 'Frontend Lead'
estimate: 'M'
status: 'todo'
---

# T14 — Frontend tests for form-list and form-viewer

## Why

Consolidates dedicated component-level coverage for T9–T12, per the repo's existing convention ([architecture-map.md](../../../architecture-map.md): "frontend Vitest with `TestBed` + `HttpTestingController`", e.g. `client/apps/designer/src/app/form-list/form-list.spec.ts`). The individual UI tasks note "moved to full coverage in T14" — this is where that coverage lands.

## What

Vitest + `TestBed` + `HttpTestingController` specs:

- `form-list.spec.ts` — renders the published-forms list from a mocked HTTP response
- `form-viewer.spec.ts` — prefill from existing data (AC-19), a broken-component error placeholder (AC-16), no `[innerHTML]`/`bypassSecurityTrust*` usage (AC-15, can be a static assertion over the template), a blocked invalid submit (AC-18), and a delete reverting to empty (AC-29)

## Definition of Done

- [ ] all listed scenarios have a passing test
- [ ] `nx test runtime` (or the equivalent target) is green
- [ ] lint clean

## Notes

AC-30's discovery-list coverage lives here at the component level; T15 covers it again end-to-end through the real UI.
