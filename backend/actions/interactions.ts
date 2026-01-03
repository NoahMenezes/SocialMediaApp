"use server";

import { db } from "@/backend/db";
import { likes, comments, reposts, notifications, posts } from "@/backend/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

// --- LIKES ---

export async function toggleLike(postId: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const existingLike = await db.query.likes.findFirst({
        where: and(eq(likes.userId, user.id), eq(likes.postId, postId)),
    });

    if (existingLike) {
        await db.delete(likes).where(and(eq(likes.userId, user.id), eq(likes.postId, postId)));
    } else {
        await db.insert(likes).values({
            userId: user.id,
            postId: postId,
        });

        // Add notification for the post owner
        const post = await db.query.posts.findFirst({
            where: eq(posts.id, postId),
        });

        if (post && post.userId !== user.id) {
            await db.insert(notifications).values({
                recipientId: post.userId,
                senderId: user.id,
                type: "like",
                postId: postId,
            });
        }
    }

    revalidatePath("/");
    revalidatePath(`/profile`);
}

// --- COMMENTS ---

export async function addComment(postId: string, content: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const [newComment] = await db.insert(comments).values({
        userId: user.id,
        postId: postId,
        content: content,
    }).returning();

    // Add notification
    const post = await db.query.posts.findFirst({
        where: eq(posts.id, postId),
    });

    if (post && post.userId !== user.id) {
        await db.insert(notifications).values({
            recipientId: post.userId,
            senderId: user.id,
            type: "reply",
            postId: postId,
        });
    }

    revalidatePath("/");
    return newComment;
}

// --- REPOSTS ---

export async function toggleRepost(postId: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const existingRepost = await db.query.reposts.findFirst({
        where: and(eq(reposts.userId, user.id), eq(reposts.postId, postId)),
    });

    if (existingRepost) {
        await db.delete(reposts).where(and(eq(reposts.userId, user.id), eq(reposts.postId, postId)));
    } else {
        await db.insert(reposts).values({
            userId: user.id,
            postId: postId,
        });
    }

    revalidatePath("/");
    revalidatePath(`/profile`);
}
