import * as dotenv from 'dotenv';
dotenv.config();

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { roles, schemasTypes } from './schema';

const client = postgres(process.env['DATABASE_URL']!);
const db = drizzle(client);

async function seed() {
  console.log('Seeding roles...');
  await db
    .insert(roles)
    .values([
      { name: 'user',  description: 'Standard user' },
      { name: 'admin', description: 'Administrator' },
    ])
    .onConflictDoNothing();

  console.log('Seeding schemas_types...');
  await db
    .insert(schemasTypes)
    .values([
      { name: 'form',      description: 'Form with input fields' },
      { name: 'page',      description: 'Free-form page with components' },
      { name: 'dashboard', description: 'Dashboard with widgets' },
    ])
    .onConflictDoNothing();

  console.log('Seed complete.');
  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
