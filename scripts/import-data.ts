import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import * as schema from '../backend/db/schema';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const dbUrl = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;
const dbAuthToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

if (!dbUrl) {
    console.error('❌ Error: DATABASE_URL or TURSO_DATABASE_URL environment variable is not defined.');
    console.error('Please check your .env.local file.');
    process.exit(1);
}

const client = createClient({
    url: dbUrl,
    authToken: dbAuthToken,
});

const db = drizzle(client, { schema });

async function importNewsData() {
    console.log('📰 Importing News Dataset...');

    const newsPath = path.join(process.cwd(), 'raw_data', 'NewsDataset.csv');
    const newsContent = fs.readFileSync(newsPath, 'utf-8');

    const records = parse(newsContent, {
        columns: true,
        skip_empty_lines: true,
    });

    console.log(`Found ${records.length} news items`);

    // Import in batches of 100
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);

        await db.insert(schema.news).values(
            batch.map((record: any) => ({
                summary: record.Summary || '',
                text: record.Text || '',
            }))
        ).onConflictDoNothing();

        console.log(`Imported ${Math.min(i + batchSize, records.length)}/${records.length} news items`);
    }

    console.log('✅ News data imported successfully!');
}

async function importInstagramComments() {
    console.log('💬 Importing Instagram Comments...');

    const csvPath = path.join(process.cwd(), 'raw_data', 'realistic_instagram_dataset.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
    });

    console.log(`Found ${records.length} Instagram comments`);

    // Import in batches of 100
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);

        await db.insert(schema.instagramComments).values(
            batch.map((record: any) => ({
                id: record.Comment_ID,
                postId: record.Post_ID || null,
                postCreatorId: record.Post_Creator_ID || null,
                commentText: record.Comment_Text || null,
                commentCreatorId: record.Comment_Creator_ID || null,
                replyToCommentId: record.Reply_To_Comment_ID || null,
                replyToUserId: record.Reply_To_User_ID || null,
                replyText: record.Reply_Text || null,
                emojiUsed: record.Emoji_Used || null,
                hashtagsUsed: record.Hashtags_Used || null,
                likesCount: record.Likes_Count ? parseInt(record.Likes_Count) : 0,
                repliesCount: record.Replies_Count ? parseInt(record.Replies_Count) : 0,
            }))
        ).onConflictDoNothing();

        console.log(`Imported ${Math.min(i + batchSize, records.length)}/${records.length} comments`);
    }

    console.log('✅ Instagram comments imported successfully!');
}

async function importInstagramProfiles() {
    console.log('👤 Importing Instagram Profiles from JSON files...');

    const dbPath = path.join(process.cwd(), 'db');
    const files = fs.readdirSync(dbPath).filter(f => f.endsWith('.json'));

    console.log(`Found ${files.length} JSON profile files`);

    let totalImported = 0;

    for (const file of files) {
        try {
            const filePath = path.join(dbPath, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(content);

            // Check if it has user data
            if (data.graphql && data.graphql.user) {
                const user = data.graphql.user;

                // Insert into instagramProfiles
                await db.insert(schema.instagramProfiles).values({
                    id: user.id,
                    username: user.username,
                    fullName: user.full_name || null,
                    biography: user.biography || null,
                    externalUrl: user.external_url || null,
                    followersCount: user.edge_followed_by?.count || 0,
                    followingCount: user.edge_follow?.count || 0,
                    profilePicUrl: user.profile_pic_url || null,
                    isVerified: user.is_verified || false,
                    isPrivate: user.is_private || false,
                    isBusinessAccount: user.is_business_account || false,
                    rawJson: JSON.stringify(data),
                }).onConflictDoNothing();

                // Also create a user account for this profile
                await db.insert(schema.users).values({
                    id: user.id,
                    name: user.full_name || user.username,
                    email: `${user.username}@example.com`,
                    username: user.username,
                    image: user.profile_pic_url || null,
                    bio: user.biography || null,
                }).onConflictDoUpdate({
                    target: schema.users.id,
                    set: {
                        name: user.full_name || user.username,
                        email: `${user.username}@example.com`,
                        username: user.username,
                        image: user.profile_pic_url || null,
                        bio: user.biography || null,
                    }
                });

                totalImported++;

                if (totalImported % 10 === 0) {
                    console.log(`Imported ${totalImported}/${files.length} profiles`);
                }
            }
        } catch (error) {
            console.error(`Error processing ${file}:`, error);
        }
    }

    console.log(`✅ Imported ${totalImported} Instagram profiles successfully!`);
}

async function createSamplePostsFromData() {
    console.log('📝 Creating sample posts from imported data...');

    // Get all users
    const allUsers = await db.select().from(schema.users);

    if (allUsers.length === 0) {
        console.log('⚠️  No users found. Please create a user account first.');
        return;
    }

    console.log(`Using ${allUsers.length} users to distribute posts`);

    // Get some news items (let's get more for variety)
    const newsItems = await db.select().from(schema.news).limit(50);

    // First, clear existing sample posts if they were all from one user
    await db.delete(schema.posts);

    // Create posts from news
    for (let i = 0; i < newsItems.length; i++) {
        const news = newsItems[i];
        // Assign to a random user or cycle through users
        const user = allUsers[i % allUsers.length];

        await db.insert(schema.posts).values({
            userId: user.id,
            content: `${news.summary}\n\n${news.text.substring(0, 200)}...`,
            visibility: 'public',
        }).onConflictDoNothing();
    }

    console.log(`✅ Created ${newsItems.length} sample posts from news data with diverse authors!`);
}

async function checkData() {
    console.log('\n📊 Checking imported data...\n');

    const newsCount = await db.select().from(schema.news);
    console.log(`News items: ${newsCount.length}`);

    const commentsCount = await db.select().from(schema.instagramComments);
    console.log(`Instagram comments: ${commentsCount.length}`);

    const profilesCount = await db.select().from(schema.instagramProfiles);
    console.log(`Instagram profiles: ${profilesCount.length}`);

    const postsCount = await db.select().from(schema.posts);
    console.log(`Posts: ${postsCount.length}`);
}

async function main() {
    try {
        console.log('🚀 Starting data import...\n');

        await importInstagramProfiles();
        await createSamplePostsFromData();
        await importNewsData();
        await importInstagramComments();
        await checkData();

        console.log('\n✨ All data imported successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error importing data:', error);
        process.exit(1);
    }
}

main();
