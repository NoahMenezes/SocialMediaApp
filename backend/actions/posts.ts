"use server"

import { db } from "@/backend/db"
import { posts, users, news, instagramProfiles, reposts, likes } from "@/backend/db/schema"
import { eq, desc, sql, inArray, and } from "drizzle-orm"
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
            },
            isLiked: false,
            isReposted: false
        }

        revalidatePath("/")
        return { success: true, post: formattedPost }
    } catch (error) {
        console.error("Failed to create post", error)
        return { error: "Failed to create post", success: false }
    }
}

export async function getRepostedPosts() {
    try {
        const user = await getCurrentUser();
        if (!user) return [];

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
            }
        };

        const repostsResult = await db.select(postSelect)
            .from(reposts)
            .innerJoin(posts, eq(reposts.postId, posts.id))
            .innerJoin(users, eq(posts.userId, users.id))
            .where(eq(reposts.userId, user.id))
            .orderBy(desc(reposts.createdAt));

        let formattedPosts = repostsResult.map(post => ({
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
            isRepost: true,
            isLiked: false,
            isReposted: true // By definition, these are reposted by the current user
        }));

        if (formattedPosts.length > 0) {
            const postIds = formattedPosts.map(p => p.id);
            const userLikes = await db.select().from(likes).where(and(eq(likes.userId, user.id), inArray(likes.postId, postIds)));
            const likedPostIds = new Set(userLikes.map(l => l.postId));

            formattedPosts = formattedPosts.map(post => ({
                ...post,
                isLiked: likedPostIds.has(post.id)
            }));
        }

        return formattedPosts;

    } catch (error) {
        console.error("Failed to fetch reposted posts", error);
        return [];
    }
}

export async function getPosts(userId?: string, query?: string, page: number = 1, pageSize: number = 20) {
    try {
        const currentUser = await getCurrentUser();
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

        // Execute Queries
        const [postsResult, repostsResult] = await Promise.all([
            postsQuery.orderBy(desc(posts.createdAt)).limit(pageSize).offset(offset),
            repostsQuery ? repostsQuery.orderBy(desc(reposts.createdAt)).limit(pageSize).offset(offset) : Promise.resolve([]),
        ]);

        // Transform Posts (Direct Authored)
        const formattedPosts = postsResult.map(post => ({
            id: post.id,
            content: post.content,
            timestamp: post.createdAt ? formatTimestamp(post.createdAt) : "",
            rawDate: post.createdAt,
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
            isRepost: false,
            isLiked: false,
            isReposted: false
        }));

        // Transform Reposts (Indirect)
        const formattedReposts = (repostsResult as any[]).map(post => ({
            id: post.id,
            content: post.content,
            timestamp: post.createdAt ? formatTimestamp(post.createdAt) : "",
            rawDate: post.createdAt,
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
            isRepost: true,
            isLiked: false,
            isReposted: false
        }));

        // Combine and Sort
        let combinedFeed: any[] = [];
        if (userId) {
            // Profile View: Only show user's posts and reposts
            combinedFeed = [...formattedPosts, ...formattedReposts];
        } else {
            // Feed View: Show all real posts/reposts
            combinedFeed = [...formattedPosts, ...formattedReposts];
        }

        // Sort by date (descending)
        combinedFeed.sort((a, b) => {
            const dateA = a.rawDate ? new Date(a.rawDate).getTime() : 0;
            const dateB = b.rawDate ? new Date(b.rawDate).getTime() : 0;
            return dateB - dateA;
        });

        // Enrich with Liked/Reposted status if user is logged in
        if (currentUser && combinedFeed.length > 0) {
            // Get unique IDs to query
            const postIds = Array.from(new Set(combinedFeed.map(p => p.id))) as string[];

            const [userLikes, userRepostsData] = await Promise.all([
                db.select().from(likes).where(and(eq(likes.userId, currentUser.id), inArray(likes.postId, postIds))),
                db.select().from(reposts).where(and(eq(reposts.userId, currentUser.id), inArray(reposts.postId, postIds)))
            ]);

            const likedPostIds = new Set(userLikes.map(l => l.postId));
            const repostedPostIds = new Set(userRepostsData.map(r => r.postId));

            combinedFeed = combinedFeed.map(post => ({
                ...post,
                isLiked: likedPostIds.has(post.id),
                isReposted: repostedPostIds.has(post.id)
            }));
        }

        return combinedFeed;

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