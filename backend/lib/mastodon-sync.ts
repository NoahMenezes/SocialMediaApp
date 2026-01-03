/**
 * Mastodon Sync Service
 * 
 * This service syncs data between Mastodon API and our local database.
 * It handles importing posts, notifications, followers, and other data.
 */

import { db } from '../db';
import {
    users, posts, likes, follows, notifications,
    mediaAttachments, hashtags, postHashtags, mentions,
    polls, pollOptions, blocks, mutes
} from '../db/schema';
import {
    MastodonClient,
    MastodonStatus,
    MastodonAccount,
    MastodonNotification
} from './mastodon-client';
import { eq, and } from 'drizzle-orm';

export class MastodonSyncService {
    private client: MastodonClient;
    private userId: string;

    constructor(client: MastodonClient, userId: string) {
        this.client = client;
        this.userId = userId;
    }

    /**
     * Sync user profile from Mastodon
     */
    async syncUserProfile(): Promise<void> {
        try {
            const mastodonAccount = await this.client.verifyCredentials();

            await db.update(users)
                .set({
                    name: mastodonAccount.display_name || mastodonAccount.username,
                    username: mastodonAccount.username,
                    bio: this.stripHtml(mastodonAccount.note),
                    image: mastodonAccount.avatar,
                    headerImage: mastodonAccount.header,
                    followersCount: mastodonAccount.followers_count,
                    followingCount: mastodonAccount.following_count,
                    postsCount: mastodonAccount.statuses_count,
                    mastodonId: mastodonAccount.id,
                    updatedAt: new Date(),
                })
                .where(eq(users.id, this.userId));

            console.log('✅ User profile synced from Mastodon');
        } catch (error) {
            console.error('❌ Error syncing user profile:', error);
            throw error;
        }
    }

    /**
     * Sync home timeline from Mastodon
     */
    async syncHomeTimeline(limit: number = 20): Promise<void> {
        try {
            const statuses = await this.client.getHomeTimeline({ limit });

            for (const status of statuses) {
                await this.importStatus(status);
            }

            console.log(`✅ Synced ${statuses.length} posts from home timeline`);
        } catch (error) {
            console.error('❌ Error syncing home timeline:', error);
            throw error;
        }
    }

    /**
     * Sync notifications from Mastodon
     */
    async syncNotifications(limit: number = 20): Promise<void> {
        try {
            const mastodonNotifications = await this.client.getNotifications({ limit });

            for (const notification of mastodonNotifications) {
                await this.importNotification(notification);
            }

            console.log(`✅ Synced ${mastodonNotifications.length} notifications`);
        } catch (error) {
            console.error('❌ Error syncing notifications:', error);
            throw error;
        }
    }

    /**
     * Import a Mastodon status into our database
     */
    private async importStatus(status: MastodonStatus): Promise<string> {
        // Check if post already exists
        const existingPost = await db.query.posts.findFirst({
            where: eq(posts.mastodonId, status.id),
        });

        if (existingPost) {
            return existingPost.id;
        }

        // Import the account first
        const authorId = await this.importAccount(status.account);

        // Handle reblog
        let reblogOfId: string | null = null;
        if (status.reblog) {
            reblogOfId = await this.importStatus(status.reblog);
        }

        // Create the post
        const [newPost] = await db.insert(posts).values({
            userId: authorId,
            content: this.stripHtml(status.content),
            visibility: status.visibility,
            sensitive: status.sensitive,
            spoilerText: status.spoiler_text || null,
            language: status.language || 'en',
            inReplyToId: status.in_reply_to_id,
            inReplyToAccountId: status.in_reply_to_account_id,
            reblogOfId: reblogOfId,
            likesCount: status.favourites_count,
            reblogsCount: status.reblogs_count,
            repliesCount: status.replies_count,
            mastodonId: status.id,
            mastodonUrl: status.url,
            createdAt: new Date(status.created_at),
            updatedAt: new Date(),
        }).returning();

        // Import media attachments
        for (const media of status.media_attachments) {
            await db.insert(mediaAttachments).values({
                postId: newPost.id,
                type: media.type,
                url: media.url,
                previewUrl: media.preview_url,
                remoteUrl: media.remote_url || null,
                description: media.description || null,
                blurhash: media.blurhash || null,
                mastodonId: media.id,
            });
        }

        // Import hashtags
        for (const tag of status.tags) {
            const hashtagId = await this.importHashtag(tag.name);

            // Link hashtag to post
            await db.insert(postHashtags).values({
                postId: newPost.id,
                hashtagId: hashtagId,
            }).onConflictDoNothing();
        }

        // Import mentions
        for (const mention of status.mentions) {
            const mentionedUserId = await this.importAccountById(mention.id);

            await db.insert(mentions).values({
                postId: newPost.id,
                userId: mentionedUserId,
            });
        }

        // Import poll if exists
        if (status.poll) {
            const [newPoll] = await db.insert(polls).values({
                postId: newPost.id,
                expiresAt: status.poll.expires_at ? new Date(status.poll.expires_at) : null,
                multiple: status.poll.multiple,
                votesCount: status.poll.votes_count,
                mastodonId: status.poll.id,
            }).returning();

            for (const option of status.poll.options) {
                await db.insert(pollOptions).values({
                    pollId: newPoll.id,
                    title: option.title,
                    votesCount: option.votes_count || 0,
                });
            }
        }

        return newPost.id;
    }

