'use server';

/**
 * Social Actions
 * 
 * Server actions for following, blocking, and muting users.
 * Supports both local operations and Mastodon integration.
 */

import { db } from '../db';
import { follows, blocks, mutes, users } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/auth.config';
import { createMastodonClient } from '../lib/mastodon-client';
import { revalidatePath } from 'next/cache';

/**
 * Follow a user
 */
export async function followUser(targetUserId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Unauthorized' };
        }

        if (session.user.id === targetUserId) {
            return { error: 'Cannot follow yourself' };
        }

        // Check if already following
        const existingFollow = await db.query.follows.findFirst({
            where: and(
                eq(follows.followerId, session.user.id),
                eq(follows.followingId, targetUserId)
            ),
        });

        if (existingFollow) {
            return { error: 'Already following' };
        }

        // Create follow
        await db.insert(follows).values({
            followerId: session.user.id,
            followingId: targetUserId,
        });

        // Update follower/following counts
        const [currentUser, targetUser] = await Promise.all([
            db.query.users.findFirst({ where: eq(users.id, session.user.id) }),
            db.query.users.findFirst({ where: eq(users.id, targetUserId) }),
        ]);

        if (currentUser) {
            await db.update(users)
                .set({ followingCount: (currentUser.followingCount || 0) + 1 })
                .where(eq(users.id, session.user.id));
        }

        if (targetUser) {
            await db.update(users)
                .set({ followersCount: (targetUser.followersCount || 0) + 1 })
                .where(eq(users.id, targetUserId));

            // Follow on Mastodon if both users have Mastodon accounts
            if (currentUser?.mastodonAccessToken && currentUser?.mastodonInstanceUrl && targetUser?.mastodonId) {
                try {
                    const mastodonClient = createMastodonClient({
                        instanceUrl: currentUser.mastodonInstanceUrl,
                        accessToken: currentUser.mastodonAccessToken,
                    });

                    await mastodonClient.followAccount(targetUser.mastodonId);
                } catch (mastodonError) {
                    console.error('Failed to follow on Mastodon:', mastodonError);
                }
            }
        }

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error following user:', error);
        return { error: 'Failed to follow user' };
    }
}

/**
 * Unfollow a user
 */
export async function unfollowUser(targetUserId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Unauthorized' };
        }

        // Delete follow
        await db.delete(follows).where(
            and(
                eq(follows.followerId, session.user.id),
                eq(follows.followingId, targetUserId)
            )
        );

        // Update follower/following counts
        const [currentUser, targetUser] = await Promise.all([
            db.query.users.findFirst({ where: eq(users.id, session.user.id) }),
            db.query.users.findFirst({ where: eq(users.id, targetUserId) }),
        ]);

        if (currentUser) {
            await db.update(users)
                .set({ followingCount: Math.max((currentUser.followingCount || 0) - 1, 0) })
                .where(eq(users.id, session.user.id));
        }

        if (targetUser) {
            await db.update(users)
                .set({ followersCount: Math.max((targetUser.followersCount || 0) - 1, 0) })
                .where(eq(users.id, targetUserId));

            // Unfollow on Mastodon if both users have Mastodon accounts
            if (currentUser?.mastodonAccessToken && currentUser?.mastodonInstanceUrl && targetUser?.mastodonId) {
                try {
                    const mastodonClient = createMastodonClient({
                        instanceUrl: currentUser.mastodonInstanceUrl,
                        accessToken: currentUser.mastodonAccessToken,
                    });

                    await mastodonClient.unfollowAccount(targetUser.mastodonId);
                } catch (mastodonError) {
                    console.error('Failed to unfollow on Mastodon:', mastodonError);
                }
            }
        }

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error unfollowing user:', error);
        return { error: 'Failed to unfollow user' };
    }
}

/**
 * Block a user
 */
export async function blockUser(targetUserId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Unauthorized' };
        }

        if (session.user.id === targetUserId) {
            return { error: 'Cannot block yourself' };
        }

        // Check if already blocked
        const existingBlock = await db.query.blocks.findFirst({
            where: and(
                eq(blocks.blockerId, session.user.id),
                eq(blocks.blockedId, targetUserId)
            ),
        });

        if (existingBlock) {
            return { error: 'Already blocked' };
        }

        // Create block
        await db.insert(blocks).values({
            blockerId: session.user.id,
            blockedId: targetUserId,
        });

        // Remove any existing follow relationships
        await Promise.all([
            db.delete(follows).where(
                and(
                    eq(follows.followerId, session.user.id),
                    eq(follows.followingId, targetUserId)
                )
            ),
            db.delete(follows).where(
                and(
                    eq(follows.followerId, targetUserId),
                    eq(follows.followingId, session.user.id)
                )
            ),
        ]);

        // Block on Mastodon if applicable
        const [currentUser, targetUser] = await Promise.all([
            db.query.users.findFirst({ where: eq(users.id, session.user.id) }),
            db.query.users.findFirst({ where: eq(users.id, targetUserId) }),
        ]);

        if (currentUser?.mastodonAccessToken && currentUser?.mastodonInstanceUrl && targetUser?.mastodonId) {
            try {
                const mastodonClient = createMastodonClient({
                    instanceUrl: currentUser.mastodonInstanceUrl,
                    accessToken: currentUser.mastodonAccessToken,
                });

                await mastodonClient.blockAccount(targetUser.mastodonId);
            } catch (mastodonError) {
                console.error('Failed to block on Mastodon:', mastodonError);
            }
        }

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error blocking user:', error);
        return { error: 'Failed to block user' };
    }
}

