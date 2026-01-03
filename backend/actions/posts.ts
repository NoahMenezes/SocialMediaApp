'use server';

/**
 * Post Actions
 * 
 * Server actions for creating, deleting, and interacting with posts.
 * Supports both local posts and Mastodon integration.
 */

import { db } from '../db';
import { posts, likes, reposts, bookmarks, comments, mediaAttachments, users } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/auth.config';
import { createMastodonClient } from '../lib/mastodon-client';
import { revalidatePath } from 'next/cache';

/**
 * Create a new post
 */
export async function createPost(formData: FormData) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Unauthorized' };
        }

        const content = formData.get('content') as string;
        const visibility = (formData.get('visibility') as string) || 'public';
        const sensitive = formData.get('sensitive') === 'true';
        const spoilerText = formData.get('spoilerText') as string | null;
        const inReplyToId = formData.get('inReplyToId') as string | null;

        if (!content || content.trim().length === 0) {
            return { error: 'Content is required' };
        }

        // Create local post
        const [newPost] = await db.insert(posts).values({
            userId: session.user.id,
            content: content.trim(),
            visibility,
            sensitive,
            spoilerText: spoilerText || null,
            inReplyToId: inReplyToId || null,
            likesCount: 0,
            reblogsCount: 0,
            repliesCount: 0,
        }).returning();

        // If user has Mastodon connected, post there too
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
        });

        if (user?.mastodonAccessToken && user?.mastodonInstanceUrl) {
            try {
                const mastodonClient = createMastodonClient({
                    instanceUrl: user.mastodonInstanceUrl,
                    accessToken: user.mastodonAccessToken,
                });

                const mastodonStatus = await mastodonClient.createStatus({
                    status: content,
                    visibility: visibility as any,
                    sensitive,
                    spoiler_text: spoilerText || undefined,
                    in_reply_to_id: inReplyToId || undefined,
                });

                // Update local post with Mastodon ID
                await db.update(posts)
                    .set({
                        mastodonId: mastodonStatus.id,
                        mastodonUrl: mastodonStatus.url,
                    })
                    .where(eq(posts.id, newPost.id));
            } catch (mastodonError) {
                console.error('Failed to post to Mastodon:', mastodonError);
                // Continue anyway - local post was created
            }
        }

        revalidatePath('/');
        return { success: true, post: newPost };
    } catch (error) {
        console.error('Error creating post:', error);
        return { error: 'Failed to create post' };
    }
}

/**
 * Delete a post
 */
export async function deletePost(postId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Unauthorized' };
        }

        // Check if user owns the post
        const post = await db.query.posts.findFirst({
            where: eq(posts.id, postId),
        });

        if (!post) {
            return { error: 'Post not found' };
        }

        if (post.userId !== session.user.id) {
            return { error: 'Unauthorized' };
        }

        // Delete from Mastodon if it exists there
        if (post.mastodonId) {
            const user = await db.query.users.findFirst({
                where: eq(users.id, session.user.id),
            });

            if (user?.mastodonAccessToken && user?.mastodonInstanceUrl) {
                try {
                    const mastodonClient = createMastodonClient({
                        instanceUrl: user.mastodonInstanceUrl,
                        accessToken: user.mastodonAccessToken,
                    });

                    await mastodonClient.deleteStatus(post.mastodonId);
                } catch (mastodonError) {
                    console.error('Failed to delete from Mastodon:', mastodonError);
                }
            }
        }

        // Delete local post (cascade will handle related data)
        await db.delete(posts).where(eq(posts.id, postId));

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error deleting post:', error);
        return { error: 'Failed to delete post' };
    }
}

/**
 * Like a post
 */
export async function likePost(postId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Unauthorized' };
        }

        // Check if already liked
        const existingLike = await db.query.likes.findFirst({
            where: and(
                eq(likes.userId, session.user.id),
                eq(likes.postId, postId)
            ),
        });

        if (existingLike) {
            return { error: 'Already liked' };
        }

        // Create like
        await db.insert(likes).values({
            userId: session.user.id,
            postId,
        });

        // Update like count
        const post = await db.query.posts.findFirst({
            where: eq(posts.id, postId),
        });

        if (post) {
            await db.update(posts)
                .set({ likesCount: (post.likesCount || 0) + 1 })
                .where(eq(posts.id, postId));

            // Like on Mastodon if it exists there
            if (post.mastodonId) {
                const user = await db.query.users.findFirst({
                    where: eq(users.id, session.user.id),
                });

                if (user?.mastodonAccessToken && user?.mastodonInstanceUrl) {
                    try {
                        const mastodonClient = createMastodonClient({
                            instanceUrl: user.mastodonInstanceUrl,
                            accessToken: user.mastodonAccessToken,
                        });

                        await mastodonClient.favouriteStatus(post.mastodonId);
                    } catch (mastodonError) {
                        console.error('Failed to like on Mastodon:', mastodonError);
                    }
                }
            }
        }

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error liking post:', error);
        return { error: 'Failed to like post' };
    }
}

/**
 * Unlike a post
 */
export async function unlikePost(postId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Unauthorized' };
        }

        // Delete like
        await db.delete(likes).where(
            and(
                eq(likes.userId, session.user.id),
                eq(likes.postId, postId)
            )
        );

        // Update like count
        const post = await db.query.posts.findFirst({
            where: eq(posts.id, postId),
        });

        if (post) {
            await db.update(posts)
                .set({ likesCount: Math.max((post.likesCount || 0) - 1, 0) })
                .where(eq(posts.id, postId));

            // Unlike on Mastodon if it exists there
            if (post.mastodonId) {
                const user = await db.query.users.findFirst({
                    where: eq(users.id, session.user.id),
                });

                if (user?.mastodonAccessToken && user?.mastodonInstanceUrl) {
                    try {
                        const mastodonClient = createMastodonClient({
                            instanceUrl: user.mastodonInstanceUrl,
                            accessToken: user.mastodonAccessToken,
                        });

                        await mastodonClient.unfavouriteStatus(post.mastodonId);
                    } catch (mastodonError) {
                        console.error('Failed to unlike on Mastodon:', mastodonError);
                    }
                }
            }
        }

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error unliking post:', error);
        return { error: 'Failed to unlike post' };
    }
}

