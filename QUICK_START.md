# Quick Start Guide

Get your social media app up and running in 5 minutes!

---

## 🚀 Step 1: Run Database Migration

```bash
# Generate and apply migrations
npx drizzle-kit generate:sqlite
npx drizzle-kit push:sqlite
```

---

## 🧪 Step 2: Test Basic Functionality

Create a test file to verify everything works:

```typescript
// test-backend.ts
import { db } from './backend/db';
import { users, posts, likes, follows } from './backend/db/schema';

async function testBackend() {
  console.log('🧪 Testing backend...\n');

  // 1. Create test users
  console.log('Creating users...');
  const [user1] = await db.insert(users).values({
    name: 'Alice',
    email: 'alice@example.com',
    username: 'alice',
  }).returning();

  const [user2] = await db.insert(users).values({
    name: 'Bob',
    email: 'bob@example.com',
    username: 'bob',
  }).returning();

  console.log('✅ Users created:', user1.username, user2.username);

  // 2. Create a post
  console.log('\nCreating post...');
  const [post] = await db.insert(posts).values({
    userId: user1.id,
    content: 'Hello, world! This is my first post.',
    visibility: 'public',
  }).returning();

  console.log('✅ Post created:', post.content);

  // 3. Like the post
  console.log('\nLiking post...');
  await db.insert(likes).values({
    userId: user2.id,
    postId: post.id,
  });

  console.log('✅ Post liked by', user2.username);

  // 4. Follow user
  console.log('\nFollowing user...');
  await db.insert(follows).values({
    followerId: user2.id,
    followingId: user1.id,
  });

  console.log('✅', user2.username, 'is now following', user1.username);

  console.log('\n🎉 All tests passed!');
}

testBackend().catch(console.error);
```

Run it:
```bash
npx tsx test-backend.ts
```

---

## 📱 Step 3: Create Your First Component

### Example: Feed Component

```typescript
// app/feed/page.tsx
import { getFeedPosts } from '@/backend/actions/posts';
import { PostCard } from '@/components/PostCard';

export default async function FeedPage() {
  const result = await getFeedPosts(20, 0);

  if (!result.success) {
    return <div>Error: {result.error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Feed</h1>
      <div className="space-y-4">
        {result.posts?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
```

### Example: Post Card Component

```typescript
// components/PostCard.tsx
'use client';

import { useState } from 'react';
import { likePost, unlikePost, repostPost } from '@/backend/actions/posts';
import type { Post } from '@/backend/db/schema';

export function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likesCount || 0);

  const handleLike = async () => {
    if (liked) {
      await unlikePost(post.id);
      setLikes(likes - 1);
    } else {
      await likePost(post.id);
      setLikes(likes + 1);
    }
    setLiked(!liked);
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow">
      <p className="text-gray-800 mb-3">{post.content}</p>
      
      <div className="flex gap-4 text-sm text-gray-600">
        <button 
          onClick={handleLike}
          className={liked ? 'text-red-500' : ''}
        >
          ❤️ {likes}
        </button>
        
        <button onClick={() => repostPost(post.id)}>
          🔄 {post.reblogsCount || 0}
        </button>
        
        <button>
          💬 {post.repliesCount || 0}
        </button>
      </div>
    </div>
  );
}
```

---

## 🔔 Step 4: Add Notifications

### Notification Badge

```typescript
// components/NotificationBadge.tsx
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
    
    // Poll every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  if (count === 0) return null;

  return (
    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
      {count}
    </span>
  );
}
```

### Notification List

```typescript
// app/notifications/page.tsx
import { getNotifications } from '@/backend/actions/notifications';
import { NotificationItem } from '@/components/NotificationItem';

export default async function NotificationsPage() {
  const result = await getNotifications(50, 0);

  if (!result.success) {
    return <div>Error loading notifications</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <div className="space-y-2">
        {result.notifications?.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
}
```

---

## 💬 Step 5: Add Messaging

### Message List

```typescript
// app/messages/page.tsx
import { getConversations } from '@/backend/actions/messages';
import Link from 'next/link';

export default async function MessagesPage() {
  const result = await getConversations();

  if (!result.success) {
    return <div>Error loading messages</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      <div className="space-y-2">
        {result.conversations?.map((conv) => (
          <Link 
            key={conv.user.id} 
            href={`/messages/${conv.user.id}`}
            className="block p-4 border rounded hover:bg-gray-50"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{conv.user.name}</p>
                <p className="text-sm text-gray-600">
                  {conv.lastMessage.content}
                </p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                  {conv.unreadCount}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

### Chat Interface

```typescript
// app/messages/[userId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getMessages, sendMessage } from '@/backend/actions/messages';

