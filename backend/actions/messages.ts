"use server";

import { db } from "@/backend/db";
import { messages, users } from "@/backend/db/schema";
import { eq, or, and, desc, asc, inArray, like, isNull } from "drizzle-orm";
import { auth } from "@/auth.config";
import { revalidatePath } from "next/cache";

/**
 * Send a message to another user
 */
export async function sendMessage(receiverId: string, content: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const senderId = session.user.id;

        if (!content.trim()) {
            return { error: "Message content cannot be empty" };
        }

        if (senderId === receiverId) {
            return { error: "Cannot send message to yourself" };
        }

        // Insert message
        const [newMessage] = await db
            .insert(messages)
            .values({
                senderId,
                receiverId,
                content: content.trim(),
            })
            .returning();

        // Revalidate relevant paths
        revalidatePath(`/messages`);
        revalidatePath(`/messages/${receiverId}`);

        return { success: true, message: newMessage };
    } catch (error) {
        console.error("Error sending message:", error);
        return { error: "Failed to send message" };
    }
}

/**
 * Get conversation history with a specific user
 */
export async function getMessages(otherUserId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized", messages: [] };
        }

        const currentUserId = session.user.id;

        // Fetch messages where (sender=me AND receiver=other) OR (sender=other AND receiver=me)
        const conversationMessages = await db.query.messages.findMany({
            where: or(
                and(
                    eq(messages.senderId, currentUserId),
                    eq(messages.receiverId, otherUserId)
                ),
                and(
                    eq(messages.senderId, otherUserId),
                    eq(messages.receiverId, currentUserId)
                )
            ),
            orderBy: [asc(messages.createdAt)],
            with: {
                // Optional: fetch sender details if needed, but we usually know who is who
            }
        });

        return { success: true, messages: conversationMessages };
    } catch (error) {
        console.error("Error fetching messages:", error);
        return { error: "Failed to fetch messages", messages: [] };
    }
}

/**
 * Get list of users the current user has chatted with
 */
export async function getConversations() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized", conversations: [] };
        }

        const currentUserId = session.user.id;

        // Get all messages involving the current user
        const allMessages = await db.query.messages.findMany({
            where: or(
                eq(messages.senderId, currentUserId),
                eq(messages.receiverId, currentUserId)
            ),
            orderBy: [desc(messages.createdAt)],
        });

        // Group by other user and pick the latest message
        const conversationMap = new Map();

        for (const msg of allMessages) {
            const otherId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId;
            if (!conversationMap.has(otherId)) {
                conversationMap.set(otherId, msg);
            }
        }

        // Fetch user details for these conversations
        const conversationUserIds = Array.from(conversationMap.keys());

        let conversationUsers: any[] = [];
        if (conversationUserIds.length > 0) {
            conversationUsers = await db.query.users.findMany({
                where: inArray(users.id, conversationUserIds),
            });
        }

        // Build conversation objects with user details and unread count
        const conversations = await Promise.all(
            conversationUsers.map(async (user) => {
                const lastMessage = conversationMap.get(user.id);

                // Count unread messages from this user
                const unreadMessages = await db.query.messages.findMany({
                    where: and(
                        eq(messages.senderId, user.id),
                        eq(messages.receiverId, currentUserId),
                        isNull(messages.readAt)
                    ),
                });

                return {
                    user,
                    lastMessage,
                    unreadCount: unreadMessages.length,
                };
            })
        );

        return { success: true, conversations };
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return { error: "Failed to fetch conversations", conversations: [] };
    }
}

/**
 * Get unread message count
 */
export async function getUnreadMessageCount() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized", count: 0 };
        }

        const unreadMessages = await db.query.messages.findMany({
            where: and(
                eq(messages.receiverId, session.user.id),
                isNull(messages.readAt)
            ),
        });

        return { success: true, count: unreadMessages.length };
    } catch (error) {
        console.error("Error fetching unread count:", error);
        return { error: "Failed to fetch unread count", count: 0 };
    }
}

/**
 * Mark conversation as read
 */
export async function markConversationAsRead(otherUserId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        await db.update(messages)
            .set({ readAt: new Date() })
            .where(
                and(
                    eq(messages.senderId, otherUserId),
                    eq(messages.receiverId, session.user.id),
                    isNull(messages.readAt)
                )
            );

        revalidatePath('/messages');
        return { success: true };
    } catch (error) {
        console.error("Error marking conversation as read:", error);
        return { error: "Failed to mark conversation as read" };
    }
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        // Verify the message belongs to the user (sender only can delete)
        const message = await db.query.messages.findFirst({
            where: eq(messages.id, messageId),
        });

        if (!message) {
            return { error: "Message not found" };
        }

        if (message.senderId !== session.user.id) {
            return { error: "Unauthorized" };
        }

        // Delete message
        await db.delete(messages).where(eq(messages.id, messageId));

        revalidatePath('/messages');
        return { success: true };
    } catch (error) {
        console.error("Error deleting message:", error);
        return { error: "Failed to delete message" };
    }
}

/**
 * Search for users to message
 */
export async function searchUsers(query: string, limit: number = 10) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized", users: [] };
        }

        if (!query || query.trim().length === 0) {
            return { success: true, users: [] };
        }

        const searchQuery = `%${query.toLowerCase()}%`;

        const foundUsers = await db.query.users.findMany({
            where: or(
                like(users.username, searchQuery),
                like(users.name, searchQuery)
            ),
            limit,
        });

        // Filter out the current user
        const currentUserId = session.user.id;
        const filteredUsers = foundUsers.filter(user => user.id !== currentUserId);

        return { success: true, users: filteredUsers };
    } catch (error) {
        console.error("Error searching users:", error);
        return { error: "Failed to search users", users: [] };
    }
}
