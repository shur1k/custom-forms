---
status: Draft
owner: "Oleksandr Vorovchenko"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-08-06"
feature_size: L
stage: "04-05"
ticket: "<TBD>"
target_surfaces: [backend-service, web-frontend]  # decided §4 — both already exist in the brownfield (server/api NestJS, client/apps/* Angular federation) and PRD US-04+ requires extending both. Read (never re-derived) by api-forge/complete-sequence-diagrams/break-tasks/plan-tests/review-feature → _shared/surfaces.md
---

# Software Architecture Document — custom-forms

<!-- Stages 04-05 → see sdlc/plugin/skills/architecture-design/SKILL.md -->
<!-- 12 Arc42 sections. Empty sections — <!-- N/A: <one-line reason> -->. -->
<!-- C4 Context (L1) lives inline in §3. C4 Container (L2) lives inline in §5. -->
<!-- §6 Runtime view seeds the primary flow(s) here; complete-sequence-diagrams (stage 06) then -->
<!--    fills §6 with every critical flow / §5 AC — no cap. -->
<!-- Numbers in §10 come VERBATIM from PRD §6 NFR — no inventing, no rounding. -->
<!-- Заповнений приклад: див ~/sources/beerphp/beerlms/docs/features/course-lesson-mvp/sad.md -->

## 1. Introduction and goals

**Intent.** Custom-forms is the first step toward a broader no-code application-building platform. A Creator (technical, implementation-facing consultant) assembles a working form screen from a curated component library without writing code — removing the developer-queue bottleneck on screen delivery. A User fills in a Creator-published form and sees their own previously-entered values when they return. Access is governed by three roles — Admin, Creator, User — from day one.

**Top-3 quality goals (1-liners; full scenarios in §10):**

1. Rendering correctness under component-library evolution — Runtime never renders a published form blank or silently broken, even after the curated component library changes.
2. Authorization & data-isolation integrity — the three-role access boundary and per-User forms-data isolation hold under every access path.
3. Responsiveness — Designer save and Runtime render stay within their p95 latency targets.

**Stakeholders.**

| Role | Interest | Sign-off owner? |
|---|---|---|
| Admin | Governs Designer access + user roles | No |
| Creator | Assembles/publishes forms, manages schemas/templates | No |
| User | Fills published forms, owns their own submitted data | No |
| Tech Lead | SAD approval | Yes |
| Security Lead | Reviews the new authz boundary + data-isolation guarantee | Yes |

<!-- Decision overrides (¶4) — populated by the Step-7 critic resolution loop, empty otherwise.       -->
<!-- Each: «Decision override: <headline> — rationale: <reason>» so downstream skills see the choice.  -->

## 2. Constraints

**Technical.**
- Angular 21 (zoneless, Signals) + NX 22.6.1 monorepo
- `@angular-architects/native-federation` (esbuild-based Module Federation, NOT Webpack) — shell host (port 4200) + federated remotes: designer (4201), runtime (4202), user-administration (4203)
- NestJS 11 backend (`server/api`), Express platform
- Drizzle ORM 0.40 + PostgreSQL (`postgres` driver), JSONB columns for schema storage
- Auth: `@nestjs/jwt` + `passport-jwt`; `bcryptjs` (12 rounds) for password hashing
- `@nestjs/swagger` — OpenAPI docs at `/api/docs`

**Organisational.**
- Feature size **L** (`.size`) — full 12-section SAD, 10-15 ADRs expected
- Hard build-sequence constraint (PRD §1): US-01/02/03 (auth + role administration) ship before US-04+ (Designer/Runtime capabilities)
- No deadline / effort budget stated in PRD → `<TBD by PM>` (see §11 Risks)

**Conventions.**
- No repo-level `CLAUDE.md` — conventions below are inferred from the existing (brownfield) code at commit `0a09af4`, not an authored standard
- Backend: one NestJS module per domain (`app/{auth,schemas,users,drizzle}`), each with `.controller.ts` / `.service.ts` / `.module.ts` / `dto/`; services inject `DRIZZLE_DB` and use Drizzle relational queries
- Frontend: NX apps = shell (host) + federated remotes; shared libs (`http`, `auth`, `ui`, `api-client`); standalone Angular components + signals
- ID strategy: UUID v4 (`uuid('...').primaryKey().defaultRandom()`)
- DTO naming: `{Action}{Entity}Dto`

