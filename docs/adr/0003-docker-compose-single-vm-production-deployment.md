---
status: Accepted
owner: "Oleksandr Vorovchenko"
reviewers: []
updated_at: "2026-08-06"
feature_size: L
stage: "04-05"
ticket: "<TBD>"
---

# 0003 — Deploy production as Docker Compose on a single VM

- **Status:** Accepted
- **Date:** 2026-08-06
- **Deciders:** Architect (Oleksandr Vorovchenko) + user, during the §7 Socratic walk

## Context

The brownfield repo (commit `0a09af4`) only has a dev-only `docker-compose.dev.yml` that runs Postgres 16 alone — the NestJS API and the 4 Angular apps (shell, designer, runtime, user-administration) are served via `nx serve`/`nx build` directly, with no production deployment defined yet. custom-forms is the first feature to ship user-facing Designer/Runtime capability into a real environment, so §7 needs to fix a concrete production topology rather than leave it as a gap.

## Decision drivers

- PRD §6 NFR: Availability 99.0% (monthly SLO, "internal MVP tool, business hours") — a modest target, not a high-availability requirement.
- PRD §6 NFR: Throughput ≥5 req/s per instance — comfortably handled by a single instance.
- PRD §2 Context: custom-forms is explicitly framed as an internal MVP tool, not a customer-facing product needing zero-downtime deploys.
- Constraint (§2 Organisational): feature size L, no stated deadline/effort budget for standing up new infrastructure orchestration.

## Considered options

1. **Docker Compose on a single VM** — extend the existing `docker-compose.dev.yml` pattern into a `docker-compose.yml` (prod): one Postgres 16 container, one NestJS API container (built via `nx build api`), one Nginx container serving the 4 Angular apps' production builds (`nx build --configuration=production`) and reverse-proxying `/api` to NestJS. No replicas.
2. **Kubernetes / managed container orchestration** — deploy each container as a Kubernetes Deployment with replica sets, health probes, and a managed load balancer.
3. **Managed PaaS (e.g. a cloud App Platform / Cloud Run-style service)** — offload the container runtime and scaling entirely to a managed platform.

## Decision outcome

**Chosen:** Option 1 — Docker Compose on a single VM. The 99.0% monthly SLO and ≥5 req/s throughput target are both comfortably met by a single instance, and the repo already has the Compose pattern in place for dev — this extends a convention already proven rather than introducing an orchestration platform (Kubernetes) or a new hosting paradigm (a managed PaaS) that this MVP's scale doesn't justify.

## Consequences

**Positive**
- Reuses the existing Docker Compose convention from `docker-compose.dev.yml` — one new prod-flavored compose file, no new deployment tooling to learn.
- Simple to operate for a small internal-tool team — one VM, one `docker compose up`, no cluster to manage.
- Directly proportionate to the PRD's stated NFR (99.0% SLO, ≥5 req/s) — doesn't over-engineer for scale this iteration doesn't need.

**Negative**
- Single point of failure — no automatic failover; a VM outage takes the whole system down until manually restarted or replaced.
- No horizontal scaling story — if throughput or availability requirements grow (e.g. beyond the internal-MVP phase), this decision needs revisiting and the migration to an orchestrated setup takes real effort (new Dockerfiles are proportionate now, but a later re-platform to Kubernetes is a separate, larger effort).

**Neutral**
- Requires two new Dockerfiles this feature didn't previously need: one for the NestJS API build, one for the Nginx + static Angular build layer.
- If a future iteration needs multi-instance scaling, this ADR would be superseded, not amended.

## Links

- PRD: [[../PRD.md]]
- SAD: [[../sad.md]] §7
- Related ADR: none
