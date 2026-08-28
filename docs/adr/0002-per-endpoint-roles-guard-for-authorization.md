---
status: Accepted
owner: "Oleksandr Vorovchenko"
reviewers: []
updated_at: "2026-08-06"
feature_size: L
stage: "04-05"
ticket: "<TBD>"
---

# 0002 — Enforce the three-role model with a per-endpoint @Roles() + RolesGuard

- **Status:** Accepted
- **Date:** 2026-08-06
- **Deciders:** Architect (Oleksandr Vorovchenko) + user, during the §4 Socratic walk

## Context

The brownfield scan of commit `0a09af4` found `RolesGuard` and the `@Roles()` decorator already implemented under `server/api/src/app/users/`, but not applied to the `/schemas` controller — those endpoints currently require only `JwtAuthGuard` (proves *who* you are, not *what* you're allowed to do). PRD introduces new authorization requirements that don't exist in the reference module: AC-06 (Designer reachable only by Admin/Creator), AC-05 (only Admin manages users/roles), plus the two new modules from ADR-0001 (`forms-data`, `templates`) that also need role-gated write paths and User-scoped read paths. PRD §6.1 explicitly marks this security review as Required.

## Decision drivers

- AC-05 (US-02): only Admin creates users / changes role assignments.
- AC-06 (US-03): Designer reachable only by Admin and Creator; User role denied with an explanation.
- AC-20 (US-07): Runtime forms-data reads must be scoped to the requesting User regardless of role — this is identity-scoping, not role-gating, so it composes with (not replaces) the role guard.
- PRD §3 non-goal: "Field-level or screen-level permission granularity beyond the three roles" — out of scope this iteration, which rules out a general-purpose policy engine as overkill.
- PRD §6.1: "Security review: Required — new authz boundary."

## Considered options

1. **Per-endpoint `@Roles()` decorator + the existing `RolesGuard`** — apply the already-implemented guard to every controller (`schemas`, `forms-data`, `templates`, `users`); Runtime read/submit endpoints stay open to all three roles and rely on `userId`-scoping instead of a role check.
2. **A centralized policy/ability layer (CASL-style)** — introduce a general "what can X do to Y" DSL instead of scattering decorators across controllers.

## Decision outcome

**Chosen:** Option 1. It reuses code that already exists in the brownfield (`RolesGuard` + `@Roles()`), needs no new dependency, and matches the PRD's own scope boundary — the non-goal explicitly rules out per-field/per-screen permission granularity, which is the exact problem a CASL-style engine solves. A general policy layer would be solving for a requirement the PRD deliberately deferred.

## Consequences

**Positive**
- No new library, no learning curve — extends a pattern already proven in the codebase.
- Each controller's role requirement is visible right at the route (`@Roles('admin')`), easy to audit for the security review PRD §6.1 requires.
- Composes cleanly with User-scoping (AC-20): role guard answers "can this role call this route," while the service layer separately filters forms-data reads by `userId` from the JWT — two independent, simple checks instead of one complex rule engine.

**Negative**
- Every new endpoint must remember to add the decorator — no structural guarantee against forgetting it (mitigated by a review checklist / lint rule, not by the architecture itself).
- If a future iteration needs finer-grained (per-field/per-screen) permissions, this decision will need to be revisited — but that's explicitly out of scope now (PRD §3 non-goal).

**Neutral**
- Runtime endpoints (form fetch/submit/delete-own-data) stay guard-open to all three roles; their protection is identity-scoping (`userId` match), not role-gating — a different mechanism, deliberately, per AC-20.

## Links

- PRD: [[../PRD.md]]
- SAD: [[../sad.md]] §4
- Related ADR: [[0001-dedicated-forms-data-and-templates-tables]]
