# Social Media App - Database & Mastodon API Integration Plan

## 📋 Overview
This document outlines the complete implementation for a social media application with Mastodon API integration. The system includes a comprehensive database schema and backend actions for all social media features.

---

## 🗄️ Database Schema

### Core Tables

#### 1. **Users Table**
Enhanced with Mastodon integration fields:
- Basic profile: `id`, `name`, `email`, `username`, `bio`
- Extended profile: `website`, `location`, `headerImage`
- Counters: `followersCount`, `followingCount`, `postsCount`
- Mastodon sync: `mastodonId`, `mastodonAccessToken`, `mastodonInstanceUrl`

#### 2. **Posts Table**
Full-featured post system:
- Content: `content`, `image`
- Visibility: `visibility` (public, unlisted, private, direct)
- Moderation: `sensitive`, `spoilerText`
- Threading: `inReplyToId`, `inReplyToAccountId`, `reblogOfId`
- Metrics: `likesCount`, `reblogsCount`, `repliesCount`
- Mastodon sync: `mastodonId`, `mastodonUrl`

#### 3. **Comments Table**
Threaded discussions on posts

#### 4. **Likes Table**
User-post like relationships

#### 5. **Reposts Table**
Boost/repost functionality

#### 6. **Follows Table**
User following relationships

#### 7. **Bookmarks Table**
Save posts for later

#### 8. **Notifications Table**
Real-time notification system with types:
- `mention`, `like`, `reblog`, `follow`, `follow_request`, `post`, `poll`, `update`

#### 9. **Messages Table**
Direct messaging system:
- One-to-one conversations
- Read receipts with `readAt` timestamp

### Extended Features Tables

#### 10. **Media Attachments Table**
- Support for: `image`, `video`, `gifv`, `audio`
- Includes: `url`, `previewUrl`, `description` (alt text), `blurhash`
- Mastodon sync: `mastodonId`, `remoteUrl`

#### 11. **Hashtags Table**
- Trending hashtag tracking
- Usage count for popularity

#### 12. **Post Hashtags Table**
Many-to-many relationship between posts and hashtags

#### 13. **Mentions Table**
Track user mentions in posts

#### 14. **Polls Table**
Interactive polls with:
- Expiration dates
- Multiple choice support
- Vote counting

#### 15. **Poll Options Table**
Individual poll choices

#### 16. **Poll Votes Table**
User votes on polls

#### 17. **Blocks Table**
User blocking for privacy

#### 18. **Mutes Table**
Mute users with optional notification muting

---

## 🔌 Mastodon API Integration

### Client Library (`mastodon-client.ts`)

Comprehensive API client with methods for:

#### Account Operations
- `verifyCredentials()` - Get current user info
- `getAccount(id)` - Fetch account details
- `updateCredentials()` - Update profile

#### Timeline Operations
- `getHomeTimeline()` - Personal feed
- `getPublicTimeline()` - Global feed
- `getHashtagTimeline(tag)` - Hashtag-specific feed

#### Status Operations
- `getStatus(id)` - Fetch single post
- `createStatus()` - Create new post
- `deleteStatus(id)` - Delete post
- `getStatusContext(id)` - Get replies and thread

#### Interaction Operations
- `favouriteStatus(id)` / `unfavouriteStatus(id)` - Like/unlike
- `reblogStatus(id)` / `unreblogStatus(id)` - Boost/unboost
- `bookmarkStatus(id)` / `unbookmarkStatus(id)` - Save/unsave

#### Social Operations
- `followAccount(id)` / `unfollowAccount(id)`
- `blockAccount(id)` / `unblockAccount(id)`
- `muteAccount(id)` / `unmuteAccount(id)`

#### Notification Operations
- `getNotifications()` - Fetch notifications
- `clearNotifications()` - Clear all
- `dismissNotification(id)` - Dismiss single

#### Media Operations
- `uploadMedia(file)` - Upload images/videos

