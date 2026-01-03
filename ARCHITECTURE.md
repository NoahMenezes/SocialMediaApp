# System Architecture

Visual overview of your social media application architecture.

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Feed Page   │  │ Notifications│  │  Messages    │      │
│  │  Components  │  │  Components  │  │  Components  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
│         └─────────────────┼──────────────────┘               │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend Actions (Server)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ posts.ts     │  │ social.ts    │  │ messages.ts  │      │
│  │ - createPost │  │ - followUser │  │ - sendMessage│      │
│  │ - likePost   │  │ - blockUser  │  │ - getConv.   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
│         └─────────────────┼──────────────────┘               │
│                           │                                  │
│  ┌──────────────┐  ┌──────┴───────┐                         │
│  │notifications │  │   auth.ts    │                         │
│  │  .ts         │  │              │                         │
│  └──────┬───────┘  └──────────────┘                         │
│         │                                                    │
└─────────┼────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│              Database Layer (Drizzle ORM)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   schema.ts                          │   │
│  │  - users          - mediaAttachments                 │   │
│  │  - posts          - hashtags                         │   │
│  │  - comments       - mentions                         │   │
│  │  - likes          - polls                            │   │
│  │  - follows        - blocks                           │   │
│  │  - notifications  - mutes                            │   │
│  │  - messages       - bookmarks                        │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   SQLite Database                            │
│              (Turso / Local SQLite)                          │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│              Mastodon Integration (Optional)                 │
│  ┌──────────────────────┐  ┌──────────────────────┐         │
│  │  mastodon-client.ts  │  │  mastodon-sync.ts    │         │
│  │  - API Methods       │  │  - syncProfile       │         │
│  │  - Authentication    │  │  - syncTimeline      │         │
│  │  - CRUD Operations   │  │  - syncNotifications │         │
│  └──────────┬───────────┘  └──────────┬───────────┘         │
│             │                         │                      │
│             └────────────┬────────────┘                      │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Mastodon API    │
                  │ (External)      │
                  └─────────────────┘
```

---

## 📊 Database Schema Relationships

```
users
  ├─── posts (1:N)
  │     ├─── comments (1:N)
  │     ├─── likes (1:N)
  │     ├─── reposts (1:N)
  │     ├─── bookmarks (1:N)
  │     ├─── mediaAttachments (1:N)
  │     ├─── postHashtags (M:N via hashtags)
  │     ├─── mentions (1:N)
  │     └─── polls (1:1)
  │           └─── pollOptions (1:N)
  │                 └─── pollVotes (M:N via users)
  │
  ├─── follows (follower) (1:N)
  ├─── follows (following) (1:N)
  ├─── blocks (blocker) (1:N)
  ├─── blocks (blocked) (1:N)
  ├─── mutes (muter) (1:N)
  ├─── mutes (muted) (1:N)
  ├─── notifications (recipient) (1:N)
  ├─── notifications (sender) (1:N)
  ├─── messages (sender) (1:N)
  └─── messages (receiver) (1:N)
```

---

## 🔄 Data Flow Examples

### Creating a Post

```
User Action (Frontend)
    │
    ▼
createPost(formData)
    │
    ├─► Insert into posts table
    │
    ├─► If Mastodon connected:
    │   └─► mastodonClient.createStatus()
    │       └─► Update post with mastodonId
    │
    └─► revalidatePath('/')
        └─► Update UI
```

### Liking a Post

```
User Action (Frontend)
    │
    ▼
likePost(postId)
    │
    ├─► Insert into likes table
    │
    ├─► Update posts.likesCount
    │
    ├─► Create notification for post author
    │
    ├─► If Mastodon post:
    │   └─► mastodonClient.favouriteStatus()
    │
    └─► revalidatePath('/')
```

### Syncing from Mastodon

```
User Action (Settings)
    │
    ▼
syncMastodonTimeline()
    │
    ├─► mastodonClient.getHomeTimeline()
    │
    ├─► For each status:
    │   ├─► Import account (if new)
    │   ├─► Import post
    │   ├─► Import media attachments
    │   ├─► Import hashtags
    │   ├─► Import mentions
    │   └─► Import poll (if exists)
    │
    └─► revalidatePath('/')
```

---

## 🎯 Request Flow

### Server-Side Rendering (SSR)

```
1. User visits /feed
   │
   ▼
2. Next.js Server Component
   │
   ▼
3. getFeedPosts() action
   │
   ▼
4. Database query via Drizzle
   │
   ▼
5. Return posts data
   │
   ▼
