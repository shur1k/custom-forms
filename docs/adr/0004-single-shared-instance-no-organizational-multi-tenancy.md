---
status: Accepted
owner: 'Oleksandr Vorovchenko'
reviewers: []
updated_at: '2026-08-09'
feature_size: L
stage: '04-05'
ticket: '<TBD>'
---

# 0004 — Run custom-forms as a single shared instance with per-User data isolation, no organizational multi-tenancy

- **Status:** Accepted
- **Date:** 2026-08-09
- **Deciders:** Architect (Oleksandr Vorovchenko) + user, during the §9 Socratic walk (resolving a PRD §8 open question due at this stage)

## Context

PRD §8 explicitly left open: "Is custom-forms a single shared internal instance, or does data/screens need per-client isolation (multi-tenancy)? Default now: not decided" — due "before `/sdlc-architecture-design custom-forms` security review." The brownfield has no `tenant_id` column or per-client partitioning anywhere. This needed resolving before §9 could close, since it bears directly on the data model (§4/§5, ADR-0001) and on QG-2 (authz/isolation, §1).

## Decision drivers

- QG-2 (§1): authorization & data-isolation integrity is a top-3 quality goal.
- AC-11: the schemas/templates browser lists every schema and template created by any Creator/Admin — visibility is shared across accounts, not scoped to the creating account.
- AC-20: forms data must be strictly isolated per submitting User — no cross-account read path, for any role including Admin/Creator.
- PRD §6.1: "AuthZ/AuthN impact... Runtime is reachable by all three roles, scoped to published forms and, for forms data, scoped to the submitting User only."

## Considered options

1. **Single shared instance, isolation only at the forms-data/User level** — one deployment, one database. Schemas and templates are shared across every Admin/Creator (as AC-11 already requires). Forms data is isolated per submitting User (as AC-20 already requires). No organizational/business-client concept exists in the data model at all.
2. **Organizational multi-tenancy** — introduce a `tenant`/`client` entity above User, add a `tenant_id` (or equivalent) to `schemas`, `templates`, and `forms_data`, and scope every query by tenant in addition to role and User.

## Decision outcome

**Chosen:** Option 1. The user's framing during this walk: "We need to separate data per client. Forms Schemas are common and shared (treat it as a built application). The BE instance is also shared, but each client (runtime user) has isolated data and can see and edit only own data." — this confirms the isolation unit is the **User** (AC-20's existing scope), not an organizational tenant above it. Schemas/templates stay globally shared per AC-11 as already specified; nothing in the PRD's roles, user stories, or acceptance criteria implies a business-client concept distinct from the User role. Introducing a `tenant_id` layer would add schema complexity (a new entity, a new FK on three tables, tenant-scoped queries everywhere) to solve isolation that AC-20 already delivers at the User level.

## Consequences

**Positive**

- No new entity, no new FK, no new query-scoping layer beyond what ADR-0001's `forms_data` table (`UNIQUE(schemaId, userId)`) already provides.
- Matches AC-11's explicit design: schemas/templates are a shared library across all Creators/Admins, not partitioned.
- Keeps the data model from ADR-0001 exactly as designed — no rework.

**Negative**

- If a future iteration genuinely needs to isolate different business clients' schemas/templates from each other (not just User-level forms-data isolation), this is a real re-platforming effort: a new `tenant` entity, a `tenant_id` FK backfilled onto `schemas`, `schemas_versions`, `templates`, and `forms_data`, plus tenant-scoping added to every query and every role-guard check.

**Neutral**

- The word "client" in this feature's vocabulary means "the User role, using Runtime" — not an organizational/business tenant. This should be reflected in `docs/CONTEXT.md` if the term causes confusion later (flagged for a `sdlc:fix-term` follow-up).

## Links

- PRD: [[../PRD.md]]
- SAD: [[../sad.md]] §9 (resolves the PRD §8 open question; conceptually belongs to the §4 strategic layer)
- Related ADR: [[0001-dedicated-forms-data-and-templates-tables]]
