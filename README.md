# Custom Forms

A no-code app builder MVP: **Creators** assemble multi-page forms/screens from a curated component library in the **Designer**, and **Users** fill them in through the **Runtime**, revisiting their own previously entered data on later visits. **Admins** manage user accounts and roles.

The MVP validates whether Angular can fully render a dynamic, config-driven UI before investing further in a full no-code product. See `docs/features/custom-forms/idea-brief.md`, `PRD.md`, and `sad.md` for the full problem statement, requirements, and architecture.

## Stack

- **Backend**: NestJS 11 REST API, PostgreSQL via Drizzle ORM.
- **Frontend**: Angular 21 SPA using `@angular-architects/native-federation` (module federation) — a `shell` host with `designer`, `runtime`, and `user-administration` federated remotes.
- **Monorepo**: Nx 22, npm workspaces (single root `package.json`).
- **Component library**: `client/libs/ui`, documented with Storybook.

## Project structure

```
server/api/            NestJS backend (auth, users, schemas, forms-data, templates, drizzle)
server/api-e2e/        Backend e2e tests
client/apps/shell/               Federation host app
client/apps/designer/            Form/screen builder
client/apps/runtime/             End-user fill/revisit UI
client/apps/user-administration/ User & role management UI
client/libs/ui/                  Shared component library (Storybook)
client/libs/auth/                Shared auth logic
client/libs/http/                Shared HTTP client setup
client/libs/api-client/          Generated API client (do not hand-edit)
docs/features/custom-forms/      Idea brief, PRD, SAD, ADRs for this feature
docs/architecture-map.md         Repo-wide architecture map
```

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in real values (database credentials, JWT secret, etc.).
3. Start the dev database:
   ```
   docker compose -f docker-compose.dev.yml up -d
   ```
4. Run migrations and seed data:
   ```
   npm run db:migrate
   npm run db:seed
   ```

## Running

- Backend API: `npm run api:serve`
- All frontend apps: `npm run fe:serve`
- A single frontend app: `npm run fe:serve:shell` / `fe:serve:designer` / `fe:serve:runtime` / `fe:serve:user-admin`
- Component library Storybook: `npm run fe:storybook`

## Testing & linting

- `nx test <project>` — unit tests (Vitest/Jest depending on project).
- `nx run <project>:eslint:lint` — lint (note: the lint target is named `eslint:lint`, not `lint`).
- `nx run <project>:e2e` — Playwright e2e tests, for projects with an `-e2e` counterpart.

There is no CI pipeline configured in this repo — run the above locally before merging.

## Database

Schema and migrations live under `server/api/src/db/` and are managed with Drizzle Kit:

- `npm run db:generate` — generate a new migration from schema changes.
- `npm run db:migrate` — apply migrations.
- `npm run db:push` — push schema directly (dev only).
- `npm run db:studio` — open Drizzle Studio.

## Contributing

Branch and commit naming: `type/CF-<ticket-number>-short_description`, e.g. `feature/CF-42-template-actions`. `type` is one of `feature`, `fix`, `refactor`, `chore`, `hotfix`, etc.
