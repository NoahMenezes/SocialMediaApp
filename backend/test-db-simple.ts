/**
 * Simple Database Connection Test
 */

import { db } from './db';
import { users } from './db/schema';

async function simpleTest() {
    console.log('Testing database connection...\n');

    try {
        // Simple select query
        const result = await db.select().from(users).limit(1);
        console.log('✅ Database connection successful!');
        console.log(`Found ${result.length} user(s)\n`);

        if (result.length > 0) {
            console.log('Sample user:', result[0].name);
        }

        process.exit(0);
    } catch (error: any) {
        console.error('❌ Database connection failed!');
        console.error('Error:', error.message);
        console.error('\nPlease check:');
        console.error('1. DATABASE_URL in .env.local');
        console.error('2. Database file exists (for local SQLite)');
        console.error('3. Run: npx drizzle-kit push:sqlite\n');
        process.exit(1);
    }
}

simpleTest();
