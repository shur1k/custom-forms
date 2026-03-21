import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  schema: './apps/api/src/db/schema.ts',
  out: './apps/api/src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env['DATABASE_URL']! },
});
