const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { parse } = require('csv-parse');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const { db } = require('../db');
const { news, instagramComments, instagramProfiles } = require('../db/schema');

async function importNews() {
    console.log('Starting NewsDataset.csv import...');
    const filePath = path.join(process.cwd(), 'NewsDataset.csv');
    if (!fs.existsSync(filePath)) return;

    const parser = fs.createReadStream(filePath).pipe(
        parse({ columns: true, skip_empty_lines: true })
    );

    let batch = [];
    const BATCH_SIZE = 500;
    let total = 0;

    for await (const record of parser) {
        batch.push({
            summary: record.Summary || '',
            text: record.Text || '',
        });

        if (batch.length >= BATCH_SIZE) {
            await db.insert(news).values(batch).onConflictDoNothing();
            total += batch.length;
            console.log(`Imported ${total} news records...`);
            batch = [];
        }
    }

    if (batch.length > 0) {
        await db.insert(news).values(batch).onConflictDoNothing();
        total += batch.length;
    }
    console.log(`Finished NewsDataset.csv import. Total: ${total}`);
}

async function importInstagramComments() {
    console.log('Starting realistic_instagram_dataset.csv import...');
    const filePath = path.join(process.cwd(), 'realistic_instagram_dataset.csv');
    if (!fs.existsSync(filePath)) return;

    const parser = fs.createReadStream(filePath).pipe(
        parse({ columns: true, skip_empty_lines: true })
    );

    let batch = [];
    const BATCH_SIZE = 500;
    let total = 0;

    for await (const record of parser) {
        batch.push({
            id: record.Comment_ID,
            postId: record.Post_ID,
            postCreatorId: record.Post_Creator_ID,
            commentText: record.Comment_Text,
            commentCreatorId: record.Comment_Creator_ID,
            replyToCommentId: record.Reply_To_Comment_ID,
            replyToUserId: record.Reply_To_User_ID,
            replyText: record.Reply_Text,
            emojiUsed: record.Emoji_Used,
            hashtagsUsed: record.Hashtags_Used,
            likesCount: parseInt(record.Likes_Count) || 0,
            repliesCount: parseInt(record.Replies_Count) || 0,
        });

        if (batch.length >= BATCH_SIZE) {
            await db.insert(instagramComments).values(batch).onConflictDoNothing();
            total += batch.length;
            console.log(`Imported ${total} instagram comments...`);
            batch = [];
        }
    }

    if (batch.length > 0) {
        await db.insert(instagramComments).values(batch).onConflictDoNothing();
        total += batch.length;
    }
    console.log(`Finished instagram comments import. Total: ${total}`);
}

async function importInstagramProfiles() {
    console.log('Starting Instagram profiles import...');
    const dbDir = path.join(process.cwd(), 'raw_data', 'instagram_profiles');

    if (!fs.existsSync(dbDir)) {
        console.log('Instagram profiles directory not found. Skipping...');
        return;
    }
    const files = fs.readdirSync(dbDir).filter((f: string) => f.endsWith('.json'));
    let batch = [];
    const BATCH_SIZE = 100;
    let total = 0;

    for (const file of files) {
        const filePath = path.join(dbDir, file);
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(content);
            const user = data.graphql?.user;
            if (!user) continue;

            batch.push({
                id: user.id,
                username: user.username,
                fullName: user.full_name,
                biography: user.biography,
                externalUrl: user.external_url,
                followersCount: user.edge_followed_by?.count || 0,
                followingCount: user.edge_follow?.count || 0,
                profilePicUrl: user.profile_pic_url,
                isVerified: !!user.is_verified,
                isPrivate: !!user.is_private,
                isBusinessAccount: !!user.is_business_account,
                rawJson: content,
            });

            if (batch.length >= BATCH_SIZE) {
                await db.insert(instagramProfiles).values(batch).onConflictDoNothing();
                total += batch.length;
                console.log(`Imported ${total} instagram profiles...`);
                batch = [];
            }
        } catch (e) {
            console.error(`Error parsing ${file}:`, e);
        }
    }

    if (batch.length > 0) {
        await db.insert(instagramProfiles).values(batch).onConflictDoNothing();
        total += batch.length;
    }
    console.log(`Finished instagram profiles import. Total: ${total}`);
}

async function main() {
    try {
        await importInstagramComments();
        await importNews();
        await importInstagramProfiles();
        console.log('All imports completed!');
    } catch (e) {
        console.error('Import failed:', e);
    }
}

main();
