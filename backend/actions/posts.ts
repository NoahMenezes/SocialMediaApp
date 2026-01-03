"use server"

import { db } from "@/backend/db"
import { posts, users } from "@/backend/db/schema"
import { eq, desc } from "drizzle-orm"
import { auth } from "@/auth.config"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "./auth"

export async function createPost(content: string) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            throw new Error("Unauthorized")
        }

        const [newPost] = await db.insert(posts).values({
            userId: user.id,
            content,
        }).returning()

        revalidatePath("/")
        return newPost
    } catch (error) {
        console.error("Failed to create post", error)
        throw new Error("Failed to create post")
    }
}

export async function getPosts(userId?: string) {
    try {
        let query = db.select({
            id: posts.id,
            content: posts.content,
            createdAt: posts.createdAt,
            likesCount: posts.likesCount,
            reblogsCount: posts.reblogsCount,
            repliesCount: posts.repliesCount,
            image: posts.image,
            author: {
                id: users.id,
                name: users.name,
                username: users.username,
                image: users.image,
            }
        })
            .from(posts)
            .innerJoin(users, eq(posts.userId, users.id))
            .orderBy(desc(posts.createdAt));

        if (userId) {
            // @ts-ignore
            query = query.where(eq(posts.userId, userId));
        }

        const result = await query;

        return result.map(post => ({
            id: post.id,
            content: post.content,
            timestamp: post.createdAt?.toISOString() || "",
            likes: post.likesCount || 0,
            reposts: post.reblogsCount || 0,
            comments: post.repliesCount || 0,
            image: post.image,
            author: {
                name: post.author?.name || "Unknown",
                username: post.author?.username || "unknown",
                avatar: post.author?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.name || 'User'}`,
                verified: false
            }
        }))

    } catch (error) {
        console.error("Failed to fetch posts", error)
        return []
    }
}