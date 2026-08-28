# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Custom Forms — a no-code Designer + Runtime app builder. **Creators** assemble multi-field forms/screens from a curated component kit (Designer); **Users** fill them in and revisit their own previously entered data (Runtime); **Admins** manage users/roles. See `docs/PROJECT.md` for the project scope and feature index, and `README.md` for a quick overview.

## Stack & structure

Nx 22 monorepo (npm, single root `package.json` — no per-project package.json files).

- `server/api/` — NestJS 11 REST API (`server/api-e2e/` for its e2e tests). Domain modules under `server/api/src/app/`: `auth`, `users`, `schemas`, `forms-data`, `templates`, `drizzle` (DB module).
- `client/apps/` — Angular 21 SPA using `@angular-architects/native-federation` (module federation): `shell` (host), `designer`, `runtime`, `user-administration` (each has a paired `-e2e` Playwright project).
- `client/libs/` — `ui` (Storybook component library), `auth`, `http`, `api-client` (generated, see below — don't hand-edit).
- DB: PostgreSQL via Drizzle ORM. Schema at `server/api/src/db/schema.ts`, migrations at `server/api/src/db/migrations/`.
- `docs/PROJECT.md` — project scope + feature index; `docs/idea-brief.md`, `docs/CONTEXT.md`, `docs/adr/` — project-wide SDLC artifacts; `docs/features/<feature>/` (one dir per feature: `user-administration`, `designer` + its sub-features `forms-editor`/`schema-viewer`/`template-actions`, `runtime`) — per-feature PRD/SAD/ADRs; `docs/architecture-map.md` is the repo-wide architecture map.

## Commands

Nx target names are **non-default** in this repo:

- Lint target is `eslint:lint`, not `lint` — e.g. `nx run <project>:eslint:lint`.
- E2E target is `e2e` (Playwright plugin).

Common scripts (see root `package.json` for the full list):

- `npm run api:serve` / `api:build` / `api:test` — NestJS API.
- `npm run api:generate-client` — regenerates `client/libs/api-client` from the API's OpenAPI spec; don't hand-edit that lib.
- `npm run db:generate` / `db:migrate` / `db:push` / `db:studio` — Drizzle migrations (drizzle-kit).
- `npm run db:seed` — runs `server/api/src/db/seed.ts` via tsx.
- `npm run fe:serve` — serves all 4 frontend apps in parallel; `fe:serve:shell|designer|runtime|user-admin` for one app.
- `npm run fe:serve:shell:dev` — dev mode: shell served live, other remotes served static (module-federation dev setup).
- `npm run fe:build` — production build of all 4 apps; `fe:build:<app>` for one.
- `npm run fe:storybook` / `fe:storybook:build` — Storybook for the `ui` lib.

Dev database: `docker-compose.dev.yml` (Postgres 16, port 5432) — needs `DB_NAME`, `DB_USER`, `DB_PASSWORD` in `.env`. Copy `.env.example` to `.env` and fill in real values before running it.

## Conventions

- Import order is enforced by `eslint-plugin-simple-import-sort`: external deps first, then `@custom-forms/*` internal + relative imports, with a blank line between groups.
- Module boundaries between Nx projects are enforced via `@nx/enforce-module-boundaries`.
- Prettier: single quotes (`.prettierrc`).
- Backend follows a layered, module-per-domain NestJS style — new backend features get their own module under `server/api/src/app/`, not folded into an existing one whose invariants mean something else (see `sad.md` §4 for the reasoning behind the `forms-data`/`templates` split).
- Branch naming: `type/CF-<ticket-number>-short_description` (e.g. `feature/CF-42-template-actions`). `type` is one of `feature`, `fix`, `refactor`, `chore`, `hotfix`, etc.
- Commit message naming: `[CF-<ticket-number>] <message>` (e.g. `[CF-42] Add save-as-template action`).

## No CI

There is no `.github/workflows` — no CI is configured. Run lint/test/build locally before considering work done.
