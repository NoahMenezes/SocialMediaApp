/**
 * Database Connection Test
 * Run this to verify your database is working correctly
 * 
 * Usage: npx tsx backend/test-db.ts
 */

import { db } from './db';
import { users, posts, likes, follows } from './db/schema';
import { eq } from 'drizzle-orm';

async function testDatabase() {
    console.log('🧪 Testing Database Connection...\n');

    try {
        // Test 1: Check database connection
        console.log('1️⃣ Testing database connection...');
        const testQuery = await db.select().from(users).limit(1);
        console.log('✅ Database connection successful!\n');

        // Test 2: Count existing users
        console.log('2️⃣ Counting existing users...');
        const allUsers = await db.select().from(users);
        console.log(`✅ Found ${allUsers.length} user(s) in database\n`);

        // Test 3: Create a test user (if none exist)
        if (allUsers.length === 0) {
            console.log('3️⃣ Creating test user...');
            const [testUser] = await db.insert(users).values({
                name: 'Test User',
                email: 'test@example.com',
                username: 'testuser',
                emailVerified: new Date(),
            }).returning();
            console.log('✅ Test user created:', testUser.username, '\n');
        } else {
            console.log('3️⃣ Skipping test user creation (users already exist)\n');
        }

        // Test 4: Count posts
        console.log('4️⃣ Counting posts...');
        const allPosts = await db.select().from(posts);
        console.log(`✅ Found ${allPosts.length} post(s) in database\n`);

        // Test 5: Test query with join
        console.log('5️⃣ Testing complex query (posts with users)...');
        const postsWithUsers = await db.select({
            post: posts,
            user: users,
        })
            .from(posts)
            .innerJoin(users, eq(posts.userId, users.id))
            .limit(5);
        console.log(`✅ Query successful! Found ${postsWithUsers.length} post(s) with user data\n`);

        // Summary
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 DATABASE STATUS SUMMARY');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ Connection: Working`);
        console.log(`👥 Users: ${allUsers.length}`);
        console.log(`📝 Posts: ${allPosts.length}`);
        console.log(`🔗 Joins: Working`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('🎉 All database tests passed!\n');

        // Show sample data if available
        if (allUsers.length > 0) {
            console.log('📋 Sample Users:');
            allUsers.slice(0, 3).forEach((user, i) => {
                console.log(`   ${i + 1}. ${user.name} (@${user.username}) - ${user.email}`);
            });
            console.log('');
        }

        if (allPosts.length > 0) {
            console.log('📋 Sample Posts:');
            allPosts.slice(0, 3).forEach((post, i) => {
                console.log(`   ${i + 1}. ${post.content.substring(0, 50)}...`);
            });
            console.log('');
        }

    } catch (error) {
        console.error('❌ Database test failed!');
        console.error('Error:', error);
        console.error('\n💡 Troubleshooting:');
        console.error('   1. Check your .env.local file has DATABASE_URL set');
        console.error('   2. Make sure you ran: npx drizzle-kit push:sqlite');
        console.error('   3. Verify the database file exists (for local SQLite)');
        console.error('   4. Check Turso credentials (if using Turso)\n');
        process.exit(1);
    }
}

// Run the test
testDatabase()
    .then(() => {
        console.log('✅ Test completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Test failed:', error);
        process.exit(1);
    });