/**
 * Repost (boost) a post
 */
export async function repostPost(postId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Unauthorized' };
        }

        // Check if already reposted
        const existingRepost = await db.query.reposts.findFirst({
            where: and(
                eq(reposts.userId, session.user.id),
                eq(reposts.postId, postId)
            ),
        });

        if (existingRepost) {
            return { error: 'Already reposted' };
        }

        // Create repost
        await db.insert(reposts).values({
            userId: session.user.id,
            postId,
        });

        // Update repost count
        const post = await db.query.posts.findFirst({
            where: eq(posts.id, postId),
        });

        if (post) {
            await db.update(posts)
                .set({ reblogsCount: (post.reblogsCount || 0) + 1 })
                .where(eq(posts.id, postId));

            // Reblog on Mastodon if it exists there
            if (post.mastodonId) {
                const user = await db.query.users.findFirst({
                    where: eq(users.id, session.user.id),
                });

                if (user?.mastodonAccessToken && user?.mastodonInstanceUrl) {
                    try {
                        const mastodonClient = createMastodonClient({
                            instanceUrl: user.mastodonInstanceUrl,
                            accessToken: user.mastodonAccessToken,
                        });

                        await mastodonClient.reblogStatus(post.mastodonId);
                    } catch (mastodonError) {
                        console.error('Failed to reblog on Mastodon:', mastodonError);
                    }
                }
            }
        }

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error reposting post:', error);
        return { error: 'Failed to repost' };
    }
}

/**
 * Unrepost a post
 */
export async function unrepostPost(postId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Unauthorized' };
        }

        // Delete repost
        await db.delete(reposts).where(
            and(
                eq(reposts.userId, session.user.id),
                eq(reposts.postId, postId)
            )
        );

        // Update repost count
        const post = await db.query.posts.findFirst({
            where: eq(posts.id, postId),
        });

        if (post) {
            await db.update(posts)
                .set({ reblogsCount: Math.max((post.reblogsCount || 0) - 1, 0) })
                .where(eq(posts.id, postId));

            // Unreblog on Mastodon if it exists there
            if (post.mastodonId) {
                const user = await db.query.users.findFirst({
                    where: eq(users.id, session.user.id),
                });

                if (user?.mastodonAccessToken && user?.mastodonInstanceUrl) {
                    try {
                        const mastodonClient = createMastodonClient({
                            instanceUrl: user.mastodonInstanceUrl,
                            accessToken: user.mastodonAccessToken,
                        });

                        await mastodonClient.unreblogStatus(post.mastodonId);
                    } catch (mastodonError) {
                        console.error('Failed to unreblog on Mastodon:', mastodonError);
                    }
                }
            }
        }

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error unreposting post:', error);
        return { error: 'Failed to unrepost' };
    }
}

/**
 * Bookmark a post
 */
export async function bookmarkPost(postId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Unauthorized' };
        }

        // Check if already bookmarked
        const existingBookmark = await db.query.bookmarks.findFirst({
            where: and(
                eq(bookmarks.userId, session.user.id),
                eq(bookmarks.postId, postId)
            ),
        });

        if (existingBookmark) {
            return { error: 'Already bookmarked' };
        }

        // Create bookmark
        await db.insert(bookmarks).values({
            userId: session.user.id,
            postId,
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error bookmarking post:', error);
        return { error: 'Failed to bookmark post' };
    }
}

/**
 * Remove bookmark from a post
 */
export async function unbookmarkPost(postId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Unauthorized' };
        }

        // Delete bookmark
        await db.delete(bookmarks).where(
            and(
                eq(bookmarks.userId, session.user.id),
                eq(bookmarks.postId, postId)
            )
        );

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error removing bookmark:', error);
        return { error: 'Failed to remove bookmark' };
    }
}

/**
 * Add a comment to a post
 */
export async function addComment(postId: string, content: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Unauthorized' };
        }

        if (!content || content.trim().length === 0) {
            return { error: 'Comment content is required' };
        }

        // Create comment
        const [newComment] = await db.insert(comments).values({
            userId: session.user.id,
            postId,
            content: content.trim(),
        }).returning();

        // Update replies count
        const post = await db.query.posts.findFirst({
            where: eq(posts.id, postId),
        });

        if (post) {
            await db.update(posts)
                .set({ repliesCount: (post.repliesCount || 0) + 1 })
                .where(eq(posts.id, postId));
        }

        revalidatePath('/');
        return { success: true, comment: newComment };
    } catch (error) {
        console.error('Error adding comment:', error);
        return { error: 'Failed to add comment' };
    }
}

/**
 * Get posts for the feed
 */
export async function getFeedPosts(limit: number = 20, offset: number = 0) {
    try {
        const session = await auth();

        const feedPosts = await db.query.posts.findMany({
            limit,
            offset,
            orderBy: [desc(posts.createdAt)],
            with: {
                user: true,
                likes: true,
                reposts: true,
                comments: {
                    with: {
                        user: true,
                    },
                },
            },
        });

        return { success: true, posts: feedPosts };
    } catch (error) {
        console.error('Error fetching feed posts:', error);
        return { error: 'Failed to fetch posts' };
    }
}
