---
name: add-api-endpoint
description: Add a new REST endpoint (route/handler) to the NestJS backend at server/api/src/app/ — whether that means a new method on an existing controller (auth, users, schemas, forms-data, templates) or a brand-new domain module. Use this whenever the user asks to "add an endpoint", "expose an API for X", "add a route", "add a controller method", "let users POST/PATCH/DELETE X", or describes backend work that clearly needs a new NestJS handler — even if they don't say "endpoint" explicitly (e.g. "users should be able to duplicate a schema", "add an admin action to suspend a user"). Covers DTO + validation, guards/roles, the Drizzle-backed service, test-first (controller + service specs), module registration, and api-client regeneration.
---

# Add a REST endpoint (NestJS + Drizzle)

This repo's backend is a layered, module-per-domain NestJS app under `server/api/src/app/`. Every existing module (`auth`, `schemas`, `users`) follows the same shape: `Controller` (HTTP + guards, no business logic) → `Service` (Drizzle queries + authorization/ownership checks) → `Module` (wires them together, registered in `app.module.ts`). Follow that shape rather than inventing a new one — consistency here is what lets any engineer (or Claude) predict where logic lives.

## 1. Decide: existing module or new module?

Read `docs/adr/0001-dedicated-forms-data-and-templates-tables.md` and `CLAUDE.md` first if you haven't — the rule already decided for this repo is: **a module owns one set of invariants**. Don't fold a new concern into a module whose invariants mean something else (e.g. per-User submitted form data doesn't belong in `schemas`, which owns schema definitions — that's why `forms-data` is a separate module per ADR-0001).

- **Endpoint fits an existing module's invariants** (e.g. another `schemas` action, another `users` admin action) → add to that module.
- **Endpoint is a new domain concern** (a table/concept that doesn't belong to any existing module's invariants) → scaffold a new module (§5 below).

If it's ambiguous, ask the user rather than guessing — a wrong call here means a painful module split later.

## 2. Write the tests first (RED)

This repo tests controllers and services independently, both with mocks — there's no need to hit a real database or spin up the whole app for unit coverage (e2e in `server/api-e2e` only smoke-tests `GET /api`). Write the test before the implementation so you have a concrete, checkable definition of "done," and so you're forced to decide the method signature and error cases up front rather than discovering them mid-implementation.

**Controller spec** — mock the service, override `JwtAuthGuard` (and `RolesGuard` if used) to `canActivate: () => true`, assert the controller calls the service with the right arguments. See `server/api/src/app/schemas/schemas.controller.spec.ts` for the exact pattern (`mockReq = { user: { userId, role } }`, `overrideGuard(...).useValue(...)`).

**Service spec** — build a mock Drizzle DB object shaped like `{ query: { <table>: { findFirst, findMany } }, insert, update, delete }`, inject it via `{ provide: DRIZZLE_DB, useValue: db }`. Cover: the happy path, the "not found" path (`NotFoundException`), and — if the resource is owned or role-scoped — both the "caller owns it" and "caller doesn't own it" (`ForbiddenException`) paths. See `schemas.service.spec.ts` for the chained-mock style (`db.insert.mockReturnValue({ values: jest.fn().mockReturnValue({ returning: ... }) })`).

Run `npm run api:test` (or the specific spec file) and confirm the new tests fail for the right reason (method doesn't exist yet) before writing implementation code.

## 3. DTO

One class per request body shape, in `<module>/dto/`, using `class-validator` decorators for runtime validation and `@nestjs/swagger` decorators (`ApiProperty` / `ApiPropertyOptional`) so it shows up correctly in the generated OpenAPI spec. Match `create-schema.dto.ts`: required fields get `@ApiProperty` + validators with `!`, optional fields get `@ApiPropertyOptional` + `@IsOptional()` + `?`.

## 4. Service (GREEN)

Inject `DRIZZLE_DB` (`@Inject(DRIZZLE_DB) private readonly db: DrizzleDB`) and put all query + authorization logic here — the controller should never touch the DB directly. Follow the existing error convention: `NotFoundException` when the resource doesn't exist, `ForbiddenException` when it exists but the caller isn't allowed to act on it (owner mismatch, wrong role). Look up the relevant table(s) in `server/api/src/db/schema.ts` — don't add a new table for this endpoint unless the underlying concept genuinely doesn't exist yet (that's a data-model change, bigger than "add an endpoint" — flag it to the user rather than improvising a schema).

Run the tests again until green, refactoring only the code you just wrote.

## 5. Controller

Add the HTTP-facing method: `@Get/@Post/@Patch/@Delete`, `@ApiOperation({ summary: ... })`, delegate the one line to the service, return whatever the service returns. Every controller in this repo is `@UseGuards(JwtAuthGuard)` at minimum. If the action should be restricted to a role (per ADR-0002, this repo enforces authorization with per-endpoint `@Roles()` + the existing `RolesGuard`, not ad-hoc checks scattered in services), also add `RolesGuard` to `@UseGuards(...)` and put `@Roles('superuser')` (or whichever role) on the controller or method — see `users.controller.ts`. Don't invent a different authorization mechanism.

## 6. New module scaffold (only if step 1 said "new module")

Mirror `schemas/`: `<name>.module.ts` (`@Module({ controllers: [...], providers: [...] })`), `<name>.controller.ts`, `<name>.service.ts`, `dto/`. Then register it in `server/api/src/app/app.module.ts`'s `imports: [...]` array — a module that isn't imported there is dead code, easy to forget.

## 7. Wire it up and verify

1. `npm run api:test` — full suite green, not just the new spec.
2. `nx run api:eslint:lint` — matches this repo's lint target naming (not the default `lint`).
3. `npm run api:generate-client` — regenerates `client/libs/api-client` from the running API's OpenAPI spec so frontend code gets typed access to the new endpoint. Never hand-edit anything under `client/libs/api-client` — it's fully generated and your edits will be silently overwritten next regen.
4. If the endpoint is meant to be reachable, do a quick manual sanity check (`npm run api:serve` + `curl`/Swagger UI at `/api` docs) rather than trusting types alone — a route can be perfectly typed and still be wired to the wrong guard or path.

## Definition of done

- [ ] Controller + service specs written first, watched fail, then pass
- [ ] DTO validates input, documented with Swagger decorators
- [ ] Guards match this repo's convention (`JwtAuthGuard` always; `RolesGuard` + `@Roles()` if role-restricted)
- [ ] Service holds the DB/authorization logic, not the controller
- [ ] New module (if any) registered in `app.module.ts`
- [ ] `api:test` and `api:eslint:lint` pass
- [ ] `api:generate-client` re-run if the frontend needs the new route
