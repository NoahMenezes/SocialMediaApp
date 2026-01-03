"use server";

import { db } from "@/backend/db";
import { bookmarks, posts, users, likes, comments, reposts } from "@/backend/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getCurrentUser } from "./auth";

export async function getBookmarkStatus(postId: string) {
    const user = await getCurrentUser();
    if (!user) return false;

    const result = await db.select()
        .from(bookmarks)
        .where(sql`${bookmarks.postId} = ${postId} AND ${bookmarks.userId} = ${user.id}`)
        .limit(1);

    return result.length > 0;
}

export async function toggleBookmark(postId: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const existing = await db.select()
        .from(bookmarks)
        .where(sql`${bookmarks.postId} = ${postId} AND ${bookmarks.userId} = ${user.id}`)
        .limit(1);

    if (existing.length > 0) {
        await db.delete(bookmarks).where(sql`${bookmarks.postId} = ${postId} AND ${bookmarks.userId} = ${user.id}`);
        return false;
    } else {
        await db.insert(bookmarks).values({ postId, userId: user.id });
        return true;
    }
}

export async function getBookmarkedPosts() {
    const user = await getCurrentUser();
    if (!user) return [];

    const bookmarked = await db.select({
        id: posts.id,
        content: posts.content,
        image: posts.image,
        createdAt: posts.createdAt,
        author: {
            id: users.id,
            name: users.name,
            username: users.username,
            image: users.image,
        },
        likesCount: sql<number>`(SELECT count(*) FROM ${likes} WHERE ${likes.postId} = ${posts.id})`,
        commentsCount: sql<number>`(SELECT count(*) FROM ${comments} WHERE ${comments.postId} = ${posts.id})`,
        repostsCount: sql<number>`(SELECT count(*) FROM ${reposts} WHERE ${reposts.postId} = ${posts.id})`,
        isLiked: sql<boolean>`EXISTS (SELECT 1 FROM ${likes} WHERE ${likes.postId} = ${posts.id} AND ${likes.userId} = ${user.id})`,
        isReposted: sql<boolean>`EXISTS (SELECT 1 FROM ${reposts} WHERE ${reposts.postId} = ${posts.id} AND ${reposts.userId} = ${user.id})`,
    })
        .from(bookmarks)
        .innerJoin(posts, eq(bookmarks.postId, posts.id))
        .innerJoin(users, eq(posts.userId, users.id))
        .where(eq(bookmarks.userId, user.id))
        .orderBy(desc(bookmarks.createdAt))
        .limit(50);

    return bookmarked.map((post: any) => ({
        id: post.id,
        content: post.content,
        image: post.image,
        timestamp: post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'recently',
        author: {
            name: post.author.name,
            username: post.author.username || post.author.name.replace(/\s+/g, '').toLowerCase(),
            avatar: post.author.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.name}`,
            verified: true, // Placeholder
        },
        likes: Number(post.likesCount),
        comments: Number(post.commentsCount),
        reposts: Number(post.repostsCount),
        isLiked: Boolean(post.isLiked),
        isReposted: Boolean(post.isReposted),
    }));
}
