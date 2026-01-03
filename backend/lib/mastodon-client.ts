/**
 * Mastodon API Client
 * 
 * This module provides a comprehensive client for interacting with Mastodon API.
 * It supports authentication, posting, timeline fetching, and all social interactions.
 * 
 * Documentation: https://docs.joinmastodon.org/client/intro/
 */

export interface MastodonConfig {
    instanceUrl: string;
    accessToken: string;
}

export interface MastodonAccount {
    id: string;
    username: string;
    acct: string;
    display_name: string;
    locked: boolean;
    bot: boolean;
    created_at: string;
    note: string;
    url: string;
    avatar: string;
    avatar_static: string;
    header: string;
    header_static: string;
    followers_count: number;
    following_count: number;
    statuses_count: number;
    last_status_at: string;
    fields: Array<{ name: string; value: string; verified_at: string | null }>;
}

export interface MastodonStatus {
    id: string;
    created_at: string;
    in_reply_to_id: string | null;
    in_reply_to_account_id: string | null;
    sensitive: boolean;
    spoiler_text: string;
    visibility: 'public' | 'unlisted' | 'private' | 'direct';
    language: string | null;
    uri: string;
    url: string;
    replies_count: number;
    reblogs_count: number;
    favourites_count: number;
    content: string;
    reblog: MastodonStatus | null;
    account: MastodonAccount;
    media_attachments: MastodonMediaAttachment[];
    mentions: Array<{ id: string; username: string; url: string; acct: string }>;
    tags: Array<{ name: string; url: string }>;
    poll: MastodonPoll | null;
    card: any | null;
    favourited?: boolean;
    reblogged?: boolean;
    bookmarked?: boolean;
}

export interface MastodonMediaAttachment {
    id: string;
    type: 'image' | 'video' | 'gifv' | 'audio' | 'unknown';
    url: string;
    preview_url: string;
    remote_url: string | null;
    description: string | null;
    blurhash: string | null;
    meta?: any;
}

export interface MastodonPoll {
    id: string;
    expires_at: string | null;
    expired: boolean;
    multiple: boolean;
    votes_count: number;
    voters_count: number | null;
    voted?: boolean;
    own_votes?: number[];
    options: Array<{ title: string; votes_count: number | null }>;
}

export interface MastodonNotification {
    id: string;
    type: 'mention' | 'status' | 'reblog' | 'follow' | 'follow_request' | 'favourite' | 'poll' | 'update';
    created_at: string;
    account: MastodonAccount;
    status?: MastodonStatus;
}

export interface CreateStatusParams {
    status: string;
    in_reply_to_id?: string;
    media_ids?: string[];
    sensitive?: boolean;
    spoiler_text?: string;
    visibility?: 'public' | 'unlisted' | 'private' | 'direct';
    language?: string;
    poll?: {
        options: string[];
        expires_in: number;
        multiple?: boolean;
    };
}

export class MastodonClient {
    private instanceUrl: string;
    private accessToken: string;

    constructor(config: MastodonConfig) {
        this.instanceUrl = config.instanceUrl.replace(/\/$/, ''); // Remove trailing slash
        this.accessToken = config.accessToken;
    }

    /**
     * Make an authenticated request to the Mastodon API
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.instanceUrl}/api/v1${endpoint}`;

        const headers: HeadersInit = {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            ...options.headers,
        };

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(`Mastodon API Error: ${response.status} - ${JSON.stringify(error)}`);
        }

        return response.json();
    }

    // ==================== ACCOUNT METHODS ====================

    /**
     * Get the current user's account information
     */
    async verifyCredentials(): Promise<MastodonAccount> {
        return this.request<MastodonAccount>('/accounts/verify_credentials');
    }

    /**
     * Get an account by ID
     */
    async getAccount(accountId: string): Promise<MastodonAccount> {
        return this.request<MastodonAccount>(`/accounts/${accountId}`);
    }