**Regulatory / external.**
- PRD §6.1: Security review **Required** — new authz boundary (3 roles), new forms-data isolation guarantee, unresolved personal-data-field question
- Data classification: internal
- Named abuse cases to defend: config injection (XSS), draft leak, cross-User forms-data leak, component-library tampering, spam screen creation (rate-limit 30 saves/min/account)

## 3. Context and scope

Custom-forms is an internal no-code tool: a Creator (or Admin) assembles a form screen from a curated component library in Designer and publishes it; a User then fills that published form in Runtime and sees their own previously-submitted values on return. Admin additionally governs who holds which role. The system is self-contained — PRD §3 explicitly puts external-system integrations and workflow automation out of scope for this iteration, and the existing auth is homegrown (JWT/passport), not an external Identity Provider.

**External systems (in / out):**

| Actor or system | Type | Interaction |
|---|---|---|
| Admin | Person | Manages user accounts/roles, uses Designer |
| Creator | Person | Assembles/publishes forms + templates in Designer |
| User | Person | Fills/revisits own forms data in Runtime |
| *(none)* | — | No external systems this iteration — deliberate (PRD §3 non-goal: workflow automation / external integrations out of scope; auth is self-hosted JWT, not an external IdP) |

**C4 Context (L1):**

```mermaid
C4Context
    title custom-forms — System Context

    Person(admin, "Admin", "governs Designer access + user roles")
    Person(creator, "Creator", "assembles + publishes forms in Designer")
    Person(user, "User", "fills + revisits own forms data in Runtime")

    System(customforms, "Custom-forms", "No-code form builder: Designer (build/publish) + Runtime (fill/revisit)")

    Rel(admin, customforms, "Manages users/roles, uses Designer", "HTTPS")
    Rel(creator, customforms, "Builds/publishes forms in Designer", "HTTPS")
    Rel(user, customforms, "Fills/revisits own forms data in Runtime", "HTTPS")
```

## 4. Solution strategy

