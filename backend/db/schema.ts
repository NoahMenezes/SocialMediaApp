import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import type { AdapterAccountType } from "next-auth/adapters";

// Users table - supports both email/password and OAuth
export const users = sqliteTable('users', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: integer('email_verified', { mode: 'timestamp' }),
    image: text('image'),
    password: text('password'), // Optional for OAuth users
    bio: text('bio'),
    username: text('username'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Accounts table - stores OAuth provider information
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

// Sessions table - stores user sessions
export const sessions = sqliteTable('sessions', {
    sessionToken: text('session_token').primaryKey(),
    userId: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    expires: integer('expires', { mode: 'timestamp' }).notNull(),
});

// Verification tokens table - for email verification
export const verificationTokens = sqliteTable('verification_tokens', {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: integer('expires', { mode: 'timestamp' }).notNull(),
}, (verificationToken) => ({
    compoundKey: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
    }),
}));

// Posts table
export const posts = sqliteTable('posts', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    image: text('image'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Likes table
export const likes = sqliteTable('likes', {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (t) => ({
    pk: primaryKey({ columns: [t.userId, t.postId] }),
}));

// Bookmarks table
export const bookmarks = sqliteTable('bookmarks', {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (t) => ({
    pk: primaryKey({ columns: [t.userId, t.postId] }),
}));

// Follows table
export const follows = sqliteTable('follows', {
    followerId: text('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    followingId: text('following_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (t) => ({
    pk: primaryKey({ columns: [t.followerId, t.followingId] }),
}));

// Notifications table
export const notifications = sqliteTable('notifications', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    recipientId: text('recipient_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    senderId: text('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type: text('type', { enum: ['like', 'follow', 'reply'] }).notNull(),
    postId: text('post_id').references(() => posts.id, { onDelete: 'set null' }),
    read: integer('read', { mode: 'boolean' }).default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Conversations table
export const conversations = sqliteTable('conversations', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Conversation participants table
export const conversationParticipants = sqliteTable('conversation_participants', {
    conversationId: text('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    joinedAt: integer('joined_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (t) => ({
    pk: primaryKey({ columns: [t.conversationId, t.userId] }),
}));

// Messages table
export const messages = sqliteTable('messages', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    conversationId: text('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
    senderId: text('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    read: integer('read', { mode: 'boolean' }).default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Comments table
export const comments = sqliteTable('comments', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Reposts table
export const reposts = sqliteTable('reposts', {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (t) => ({
    pk: primaryKey({ columns: [t.userId, t.postId] }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type ConversationParticipant = typeof conversationParticipants.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Repost = typeof reposts.$inferSelect;