#### Search Operations
- `search(query)` - Search accounts, hashtags, statuses

### Sync Service (`mastodon-sync.ts`)

Bidirectional sync between Mastodon and local database:

#### Sync Functions
- `syncUserProfile()` - Import user profile data
- `syncHomeTimeline()` - Import timeline posts
- `syncNotifications()` - Import notifications

#### Import Functions
- `importStatus()` - Import post with media, hashtags, mentions, polls
- `importAccount()` - Import user account
- `importHashtag()` - Import and track hashtags
- `importNotification()` - Import notification

---

## 🎯 Backend Actions

### 1. Post Actions (`posts.ts`)

#### Create & Delete
- `createPost(formData)` - Create post locally and on Mastodon
- `deletePost(id)` - Delete from both systems

#### Interactions
- `likePost(id)` / `unlikePost(id)` - With Mastodon sync
- `repostPost(id)` / `unrepostPost(id)` - Boost functionality
- `bookmarkPost(id)` / `unbookmarkPost(id)` - Save posts
- `addComment(postId, content)` - Add comment/reply

#### Retrieval
- `getFeedPosts(limit, offset)` - Paginated feed

### 2. Social Actions (`social.ts`)

#### Follow Management
- `followUser(id)` / `unfollowUser(id)` - With count updates
- `getFollowers(userId)` - Get follower list
- `getFollowing(userId)` - Get following list
- `isFollowing(userId)` - Check follow status

#### Privacy Controls
- `blockUser(id)` / `unblockUser(id)` - Block users
- `muteUser(id, muteNotifications)` / `unmuteUser(id)` - Mute users

### 3. Notification Actions (`notifications.ts`)

#### Retrieval
- `getNotifications(limit, offset)` - Paginated notifications
- `getUnreadNotificationCount()` - Badge count

#### Management
- `markNotificationAsRead(id)` - Mark single as read
- `markAllNotificationsAsRead()` - Bulk mark as read
- `deleteNotification(id)` - Remove notification

#### Sync
- `syncMastodonNotifications()` - Import from Mastodon

### 4. Message Actions (`messages.ts`)

#### Messaging
- `sendMessage(receiverId, content)` - Send DM
- `getConversation(userId)` - Get chat history
- `getConversations()` - List all chats with unread counts

#### Management
- `getUnreadMessageCount()` - Badge count
- `markConversationAsRead(userId)` - Mark chat as read
- `deleteMessage(id)` - Delete message

#### Utility
- `searchUsers(query)` - Find users to message

---

## 🚀 Implementation Steps

### Phase 1: Database Setup ✅
1. ✅ Enhanced user schema with Mastodon fields
2. ✅ Enhanced posts schema with visibility and threading
3. ✅ Added media attachments table
4. ✅ Added hashtags and mentions tables
5. ✅ Added polls system
6. ✅ Added blocks and mutes tables
7. ✅ Updated TypeScript types for all tables

### Phase 2: Mastodon Integration ✅
1. ✅ Created Mastodon API client
2. ✅ Created sync service
3. ✅ Implemented bidirectional sync

### Phase 3: Backend Actions ✅
1. ✅ Post management actions
2. ✅ Social interaction actions
3. ✅ Notification actions
4. ✅ Messaging actions

### Phase 4: Next Steps 🔄

#### Database Migration
```bash
# Generate migration
npx drizzle-kit generate:sqlite

# Run migration
npx drizzle-kit push:sqlite
```

#### Environment Variables
Add to `.env.local`:
```env
# Mastodon Configuration (Optional - per user)
MASTODON_INSTANCE_URL=https://mastodon.social
MASTODON_CLIENT_ID=your_client_id
MASTODON_CLIENT_SECRET=your_client_secret
```

#### User Mastodon Connection Flow
1. User navigates to settings
2. Enters Mastodon instance URL
3. OAuth flow to get access token
4. Store `mastodonAccessToken` and `mastodonInstanceUrl` in user record
5. Enable sync features

