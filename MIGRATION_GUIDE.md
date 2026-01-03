# Database Migration Guide

This guide will help you apply the new database schema to your database.

---

## 🚀 Quick Start

### Step 1: Generate Migration

```bash
npx drizzle-kit generate:sqlite
```

This will create a migration file in the `drizzle` folder based on your schema changes.

### Step 2: Review Migration

Check the generated migration file in `drizzle/` directory to ensure it looks correct.

### Step 3: Apply Migration

```bash
npx drizzle-kit push:sqlite
```

This will apply all pending migrations to your database.

---

## 📋 What Will Be Created

The migration will create/modify these tables:

### New Tables
- `media_attachments` - Store images, videos, audio
- `hashtags` - Track hashtags
- `post_hashtags` - Link posts to hashtags
- `mentions` - Track user mentions
- `polls` - Poll questions
- `poll_options` - Poll choices
- `poll_votes` - User votes
- `blocks` - User blocks
- `mutes` - User mutes

### Modified Tables
- `users` - Added Mastodon fields, counters, extended profile
- `posts` - Added visibility, threading, metrics, Mastodon sync
- `messages` - Already exists, no changes needed

---

## 🔧 Manual Migration (Alternative)

If you prefer to run SQL manually, here's the structure:

### 1. Update Users Table

```sql
ALTER TABLE users ADD COLUMN username TEXT UNIQUE;
ALTER TABLE users ADD COLUMN website TEXT;
ALTER TABLE users ADD COLUMN location TEXT;
ALTER TABLE users ADD COLUMN header_image TEXT;
ALTER TABLE users ADD COLUMN followers_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN following_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN posts_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN mastodon_id TEXT;
ALTER TABLE users ADD COLUMN mastodon_access_token TEXT;
ALTER TABLE users ADD COLUMN mastodon_instance_url TEXT;
ALTER TABLE users ADD COLUMN updated_at INTEGER;
```

### 2. Update Posts Table

```sql
ALTER TABLE posts ADD COLUMN visibility TEXT DEFAULT 'public';
ALTER TABLE posts ADD COLUMN sensitive INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN spoiler_text TEXT;
ALTER TABLE posts ADD COLUMN language TEXT DEFAULT 'en';
ALTER TABLE posts ADD COLUMN in_reply_to_id TEXT;
ALTER TABLE posts ADD COLUMN in_reply_to_account_id TEXT;
ALTER TABLE posts ADD COLUMN reblog_of_id TEXT;
ALTER TABLE posts ADD COLUMN likes_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN reblogs_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN replies_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN mastodon_id TEXT;
ALTER TABLE posts ADD COLUMN mastodon_url TEXT;
ALTER TABLE posts ADD COLUMN updated_at INTEGER;
```

### 3. Create New Tables

```sql
-- Media Attachments
CREATE TABLE media_attachments (
    id TEXT PRIMARY KEY,
    post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    preview_url TEXT,
    remote_url TEXT,
    description TEXT,
    blurhash TEXT,
    mastodon_id TEXT,
    created_at INTEGER
);

-- Hashtags
CREATE TABLE hashtags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    usage_count INTEGER DEFAULT 0,
    created_at INTEGER
);

-- Post Hashtags
CREATE TABLE post_hashtags (
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    hashtag_id TEXT NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, hashtag_id)
);

-- Mentions
CREATE TABLE mentions (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at INTEGER
);

-- Polls
CREATE TABLE polls (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    expires_at INTEGER,
    multiple INTEGER DEFAULT 0,
    votes_count INTEGER DEFAULT 0,
    mastodon_id TEXT,
    created_at INTEGER
);

-- Poll Options
CREATE TABLE poll_options (
    id TEXT PRIMARY KEY,
    poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    votes_count INTEGER DEFAULT 0
);

-- Poll Votes
CREATE TABLE poll_votes (
    poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_id TEXT NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at INTEGER,
    PRIMARY KEY (poll_id, option_id, user_id)
);

-- Blocks
CREATE TABLE blocks (
    blocker_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at INTEGER,
    PRIMARY KEY (blocker_id, blocked_id)
);

-- Mutes
CREATE TABLE mutes (
    muter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    muted_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notifications INTEGER DEFAULT 1,
    created_at INTEGER,
    PRIMARY KEY (muter_id, muted_id)
);
```

---

## 🔍 Verify Migration

After running the migration, verify it worked:

```bash
# Check database schema
npx drizzle-kit studio
```

This will open Drizzle Studio where you can browse your database schema and data.

---

## ⚠️ Important Notes

### Backup First!
Always backup your database before running migrations:

```bash
# For SQLite
cp your-database.db your-database.backup.db
```

### Check Existing Data
If you have existing data in `users` or `posts` tables:
- The new columns will be added with default values
- Existing data will not be affected
- You may want to update existing records to populate new fields

### Update Existing Records

```sql
-- Set default values for existing users
UPDATE users SET 
    followers_count = 0,
    following_count = 0,
    posts_count = 0,
    updated_at = created_at
WHERE followers_count IS NULL;

-- Set default values for existing posts
UPDATE posts SET
    visibility = 'public',
    sensitive = 0,
    language = 'en',
    likes_count = 0,
    reblogs_count = 0,
    replies_count = 0,
    updated_at = created_at
WHERE visibility IS NULL;
```

---

## 🐛 Troubleshooting

### Error: "table already exists"
If you get this error, some tables might already exist. You can:
1. Drop the existing table (⚠️ will lose data)
2. Modify the migration to skip that table
3. Manually add only the missing columns

### Error: "column already exists"
This means the column was already added. Safe to ignore or modify the migration.

### Error: "foreign key constraint failed"
Make sure referenced tables exist before creating tables with foreign keys.

---

## 📊 Migration Checklist

- [ ] Backup database
- [ ] Run `npx drizzle-kit generate:sqlite`
- [ ] Review generated migration
- [ ] Run `npx drizzle-kit push:sqlite`
- [ ] Verify with `npx drizzle-kit studio`
- [ ] Update existing records if needed
- [ ] Test basic operations (create user, create post)
- [ ] Test relationships (create like, create follow)

---

## 🎯 Next Steps After Migration

1. **Test the Schema**
   ```typescript
   import { db } from '@/backend/db';
   import { users, posts } from '@/backend/db/schema';
   
   // Test creating a user
   const [user] = await db.insert(users).values({
     name: 'Test User',
     email: 'test@example.com',
     username: 'testuser'
   }).returning();
   
   console.log('User created:', user);
   ```

2. **Populate Test Data**
   - Create a few test users
   - Create some test posts
   - Test likes, follows, etc.

3. **Start Building Frontend**
   - Use the backend actions you created
   - Build UI components
   - Test the full flow

---

## 📞 Need Help?

If you encounter issues:
1. Check the Drizzle ORM documentation: https://orm.drizzle.team/
2. Review the schema file: `backend/db/schema.ts`
3. Check database logs for specific errors
4. Verify your database connection in `drizzle.config.ts`

---

**Good luck with your migration!** 🚀
