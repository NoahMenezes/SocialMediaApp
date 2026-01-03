"use server";

import { db } from "@/backend/db";
import { messages, users } from "@/backend/db/schema";
import { eq, or, and, desc, sql } from "drizzle-orm";
import { auth } from "@/auth.config";
import { revalidatePath } from "next/cache";

/**
 * Send a direct message to another user
 */
export async function sendMessage(receiverId: string, content: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Unauthorized' };
        }

        const [newMessage] = await db.insert(messages).values({
            senderId: session.user.id,
            receiverId: receiverId,
            content: content,
            createdAt: new Date(),
        }).returning();

        revalidatePath('/messages');
        return { success: true, message: newMessage };
    } catch (error) {
        console.error('Error sending message:', error);
        return { error: 'Failed to send message' };
    }
}

/**
 * Get messages between current user and another user
 */
export async function getMessages(otherUserId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return [];

        const chatMessages = await db.query.messages.findMany({
            where: or(
                and(
                    eq(messages.senderId, session.user.id),
                    eq(messages.receiverId, otherUserId)
                ),
                and(
                    eq(messages.senderId, otherUserId),
                    eq(messages.receiverId, session.user.id)
                )
            ),
            orderBy: [messages.createdAt],
        });

        return chatMessages.map(m => ({
            id: m.id,
            senderId: m.senderId,
            content: m.content,
            createdAt: m.createdAt,
            isOwn: m.senderId === session?.user?.id,
        }));
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
}

/**
 * Get all conversations for the current user
 * grouped by the other user
 */
export async function getConversations() {
    try {
        const session = await auth();
        if (!session?.user?.id) return [];

        const userId = session.user.id;

        // This is a bit complex in SQLite/Drizzle without a dedicated conversations table
        // We find all unique "other" users the current user has chatted with
        const allMessages = await db.query.messages.findMany({
            where: or(
                eq(messages.senderId, userId),
                eq(messages.receiverId, userId)
            ),
            orderBy: [desc(messages.createdAt)],
        });

        const conversationMap = new Map();

        for (const msg of allMessages) {
            const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;

            if (!conversationMap.has(otherUserId)) {
                conversationMap.set(otherUserId, {
                    lastMessage: msg,
                    otherUserId: otherUserId
                });
            }
        }

        const conversationList = Array.from(conversationMap.values());

        // Fetch user details for each conversation
        const results = [];
        for (const conv of conversationList) {
            const otherUser = await db.query.users.findFirst({
                where: eq(users.id, conv.otherUserId),
            });

            if (otherUser) {
                results.push({
                    id: otherUser.id, // We use otherUser.id as the conversation ID for simplicity
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
        console.error('Error fetching conversations:', error);
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
                sql`${messages.readAt} IS NULL`
            ),
        });

        return unread.length;
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return 0;
    }
}

/**
 * Mark a conversation as read
 */
export async function markConversationAsRead(otherUserId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: 'Unauthorized' };

        await db.update(messages)
            .set({ readAt: new Date() })
            .where(and(
                eq(messages.senderId, otherUserId),
                eq(messages.receiverId, session.user.id),
                sql`${messages.readAt} IS NULL`
            ));

        revalidatePath('/messages');
        return { success: true };
    } catch (error) {
        console.error('Error marking as read:', error);
        return { error: 'Failed' };
    }
}

/**
 * Search users to start new conversation
 */
export async function searchUsers(query: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return [];

        return await db.query.users.findMany({
            where: and(
                or(
                    sql`lower(${users.name}) LIKE ${'%' + query.toLowerCase() + '%'}`,
                    sql`lower(${users.username}) LIKE ${'%' + query.toLowerCase() + '%'}`
                ),
                sql`${users.id} != ${session.user.id}`
            ),
            limit: 10,
        });
    } catch (error) {
        console.error('Error searching users:', error);
        return [];
    }
}
