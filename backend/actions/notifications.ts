"use server";

import { db } from "@/backend/db";
import { notifications, users } from "@/backend/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/auth.config";
import { createMastodonClient } from "../lib/mastodon-client";
import { createSyncService } from "../lib/mastodon-sync";
import { revalidatePath } from "next/cache";

/**
 * Get user's notifications formatted for the UI
 */
export async function getNotifications(limit: number = 50, offset: number = 0) {
    try {
        const session = await auth();
        if (!session?.user?.id) return [];

        const results = await db.select({
            id: notifications.id,
            type: notifications.type,
            read: notifications.read,
            createdAt: notifications.createdAt,
            actor: {
                name: users.name,
                image: users.image,
            },
        })
            .from(notifications)
            .innerJoin(users, eq(notifications.senderId, users.id))
            .where(eq(notifications.recipientId, session.user!.id))
            .orderBy(desc(notifications.createdAt))
            .limit(limit)
            .offset(offset);

        return results.map(n => ({
            id: n.id,
            type: n.type,
            read: n.read,
            time: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'recently',
            actor: {
                name: n.actor.name,
                avatar: n.actor.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.actor.name}`,
            },
            content: n.type === 'like' ? 'liked your post' : n.type === 'follow' ? 'followed you' : 'replied to your post',
        }));
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Unauthorized' };
        }

        const unreadNotifications = await db.query.notifications.findMany({
            where: and(
                eq(notifications.recipientId, session.user!.id),
                eq(notifications.read, false)
            ),
        });

        return { success: true, count: unreadNotifications.length };
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return { error: 'Failed to fetch unread count' };
    }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Unauthorized' };
        }

        // Verify the notification belongs to the user
        const notification = await db.query.notifications.findFirst({
            where: eq(notifications.id, notificationId),
        });

        if (!notification) {
            return { error: 'Notification not found' };
        }

        if (notification.recipientId !== session.user!.id) {
            return { error: 'Unauthorized' };
        }

        // Mark as read
        await db.update(notifications)
            .set({ read: true })
            .where(eq(notifications.id, notificationId));

        revalidatePath('/notifications');
        return { success: true };
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return { error: 'Failed to mark notification as read' };
    }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Unauthorized' };
        }

        await db.update(notifications)
            .set({ read: true })
            .where(
                and(
                    eq(notifications.recipientId, session.user!.id),
                    eq(notifications.read, false)
                )
            );

        revalidatePath('/notifications');
        return { success: true };
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return { error: 'Failed to mark all notifications as read' };
    }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Unauthorized' };
        }

        // Verify the notification belongs to the user
        const notification = await db.query.notifications.findFirst({
            where: eq(notifications.id, notificationId),
        });

        if (!notification) {
            return { error: 'Notification not found' };
        }

        if (notification.recipientId !== session.user!.id) {
            return { error: 'Unauthorized' };
        }

        // Delete notification
        await db.delete(notifications).where(eq(notifications.id, notificationId));

        revalidatePath('/notifications');
        return { success: true };
    } catch (error) {
        console.error('Error deleting notification:', error);
        return { error: 'Failed to delete notification' };
    }
}

/**
 * Sync notifications from Mastodon
 */
export async function syncMastodonNotifications() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Unauthorized' };
        }

        // Get user's Mastodon credentials
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user!.id),
        });

        if (!user?.mastodonAccessToken || !user?.mastodonInstanceUrl) {
            return { error: 'Mastodon account not connected' };
        }

        // Create Mastodon client and sync service
        const mastodonClient = createMastodonClient({
            instanceUrl: user.mastodonInstanceUrl,
            accessToken: user.mastodonAccessToken,
        });

        const syncService = createSyncService(mastodonClient, session.user!.id);

        // Sync notifications
        await syncService.syncNotifications(50);

        revalidatePath('/notifications');
        return { success: true };
    } catch (error) {
        console.error('Error syncing Mastodon notifications:', error);
        return { error: 'Failed to sync notifications from Mastodon' };
    }
}

/**
 * Create a notification (internal use)
 */
export async function createNotification(data: {
    recipientId: string;
    senderId: string;
    type: string;
    postId?: string | null;
}) {
    try {
        await db.insert(notifications).values({
            recipientId: data.recipientId,
            senderId: data.senderId,
            type: data.type,
            postId: data.postId || null,
            read: false,
        });

        revalidatePath('/notifications');
        return { success: true };
    } catch (error) {
        console.error('Error creating notification:', error);
        return { error: 'Failed to create notification' };
    }
}
