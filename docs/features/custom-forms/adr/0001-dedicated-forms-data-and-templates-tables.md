---
status: Accepted
owner: "Oleksandr Vorovchenko"
reviewers: []
updated_at: "2026-08-06"
feature_size: L
stage: "04-05"
ticket: "<TBD>"
---

# 0001 — Store forms data and templates as two dedicated tables

- **Status:** Accepted
- **Date:** 2026-08-06
- **Deciders:** Architect (Oleksandr Vorovchenko) + user, during the §4 Socratic walk

## Context

PRD §4 introduces two entities that don't exist in the reference brownfield module (commit `0a09af4`): **forms data** (the values a User submits into a published form — AC-17: one record per User per form, overwritten on resubmit, not a history) and **templates** (a named, independent copy of a forms schema — AC-24: editing/deleting the source template never affects forms already created from it). The existing schema only has `schemas` (type = form/page/dashboard) and `schemas_versions` (publish-snapshots). Neither entity has a natural home in that existing structure, and both need their own storage decision before `sdlc:generate-data-model` can run.

## Decision drivers

- AC-17 (US-07): exactly one forms-data row per (schema, User) pair — upsert semantics, not append-only history.
- AC-20 (US-07): forms data must be strictly isolated per submitting User — no cross-account read path.
- AC-24 (US-09): a template is an independent copy; later edits/deletes of the template must never affect forms already created from it.
- AC-22 (US-08): template names are unique case-insensitively across the whole instance.
- PRD §6 NFR: Designer schemas/templates list renders up to 500 combined rows without a UI freeze >1s — favors a query shape that doesn't require joining across type-discriminated rows.

## Considered options

1. **Two new dedicated tables** — `forms_data` (schemaId FK, userId FK, data JSONB, `UNIQUE(schemaId, userId)`) and `templates` (id, name UNIQUE case-insensitive, schema JSONB, independent of `schemas`).
2. **Reuse `schemas` for templates via a 4th `schemas_type` (`'template'`)** + a new `forms_data` table only.
3. **Overload `schemas_versions`** (the existing publish-snapshot table) to also carry forms-data rows via a type discriminator.

## Decision outcome

**Chosen:** Option 1 — two new dedicated tables, `forms_data` and `templates`. It keeps each entity's invariants (upsert-per-User for forms data; name-uniqueness + independence for templates) as native table constraints instead of overloaded discriminator logic on top of tables whose existing semantics (form/page/dashboard type, publish-snapshot) mean something different. It costs two new migrations and two new NestJS modules, which is proportionate for a size-L feature.

## Consequences

**Positive**
- Clear separation of responsibility — `forms_data` ≠ `schemas_versions` ≠ `templates`; each table's constraints directly express its own invariant (`UNIQUE(schemaId, userId)` for forms data, `UNIQUE(lower(name))` for templates).
- Adding an index or constraint to one entity never risks the other two.
- Straightforward mapping for `sdlc:generate-data-model` — no discriminator-column modeling.

**Negative**
- Two new migrations and two new NestJS modules (`forms-data`, `templates`) to build and test, following the existing `schemas` module pattern.
- Slightly more surface area than reusing an existing table.

**Neutral**
- Templates carry no forms data (AC-26), so `templates` never needs a `forms_data`-style child table.
- If a future iteration wants template versioning, that's a new decision on top of this table, not a migration of this one.

## Links

- PRD: [[../PRD.md]]
- SAD: [[../sad.md]] §4
- Related ADR: none yet