export default function ChatPage({ params }: { params: { userId: string } }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const loadMessages = async () => {
      const result = await getMessages(params.userId);
      if (result.success) {
        setMessages(result.messages);
      }
    };

    loadMessages();
  }, [params.userId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const result = await sendMessage(params.userId, newMessage);
    if (result.success) {
      setMessages([...messages, result.message]);
      setNewMessage('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`p-3 rounded-lg ${
              msg.senderId === params.userId 
                ? 'bg-gray-200 mr-auto' 
                : 'bg-blue-500 text-white ml-auto'
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 border rounded px-3 py-2"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
```

---

## 🦣 Step 6: Connect Mastodon (Optional)

### Settings Page

```typescript
// app/settings/mastodon/page.tsx
'use client';

import { useState } from 'react';
import { db } from '@/backend/db';
import { users } from '@/backend/db/schema';
import { eq } from 'drizzle-orm';

export default function MastodonSettings() {
  const [instanceUrl, setInstanceUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');

  const handleConnect = async () => {
    // Save to database
    // In a real app, you'd get the current user ID from session
    const userId = 'current-user-id';
    
    await db.update(users)
      .set({
        mastodonInstanceUrl: instanceUrl,
        mastodonAccessToken: accessToken,
      })
      .where(eq(users.id, userId));

    alert('Mastodon account connected!');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Connect Mastodon</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Instance URL
          </label>
          <input
            type="text"
            value={instanceUrl}
            onChange={(e) => setInstanceUrl(e.target.value)}
            placeholder="https://mastodon.social"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Access Token
          </label>
          <input
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="Your Mastodon access token"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          onClick={handleConnect}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Connect Account
        </button>
      </div>
    </div>
  );
}
```

### Sync Button

```typescript
// components/SyncButton.tsx
'use client';

import { syncMastodonNotifications } from '@/backend/actions/notifications';
import { createMastodonClient } from '@/backend/lib/mastodon-client';
import { createSyncService } from '@/backend/lib/mastodon-sync';

export function SyncButton({ user }: { user: User }) {
  const handleSync = async () => {
    if (!user.mastodonAccessToken || !user.mastodonInstanceUrl) {
      alert('Please connect your Mastodon account first');
      return;
    }

    const client = createMastodonClient({
      instanceUrl: user.mastodonInstanceUrl,
      accessToken: user.mastodonAccessToken,
    });

    const syncService = createSyncService(client, user.id);

    // Sync everything
    await syncService.syncUserProfile();
    await syncService.syncHomeTimeline(50);
    await syncMastodonNotifications();

    alert('Sync complete!');
  };

  return (
    <button
      onClick={handleSync}
      className="bg-purple-500 text-white px-4 py-2 rounded"
    >
      🦣 Sync with Mastodon
    </button>
  );
}
```

---

## 🎯 Common Patterns

### Server Component (Data Fetching)
```typescript
// Fetch data on the server
export default async function Page() {
  const result = await getFeedPosts(20, 0);
  return <div>{/* render */}</div>;
}
```

### Client Component (Interactions)
```typescript
'use client';

// Handle user interactions
export function InteractiveButton() {
  const handleClick = async () => {
    await likePost(postId);
  };
  return <button onClick={handleClick}>Like</button>;
}
```

### Form Submission
```typescript
'use client';

export function CreatePostForm() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createPost(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea name="content" required />
      <button type="submit">Post</button>
    </form>
  );
}
```

---

## 📚 Resources

- **Implementation Plan**: `DATABASE_IMPLEMENTATION_PLAN.md`
- **API Reference**: `BACKEND_API_REFERENCE.md`
- **Migration Guide**: `MIGRATION_GUIDE.md`
- **Summary**: `IMPLEMENTATION_SUMMARY.md`

---

## 🎉 You're Ready!

You now have:
- ✅ Database schema set up
- ✅ Backend actions ready to use
- ✅ Example components to build from
- ✅ Mastodon integration (optional)

**Start building your amazing social media app!** 🚀

---

**Need help?** Check the documentation files or review the code examples above.
