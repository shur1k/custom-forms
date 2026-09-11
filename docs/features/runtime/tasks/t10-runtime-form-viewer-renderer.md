---
id: T10
title: 'Build Runtime form-viewer renderer with per-component error fallback'
layer: 'ui'
deps: ['T8']
acs: ['AC-15', 'AC-16']
files_hint: ['client/apps/runtime/src/app/form-viewer/']
owner: 'Frontend Lead'
estimate: 'M'
status: 'todo'
---

# T10 — Build Runtime form-viewer renderer with per-component error fallback

## Why

Derives from [PRD AC-15/AC-16](../PRD.md) and [sad §1 quality goal](../sad.md): "Runtime never renders a published form blank or silently broken, even after the curated component library changes." This is the SAD's headline quality goal for the whole feature — treat this task's error-boundary behavior as load-bearing, not a nice-to-have.

## What

New `form-viewer/` screen under `client/apps/runtime/src/app/` that reads a published form's schema (fetched via T3/T4's gated endpoint) and dynamically instantiates the same component kit Designer's canvas uses (`input`/`select`/`button`/`text-area`, per [architecture-map.md](../../../architecture-map.md) §Frontend / `client/apps/designer/src/app/form-editor/canvas/canvas.ts`), in read/fill mode rather than edit mode.

Two behaviors this task owns:

- **AC-15:** every text/link component value renders via Angular's default template binding — never `[innerHTML]` or `bypassSecurityTrust*` (shared convention, [designer sad.md §8](../../designer/sad.md)).
- **AC-16:** wrap each component's render in a per-component error boundary (a component raising an uncaught error, or failing to resolve its bound data, shows a visible placeholder for that component only — never a blank screen, and never takes down the rest of the form).

## Definition of Done

- [ ] a form with a component that has a broken/unresolvable data binding shows a visible error placeholder for that component only, page stays usable
- [ ] no component value is ever rendered via `[innerHTML]` / `bypassSecurityTrust*`
- [ ] structural render (no fill/submit logic yet — that's T11/T12) matches the schema's `col`/`row`/`w`/`h` layout from Designer

## Notes

Do not duplicate the component-kit's rendering logic — factor out/reuse what Designer's canvas already defines for each component type rather than hand-rolling a second renderer.
