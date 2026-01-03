"use server";

import { db } from "@/backend/db";
import { messages, users } from "@/backend/db/schema";
<<<<<<< HEAD
import { eq, or, and, desc, asc, inArray, like, isNull } from "drizzle-orm";
=======
import { eq, or, and, desc, sql } from "drizzle-orm";
>>>>>>> d44b90a855c534bb865b12274fd955d3e33b65ff
import { auth } from "@/auth.config";
import { revalidatePath } from "next/cache";

/**
<<<<<<< HEAD
 * Send a message to another user
=======
 * Send a direct message to another user
>>>>>>> d44b90a855c534bb865b12274fd955d3e33b65ff
 */
export async function sendMessage(receiverId: string, content: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
<<<<<<< HEAD
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
=======
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
>>>>>>> d44b90a855c534bb865b12274fd955d3e33b65ff
    }
}

/**
<<<<<<< HEAD
 * Get conversation history with a specific user
=======
 * Get messages between current user and another user
>>>>>>> d44b90a855c534bb865b12274fd955d3e33b65ff
 */
export async function getMessages(otherUserId: string) {
    try {
        const session = await auth();
<<<<<<< HEAD
        if (!session?.user?.id) {
            return { error: "Unauthorized", messages: [] };
        }

        const currentUserId = session.user.id;

        // Fetch messages where (sender=me AND receiver=other) OR (sender=other AND receiver=me)
        const conversationMessages = await db.query.messages.findMany({
            where: or(
                and(
                    eq(messages.senderId, currentUserId),
=======
        if (!session?.user?.id) return [];

        const chatMessages = await db.query.messages.findMany({
            where: or(
                and(
                    eq(messages.senderId, session.user.id),
>>>>>>> d44b90a855c534bb865b12274fd955d3e33b65ff
                    eq(messages.receiverId, otherUserId)
                ),
                and(
                    eq(messages.senderId, otherUserId),
<<<<<<< HEAD
                    eq(messages.receiverId, currentUserId)
                )
            ),
            orderBy: [asc(messages.createdAt)],
        });

        return { success: true, messages: conversationMessages };
    } catch (error) {
        console.error("Error fetching messages:", error);
        return { error: "Failed to fetch messages", messages: [] };
=======
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
>>>>>>> d44b90a855c534bb865b12274fd955d3e33b65ff
    }
}

/**
<<<<<<< HEAD
 * Get list of users the current user has chatted with
=======
 * Get all conversations for the current user
 * grouped by the other user
>>>>>>> d44b90a855c534bb865b12274fd955d3e33b65ff
 */
export async function getConversations() {
    try {
        const session = await auth();
<<<<<<< HEAD
        if (!session?.user?.id) {
            return { error: "Unauthorized", conversations: [] };
        }

        const currentUserId = session.user.id;

        // Get all messages involving the current user
        const allMessages = await db.query.messages.findMany({
            where: or(
                eq(messages.senderId, currentUserId),
                eq(messages.receiverId, currentUserId)
=======
        if (!session?.user?.id) return [];

        const userId = session.user.id;

        // This is a bit complex in SQLite/Drizzle without a dedicated conversations table
        // We find all unique "other" users the current user has chatted with
        const allMessages = await db.query.messages.findMany({
            where: or(
                eq(messages.senderId, userId),
                eq(messages.receiverId, userId)
>>>>>>> d44b90a855c534bb865b12274fd955d3e33b65ff
            ),
            orderBy: [desc(messages.createdAt)],
        });

<<<<<<< HEAD
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
=======
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
>>>>>>> d44b90a855c534bb865b12274fd955d3e33b65ff
    }
}

/**
 * Get unread message count
 */
export async function getUnreadMessageCount() {
    try {
        const session = await auth();
<<<<<<< HEAD
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
=======
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
>>>>>>> d44b90a855c534bb865b12274fd955d3e33b65ff
    }
}

/**
<<<<<<< HEAD
 * Mark conversation as read
=======
 * Mark a conversation as read
>>>>>>> d44b90a855c534bb865b12274fd955d3e33b65ff
 */
export async function markConversationAsRead(otherUserId: string) {
    try {
        const session = await auth();
<<<<<<< HEAD
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
=======
        if (!session?.user?.id) return { error: 'Unauthorized' };

        await db.update(messages)
            .set({ readAt: new Date() })
            .where(and(
                eq(messages.senderId, otherUserId),
                eq(messages.receiverId, session.user.id),
                sql`${messages.readAt} IS NULL`
            ));
>>>>>>> d44b90a855c534bb865b12274fd955d3e33b65ff

        revalidatePath('/messages');
        return { success: true };
    } catch (error) {
<<<<<<< HEAD
        console.error("Error marking conversation as read:", error);
        return { error: "Failed to mark conversation as read" };
=======
        console.error('Error marking as read:', error);
        return { error: 'Failed' };
>>>>>>> d44b90a855c534bb865b12274fd955d3e33b65ff
    }
}

/**
<<<<<<< HEAD
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
        const filteredUsers = foundUsers.filter(user => user.id !== session.user?.id);

        return { success: true, users: filteredUsers };
    } catch (error) {
        console.error("Error searching users:", error);
        return { error: "Failed to search users", users: [] };
=======
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
>>>>>>> d44b90a855c534bb865b12274fd955d3e33b65ff
    }
}
