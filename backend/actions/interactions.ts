"use server";

import { db } from "@/backend/db";
import { likes, comments, reposts, notifications, posts } from "@/backend/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

// --- LIKES ---

// --- LIKES ---

export async function toggleLike(postId: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Check if like exists using SELECT
    const existingLike = await db.select().from(likes)
        .where(and(eq(likes.userId, user.id), eq(likes.postId, postId)))
        .get();

    if (existingLike) {
        await db.delete(likes).where(and(eq(likes.userId, user.id), eq(likes.postId, postId)));

        // Decrement likesCount
        await db.update(posts)
            .set({ likesCount: sql<number>`${posts.likesCount} - 1` })
            .where(eq(posts.id, postId));
    } else {
        await db.insert(likes).values({
            userId: user.id,
            postId: postId,
        });

        // Increment likesCount
        await db.update(posts)
            .set({ likesCount: sql<number>`${posts.likesCount} + 1` })
            .where(eq(posts.id, postId));

        // Add notification for the post owner
        const post = await db.select().from(posts).where(eq(posts.id, postId)).get(); // Use select here too

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

    // Increment repliesCount
    await db.update(posts)
        .set({ repliesCount: sql<number>`${posts.repliesCount} + 1` })
        .where(eq(posts.id, postId));

    // Add notification
    const post = await db.select().from(posts).where(eq(posts.id, postId)).get();

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

    const existingRepost = await db.select().from(reposts)
        .where(and(eq(reposts.userId, user.id), eq(reposts.postId, postId)))
        .get();

    if (existingRepost) {
        await db.delete(reposts).where(and(eq(reposts.userId, user.id), eq(reposts.postId, postId)));

        // Decrement reblogsCount
        await db.update(posts)
            .set({ reblogsCount: sql<number>`${posts.reblogsCount} - 1` })
            .where(eq(posts.id, postId));
    } else {
        await db.insert(reposts).values({
            userId: user.id,
            postId: postId,
        });

        // Increment reblogsCount
        await db.update(posts)
            .set({ reblogsCount: sql<number>`${posts.reblogsCount} + 1` })
            .where(eq(posts.id, postId));
    }

    revalidatePath("/");
    revalidatePath("/reposts");
    revalidatePath(`/profile`);
}