**Target surface(s) (the first decision — what's being built):** `[backend-service, web-frontend]`

Both surfaces already exist in the brownfield (`server/api` NestJS backend; `client/apps/{shell,designer,runtime,user-administration}` Angular federation) and PRD US-04+ requires extending both — this is a continuation, not a fresh multi-surface pick, so it stays inline (no ADR): the "legitimate alternative" blast-radius criterion doesn't fire when the alternative is excluded by an existing, already-shipped architecture.

**UI-architecture (web-frontend):** Continue the existing SPA + `@angular-architects/native-federation` model — shell host + federated remotes, no SSR. custom-forms is an internal tool with no SEO requirement, so there's no product signal to justify introducing a second rendering paradigm. Inline, no ADR (same reasoning as the surface pick — this extends, not replaces, the established architecture).

**Top strategic choices (the seeds for ADRs):**

1. **Dedicated `forms_data` + `templates` tables** (→ ADR-0001) — forms data (AC-17: one row per User per form, upsert not history) and templates (AC-24: independent copy, no ongoing link to source) are new entities absent from the brownfield's `schemas` / `schemas_versions` tables. Two new tables keep each entity's invariants as native constraints instead of overloading tables whose existing semantics mean something else.
2. **Per-endpoint `@Roles()` + the existing `RolesGuard`** (→ ADR-0002) — the brownfield already implements `RolesGuard`/`@Roles()` under `server/api/src/app/users/` but never applies it to `/schemas`; PRD's new authz requirements (AC-05, AC-06) need it applied across `schemas`/`forms-data`/`templates`/`users` controllers. Runtime endpoints stay guard-open to all three roles and rely on `userId`-scoping instead (AC-20 is identity-scoping, not role-gating).
3. **UI-architecture: SPA consuming the backend API, unchanged from the brownfield** — see above; inline, no ADR.

Each tactical decision in later sections should be traceable to one of these strategic seeds. Tactical decisions that *contradict* a strategic choice are red flags — surface them in §11 Risks.

## 5. Building block view

Backend stays a layered NestJS module-per-domain style (already the brownfield convention — no divergence proposed). Two new modules land alongside the existing three, per ADR-0001's table split: `forms-data` and `templates`. The `schemas` module gains one new cross-module read (into `forms-data`) to enforce AC-10b's field-removal guard — before allowing a field removal, `schemas.service` asks `forms-data.service` whether any submitted row has a value under that field's key.

**Internal decomposition (backend, `server/api/src/app/`):**
```
app/
├── auth/          <existing — login/register, JWT strategy>
├── users/         <existing — user CRUD + role assignment, RolesGuard>
├── schemas/       <existing, extended — + field-removal guard (AC-10b) reads forms-data>
├── forms-data/    <NEW (ADR-0001) — per-User submitted values, upsert-on-resubmit (AC-17)>
├── templates/     <NEW (ADR-0001) — named independent schema copies (AC-21/AC-24)>
└── drizzle/       <existing — DB module>
```

**Internal decomposition (frontend, `client/apps/`):**
```
designer/src/app/
├── form-list/            <existing, extended — also lists templates (AC-11)>
├── form-editor/          <existing — canvas/palette/properties-panel>
├── schema-viewer/        <existing>
└── template-actions/     <NEW — save-as-template, create-from-template>

runtime/src/app/          <currently empty routes — filled this iteration>
├── form-list/            <NEW — AC-30 temporary discovery list of published forms>
└── form-viewer/          <NEW — render, fill, prefill own data, delete own data>
```

**C4 Container (L2):**

```mermaid
C4Container
    title custom-forms — Containers

    Person(admin, "Admin")
    Person(creator, "Creator")
    Person(user, "User")

    Container_Boundary(app, "Custom-forms") {
        Container(web, "Web frontend", "Angular 21 SPA, native-federation (shell + designer/runtime/user-administration remotes)", "Designer build/publish UI, Runtime fill/revisit UI, user administration UI")
        Container(api, "Backend API", "NestJS 11", "REST API — auth, schemas, forms-data, templates, users")
    }

    ContainerDb(db, "PostgreSQL", "Drizzle ORM 0.40", "roles, users, schemas, schemas_types, schemas_versions, forms_data, templates")

    Rel(admin, web, "Manages users/roles, uses Designer", "HTTPS")
    Rel(creator, web, "Builds/publishes forms", "HTTPS")
    Rel(user, web, "Fills/revisits forms", "HTTPS")
    Rel(web, api, "calls", "JSON/HTTPS")
    Rel(api, db, "reads/writes", "Drizzle/postgres")
```

The 4 federated frontend apps (shell/designer/runtime/user-administration) are shown as one `web` container since they're one declared `web-frontend` surface at this zoom level — the federation split is pre-existing deployment infrastructure, not new architecture this feature introduces.

## 6. Runtime view

architecture-design seeds the primary flows below; `complete-sequence-diagrams` (stage 06) then covers every remaining critical flow / §5 AC.

**Critical flow 1: Creator assembles and publishes a form**

```mermaid
sequenceDiagram
    actor Creator
    participant Web
    participant API
    participant DB
    Creator->>Web: places components, saves draft
    Web->>API: create/update schema (draft)
    API->>DB: write schemas row
    DB-->>API: ok
    API-->>Web: schema saved
    Creator->>Web: submits publish action
    Web->>API: publish schema
    API->>DB: validate at least one component (AC-09), write schemas_versions snapshot
    DB-->>API: ok
    API-->>Web: published
    Web-->>Creator: confirmation
```

**Critical flow 2: User fills, submits, and later returns to a published form**

```mermaid
sequenceDiagram
    actor User
    participant Web
    participant API
    participant DB
    User->>Web: opens published form
    Web->>API: get form + own forms data
    API->>DB: read schema, read forms_data where userId = me
    DB-->>API: schema plus existing values if any
    API-->>Web: form prefilled or empty
    User->>Web: fills required fields, submits
    Web->>API: submit forms data
    API->>DB: upsert forms_data by schemaId and userId
    DB-->>API: ok
    API-->>Web: submission confirmed
```

**Critical flow 3: Runtime shows a visible error placeholder for a broken component (AC-16)**

```mermaid
sequenceDiagram
    actor User
    participant Web
    participant API
    User->>Web: opens published form
    Web->>API: get form config
    API-->>Web: schema, including a component with a broken data binding
    alt component renders successfully
        Web-->>User: shows the rendered field
    else component raises an error or cannot resolve its bound data
        Web-->>User: shows a visible error placeholder for that component only
    end
```

## 7. Deployment view

<!-- 🎯 Навіщо: ТОПОЛОГІЯ, яку DevOps має знати без читання Helm-чартів — скільки реплік,  -->
<!--           де живе фоновий обробник, ПРИ ЯКИХ ЧИСЛАХ масштабуємось.                     -->
<!-- 📋 Що писати: 2-3 речення про топологію + метрики + алерти + конкретні числа-пороги.   -->
<!-- 📌 Приклад: «500 IC → партиціонування за кварталом» (не «при зростанні подумаємо»).    -->
<!-- 🎯 Можна N/A для XS/S функцій, що переюзають існуюче розгортання без змін.            -->

<Topology in 2-3 sentences. Where it runs (k8s / VM / serverless), replicas, scaling thresholds.>

**Monitoring:**
- <Metrics — e.g. Prometheus `<metric_name>`>
- <Alerts — e.g. "outbox lag > 10 min → page on-call">
- <Tracing — e.g. OpenTelemetry HTTP spans>

**Scaling thresholds:**
- <e.g. 500 IC × 5 goals × 26 checkpoints/Q = 65k rows/year — comfortable in one table>
- <e.g. partitioning by quarter at >500k rows/year>

<!-- For XS/S that doesn't change deployment: <!-- N/A: feature reuses existing deployment unit -->. -->

## 8. Crosscutting concepts

<!-- 🎯 Навіщо: НАСКРІЗНІ ПАТЕРНИ, які перетинають кілька модулів: логування, помилки,    -->
<!--           авторизація, ID strategy, outbox, кеш. ⭐ Друга найгустіша секція.          -->
<!--           Якщо патерн всередині одного модуля — він НЕ сюди. Якщо це конвенція        -->
<!--           проєкту в цілому — у CLAUDE.md.                                              -->
<!-- 📋 Що писати: таблиця концепт / конвенція / де визначено. Один рядок на концепт.      -->
<!-- 📌 Приклад: «UUID v7 (час+випадковий, сортується) у app-layer» — як default з CLAUDE.md. -->

| Concept | Convention | Where defined |
|---|---|---|
| Logging | <e.g. structured slog, fields `module=<name>`> | <CLAUDE.md §X or here> |
| Authentication | <e.g. JWT via session middleware> | <CLAUDE.md §X> |
| Error handling | <e.g. domain sentinel → ports/errors.go → apperr JSON> | <CLAUDE.md §X> |
| ID strategy | <e.g. UUID v7 in app layer> | <CLAUDE.md §X> |
| Internationalisation | <e.g. N/A, English only> | — |
| Observability | <e.g. OpenTelemetry on HTTP boundaries> | — |
| Outbox / events | <module-specific patterns, if any> | <here> |

## 9. Architecture decisions

<!-- 🎯 Навіщо: ЗВОРОТНИЙ ІНДЕКС на папку adr/. `ls adr/` дає файли, §9 дає семантику —    -->
<!--           чому вони існують, до якого зрізу SAD привʼязані, у якому статусі.           -->
<!-- 📋 Що писати: таблиця з 4 колонками. Один рядок на ADR. Mixed status — це OK.         -->
<!-- 📌 Приклад: «0001 | Зберігати урок як таблицю блоків | Accepted | §4».                -->

| # | Title | Status | Section |
|---|---|---|---|
| <NNNN> | <imperative — e.g. "Use sliding window for rate limiting"> | Accepted | §<N> |
| <NNNN> | <imperative — e.g. "Co-locate outbox worker in API process"> | Accepted | §<N> |

ADR files live under `docs/features/<slug>/adr/NNNN-<title>.md`.

## 10. Quality requirements

<!-- 🎯 Навіщо: ДЕРЕВО ЯКОСТЕЙ (Quality Tree) — беремо мету з §1 і розкладаємо на          -->
<!--           конкретні листя: тести, метрики, конфіги, drill-и. ⭐ Без §10 §1 — це       -->
<!--           маніфест. З §10 кожна декларація мапиться на щось, ЩО МОЖНА ДОВЕСТИ.        -->
<!-- 📋 Що писати: на кожну якість з §1 — When / Then / How verify. Числа з PRD §6 NFR     -->
<!--           ДОСЛІВНО (не округлюй p95 ≤250мс до ≤300мс — це F6-помилка критика).        -->
<!-- 📌 Приклад: «p95 ≤500 мс на UPDATE блоку, перевіримо k6 load test 100 req/s».        -->

Each top-3 goal from §1 expanded into a full scenario:

**QG-1. <quality attribute>**
- **When:** <trigger condition>
- **Then:** <expected behavior with numbers from PRD NFR>
- **How verify:** <test / chaos drill / load test / observability>

**QG-2. <quality attribute>**
- **When:** <trigger>
- **Then:** <expected>
- **How verify:** <how>

**QG-3. <quality attribute>**
- **When:** <trigger>
- **Then:** <expected>
- **How verify:** <how>

## 11. Risks and technical debt

<!-- 🎯 Навіщо: ⭐ збирає ВСЕ, що може зламатись — і не лише технічне. Без §11 ризики   -->
<!--           обговорюються на стендапах і губляться; борг лишається у голові того,    -->
<!--           хто його прийняв.                                                          -->
<!-- 📋 Що писати: таблиця ризик/борг — серйозність — мітигація — власник. Технічний    -->
<!--           борг окремою секцією.                                                      -->
<!-- 📌 Приклад: «EM не пушить — member не оновлює дані | High | …». Перший ризик —      -->
<!--           часто продуктовий, не технічний. Це нормально.                            -->

<!-- Severity column literals: Low / Medium / High for regular risks; "Open question" for rows
     created by Step-7 `Save as Open Question` resolutions (see references/socratic-loop.md). -->

| Risk / debt | Severity | Mitigation | Owner |
|---|---|---|---|
| <e.g. Outbox lag may reach hours during downstream outage> | Medium | <Alert >10 min, on-call playbook, retry backoff> | <DevOps> |
| <e.g. No event schema versioning in v1> | Medium | <ADR-NNNN planned for v2, graceful handling of unknown fields> | <Backend> |
| Open architectural decision: <decision-headline> | Open question | Resolve before <stage trigger or YYYY-MM-DD>; <inline rationale from Step-7 Save-as-OQ> | <owner> |

**Accepted debt (acceptable in v1, plan to fix later):**
- <e.g. Goal entity is not versioned (immutable) — OK for v1, may need audit versioning in v2>

## 12. Glossary

<!-- 🎯 Навіщо: ⭐ СЛОВНИК ДОМЕНУ, який припиняє суперечки через рік («checkpoint —      -->
<!--           weekly чи biweekly? Quarter — календарний чи фіскальний?»).                -->
<!-- 📋 Що писати: таблиця термін / значення. Бізнес-терміни + технічні вперемішку.       -->
<!--           Один термін може мати дві мови у заголовку: «Goal (Обʼєктив)».              -->
<!-- 📌 Приклад: «Lesson | урок усередині курсу, що складається з блоків (text, video)». -->

| Term | Meaning |
|---|---|
| <e.g. Goal> | <quarterly intent in statement form> |
| <e.g. KR> | <Key Result — measurable target linked to a Goal> |
| <e.g. Checkpoint> | <bi-weekly progress update on a KR> |
