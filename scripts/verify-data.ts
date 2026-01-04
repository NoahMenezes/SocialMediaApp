import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../backend/db/schema';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Use the explicit URL provided by the user if env var is missing/different, 
// just to verify the specific target the user cares about.
// However, since I can't put the token here securely without the user giving it, 
// I will rely on the process.env.TURSO_AUTH_TOKEN which MUST be present for the previous import to have worked.
// Current assumption: Import worked because .env.local WAS read.
// So I will start by printing what DB I am connecting to (masking token).

const dbUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
const dbToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN;

console.log('--- Connection Debug Info ---');
console.log('Target URL:', dbUrl);
console.log('Token Present:', !!dbToken);
console.log('-----------------------------');

if (!dbUrl || !dbToken) {
    console.error('CRITICAL: Missing Database URL or Token in environment!');
    process.exit(1);
}

const client = createClient({
    url: dbUrl,
    authToken: dbToken,
});

const db = drizzle(client, { schema });

async function check() {
    console.log('Checking counts in the database...');

    try {
        const newsCount = await db.select().from(schema.news);
        console.log(`✅ News Items: ${newsCount.length}`);

        const commentsCount = await db.select().from(schema.instagramComments);
        console.log(`✅ Instagram Comments: ${commentsCount.length}`);

        const profilesCount = await db.select().from(schema.instagramProfiles);
        console.log(`✅ Instagram Profiles: ${profilesCount.length}`);

        const postsCount = await db.select().from(schema.posts);
        console.log(`✅ Sample Posts: ${postsCount.length}`);

    } catch (e: any) {
        console.error('❌ Error querying database:', e.message);
        console.error('Full Error:', e);
    }
}

check();