    /**
     * Import a Mastodon account into our database
     */
    private async importAccount(account: MastodonAccount): Promise<string> {
        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.mastodonId, account.id),
        });

        if (existingUser) {
            return existingUser.id;
        }

        // Create new user
        const [newUser] = await db.insert(users).values({
            name: account.display_name || account.username,
            email: `${account.username}@mastodon.imported`, // Placeholder email
            username: account.username,
            bio: this.stripHtml(account.note),
            image: account.avatar,
            headerImage: account.header,
            followersCount: account.followers_count,
            followingCount: account.following_count,
            postsCount: account.statuses_count,
            mastodonId: account.id,
            createdAt: new Date(account.created_at),
        }).returning();

        return newUser.id;
    }

    /**
     * Import account by Mastodon ID
     */
    private async importAccountById(mastodonId: string): Promise<string> {
        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.mastodonId, mastodonId),
        });

        if (existingUser) {
            return existingUser.id;
        }

        // Fetch from Mastodon API
        const account = await this.client.getAccount(mastodonId);
        return this.importAccount(account);
    }

    /**
     * Import a hashtag
     */
    private async importHashtag(name: string): Promise<string> {
        const normalizedName = name.toLowerCase();

        // Check if hashtag exists
        const existingHashtag = await db.query.hashtags.findFirst({
            where: eq(hashtags.name, normalizedName),
        });

        if (existingHashtag) {
            // Increment usage count
            await db.update(hashtags)
                .set({ usageCount: (existingHashtag.usageCount ?? 0) + 1 })
                .where(eq(hashtags.id, existingHashtag.id));

            return existingHashtag.id;
        }

        // Create new hashtag
        const [newHashtag] = await db.insert(hashtags).values({
            name: normalizedName,
            usageCount: 1,
        }).returning();

        return newHashtag.id;
    }

    /**
     * Import a notification
     */
    private async importNotification(notification: MastodonNotification): Promise<void> {
        // Import the sender account
        const senderId = await this.importAccount(notification.account);

        // Import the status if it exists
        let postId: string | null = null;
        if (notification.status) {
            postId = await this.importStatus(notification.status);
        }

        // Map Mastodon notification types to our types
        const typeMap: Record<string, string> = {
            'mention': 'mention',
            'status': 'post',
            'reblog': 'reblog',
            'follow': 'follow',
            'follow_request': 'follow_request',
            'favourite': 'like',
            'poll': 'poll',
            'update': 'update',
        };

        // Create notification
        await db.insert(notifications).values({
            recipientId: this.userId,
            senderId: senderId,
            type: typeMap[notification.type] || notification.type,
            postId: postId,
            read: false,
            createdAt: new Date(notification.created_at),
        }).onConflictDoNothing();
    }

    /**
     * Strip HTML tags from content
     */
    private stripHtml(html: string): string {
        return html
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<p>/gi, '\n')
            .replace(/<\/p>/gi, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .trim();
    }
}

/**
 * Create a sync service instance
 */
export function createSyncService(client: MastodonClient, userId: string): MastodonSyncService {
    return new MastodonSyncService(client, userId);
}