---

## 📊 Database Relationships

```
users
  ├── posts (one-to-many)
  ├── comments (one-to-many)
  ├── likes (one-to-many)
  ├── reposts (one-to-many)
  ├── follows (follower) (one-to-many)
  ├── follows (following) (one-to-many)
  ├── bookmarks (one-to-many)
  ├── notifications (recipient) (one-to-many)
  ├── notifications (sender) (one-to-many)
  ├── messages (sender) (one-to-many)
  ├── messages (receiver) (one-to-many)
  ├── blocks (blocker) (one-to-many)
  ├── blocks (blocked) (one-to-many)
  ├── mutes (muter) (one-to-many)
  └── mutes (muted) (one-to-many)

posts
  ├── comments (one-to-many)
  ├── likes (one-to-many)
  ├── reposts (one-to-many)
  ├── bookmarks (one-to-many)
  ├── mediaAttachments (one-to-many)
  ├── postHashtags (one-to-many)
  ├── mentions (one-to-many)
  ├── polls (one-to-one)
  ├── inReplyTo (self-reference)
  └── reblogOf (self-reference)

hashtags
  └── postHashtags (one-to-many)

polls
  ├── pollOptions (one-to-many)
  └── pollVotes (one-to-many)
```

---

## 🔐 Security Considerations

1. **Authentication**: All actions check `auth()` session
2. **Authorization**: Users can only modify their own content
3. **Data Validation**: Input sanitization on all user data
4. **Rate Limiting**: Consider implementing for Mastodon API calls
5. **Token Security**: Mastodon tokens stored encrypted in database

---

## 🎨 Frontend Integration Examples

### Creating a Post
```typescript
import { createPost } from '@/backend/actions/posts';

const formData = new FormData();
formData.append('content', 'Hello, world!');
formData.append('visibility', 'public');

const result = await createPost(formData);
```

### Following a User
```typescript
import { followUser } from '@/backend/actions/social';

const result = await followUser(targetUserId);
```

### Syncing from Mastodon
```typescript
import { syncMastodonNotifications } from '@/backend/actions/notifications';

const result = await syncMastodonNotifications();
```

---

## 📈 Performance Optimizations

1. **Indexing**: Add indexes on frequently queried fields
2. **Pagination**: All list endpoints support limit/offset
3. **Caching**: Use Next.js revalidatePath for cache invalidation
4. **Batch Operations**: Group related database operations
5. **Lazy Loading**: Load media and extended data on demand

---

## 🧪 Testing Checklist

- [ ] Test post creation locally
- [ ] Test post creation with Mastodon sync
- [ ] Test like/unlike with count updates
- [ ] Test follow/unfollow relationships
- [ ] Test notification creation and marking as read
- [ ] Test messaging between users
- [ ] Test Mastodon timeline sync
- [ ] Test hashtag tracking
- [ ] Test poll creation and voting
- [ ] Test block/mute functionality

---

## 📚 API Documentation

All actions return a consistent response format:
```typescript
// Success
{ success: true, data?: any }

// Error
{ error: string }
```

---

## 🔄 Future Enhancements

1. **Real-time Updates**: WebSocket support for live notifications
2. **Media Processing**: Image resizing and optimization
3. **Advanced Search**: Full-text search across posts
4. **Analytics**: User engagement metrics
5. **Moderation Tools**: Report system and content filtering
6. **Federation**: ActivityPub protocol support
7. **Mobile Apps**: React Native integration
8. **AI Features**: Content recommendations, auto-tagging

---

## 📞 Support

For issues or questions:
1. Check the database schema in `backend/db/schema.ts`
2. Review action implementations in `backend/actions/`
3. Consult Mastodon API docs: https://docs.joinmastodon.org/

---

**Last Updated**: 2026-01-03
**Version**: 1.0.0
