import * as dotenv from 'dotenv';
dotenv.config();

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import * as schema from './schema';
import { roles, schemasTypes, users } from './schema';

const client = postgres(process.env['DATABASE_URL']!);
const db = drizzle(client, { schema });

async function seed() {
  console.log('Seeding roles...');
  await db
    .insert(roles)
    .values([
      { name: 'user', description: 'Standard user' },
      { name: 'admin', description: 'Administrator' },
      {
        name: 'superuser',
        description: 'Super-administrator with full access',
      },
    ])
    .onConflictDoNothing();

  console.log('Seeding schemas_types...');
  await db
    .insert(schemasTypes)
    .values([
      { name: 'form', description: 'Form with input fields' },
      { name: 'page', description: 'Free-form page with components' },
      { name: 'dashboard', description: 'Dashboard with widgets' },
    ])
    .onConflictDoNothing();

  console.log('Seeding superuser account...');
  const superuserRole = await db.query.roles.findFirst({
    where: eq(roles.name, 'superuser'),
  });
  if (superuserRole) {
    // For pet project only. Don't do this in production seeding scripts.
    const passwordHash = await bcrypt.hash('$uperUser_25', 12);
    await db
      .insert(users)
      .values({ email: 'superuser@test.com', passwordHash, roleId: superuserRole.id })
      .onConflictDoNothing();
  }

  console.log('Seed complete.');
  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
