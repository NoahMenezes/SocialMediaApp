# Backend Actions API Reference

Quick reference guide for all available backend actions in your social media app.

---

## 📬 Posts API

### Create Post
```typescript
import { createPost } from '@/backend/actions/posts';

const formData = new FormData();
formData.append('content', 'Your post content');
formData.append('visibility', 'public'); // public, unlisted, private, direct
formData.append('sensitive', 'false');
formData.append('spoilerText', 'Optional content warning');
formData.append('inReplyToId', 'optional-post-id');

const result = await createPost(formData);
// Returns: { success: true, post: Post } | { error: string }
```

### Delete Post
```typescript
import { deletePost } from '@/backend/actions/posts';

const result = await deletePost(postId);
// Returns: { success: true } | { error: string }
```

### Like/Unlike Post
```typescript
import { likePost, unlikePost } from '@/backend/actions/posts';

await likePost(postId);
await unlikePost(postId);
```

### Repost/Unrepost
```typescript
import { repostPost, unrepostPost } from '@/backend/actions/posts';

await repostPost(postId);
await unrepostPost(postId);
```

### Bookmark/Unbookmark
```typescript
import { bookmarkPost, unbookmarkPost } from '@/backend/actions/posts';

await bookmarkPost(postId);
await unbookmarkPost(postId);
```

### Add Comment
```typescript
import { addComment } from '@/backend/actions/posts';

const result = await addComment(postId, 'Your comment');
// Returns: { success: true, comment: Comment } | { error: string }
```

### Get Feed
```typescript
import { getFeedPosts } from '@/backend/actions/posts';

const result = await getFeedPosts(20, 0); // limit, offset
// Returns: { success: true, posts: Post[] } | { error: string }
```

---

## 👥 Social API

### Follow/Unfollow User
```typescript
import { followUser, unfollowUser } from '@/backend/actions/social';

await followUser(targetUserId);
await unfollowUser(targetUserId);
```

### Get Followers/Following
```typescript
import { getFollowers, getFollowing } from '@/backend/actions/social';

const followers = await getFollowers(userId, 20, 0);
const following = await getFollowing(userId, 20, 0);
// Returns: { success: true, followers/following: User[] } | { error: string }
```

### Check Follow Status
```typescript
import { isFollowing } from '@/backend/actions/social';

const result = await isFollowing(targetUserId);
// Returns: { success: true, isFollowing: boolean } | { error: string }
```

### Block/Unblock User
```typescript
import { blockUser, unblockUser } from '@/backend/actions/social';

await blockUser(targetUserId);
await unblockUser(targetUserId);
```

### Mute/Unmute User
```typescript
import { muteUser, unmuteUser } from '@/backend/actions/social';

await muteUser(targetUserId, true); // true = mute notifications too
await unmuteUser(targetUserId);
```

---

## 🔔 Notifications API

### Get Notifications
```typescript
import { getNotifications } from '@/backend/actions/notifications';

const result = await getNotifications(20, 0); // limit, offset
// Returns: { success: true, notifications: Notification[] } | { error: string }
```

### Get Unread Count
```typescript
import { getUnreadNotificationCount } from '@/backend/actions/notifications';

const result = await getUnreadNotificationCount();
// Returns: { success: true, count: number } | { error: string }
```

### Mark as Read
```typescript
import { 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '@/backend/actions/notifications';

await markNotificationAsRead(notificationId);
await markAllNotificationsAsRead();
```

### Delete Notification
```typescript
import { deleteNotification } from '@/backend/actions/notifications';

await deleteNotification(notificationId);
```

### Sync from Mastodon
```typescript
import { syncMastodonNotifications } from '@/backend/actions/notifications';

await syncMastodonNotifications();
```

---

## 💬 Messages API

### Send Message
```typescript
import { sendMessage } from '@/backend/actions/messages';

const result = await sendMessage(receiverId, 'Your message');
// Returns: { success: true, message: Message } | { error: string }
```

### Get Conversation
```typescript
import { getMessages } from '@/backend/actions/messages';

const result = await getMessages(otherUserId);
// Returns: { success: true, messages: Message[] } | { error: string }
```

### Get All Conversations
```typescript
import { getConversations } from '@/backend/actions/messages';

const result = await getConversations();
// Returns: { 
//   success: true, 
//   conversations: Array<{
//     user: User,
//     lastMessage: Message,
//     unreadCount: number
//   }> 
// } | { error: string }
```

