import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

config({ path: '.env.local' });

export default defineConfig({
    schema: './backend/db/schema.ts',
    out: './backend/db/migrations',
    dialect: 'turso',
    dbCredentials: {
        url: process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || 'file:./local.db',
        authToken: process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN,
    },
});
