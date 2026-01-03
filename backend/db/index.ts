import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Support both DATABASE_URL and TURSO_DATABASE_URL for flexibility
const databaseUrl = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || 'file:./local.db';
const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

const client = createClient({
    url: databaseUrl,
    authToken: authToken,
});

export const db = drizzle(client, { schema });
