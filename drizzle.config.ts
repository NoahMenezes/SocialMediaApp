import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

config({ path: '.env.local' });

const dbUrl = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || 'file:./local.db';
const dbToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

console.log('🔌 Drizzle Config:');
console.log('   URL:', dbUrl);
console.log('   Token:', dbToken ? '***PRESENT***' : 'MISSING');

export default defineConfig({
    schema: './backend/db/schema.ts',
    out: './backend/db/migrations',
    dialect: 'turso',
    dbCredentials: {
        url: dbUrl,
        authToken: dbToken,
    },
});
