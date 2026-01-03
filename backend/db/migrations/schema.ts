import { sqliteTable, AnySQLiteColumn, foreignKey, primaryKey, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const accounts = sqliteTable("accounts", {
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	type: text().notNull(),
	provider: text().notNull(),
	providerAccountId: text("provider_account_id").notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: integer("expires_at"),
	tokenType: text("token_type"),
	scope: text(),
	idToken: text("id_token"),
	sessionState: text("session_state"),
},
(table) => {
	return {
		pk0: primaryKey({ columns: [table.provider, table.providerAccountId], name: "accounts_provider_provider_account_id_pk"})
	}
});

export const bookmarks = sqliteTable("bookmarks", {
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" } ),
	createdAt: integer("created_at"),
},
(table) => {
	return {
		pk0: primaryKey({ columns: [table.userId, table.postId], name: "bookmarks_user_id_post_id_pk"})
	}
});

export const follows = sqliteTable("follows", {
	followerId: text("follower_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	followingId: text("following_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	createdAt: integer("created_at"),
},
(table) => {
	return {
		pk0: primaryKey({ columns: [table.followerId, table.followingId], name: "follows_follower_id_following_id_pk"})
	}
});

export const likes = sqliteTable("likes", {
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" } ),
	createdAt: integer("created_at"),
},
(table) => {
	return {
		pk0: primaryKey({ columns: [table.userId, table.postId], name: "likes_user_id_post_id_pk"})
	}
});

export const notifications = sqliteTable("notifications", {
	id: text().primaryKey().notNull(),
	recipientId: text("recipient_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	senderId: text("sender_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	type: text().notNull(),
	postId: text("post_id").references(() => posts.id, { onDelete: "set null" } ),
	read: integer().default(false),
	createdAt: integer("created_at"),
});

export const posts = sqliteTable("posts", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	content: text().notNull(),
	image: text(),
	createdAt: integer("created_at"),
});

export const sessions = sqliteTable("sessions", {
	sessionToken: text("session_token").primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	expires: integer().notNull(),
});

export const verificationTokens = sqliteTable("verification_tokens", {
	identifier: text().notNull(),
	token: text().notNull(),
	expires: integer().notNull(),
},
(table) => {
	return {
		pk0: primaryKey({ columns: [table.identifier, table.token], name: "verification_tokens_identifier_token_pk"})
	}
});

export const users = sqliteTable("users", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: integer("email_verified"),
	image: text(),
	password: text(),
	bio: text(),
	username: text(),
	createdAt: integer("created_at"),
},
(table) => {
	return {
		emailUnique: uniqueIndex("users_email_unique").on(table.email),
	}
});

export const conversationParticipants = sqliteTable("conversation_participants", {
	conversationId: text("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" } ),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	joinedAt: integer("joined_at"),
},
(table) => {
	return {
		pk0: primaryKey({ columns: [table.conversationId, table.userId], name: "conversation_participants_conversation_id_user_id_pk"})
	}
});

export const conversations = sqliteTable("conversations", {
	id: text().primaryKey().notNull(),
	createdAt: integer("created_at"),
	updatedAt: integer("updated_at"),
});

export const comments = sqliteTable("comments", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" } ),
	content: text().notNull(),
	createdAt: integer("created_at"),
});

export const reposts = sqliteTable("reposts", {
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" } ),
	createdAt: integer("created_at"),
},
(table) => {
	return {
		pk0: primaryKey({ columns: [table.userId, table.postId], name: "reposts_user_id_post_id_pk"})
	}
});

