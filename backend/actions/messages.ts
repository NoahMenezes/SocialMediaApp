"use server";

import { db } from "@/backend/db";
import { messages, users } from "@/backend/db/schema";
import { eq, or, and, desc, asc, like, isNull, sql } from "drizzle-orm";
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
                createdAt: new Date(),
            })
            .returning();

        // Revalidate relevant paths
        revalidatePath(`/messages`);

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
        if (!session?.user?.id) return [];

        const currentUserId = session.user.id;

        // Fetch messages where (sender=me AND receiver=other) OR (sender=other AND receiver=me)
        const chatMessages = await db.query.messages.findMany({
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
        });

        return chatMessages.map(m => ({
            id: m.id,
            senderId: m.senderId,
            content: m.content,
            createdAt: m.createdAt,
            isOwn: m.senderId === currentUserId,
        }));
    } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
    }
}

/**
 * Get all conversations for the current user
 */
export async function getConversations() {
    try {
        const session = await auth();
        if (!session?.user?.id) return [];

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
                conversationMap.set(otherId, {
                    lastMessage: msg,
                    otherUserId: otherId
                });
            }
        }

        const conversationList = Array.from(conversationMap.values());
        const results = [];

        for (const conv of conversationList) {
            const otherUser = await db.query.users.findFirst({
                where: eq(users.id, conv.otherUserId),
            });

            if (otherUser) {
                results.push({
                    id: otherUser.id, // User ID as conversation ID
                    updatedAt: conv.lastMessage.createdAt,
                    otherUser: {
                        id: otherUser.id,
                        name: otherUser.name,
                        image: otherUser.image,
                        username: otherUser.username,
                    },
                    lastMessage: {
                        content: conv.lastMessage.content,
                        createdAt: conv.lastMessage.createdAt,
                    }
                });
            }
        }

        return results;
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return [];
    }
}

/**
 * Get unread message count
 */
export async function getUnreadMessageCount() {
    try {
        const session = await auth();
        if (!session?.user?.id) return 0;

        const unread = await db.query.messages.findMany({
            where: and(
                eq(messages.receiverId, session.user.id),
                isNull(messages.readAt)
            ),
        });

        return unread.length;
    } catch (error) {
        console.error("Error fetching unread count:", error);
        return 0;
    }
}

/**
 * Mark a conversation as read
 */
export async function markConversationAsRead(otherUserId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };

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
        return { error: "Failed" };
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

        const message = await db.query.messages.findFirst({
            where: eq(messages.id, messageId),
        });

        if (!message) {
            return { error: "Message not found" };
        }

        if (message.senderId !== session.user.id) {
            return { error: "Unauthorized" };
        }

        await db.delete(messages).where(eq(messages.id, messageId));
        revalidatePath('/messages');
        return { success: true };
    } catch (error) {
        console.error("Error deleting message:", error);
        return { error: "Failed to delete message" };
    }
}

/**
 * Search users to start new conversation
 */
export async function searchUsers(query: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return [];

        const searchQuery = `%${query.toLowerCase()}%`;

        return await db.query.users.findMany({
            where: and(
                or(
                    like(users.name, searchQuery),
                    like(users.username, searchQuery)
                ),
                sql`${users.id} != ${session.user.id}`
            ),
            limit: 10,
        });
    } catch (error) {
        console.error("Error searching users:", error);
        return [];
    }
}
