"use server"

import { db } from "@/backend/db"
import { posts, users } from "@/backend/db/schema"
import { eq, desc } from "drizzle-orm"
import { auth } from "@/auth.config"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "./auth"

export async function createPost(formData: FormData) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return { error: "Unauthorized", success: false }
        }

        const content = formData.get("content") as string
        const image = formData.get("image") as string | null

        if (!content && !image) {
            return { error: "Post cannot be empty", success: false }
        }

        const [newPostData] = await db.insert(posts).values({
            userId: user.id,
            content: content || "",
            image: image,
        }).returning()

        // Fetch user info to return a complete post object
        const author = await db.query.users.findFirst({
            where: eq(users.id, user.id)
        })

        const formattedPost = {
            id: newPostData.id,
            content: newPostData.content,
            timestamp: "Just now",
            likes: 0,
            reposts: 0,
            comments: 0,
            image: newPostData.image,
            author: {
                name: author?.name || user.name || "Unknown",
                username: author?.username || "unknown",
                avatar: author?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author?.name || 'User'}`,
                verified: false
            }
        }

        revalidatePath("/")
        return { success: true, post: formattedPost }
    } catch (error) {
        console.error("Failed to create post", error)
        return { error: "Failed to create post", success: false }
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
            timestamp: post.createdAt ? formatTimestamp(post.createdAt) : "",
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

function formatTimestamp(date: Date) {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}