/**
 * Unblock a user
 */
export async function unblockUser(targetUserId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Unauthorized' };
        }

        // Delete block
        await db.delete(blocks).where(
            and(
                eq(blocks.blockerId, session.user.id),
                eq(blocks.blockedId, targetUserId)
            )
        );

        // Unblock on Mastodon if applicable
        const [currentUser, targetUser] = await Promise.all([
            db.query.users.findFirst({ where: eq(users.id, session.user.id) }),
            db.query.users.findFirst({ where: eq(users.id, targetUserId) }),
        ]);

        if (currentUser?.mastodonAccessToken && currentUser?.mastodonInstanceUrl && targetUser?.mastodonId) {
            try {
                const mastodonClient = createMastodonClient({
                    instanceUrl: currentUser.mastodonInstanceUrl,
                    accessToken: currentUser.mastodonAccessToken,
                });

                await mastodonClient.unblockAccount(targetUser.mastodonId);
            } catch (mastodonError) {
                console.error('Failed to unblock on Mastodon:', mastodonError);
            }
        }

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error unblocking user:', error);
        return { error: 'Failed to unblock user' };
    }
}

/**
 * Mute a user
 */
export async function muteUser(targetUserId: string, muteNotifications: boolean = true) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Unauthorized' };
        }

        if (session.user.id === targetUserId) {
            return { error: 'Cannot mute yourself' };
        }

        // Check if already muted
        const existingMute = await db.query.mutes.findFirst({
            where: and(
                eq(mutes.muterId, session.user.id),
                eq(mutes.mutedId, targetUserId)
            ),
        });

        if (existingMute) {
            return { error: 'Already muted' };
        }

        // Create mute
        await db.insert(mutes).values({
            muterId: session.user.id,
            mutedId: targetUserId,
            notifications: muteNotifications,
        });

        // Mute on Mastodon if applicable
        const [currentUser, targetUser] = await Promise.all([
            db.query.users.findFirst({ where: eq(users.id, session.user.id) }),
            db.query.users.findFirst({ where: eq(users.id, targetUserId) }),
        ]);

        if (currentUser?.mastodonAccessToken && currentUser?.mastodonInstanceUrl && targetUser?.mastodonId) {
            try {
                const mastodonClient = createMastodonClient({
                    instanceUrl: currentUser.mastodonInstanceUrl,
                    accessToken: currentUser.mastodonAccessToken,
                });

                await mastodonClient.muteAccount(targetUser.mastodonId, {
                    notifications: muteNotifications,
                });
            } catch (mastodonError) {
                console.error('Failed to mute on Mastodon:', mastodonError);
            }
        }

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error muting user:', error);
        return { error: 'Failed to mute user' };
    }
}

/**
 * Unmute a user
 */
export async function unmuteUser(targetUserId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Unauthorized' };
        }

        // Delete mute
        await db.delete(mutes).where(
            and(
                eq(mutes.muterId, session.user.id),
                eq(mutes.mutedId, targetUserId)
            )
        );

        // Unmute on Mastodon if applicable
        const [currentUser, targetUser] = await Promise.all([
            db.query.users.findFirst({ where: eq(users.id, session.user.id) }),
            db.query.users.findFirst({ where: eq(users.id, targetUserId) }),
        ]);

        if (currentUser?.mastodonAccessToken && currentUser?.mastodonInstanceUrl && targetUser?.mastodonId) {
            try {
                const mastodonClient = createMastodonClient({
                    instanceUrl: currentUser.mastodonInstanceUrl,
                    accessToken: currentUser.mastodonAccessToken,
                });

                await mastodonClient.unmuteAccount(targetUser.mastodonId);
            } catch (mastodonError) {
                console.error('Failed to unmute on Mastodon:', mastodonError);
            }
        }

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error unmuting user:', error);
        return { error: 'Failed to unmute user' };
    }
}

/**
 * Get user's followers
 */
export async function getFollowers(userId: string, limit: number = 20, offset: number = 0) {
    try {
        const followers = await db.query.follows.findMany({
            where: eq(follows.followingId, userId),
            limit,
            offset,
            with: {
                follower: true,
            },
        });

        return { success: true, followers: followers.map(f => f.follower) };
    } catch (error) {
        console.error('Error fetching followers:', error);
        return { error: 'Failed to fetch followers' };
    }
}

/**
 * Get users that a user is following
 */
export async function getFollowing(userId: string, limit: number = 20, offset: number = 0) {
    try {
        const following = await db.query.follows.findMany({
            where: eq(follows.followerId, userId),
            limit,
            offset,
            with: {
                following: true,
            },
        });

        return { success: true, following: following.map(f => f.following) };
    } catch (error) {
        console.error('Error fetching following:', error);
        return { error: 'Failed to fetch following' };
    }
}

/**
 * Check if current user is following a target user
 */
export async function isFollowing(targetUserId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: true, isFollowing: false };
        }

        const follow = await db.query.follows.findFirst({
            where: and(
                eq(follows.followerId, session.user.id),
                eq(follows.followingId, targetUserId)
            ),
        });

        return { success: true, isFollowing: !!follow };
    } catch (error) {
        console.error('Error checking follow status:', error);
        return { error: 'Failed to check follow status' };
    }
}
