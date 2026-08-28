---
status: Living
updated_at: '2026-08-28'
---

# Project — Custom Forms

Custom Forms is a no-code Designer + Runtime app builder. A **Creator** assembles multi-field forms/screens from a curated component kit (Designer); a **User** fills them in and revisits their own previously entered data (Runtime); an **Admin** manages users/roles. See `docs/idea-brief.md` for the original ideation and market/approach rationale, `docs/CONTEXT.md` for the shared domain glossary, and `docs/adr/` for project-wide architecture decisions (deployment topology, tenancy model, cross-feature data model, cross-feature authz mechanism).

`custom-forms` is the project name and scope — not a feature. Feature-level SDLC artifacts (PRD.md, sad.md, per-feature ADRs) live under `docs/features/<feature>/`, one directory per feature below.

## Features

- **[user-administration](./features/user-administration/PRD.md)** — account login, user/role management, Designer access gating (Admin/Creator/User roles).
- **[designer](./features/designer/PRD.md)** — the no-code authoring app. Split into sub-features:
  - **[forms-editor](./features/designer/forms-editor/PRD.md)** — assemble a form screen from curated components and publish it.
  - **[schema-viewer](./features/designer/schema-viewer/PRD.md)** — browse and view existing forms schemas and templates.
  - **[template-actions](./features/designer/template-actions/PRD.md)** — save a schema as a template, create a new form from a template, edit/delete schemas and templates.
- **[runtime](./features/runtime/PRD.md)** — fill in a published form, revisit and delete your own previously-submitted data.

## Project-wide architecture decisions

ADRs that constrain the whole project rather than one feature live in `docs/adr/`:

| #                                                                            | Title                                                                                                      |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [0001](./adr/0001-dedicated-forms-data-and-templates-tables.md)              | Store forms data and templates as two dedicated tables                                                     |
| [0002](./adr/0002-per-endpoint-roles-guard-for-authorization.md)             | Enforce the three-role model with a per-endpoint `@Roles()` + `RolesGuard`                                 |
| [0003](./adr/0003-docker-compose-single-vm-production-deployment.md)         | Deploy production as Docker Compose on a single VM                                                         |
| [0004](./adr/0004-single-shared-instance-no-organizational-multi-tenancy.md) | Run custom-forms as a single shared instance with per-User data isolation, no organizational multi-tenancy |

## Related

- `README.md` — quick repo overview.
- `docs/architecture-map.md` — repo-wide architecture map.
- `CLAUDE.md` — stack, structure, and conventions for this monorepo.
