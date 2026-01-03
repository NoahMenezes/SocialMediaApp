"use server";

import { db } from "@/backend/db";
import { conversations, conversationParticipants, messages, users } from "@/backend/db/schema";
import { eq, and, or, desc, sql } from "drizzle-orm";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

export async function getConversations() {
    const user = await getCurrentUser();
    if (!user) return [];

    // Get all conversations where the user is a participant
    const userConversations = await db.select({
        id: conversations.id,
        updatedAt: conversations.updatedAt,
        // We'll join with participants and users to get the other person's info
    })
        .from(conversations)
        .innerJoin(conversationParticipants, eq(conversations.id, conversationParticipants.conversationId))
        .where(eq(conversationParticipants.userId, user.id))
        .orderBy(desc(conversations.updatedAt));

    const conversationList = await Promise.all(userConversations.map(async (conv) => {
        // Find the other participant
        const otherParticipant = await db.select({
            id: users.id,
            name: users.name,
            image: users.image,
            username: users.username,
        })
            .from(conversationParticipants)
            .innerJoin(users, eq(conversationParticipants.userId, users.id))
            .where(and(
                eq(conversationParticipants.conversationId, conv.id),
                sql`${conversationParticipants.userId} != ${user.id}`
            ))
            .limit(1);

        // Get the last message
        const lastMessage = await db.select()
            .from(messages)
            .where(eq(messages.conversationId, conv.id))
            .orderBy(desc(messages.createdAt))
            .limit(1);

        return {
            id: conv.id,
            updatedAt: conv.updatedAt,
            otherUser: otherParticipant[0] || null,
            lastMessage: lastMessage[0] || null,
        };
    }));

    return conversationList;
}

export async function getMessages(conversationId: string) {
    const user = await getCurrentUser();
    if (!user) return [];

    const conversationMessages = await db.select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(messages.createdAt);

    return conversationMessages.map(msg => ({
        ...msg,
        isOwn: msg.senderId === user.id
    }));
}

export async function sendMessage(conversationId: string, content: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const [newMessage] = await db.insert(messages).values({
        conversationId,
        senderId: user.id,
        content,
    }).returning();

    // Update conversation timestamp
    await db.update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, conversationId));

    revalidatePath("/messages");
    return newMessage;
}

export async function startOrGetConversation(otherUserId: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Check if a conversation already exists between these two
    const existingConv = await db.select({
        id: conversations.id
    })
        .from(conversations)
        .innerJoin(conversationParticipants, eq(conversations.id, conversationParticipants.conversationId))
        .where(and(
            eq(conversationParticipants.userId, user.id),
            sql`EXISTS (SELECT 1 FROM ${conversationParticipants} WHERE conversation_id = ${conversations.id} AND user_id = ${otherUserId})`
        ))
        .limit(1);

    if (existingConv.length > 0) {
        return existingConv[0].id;
    }

    // Create new conversation
    const [newConv] = await db.insert(conversations).values({}).returning();

    await db.insert(conversationParticipants).values([
        { conversationId: newConv.id, userId: user.id },
        { conversationId: newConv.id, userId: otherUserId },
    ]);

    return newConv.id;
}
