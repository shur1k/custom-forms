---
status: Draft
date: '2026-09-12'
---

# Data-model audit — runtime

## Staged migrations

- `docs/features/runtime/migrations/01_create_forms_data.up.sql`
- `docs/features/runtime/migrations/01_create_forms_data.down.sql`

**Not yet in the live tree.** `implement`'s T1 (`layer: migration`) promotes these into `server/api/src/db/migrations/` at the real sequence number.

## Convention source + divergence

- Detected from `docs/architecture-map.md` §Migrations + the live `server/api/src/db/migrations/` + `drizzle.config.ts`: **drizzle-kit generated**, single forward-only `.sql` file per migration, zero-padded counter name (`NNNN_<generated-name>.sql`), `--> statement-breakpoint` separators, no hand-written down file — rollback is achieved by generating a new forward migration, not by an authored `.down.sql`.
- **Divergence flagged:** the `data-model`/`implement` pipeline convention stages a `.up.sql` + `.down.sql` pair. This repo's tool (drizzle-kit) doesn't emit a down file on its own. Resolution for T1 (promotion): edit `server/api/src/db/schema.ts` to add the `formsData` table + relations, then run `npm run db:generate` — drizzle-kit will diff the schema and generate the canonical live migration file; its DDL should match `01_create_forms_data.up.sql` verbatim (same columns/constraints). `01_create_forms_data.down.sql` is kept as the manual rollback statement to satisfy the task's "applies and reverts cleanly" DoD (`db:migrate` up, then apply `down.sql` directly, then re-migrate up) — not committed as a drizzle-kit-tracked migration itself.
- **Promote-time number hint:** next live migration is `0001_*` (repo currently only has `0000_unknown_night_nurse.sql`); `implement` assigns the final generated name via `db:generate`, not a hand-picked number.

## Self-checks

- **Naming:** feature-local ordinal `01_create_forms_data.*` — matches staging convention; live file name is drizzle-kit-generated at promote time.
- **Down reversibility:** `CREATE TABLE` → `DROP TABLE`; every constraint/index created in `up.sql` is dropped implicitly by the table drop. Pass.
- **FK indexes:** `schema_id` covered by the leading column of the composite unique index; `user_id` gets its own explicit `forms_data_user_id_idx`. Pass.
- **Convention adherence:** column naming, `timestamp with time zone`, `gen_random_uuid()` default, `uuid` PK, FK `ON DELETE cascade` phrasing all match `0000_unknown_night_nurse.sql`'s style. Pass.

## Drift detection

N/A — `forms_data` is a new table; no existing domain-layer struct to diff against.

## Open items

- None blocking. PRD §8's personal-data classification question remains open at the project level (sad.md §11 accepted debt: all `forms_data` values classified uniformly as "internal" this iteration) — does not change this schema's shape.

Next stage: `implement runtime` (resumed).