6. Render HTML on server
   │
   ▼
7. Send to client
```

### Client-Side Interaction

```
1. User clicks "Like" button
   │
   ▼
2. Client component event handler
   │
   ▼
3. likePost() server action
   │
   ▼
4. Database update
   │
   ▼
5. Mastodon API call (if connected)
   │
   ▼
6. revalidatePath() triggers re-render
   │
   ▼
7. UI updates with new data
```

---

## 🔐 Authentication Flow

```
User Login
    │
    ▼
NextAuth Session
    │
    ├─► All server actions check:
    │   const session = await auth()
    │   if (!session?.user?.id) return error
    │
    └─► User ID used for:
        ├─► Creating posts
        ├─► Sending messages
        ├─► Following users
        └─► All user-specific actions
```

---

## 🦣 Mastodon Integration Flow

### Initial Setup

```
1. User enters Mastodon instance URL
   │
   ▼
2. User provides access token
   │
   ▼
3. Store in users table:
   - mastodonInstanceUrl
   - mastodonAccessToken
   │
   ▼
4. Enable sync features
```

### Bidirectional Sync

```
Local → Mastodon:
    createPost() → mastodonClient.createStatus()
    likePost() → mastodonClient.favouriteStatus()
    followUser() → mastodonClient.followAccount()

Mastodon → Local:
    syncTimeline() → Import posts to database
    syncNotifications() → Import notifications
    syncProfile() → Update user data
```

---

## 📦 File Organization

```
SocialMediaApp/
│
├── app/                          # Next.js App Router
│   ├── feed/page.tsx            # Feed page
│   ├── notifications/page.tsx   # Notifications page
│   ├── messages/page.tsx        # Messages list
│   └── messages/[userId]/page.tsx # Chat interface
│
├── backend/
│   ├── actions/                 # Server Actions
│   │   ├── posts.ts            # Post CRUD
│   │   ├── social.ts           # Follow, block, mute
│   │   ├── notifications.ts    # Notification management
│   │   └── messages.ts         # Messaging
│   │
│   ├── db/
│   │   ├── schema.ts           # Database schema
│   │   └── index.ts            # Database connection
│   │
│   └── lib/
│       ├── mastodon-client.ts  # Mastodon API client
│       └── mastodon-sync.ts    # Sync service
│
├── components/                  # React Components
│   ├── PostCard.tsx
│   ├── NotificationBadge.tsx
│   └── ChatInterface.tsx
│
└── Documentation/
    ├── DATABASE_IMPLEMENTATION_PLAN.md
    ├── BACKEND_API_REFERENCE.md
    ├── MIGRATION_GUIDE.md
    ├── QUICK_START.md
    └── ARCHITECTURE.md (this file)
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Vercel / Netlify                │
│  ┌───────────────────────────────────┐  │
│  │     Next.js Application           │  │
│  │  - SSR Pages                      │  │
│  │  - API Routes                     │  │
│  │  - Server Actions                 │  │
│  └───────────┬───────────────────────┘  │
└──────────────┼──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Turso Database                  │
│  - Distributed SQLite                   │
│  - Edge locations                       │
│  - Low latency                          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│      Mastodon Instances                 │
│  - mastodon.social                      │
│  - User's custom instances              │
└─────────────────────────────────────────┘
```

---

## 🔄 State Management

```
Server State (Database):
    ├── Posts
    ├── Users
    ├── Messages
    └── Notifications

Client State (React):
    ├── UI state (loading, errors)
    ├── Form inputs
    └── Optimistic updates

Cache (Next.js):
    ├── revalidatePath() for updates
    ├── Server Component caching
    └── Static page generation
```

---

## 📊 Performance Considerations

### Database
- Indexes on foreign keys
- Pagination for large lists
- Efficient queries with Drizzle

### API
- Rate limiting for Mastodon API
- Batch operations where possible
- Error handling and retries

### Frontend
- Server Components for data fetching
- Client Components for interactions
- Lazy loading for media
- Infinite scroll for feeds

---

## 🔐 Security Layers

```
1. Authentication
   └── NextAuth session validation

2. Authorization
   └── User ownership checks in actions

3. Data Validation
   └── Input sanitization

4. Database
   └── Parameterized queries (Drizzle)

5. API Security
   └── Token encryption
   └── HTTPS only
```

---

This architecture provides:
- ✅ Scalability
- ✅ Maintainability
- ✅ Security
- ✅ Performance
- ✅ Extensibility

**Ready to build!** 🚀
