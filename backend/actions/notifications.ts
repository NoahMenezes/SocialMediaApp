"use server";

import { db } from "@/backend/db";
import { notifications, users } from "@/backend/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "./auth";

export async function getNotifications() {
    const user = await getCurrentUser();
    if (!user) return [];

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
        .where(eq(notifications.recipientId, user.id))
        .orderBy(desc(notifications.createdAt))
        .limit(50);

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
}