    /**
     * Update the current user's profile
     */
    async updateCredentials(params: {
        display_name?: string;
        note?: string;
        avatar?: File;
        header?: File;
        locked?: boolean;
        bot?: boolean;
    }): Promise<MastodonAccount> {
        const formData = new FormData();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                if (typeof value === 'boolean') {
                    formData.append(key, String(value));
                } else {
                    formData.append(key, value);
                }
            }
        });

        return this.request<MastodonAccount>('/accounts/update_credentials', {
            method: 'PATCH',
            body: formData,
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                // Don't set Content-Type for FormData
            },
        });
    }

    // ==================== TIMELINE METHODS ====================

    /**
     * Get the home timeline
     */
    async getHomeTimeline(params?: {
        max_id?: string;
        since_id?: string;
        min_id?: string;
        limit?: number;
    }): Promise<MastodonStatus[]> {
        const queryParams = new URLSearchParams(params as any);
        return this.request<MastodonStatus[]>(`/timelines/home?${queryParams}`);
    }

    /**
     * Get the public timeline
     */
    async getPublicTimeline(params?: {
        local?: boolean;
        remote?: boolean;
        only_media?: boolean;
        max_id?: string;
        since_id?: string;
        min_id?: string;
        limit?: number;
    }): Promise<MastodonStatus[]> {
        const queryParams = new URLSearchParams(params as any);
        return this.request<MastodonStatus[]>(`/timelines/public?${queryParams}`);
    }

    /**
     * Get a hashtag timeline
     */
    async getHashtagTimeline(hashtag: string, params?: {
        local?: boolean;
        only_media?: boolean;
        max_id?: string;
        since_id?: string;
        min_id?: string;
        limit?: number;
    }): Promise<MastodonStatus[]> {
        const queryParams = new URLSearchParams(params as any);
        return this.request<MastodonStatus[]>(`/timelines/tag/${hashtag}?${queryParams}`);
    }

    // ==================== STATUS METHODS ====================

    /**
     * Get a single status by ID
     */
    async getStatus(statusId: string): Promise<MastodonStatus> {
        return this.request<MastodonStatus>(`/statuses/${statusId}`);
    }

    /**
     * Create a new status (post)
     */
    async createStatus(params: CreateStatusParams): Promise<MastodonStatus> {
        return this.request<MastodonStatus>('/statuses', {
            method: 'POST',
            body: JSON.stringify(params),
        });
    }

    /**
     * Delete a status
     */
    async deleteStatus(statusId: string): Promise<MastodonStatus> {
        return this.request<MastodonStatus>(`/statuses/${statusId}`, {
            method: 'DELETE',
        });
    }

    /**
     * Get status context (replies and ancestors)
     */
    async getStatusContext(statusId: string): Promise<{
        ancestors: MastodonStatus[];
        descendants: MastodonStatus[];
    }> {
        return this.request(`/statuses/${statusId}/context`);
    }

    // ==================== INTERACTION METHODS ====================

    /**
     * Favourite (like) a status
     */
    async favouriteStatus(statusId: string): Promise<MastodonStatus> {
        return this.request<MastodonStatus>(`/statuses/${statusId}/favourite`, {
            method: 'POST',
        });
    }

    /**
     * Unfavourite (unlike) a status
     */
    async unfavouriteStatus(statusId: string): Promise<MastodonStatus> {
        return this.request<MastodonStatus>(`/statuses/${statusId}/unfavourite`, {
            method: 'POST',
        });
    }

    /**
     * Reblog (boost/repost) a status
     */
    async reblogStatus(statusId: string): Promise<MastodonStatus> {
        return this.request<MastodonStatus>(`/statuses/${statusId}/reblog`, {
            method: 'POST',
        });
    }

    /**
     * Unreblog a status
     */
    async unreblogStatus(statusId: string): Promise<MastodonStatus> {
        return this.request<MastodonStatus>(`/statuses/${statusId}/unreblog`, {
            method: 'POST',
        });
    }

    /**
     * Bookmark a status
     */
    async bookmarkStatus(statusId: string): Promise<MastodonStatus> {
        return this.request<MastodonStatus>(`/statuses/${statusId}/bookmark`, {
            method: 'POST',
        });
    }

    /**
     * Unbookmark a status
     */
    async unbookmarkStatus(statusId: string): Promise<MastodonStatus> {
        return this.request<MastodonStatus>(`/statuses/${statusId}/unbookmark`, {
            method: 'POST',
        });
    }

    // ==================== FOLLOW METHODS ====================

    /**
     * Follow an account
     */
    async followAccount(accountId: string): Promise<any> {
        return this.request(`/accounts/${accountId}/follow`, {
            method: 'POST',
        });
    }

    /**
     * Unfollow an account
     */
    async unfollowAccount(accountId: string): Promise<any> {
        return this.request(`/accounts/${accountId}/unfollow`, {
            method: 'POST',
        });
    }

    /**
     * Block an account
     */
    async blockAccount(accountId: string): Promise<any> {
        return this.request(`/accounts/${accountId}/block`, {
            method: 'POST',
        });
    }

    /**
     * Unblock an account
     */
    async unblockAccount(accountId: string): Promise<any> {
        return this.request(`/accounts/${accountId}/unblock`, {
            method: 'POST',
        });
    }

    /**
     * Mute an account
     */
    async muteAccount(accountId: string, params?: {
        notifications?: boolean;
        duration?: number;
    }): Promise<any> {
        return this.request(`/accounts/${accountId}/mute`, {
            method: 'POST',
            body: JSON.stringify(params || {}),
        });
    }

    /**
     * Unmute an account
     */
    async unmuteAccount(accountId: string): Promise<any> {
        return this.request(`/accounts/${accountId}/unmute`, {
            method: 'POST',
        });
    }

    // ==================== NOTIFICATION METHODS ====================

    /**
     * Get notifications
     */
    async getNotifications(params?: {
        max_id?: string;
        since_id?: string;
        min_id?: string;
        limit?: number;
        types?: string[];
        exclude_types?: string[];
    }): Promise<MastodonNotification[]> {
        const queryParams = new URLSearchParams();

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach(v => queryParams.append(`${key}[]`, v));
                } else if (value !== undefined) {
                    queryParams.append(key, String(value));
                }
            });
        }

        return this.request<MastodonNotification[]>(`/notifications?${queryParams}`);
    }

    /**
     * Clear all notifications
     */
    async clearNotifications(): Promise<void> {
        return this.request('/notifications/clear', {
            method: 'POST',
        });
    }

    /**
     * Dismiss a single notification
     */
    async dismissNotification(notificationId: string): Promise<void> {
        return this.request(`/notifications/${notificationId}/dismiss`, {
            method: 'POST',
        });
    }

    // ==================== MEDIA METHODS ====================

    /**
     * Upload a media file
     */
    async uploadMedia(file: File, params?: {
        description?: string;
        focus?: string;
    }): Promise<MastodonMediaAttachment> {
        const formData = new FormData();
        formData.append('file', file);

        if (params?.description) {
            formData.append('description', params.description);
        }
        if (params?.focus) {
            formData.append('focus', params.focus);
        }

        return this.request<MastodonMediaAttachment>('/media', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
            },
        });
    }

    // ==================== SEARCH METHODS ====================

    /**
     * Search for content
     */
    async search(params: {
        q: string;
        type?: 'accounts' | 'hashtags' | 'statuses';
        resolve?: boolean;
        limit?: number;
        offset?: number;
        following?: boolean;
    }): Promise<{
        accounts: MastodonAccount[];
        statuses: MastodonStatus[];
        hashtags: Array<{ name: string; url: string; history: any[] }>;
    }> {
        const queryParams = new URLSearchParams(params as any);
        return this.request(`/search?${queryParams}`);
    }
}

/**
 * Create a Mastodon client instance
 */
export function createMastodonClient(config: MastodonConfig): MastodonClient {
    return new MastodonClient(config);
}
