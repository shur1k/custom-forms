---
status: Reviewed
owner: 'Oleksandr Vorovchenko'
reviewers: ['Tech Lead', 'Security Lead']
updated_at: '2026-08-28'
feature_size: '<TBD by sdlc:classify-size>'
stage: '03'
ticket: '<TBD>'
---

# PRD — designer

> **Inputs (required):** [project idea-brief](../../idea-brief.md) · [project CONTEXT](../../CONTEXT.md)
> **Split note (2026-08-28):** extracted from the original `custom-forms` PRD when the project docs were reorganized into `docs/PROJECT.md` + per-feature docs. This is an **overview-only** document — Designer's user stories, acceptance criteria, and building blocks are split across its three sub-features:
>
> - [forms-editor](./forms-editor/PRD.md) — US-04, AC-07–AC-10b
> - [schema-viewer](./schema-viewer/PRD.md) — US-05/06, AC-11–AC-13
> - [template-actions](./template-actions/PRD.md) — US-08/09/10, AC-21–AC-28
>   **Reference module:** git commit `0a09af4` ("[CF-13] Designer") — `server/api/src/app/schemas/*`, `client/apps/designer/src/app/form-schema.types.ts`, `form-list.ts`/`form-editor.ts`.

## 1. Context

Designer is the no-code authoring tool where a Creator (or Admin) builds an individual screen (a form, for this iteration) as a freeform JSON Schema document, from a curated component set (Text/Number/Select/Date fields). Consultants who understand a client's business requirements cannot currently assemble a working screen themselves — every screen requires a developer to hand-code it, so delivery speed is bottlenecked on the development queue (project idea-brief §2 Problem).

**Data model (already implemented, PRD extends it):**

- A **forms schema** is the JSON-Schema-based definition of one form's fields and layout, built by a Creator in Designer. It is stored as its own row (the existing `schemas` table, `type = form`).
- A **template** is a named, reusable copy of a forms schema that a Creator or Admin explicitly saves for future reuse.

## 2. Goals

- A Creator assembles a working form screen from the curated component library without writing code, in under 30 minutes (project idea-brief §13, §11 outcome metric).

## 3. Non-goals

- Multiple Creators editing the same screen simultaneously — deferred, because concurrent-edit conflict resolution adds design and testing cost the MVP budget does not cover.
- Custom UI beyond the curated component set (Text/Number/Select/Date fields) — Creators cannot add arbitrary markup or components outside the library.
- Assembling a "list" or "detail" screen from curated components — the only Creator-buildable screen type is a form.
- Building distinct behavior for the `page` and `dashboard` schema types (rows already exist in `schemas_types` for future use) — only `form`-typed schemas are functional this iteration.
- Versioning of forms schemas beyond the existing publish-snapshot mechanism (`schemas_versions`) — no rollback/diff UI this iteration.

## 4. User stories

See the three sub-features linked above for the full US-04–US-10 list and their acceptance criteria (US-08/09/10 belong to template-actions rather than Designer's own numbering gap).

## 5. Acceptance criteria

See sub-feature PRDs.

## 6. Non-functional requirements

| Aspect                                | Target                                                                                     | Measurement                                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Latency p95 — Designer save action    | ≤ 500 ms                                                                                   | API response telemetry                                                                         |
| Designer schemas/templates list scale | renders up to 500 combined schemas + templates without a UI freeze longer than 1s          | load test with a realistic count                                                               |
| Component-library change safety       | 0 published forms render blank or break silently in Runtime after a curated-library change | manual regression check across all published forms whenever a component in the library changes |

## 6.1 Security / privacy

- **Abuse case — config injection (XSS):** a Creator (or a compromised Creator account) places a text/link value in a component that contains markup or script — the system always escapes/sanitizes config-provided text before rendering it in Runtime, never interpreting it as executable code.
- **Abuse case — component-library tampering:** a Creator attempts to reference a component outside the curated library — the system makes this impossible at selection time (forms-editor AC-08).
- **Abuse case — spam screen creation:** a Creator script-saves an excessive number of screens — the system rate-limits screen-save actions to 30 per minute per account.

## 7. Metrics / KPIs

- **Screen-build time** — baseline: ~1 day (developer-assisted), target: under 30 minutes solo, measured across Creators within the first 30 days of Designer availability.
- **Adoption** — baseline: 0%, target: ≥75% of Creator accounts publish at least one form within 30 days of rollout.

## 8. Open questions

- [ ] What is the complete, final list of curated components for the first release (beyond Text/Number/Select/Date fields)? Default now: the 4 named types above. — owner: Oleksandr Vorovchenko, due: before `/sdlc-break-tasks designer`
- [ ] Whether/how the existing `page` and `dashboard` schema types (already present in `schemas_types`) get real behavior in a later iteration — owner: Oleksandr Vorovchenko, due: roadmap review
