import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../../../.env') });

import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from '../../db/schema';
import {
  formsData,
  roles,
  schemas,
  schemasTypes,
  schemasVersions,
  users,
} from '../../db/schema';
import { FormsDataService } from './forms-data.service';

/**
 * sad §10 "Authorization & data-isolation integrity" names this test
 * explicitly: a cross-account forms-data isolation test asserting account
 * B's read never returns account A's submitted values (AC-20) — a mocked
 * DB can't prove real filtering, so this runs against the real dev DB.
 */
describe('FormsDataService — cross-account isolation (sad §10, AC-20)', () => {
  const client = postgres(process.env['DATABASE_URL'] as string);
  const db = drizzle(client, { schema });
  const service = new FormsDataService(db);

  let schemaId: string;
  let adminUserId: string;
  let regularUserId: string;

  beforeAll(async () => {
    const formType = await db.query.schemasTypes.findFirst({
      where: eq(schemasTypes.name, 'form'),
    });
    const adminRole = await db.query.roles.findFirst({
      where: eq(roles.name, 'admin'),
    });
    const userRole = await db.query.roles.findFirst({
      where: eq(roles.name, 'user'),
    });
    if (!formType || !adminRole || !userRole) {
      throw new Error(
        'expected seeded schemas_types/roles to exist for this test',
      );
    }

    const [createdSchema] = await db
      .insert(schemas)
      .values({ title: 'Isolation Test Form', typeId: formType.id, schema: {} })
      .returning();
    schemaId = createdSchema.id;
    await db
      .insert(schemasVersions)
      .values({ schemaId, version: 'v1', schema: {} });

    const [adminUser] = await db
      .insert(users)
      .values({
        email: `isolation-admin-${Date.now()}@example.test`,
        passwordHash: 'not-a-real-hash',
        roleId: adminRole.id,
      })
      .returning();
    adminUserId = adminUser.id;

    const [regularUser] = await db
      .insert(users)
      .values({
        email: `isolation-user-${Date.now()}@example.test`,
        passwordHash: 'not-a-real-hash',
        roleId: userRole.id,
      })
      .returning();
    regularUserId = regularUser.id;
  });

  afterAll(async () => {
    await db.delete(formsData).where(eq(formsData.schemaId, schemaId));
    await db
      .delete(schemasVersions)
      .where(eq(schemasVersions.schemaId, schemaId));
    await db.delete(schemas).where(eq(schemas.id, schemaId));
    await db.delete(users).where(eq(users.id, adminUserId));
    await db.delete(users).where(eq(users.id, regularUserId));
    await client.end();
  });

  it("account B's read never returns account A's submitted values, even across roles", async () => {
    await service.submit(schemaId, adminUserId, { name: 'Admin Value' });
    await service.submit(schemaId, regularUserId, { name: 'User Value' });

    const adminRow = await service.getOwn(schemaId, adminUserId);
    const userRow = await service.getOwn(schemaId, regularUserId);

    expect(adminRow?.values).toEqual({ name: 'Admin Value' });
    expect(userRow?.values).toEqual({ name: 'User Value' });
    expect(adminRow?.values).not.toEqual(userRow?.values);
  });

  it("resubmitting overwrites the same account's row rather than duplicating (AC-17)", async () => {
    await service.submit(schemaId, adminUserId, { name: 'First' });
    await service.submit(schemaId, adminUserId, { name: 'Second' });

    const row = await service.getOwn(schemaId, adminUserId);
    expect(row?.values).toEqual({ name: 'Second' });

    const allRowsForSchema = await db.query.formsData.findMany({
      where: eq(formsData.schemaId, schemaId),
    });
    const adminRows = allRowsForSchema.filter((r) => r.userId === adminUserId);
    expect(adminRows).toHaveLength(1);
  });

  it("deleteOwn removes only the caller's own row (AC-29)", async () => {
    await service.submit(schemaId, adminUserId, { name: 'To be deleted' });
    await service.submit(schemaId, regularUserId, { name: 'Untouched' });

    await service.deleteOwn(schemaId, adminUserId);

    expect(await service.getOwn(schemaId, adminUserId)).toBeUndefined();
    expect((await service.getOwn(schemaId, regularUserId))?.values).toEqual({
      name: 'Untouched',
    });
  });
});
