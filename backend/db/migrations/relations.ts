import { relations } from "drizzle-orm/relations";
import { users, accounts, posts, bookmarks, follows, likes, notifications, sessions, conversationParticipants, conversations, comments, reposts } from "./schema";

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	accounts: many(accounts),
	bookmarks: many(bookmarks),
	follows_followingId: many(follows, {
		relationName: "follows_followingId_users_id"
	}),
	follows_followerId: many(follows, {
		relationName: "follows_followerId_users_id"
	}),
	likes: many(likes),
	notifications_senderId: many(notifications, {
		relationName: "notifications_senderId_users_id"
	}),
	notifications_recipientId: many(notifications, {
		relationName: "notifications_recipientId_users_id"
	}),
	posts: many(posts),
	sessions: many(sessions),
	conversationParticipants: many(conversationParticipants),
	comments: many(comments),
	reposts: many(reposts),
}));

export const bookmarksRelations = relations(bookmarks, ({one}) => ({
	post: one(posts, {
		fields: [bookmarks.postId],
		references: [posts.id]
	}),
	user: one(users, {
		fields: [bookmarks.userId],
		references: [users.id]
	}),
}));

export const postsRelations = relations(posts, ({one, many}) => ({
	bookmarks: many(bookmarks),
	likes: many(likes),
	notifications: many(notifications),
	user: one(users, {
		fields: [posts.userId],
		references: [users.id]
	}),
	comments: many(comments),
	reposts: many(reposts),
}));

export const followsRelations = relations(follows, ({one}) => ({
	user_followingId: one(users, {
		fields: [follows.followingId],
		references: [users.id],
		relationName: "follows_followingId_users_id"
	}),
	user_followerId: one(users, {
		fields: [follows.followerId],
		references: [users.id],
		relationName: "follows_followerId_users_id"
	}),
}));

export const likesRelations = relations(likes, ({one}) => ({
	post: one(posts, {
		fields: [likes.postId],
		references: [posts.id]
	}),
	user: one(users, {
		fields: [likes.userId],
		references: [users.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	post: one(posts, {
		fields: [notifications.postId],
		references: [posts.id]
	}),
	user_senderId: one(users, {
		fields: [notifications.senderId],
		references: [users.id],
		relationName: "notifications_senderId_users_id"
	}),
	user_recipientId: one(users, {
		fields: [notifications.recipientId],
		references: [users.id],
		relationName: "notifications_recipientId_users_id"
	}),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const conversationParticipantsRelations = relations(conversationParticipants, ({one}) => ({
	user: one(users, {
		fields: [conversationParticipants.userId],
		references: [users.id]
	}),
	conversation: one(conversations, {
		fields: [conversationParticipants.conversationId],
		references: [conversations.id]
	}),
}));

export const conversationsRelations = relations(conversations, ({many}) => ({
	conversationParticipants: many(conversationParticipants),
}));

export const commentsRelations = relations(comments, ({one}) => ({
	post: one(posts, {
		fields: [comments.postId],
		references: [posts.id]
	}),
	user: one(users, {
		fields: [comments.userId],
		references: [users.id]
	}),
}));

export const repostsRelations = relations(reposts, ({one}) => ({
	post: one(posts, {
		fields: [reposts.postId],
		references: [posts.id]
	}),
	user: one(users, {
		fields: [reposts.userId],
		references: [users.id]
	}),
}));