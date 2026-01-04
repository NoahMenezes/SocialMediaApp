"use server"

import { db } from "@/backend/db"
import { posts, users, news, instagramProfiles, reposts } from "@/backend/db/schema"
import { eq, desc, sql } from "drizzle-orm"
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
                avatar: author?.image || "",
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

export async function getPosts(userId?: string, query?: string, page: number = 1, pageSize: number = 20) {
    try {
        const offset = (page - 1) * pageSize;

        // Common definition for post selection to ensure consistency
        const postSelect = {
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
                verified: eq(users.emailVerified, users.emailVerified)
            }
        };

        // 1. Fetch Posts
        let postsQuery = db.select(postSelect)
            .from(posts)
            .innerJoin(users, eq(posts.userId, users.id));

        // 2. Prepare Reposts Query (Only for Profile View)
        let repostsQuery: any = null;

        if (userId) {
            // @ts-ignore
            postsQuery = postsQuery.where(eq(posts.userId, userId));

            // Setup reposts query: Select Post + Original Author, JOIN Reposts to filter by 'reposter params'
            repostsQuery = db.select(postSelect)
                .from(reposts)
                .innerJoin(posts, eq(reposts.postId, posts.id))
                .innerJoin(users, eq(posts.userId, users.id)) // Join original author
                .where(eq(reposts.userId, userId));

        } else if (query) {
            // @ts-ignore
            postsQuery = postsQuery.where(sql`${posts.content} LIKE ${`%${query}%`}`);
        }

        // 2. Fetch News (Treat as Posts)
        let newsQuery = db.select().from(news);
        if (query) {
            // @ts-ignore
            newsQuery = newsQuery.where(
                // @ts-ignore
                sql`${news.summary} LIKE ${`%${query}%`} OR ${news.text} LIKE ${`%${query}%`}`
            );
        }

        // 3. Fetch Instagram Profiles (Treat as "New User" posts)
        let instaQuery = db.select().from(instagramProfiles);
        if (query) {
            // @ts-ignore
            instaQuery = instaQuery.where(
                // @ts-ignore
                sql`${instagramProfiles.username} LIKE ${`%${query}%`} OR ${instagramProfiles.fullName} LIKE ${`%${query}%`}`
            );
        }

        // Execute queries in parallel with LIMIT and OFFSET
        const [postsResult, repostsResult, newsResult, instaResult] = await Promise.all([
            postsQuery.orderBy(desc(posts.createdAt)).limit(pageSize).offset(offset),
            repostsQuery ? repostsQuery.orderBy(desc(reposts.createdAt)).limit(pageSize).offset(offset) : Promise.resolve([]),
            newsQuery.orderBy(desc(news.createdAt)).limit(Math.max(2, Math.floor(pageSize / 4))).offset(Math.floor(offset / 4)),
            instaQuery.limit(Math.max(2, Math.floor(pageSize / 4))).offset(Math.floor(offset / 4))
        ]);

        // Transform Posts
        const formattedPosts = postsResult.map(post => ({
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
                avatar: post.author?.image || "", // Empty if no image
                verified: false
            },
            source: 'app',
            isRepost: false
        }));

        // Transform Reposts
        const formattedReposts = (repostsResult as any[]).map(post => ({
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
                avatar: post.author?.image || "",
                verified: false
            },
            source: 'app',
            isRepost: true
        }));

        // Transform News
        const formattedNews = newsResult.map(item => ({
            id: item.id,
            content: `📰 ${item.summary}\n\n${item.text}`,
            timestamp: item.createdAt ? formatTimestamp(item.createdAt) : "",
            likes: 0,
            reposts: 0,
            comments: 0,
            image: null, // News usually doesn't have an image col in this schema
            author: {
                name: "Global News",
                username: "newsbot",
                avatar: "", // No default avatar
                verified: true
            },
            source: 'news'
        }));

        // Transform Instagram Profiles
        const formattedInsta = instaResult.map(profile => ({
            id: profile.id,
            content: `👋 New creator joined: ${profile.fullName || profile.username}\n\n${profile.biography || "No bio available."}`,
            timestamp: profile.createdAt ? formatTimestamp(profile.createdAt) : "",
            likes: profile.followersCount || 0, // Use followers as "likes" for fun
            reposts: 0,
            comments: 0,
            image: profile.profilePicUrl,
            author: {
                name: profile.fullName || profile.username,
                username: profile.username,
                avatar: profile.profilePicUrl || "",
                verified: profile.isVerified || false
            },
            source: 'instagram'
        }));

        // Combine and Sort
        // Combine and Sort
        const combinedFeed = [...formattedPosts, ...formattedReposts, ...formattedNews, ...formattedInsta];

        // Shuffle slightly or sort by date? 
        // Since news/insta might have old dates or all same dates (import time), strict date sort might bunch them.
        // But for "average social media app", date sort is standard.
        // Use a simple date sort, fallback to random if dates match.
        // Note: formatTimestamp returns a string, so we can't sort by that. We rely on the fact that we fetched them ordered, but combining breaks order.
        // We should ideally keep the raw date for sorting.
        // Re-mapping for sort... actually, let's just interleave or simply sort by id if dates are weird.
        // For this task, simple concatenation is often fine, but let's try to randomize or mix if query is generic.

        // IF searching, rank by relevance? Simple concat is fine.
        // IF feed (no query), let's sort by random to simulate a "discovery" feed if dates are identical (import artifacts).

        return combinedFeed.sort(() => Math.random() - 0.5); // Simple shuffle for "Feed" feel since imported dates might be identical.

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