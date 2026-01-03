import { sqliteTable, text, integer, primaryKey, uniqueIndex } from 'drizzle-orm/sqlite-core';
import type { AdapterAccountType } from "next-auth/adapters";

// --- Users ---
export const users = sqliteTable("users", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: integer('email_verified', { mode: 'timestamp' }),
    image: text('image'),
    password: text('password'),
    bio: text('bio'),
    username: text('username').unique(),
    website: text('website'),
    location: text('location'),
    headerImage: text('header_image'),
    followersCount: integer('followers_count').default(0),
    followingCount: integer('following_count').default(0),
    postsCount: integer('posts_count').default(0),
    mastodonId: text('mastodon_id'), // For Mastodon API sync
    mastodonAccessToken: text('mastodon_access_token'), // Store user's Mastodon token
    mastodonInstanceUrl: text('mastodon_instance_url'), // e.g., https://mastodon.social
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// --- Auth Tables ---
export const accounts = sqliteTable('accounts', {
    userId: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
}, (account) => ({
    compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
    }),
}));

export const sessions = sqliteTable('sessions', {
    sessionToken: text('session_token').primaryKey(),
    userId: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    expires: integer('expires', { mode: 'timestamp' }).notNull(),
});

export const verificationTokens = sqliteTable('verification_tokens', {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: integer('expires', { mode: 'timestamp' }).notNull(),
}, (verificationToken) => ({
    compoundKey: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
    }),
}));


// --- Social Features (From existing DB) ---

export const posts = sqliteTable("posts", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    content: text('content').notNull(),
    image: text('image'),
    visibility: text('visibility').default('public'), // public, unlisted, private, direct
    sensitive: integer('sensitive', { mode: 'boolean' }).default(false),
    spoilerText: text('spoiler_text'), // Content warning
    language: text('language').default('en'),
    inReplyToId: text('in_reply_to_id'), // Reference to another post
    inReplyToAccountId: text('in_reply_to_account_id'), // Reference to user
    reblogOfId: text('reblog_of_id'), // Reference to reblogged post
    likesCount: integer('likes_count').default(0),
    reblogsCount: integer('reblogs_count').default(0),
    repliesCount: integer('replies_count').default(0),
    mastodonId: text('mastodon_id'), // For Mastodon API sync
    mastodonUrl: text('mastodon_url'), // Original Mastodon URL
    createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const comments = sqliteTable("comments", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    content: text('content').notNull(),
    createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const likes = sqliteTable("likes", {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
    pk: primaryKey({ columns: [table.userId, table.postId] })
}));

export const reposts = sqliteTable("reposts", {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
    pk: primaryKey({ columns: [table.userId, table.postId] })
}));

export const follows = sqliteTable("follows", {
    followerId: text("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    followingId: text("following_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
    pk: primaryKey({ columns: [table.followerId, table.followingId] })
}));

export const bookmarks = sqliteTable("bookmarks", {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
    pk: primaryKey({ columns: [table.userId, table.postId] })
}));

export const notifications = sqliteTable("notifications", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    recipientId: text("recipient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    senderId: text("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text('type').notNull(),
    postId: text("post_id").references(() => posts.id, { onDelete: "set null" }),
    read: integer('read', { mode: 'boolean' }).default(false),
    createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// --- Existing Chat (kept for safety) ---
export const conversations = sqliteTable("conversations", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    createdAt: integer("created_at", { mode: 'timestamp' }),
    updatedAt: integer("updated_at", { mode: 'timestamp' }),
});

export const conversationParticipants = sqliteTable("conversation_participants", {
    conversationId: text("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    joinedAt: integer("joined_at", { mode: 'timestamp' }),
}, (table) => ({
    pk: primaryKey({ columns: [table.conversationId, table.userId] })
}));

// --- Media Attachments ---
export const mediaAttachments = sqliteTable("media_attachments", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    postId: text("post_id").references(() => posts.id, { onDelete: "cascade" }),
    type: text('type').notNull(), // image, video, gifv, audio
    url: text('url').notNull(),
    previewUrl: text('preview_url'),
    remoteUrl: text('remote_url'), // Original URL from Mastodon
    description: text('description'), // Alt text
    blurhash: text('blurhash'), // For image placeholders
    mastodonId: text('mastodon_id'),
    createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// --- Hashtags ---
export const hashtags = sqliteTable("hashtags", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull().unique(),
    usageCount: integer('usage_count').default(0),
    createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// --- Post Hashtags (Many-to-Many) ---
export const postHashtags = sqliteTable("post_hashtags", {
    postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    hashtagId: text("hashtag_id").notNull().references(() => hashtags.id, { onDelete: "cascade" }),
}, (table) => ({
    pk: primaryKey({ columns: [table.postId, table.hashtagId] })
}));

// --- Mentions ---
export const mentions = sqliteTable("mentions", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// --- Polls ---
export const polls = sqliteTable("polls", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at", { mode: 'timestamp' }),
    multiple: integer('multiple', { mode: 'boolean' }).default(false),
    votesCount: integer('votes_count').default(0),
    mastodonId: text('mastodon_id'),
    createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// --- Poll Options ---
export const pollOptions = sqliteTable("poll_options", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    pollId: text("poll_id").notNull().references(() => polls.id, { onDelete: "cascade" }),
    title: text('title').notNull(),
    votesCount: integer('votes_count').default(0),
});

// --- Poll Votes ---
export const pollVotes = sqliteTable("poll_votes", {
    pollId: text("poll_id").notNull().references(() => polls.id, { onDelete: "cascade" }),
    optionId: text("option_id").notNull().references(() => pollOptions.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
    pk: primaryKey({ columns: [table.pollId, table.optionId, table.userId] })
}));

// --- Blocks ---
export const blocks = sqliteTable("blocks", {
    blockerId: text("blocker_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    blockedId: text("blocked_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
    pk: primaryKey({ columns: [table.blockerId, table.blockedId] })
}));

// --- Mutes ---
export const mutes = sqliteTable("mutes", {
    muterId: text("muter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    mutedId: text("muted_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    notifications: integer('notifications', { mode: 'boolean' }).default(true), // Mute notifications too?
    createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
    pk: primaryKey({ columns: [table.muterId, table.mutedId] })
}));

// --- NEW Chat (Simple) ---
export const messages = sqliteTable('messages', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    senderId: text('sender_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    receiverId: text('receiver_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    readAt: integer('read_at', { mode: 'timestamp' }),
});

// Exports

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type Like = typeof likes.$inferSelect;
export type NewLike = typeof likes.$inferInsert;
export type Follow = typeof follows.$inferSelect;
export type NewFollow = typeof follows.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type MediaAttachment = typeof mediaAttachments.$inferSelect;
export type NewMediaAttachment = typeof mediaAttachments.$inferInsert;
export type Hashtag = typeof hashtags.$inferSelect;
export type NewHashtag = typeof hashtags.$inferInsert;
export type Mention = typeof mentions.$inferSelect;
export type NewMention = typeof mentions.$inferInsert;
export type Poll = typeof polls.$inferSelect;
export type NewPoll = typeof polls.$inferInsert;
export type PollOption = typeof pollOptions.$inferSelect;
export type NewPollOption = typeof pollOptions.$inferInsert;
export type Block = typeof blocks.$inferSelect;
export type NewBlock = typeof blocks.$inferInsert;
export type Mute = typeof mutes.$inferSelect;
export type NewMute = typeof mutes.$inferInsert;

