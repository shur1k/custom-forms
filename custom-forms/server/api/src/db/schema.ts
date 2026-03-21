import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// Lookup tables (seeded at migration time)
// ---------------------------------------------------------------------------

export const roles = pgTable('roles', {
  id:          uuid('id').primaryKey().defaultRandom(),
  name:        text('name').notNull().unique(),
  description: text('description'),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const schemasTypes = pgTable('schemas_types', {
  id:          uuid('id').primaryKey().defaultRandom(),
  name:        text('name').notNull().unique(),
  description: text('description'),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const users = pgTable('users', {
  id:           uuid('id').primaryKey().defaultRandom(),
  email:        text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  roleId:       uuid('role_id')
                  .notNull()
                  .references(() => roles.id, { onDelete: 'restrict' }),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Schemas (forms, pages, dashboards — generic)
// ---------------------------------------------------------------------------

export const schemas = pgTable('schemas', {
  id:        uuid('id').primaryKey().defaultRandom(),
  ownerId:   uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),
  typeId:    uuid('type_id')
               .notNull()
               .references(() => schemasTypes.id, { onDelete: 'restrict' }),
  title:     text('title').notNull(),
  slug:      text('slug').unique(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema:    jsonb('schema').$type<Record<string, any>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Published version snapshots
// ---------------------------------------------------------------------------

export const schemasVersions = pgTable('schemas_versions', {
  id:          uuid('id').primaryKey().defaultRandom(),
  schemaId:    uuid('schema_id')
                 .notNull()
                 .references(() => schemas.id, { onDelete: 'cascade' }),
  version:     text('version').notNull(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema:      jsonb('schema').$type<Record<string, any>>(),
  publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Relations (required for Drizzle relational query API: `with: { type: true }`)
// ---------------------------------------------------------------------------

export const schemasRelations = relations(schemas, ({ one, many }) => ({
  type:     one(schemasTypes, { fields: [schemas.typeId],  references: [schemasTypes.id] }),
  owner:    one(users,        { fields: [schemas.ownerId], references: [users.id] }),
  versions: many(schemasVersions),
}));

export const schemasVersionsRelations = relations(schemasVersions, ({ one }) => ({
  schema: one(schemas, { fields: [schemasVersions.schemaId], references: [schemas.id] }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  role:    one(roles,   { fields: [users.roleId], references: [roles.id] }),
  schemas: many(schemas),
}));
