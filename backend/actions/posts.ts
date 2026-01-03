"use server";

import { db } from "@/backend/db";
import { posts, users, likes, comments, reposts } from "@/backend/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

export async function createPost(content: string, image?: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const [newPost] = await db.insert(posts).values({
        userId: user.id,
        content,
        image,
    }).returning();

    revalidatePath("/");
    return newPost;
}

export async function getPosts(userId?: string) {
    const user = await getCurrentUser();

    let query = db.select({
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
        isLiked: user ? sql<boolean>`EXISTS (SELECT 1 FROM ${likes} WHERE ${likes.postId} = ${posts.id} AND ${likes.userId} = ${user.id})` : sql<boolean>`false`,
        isReposted: user ? sql<boolean>`EXISTS (SELECT 1 FROM ${reposts} WHERE ${reposts.postId} = ${posts.id} AND ${reposts.userId} = ${user.id})` : sql<boolean>`false`,
    })
        .from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .orderBy(desc(posts.createdAt)) as any;

    if (userId) {
        query = query.where(eq(posts.userId, userId));
    }

    const allPosts = await query.limit(50);

    return allPosts.map((post: any) => ({
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