### Get Unread Count
```typescript
import { getUnreadMessageCount } from '@/backend/actions/messages';

const result = await getUnreadMessageCount();
// Returns: { success: true, count: number } | { error: string }
```

### Mark as Read
```typescript
import { markConversationAsRead } from '@/backend/actions/messages';

await markConversationAsRead(otherUserId);
```

### Delete Message
```typescript
import { deleteMessage } from '@/backend/actions/messages';

await deleteMessage(messageId);
```

### Search Users
```typescript
import { searchUsers } from '@/backend/actions/messages';

const result = await searchUsers('john', 10); // query, limit
// Returns: { success: true, users: User[] } | { error: string }
```

---

## 🦣 Mastodon Integration

### Client Setup
```typescript
import { createMastodonClient } from '@/backend/lib/mastodon-client';

const client = createMastodonClient({
  instanceUrl: 'https://mastodon.social',
  accessToken: 'user-access-token'
});

// Now you can use all Mastodon API methods
const timeline = await client.getHomeTimeline({ limit: 20 });
const status = await client.createStatus({ status: 'Hello Mastodon!' });
```

### Sync Service
```typescript
import { createSyncService } from '@/backend/lib/mastodon-sync';
import { createMastodonClient } from '@/backend/lib/mastodon-client';

const client = createMastodonClient({
  instanceUrl: user.mastodonInstanceUrl,
  accessToken: user.mastodonAccessToken
});

const syncService = createSyncService(client, userId);

// Sync user profile
await syncService.syncUserProfile();

// Sync home timeline
await syncService.syncHomeTimeline(50);

// Sync notifications
await syncService.syncNotifications(50);
```

---

## 🗄️ Database Types

All database types are exported from `@/backend/db/schema`:

```typescript
import type {
  User,
  NewUser,
  Post,
  NewPost,
  Comment,
  NewComment,
  Like,
  Follow,
  Notification,
  Message,
  MediaAttachment,
  Hashtag,
  Poll,
  PollOption,
  Block,
  Mute
} from '@/backend/db/schema';
```

---

## 🔄 Response Format

All actions return a consistent format:

### Success Response
```typescript
{
  success: true,
  data?: any // Optional data payload
}
```

### Error Response
```typescript
{
  error: string // Error message
}
```

---

## 🎯 Usage Examples

### Complete Post Creation Flow
```typescript
'use client';

import { useState } from 'react';
import { createPost } from '@/backend/actions/posts';

export function CreatePostForm() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('content', content);
    formData.append('visibility', 'public');

    const result = await createPost(formData);

    if (result.success) {
      setContent('');
      alert('Post created!');
    } else {
      alert(result.error);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Posting...' : 'Post'}
      </button>
    </form>
  );
}
```

### Real-time Notification Badge
```typescript
'use client';

import { useEffect, useState } from 'react';
import { getUnreadNotificationCount } from '@/backend/actions/notifications';

export function NotificationBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const result = await getUnreadNotificationCount();
      if (result.success) {
        setCount(result.count);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000); // Poll every 30s

    return () => clearInterval(interval);
  }, []);

  return count > 0 ? <span className="badge">{count}</span> : null;
}
```

### Messaging Interface
```typescript
'use client';

import { useState, useEffect } from 'react';
import { getMessages, sendMessage } from '@/backend/actions/messages';

export function ChatInterface({ otherUserId }: { otherUserId: string }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const loadMessages = async () => {
      const result = await getMessages(otherUserId);
      if (result.success) {
        setMessages(result.messages);
      }
    };

    loadMessages();
  }, [otherUserId]);

  const handleSend = async () => {
    const result = await sendMessage(otherUserId, newMessage);
    if (result.success) {
      setMessages([...messages, result.message]);
      setNewMessage('');
    }
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id}>{msg.content}</div>
        ))}
      </div>
      <input
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
      />
    </div>
  );
}
```

---

## 🔐 Authentication

All actions automatically check for authentication using NextAuth:

```typescript
const session = await auth();
if (!session?.user?.id) {
  return { error: 'Unauthorized' };
}
```

Make sure users are logged in before calling these actions.

---

## 📝 Notes

- All actions use `'use server'` directive for Next.js Server Actions
- Database operations use Drizzle ORM
- Mastodon sync is optional and only runs if user has connected their account
- All list endpoints support pagination with `limit` and `offset`
- Cache is automatically revalidated using `revalidatePath()`

---

**Last Updated**: 2026-01-03
