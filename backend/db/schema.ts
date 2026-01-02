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

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
