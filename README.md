# 🚀 Twinkle - Modern Social Media Platform

A full-featured social media application with Mastodon integration, built with Next.js 15, TypeScript, and modern web technologies.

**Last Updated**: January 5, 2026  
**Status**: ✅ Production Ready

---

## ✨ Features

### 🔐 Authentication & Security
- **Hybrid Auth**: Support for both **Google OAuth** and **Email/Password** login
- **Secure Sessions**: Powered by NextAuth v5 with JWT strategy and HTTP-only cookies
- **Middleware**: Robust route protection redirecting unauthenticated users
- **Auto-Username**: Automatically generates unique IDs/usernames for new users
- **Password Security**: Bcrypt hashing with validation (8+ chars, uppercase, lowercase, number)

### 👤 User Profiles & Social
- **Dynamic Routing**: View any user profile at `/profile/[username]`
- **Profile Management**: Edit profile for your own page, Follow/Unfollow for others
- **Avatar System**: Uses Dicebear API for consistent, generated user avatars
- **Follow System**: Follow/unfollow users, view followers/following
- **Block & Mute**: Block or mute users for better control

### 📱 Core Experience
- **Home Feed**: Database-backed feed displaying real posts with pagination
- **Explore Page**: Search functionality to find users by name or username
- **Notifications**: Real-time updates for likes, follows, and replies
- **Direct Messages**: One-on-one conversations with read receipts
- **Mastodon Integration**: Bidirectional sync between local database and Mastodon
- **Post Interactions**: Like, comment, repost, and bookmark posts
- **Full-Screen UI**: Modern layout covering entire screen (1703px × 987px optimized)

### 🎨 Modern UI/UX
- **Pure Black Theme**: Premium dark mode with pure black (#000000) background
- **Glassmorphism**: Subtle backdrop blur effects and modern gradients
- **Smooth Animations**: Framer Motion page transitions and micro-interactions
- **Responsive Design**: Mobile-first approach, works on all devices
- **Cyan Accents**: Distinctive cyan (#00FFFF) brand color
- **Premium Feel**: Enhanced shadows, hover effects, and visual hierarchy

---

## 🚀 Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animation**: Framer Motion

### Backend
- **Database**: [Turso](https://turso.tech/) (SQLite) with local fallback
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [NextAuth.js v5](https://authjs.dev/)
- **Server Actions**: Next.js 15 Server Actions
- **Password Hashing**: bcryptjs

### Data Management
- **Import Scripts**: CSV data import for news and Instagram datasets
- **Database Tables**: 18 tables including users, posts, comments, likes, reposts, follows, bookmarks, notifications, messages
- **Data Sources**: 
  - ~95,000+ news articles imported
  - 20,000+ Instagram comments imported
  - 693 Instagram profiles imported

---

## ⚡ Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Environment Setup
Create a `.env.local` file with the following:

```env
# Database (Required)
DATABASE_URL=file:./local.db
# OR for Turso (cloud):
# DATABASE_URL=libsql://your-database.turso.io
# DATABASE_AUTH_TOKEN=your_token

# NextAuth (Required)
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (Required for Google login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Mastodon Integration (Optional)
MASTODON_INSTANCE_URL=https://mastodon.social
MASTODON_CLIENT_ID=your_mastodon_client_id
MASTODON_CLIENT_SECRET=your_mastodon_client_secret
```

### 3. Database Migration
```bash
# Push schema to database
pnpm db:push

# Open Drizzle Studio to view database (optional)
pnpm db:studio
```

### 4. Import Data (Optional)
```bash
# Import CSV data (news, Instagram comments, profiles)
pnpm import-data
```

### 5. Run Development Server
```bash
pnpm dev
```

Visit: **http://localhost:3000**

### 6. Build for Production
```bash
pnpm build
```

### 7. Start Production Server
```bash
pnpm start
```

---

## 📁 Project Structure

```
my-next-app/
├── app/                          # Next.js App Router pages
│   ├── api/auth/[...nextauth]/   # NextAuth API route
│   ├── bookmarks/                # Bookmarks page
│   ├── dashboard/                # User dashboard
│   ├── explore/                  # Explore/Search page
│   ├── login/                    # Login page
│   ├── messages/                 # Direct messages
│   ├── notifications/            # Notifications page
│   ├── profile/[username]/       # User profiles
│   ├── reposts/                  # Reposts page
│   ├── settings/                 # Settings page
│   ├── signup/                   # Signup page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home/Landing page
│
├── backend/
│   ├── actions/                  # Server actions
│   │   ├── auth.ts              # Authentication
│   │   ├── bookmarks.ts         # Bookmark management
│   │   ├── interactions.ts      # Likes, comments, reposts
│   │   ├── messages.ts          # Direct messaging
│   │   ├── notifications.ts     # Notification system
│   │   ├── posts.ts             # Post CRUD operations
│   │   ├── profile.ts           # Profile management
│   │   └── social.ts            # Follow/unfollow logic
│   │
│   ├── db/
│   │   ├── schema.ts            # Complete database schema (18 tables)
│   │   └── index.ts             # Database connection
│   │
│   └── lib/                      # Backend utilities
│       ├── mastodon-client.ts   # Mastodon API client
│       └── mastodon-sync.ts     # Mastodon sync service
│
├── components/                   # React components
│   ├── ui/                      # Shadcn UI components
│   ├── app-layout.tsx           # App shell layout (full-screen)
│   ├── header.tsx               # Navigation header
│   ├── landing-page.tsx         # Landing page
│   ├── post-card.tsx            # Post display
│   ├── posts-feed.tsx           # Posts feed
│   ├── profile-view.tsx         # Profile display
│   ├── right-sidebar.tsx        # Right sidebar (trends, suggestions)
│   ├── sidebar.tsx              # Left sidebar navigation
│   └── ...                      # Other components
│
├── lib/
│   ├── animations.ts            # Framer Motion animations
│   └── utils.ts                 # Utility functions
│
├── scripts/
│   └── import-data.ts           # CSV data import script
│
├── db/                          # JSON data files (693 Instagram profiles)
├── public/                      # Static assets
├── .env.local                   # Environment variables (create this)
├── auth.config.ts               # NextAuth configuration
├── drizzle.config.ts            # Drizzle ORM config
├── middleware.ts                # Route protection
├── next.config.ts               # Next.js config
├── package.json                 # Dependencies
├── tailwind.config.ts           # Tailwind config
└── tsconfig.json                # TypeScript config
```

---

## 🗄️ Database Schema

### Core Tables (18 Total)

#### Users & Authentication
- **users** - User accounts with profiles
- **accounts** - OAuth provider accounts (NextAuth)
- **sessions** - User sessions (NextAuth)
- **verificationTokens** - Email verification tokens

#### Content
- **posts** - User posts/tweets
- **comments** - Post replies
- **mediaAttachments** - Images/videos

#### Interactions
- **likes** - Post likes
- **reposts** - Retweets/shares
- **bookmarks** - Saved posts

#### Social
- **follows** - User relationships
- **blocks** - Blocked users
- **mutes** - Muted users

#### Features
- **notifications** - Activity notifications
- **messages** - Direct messages
- **hashtags** - Trending topics
- **mentions** - User mentions
- **polls** - Poll posts

#### Imported Data
- **news** - News articles (~95,000 records)
- **instagramComments** - Instagram comments (20,000 records)
- **instagramProfiles** - Instagram profiles (693 records)

---

## 🔑 Available Backend Actions

### Authentication (`backend/actions/auth.ts`)
```typescript
import { signup, login, logout, getCurrentUser, isAuthenticated } from '@/backend/actions/auth';
```
- `signup(formData)` - Create new user
- `login(formData)` - Email/password login
- `signInWithGoogle()` - Google OAuth
- `logout()` - Sign out
- `getCurrentUser()` - Get session user
- `isAuthenticated()` - Check auth status

### Posts (`backend/actions/posts.ts`)
```typescript
import { createPost, getPosts, deletePost, getPostById } from '@/backend/actions/posts';
```
- `createPost(content, image)` - Create new post
- `getPosts()` - Get all posts
- `deletePost(postId)` - Delete post
- `getPostById(postId)` - Fetch single post
- `getUserPosts(userId)` - Get user's posts

### Interactions (`backend/actions/interactions.ts`)
```typescript
import { toggleLike, addComment, toggleRepost } from '@/backend/actions/interactions';
```
- `toggleLike(postId)` - Like/unlike post
- `addComment(postId, content)` - Add comment
- `toggleRepost(postId)` - Repost/unrepost
- `getPostComments(postId)` - Get comments

### Social (`backend/actions/social.ts`)
```typescript
import { followUser, unfollowUser, blockUser, muteUser } from '@/backend/actions/social';
```
- `followUser(userId)` - Follow user
- `unfollowUser(userId)` - Unfollow user
- `blockUser(userId)` - Block user
- `unblockUser(userId)` - Unblock user
- `muteUser(userId)` - Mute user
- `unmuteUser(userId)` - Unmute user
- `getFollowers(userId)` - Get followers
- `getFollowing(userId)` - Get following

### Messages (`backend/actions/messages.ts`)
```typescript
import { sendMessage, getConversations, getMessages } from '@/backend/actions/messages';
```
- `sendMessage(receiverId, content)` - Send DM
- `getMessages(userId)` - Get conversation
- `getConversations()` - List all chats
- `getUnreadMessageCount()` - Count unread messages
- `markConversationAsRead(userId)` - Mark as read
- `deleteMessage(messageId)` - Delete message
- `searchUsers(query)` - Search users

### Notifications (`backend/actions/notifications.ts`)
```typescript
import { getNotifications, markAsRead, markAllAsRead } from '@/backend/actions/notifications';
```
- `getNotifications()` - Fetch all notifications
- `getUnreadNotificationCount()` - Count unread
- `markAsRead(notificationId)` - Mark single as read
- `markAllAsRead()` - Mark all as read
- `deleteNotification(notificationId)` - Delete notification

### Bookmarks (`backend/actions/bookmarks.ts`)
```typescript
import { toggleBookmark, getBookmarks } from '@/backend/actions/bookmarks';
```
- `toggleBookmark(postId)` - Bookmark/unbookmark post
- `getBookmarks()` - Get all bookmarked posts

---

## 🎯 Pages & Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Landing page / Home feed | No/Yes |
| `/login` | Login page | No |
| `/signup` | Signup page | No |
| `/dashboard` | User dashboard | Yes |
| `/explore` | Search users | Yes |
| `/notifications` | Activity feed | Yes |
| `/messages` | Direct messages | Yes |
| `/bookmarks` | Saved posts | Yes |
| `/reposts` | User's reposts | Yes |
| `/profile/[username]` | User profile | Yes |
| `/settings` | Account settings | Yes |

---

## 🎨 Design System

### Colors (Dark Mode)
```css
--background: 0 0% 0%           /* Pure Black */
--foreground: 0 0% 98%          /* White text */
--card: 0 0% 3.9%               /* Very dark gray */
--primary: 0 0% 98%             /* White */
--muted: 0 0% 10%               /* Dark muted */
--border: 0 0% 14.9%            /* Subtle borders */
```

### Brand Colors
- **Primary**: Cyan (#00FFFF) - Links, logo, brand elements
- **Accent**: White (#FFFFFF) - Buttons, highlights
- **Background**: Pure Black (#000000) - Main background

### Typography
- **Font**: Inter (Google Fonts)
- **Sizes**: Responsive scale
- **Weight**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Layout
- **Full-Screen**: Optimized for 1703px × 987px (no gaps)
- **Left Sidebar**: 280px (desktop), 80px (mobile)
- **Main Content**: Flexible width (fills available space)
- **Right Sidebar**: 400px (desktop), hidden (mobile/tablet)

---

## 🔧 Development Commands

```bash
# Development
pnpm dev              # Start dev server (with 8GB heap)
pnpm build            # Build for production (with 8GB heap)
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Database
pnpm db:push          # Push schema changes to database
pnpm db:studio        # Open Drizzle Studio (GUI)

# Data Import
pnpm import-data      # Import CSV data to database
```

---

## ✅ Fixes & Improvements Completed

### Database Connection
- ✅ Fixed environment variable support (DATABASE_URL with TURSO_DATABASE_URL fallback)
- ✅ Added local SQLite fallback (`file:./local.db`)
- ✅ Proper error handling and connection validation

### Backend Actions
- ✅ Restored all messaging functions (7 functions)
- ✅ Fixed null comparisons using `isNull()` instead of `eq(field, null)`
- ✅ All 40+ server actions working correctly
- ✅ Proper authentication checks on all protected actions

### UI/UX Improvements
- ✅ Full-screen layout (no more gaps on sides)
- ✅ Enhanced sidebar designs with gradients and animations
- ✅ Glassmorphism effects on cards
- ✅ Smooth micro-interactions and hover states
- ✅ Proper responsive behavior across all screen sizes
- ✅ Pure black dark mode theme

### Layout Fixes
- ✅ Removed max-width constraints
- ✅ Changed sidebar from `fixed` to `sticky` positioning
- ✅ Main content uses `flex-1` for responsive width
- ✅ Increased sidebar widths for better proportions
- ✅ Added `flex-shrink-0` to prevent sidebar collapse

### Data Import
- ✅ Successfully imported ~95,000 news articles
- ✅ Successfully imported 20,000 Instagram comments
- ✅ Successfully imported 693 Instagram profiles
- ✅ Batch processing with conflict handling
- ✅ Data verification and logging

### Authentication
- ✅ Google OAuth working correctly
- ✅ Email/Password login with validation
- ✅ Password hashing with bcrypt
- ✅ Session management with NextAuth v5
- ✅ Protected routes with middleware

---

## 🐛 Troubleshooting

### Database Issues
If you see database connection errors:
1. Check `.env.local` has `DATABASE_URL` set
2. Run `pnpm db:push` to create tables
3. Verify Turso credentials if using cloud database

### Build Errors
If build fails due to memory:
- The `package.json` already includes `--max-old-space-size=8192` (8GB heap)
- If still failing, close other applications to free RAM

### Authentication Not Working
1. Ensure `NEXTAUTH_SECRET` is set in `.env.local`
2. Verify `NEXTAUTH_URL` matches your development URL
3. Check Google OAuth credentials if using Google login

---

## 📚 Documentation Files

All comprehensive documentation has been consolidated into this README. The following markdown files were previously used for development tracking:

- ~~DATA_IMPORT_SUMMARY.md~~ - Consolidated
- ~~FIXES_COMPLETED.md~~ - Consolidated
- ~~IMPLEMENTATION_SUMMARY.md~~ - Consolidated
- ~~LAYOUT_FIX_SUMMARY.md~~ - Consolidated
- ~~PROJECT_OVERVIEW.md~~ - Consolidated
- ~~QUICK_REFERENCE.md~~ - Consolidated
- ~~STATUS_REPORT.md~~ - Consolidated

---

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production
Make sure to set these in your deployment platform:
- `DATABASE_URL` - Your Turso database URL
- `DATABASE_AUTH_TOKEN` - Your Turso auth token
- `NEXTAUTH_SECRET` - Random secret string
- `NEXTAUTH_URL` - Your production URL
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

---

## 🎯 What's Working

- ✅ **Database**: Connected and working (Turso + local SQLite)
- ✅ **All 18 database tables** created and functional
- ✅ **Authentication**: Google OAuth + Email/Password
- ✅ **All backend actions**: Posts, social, notifications, messages (40+ functions)
- ✅ **Mastodon API client**: Ready for integration
- ✅ **Full-screen UI**: Modern, premium design
- ✅ **Data import**: Successfully imported 115,000+ records
- ✅ **Session management**: Secure JWT sessions
- ✅ **Route protection**: Middleware guards all protected routes

---

## 📄 License

MIT License - Feel free to use this in your projects!

---

## 🤝 Contributing

This is a personal project, but feel free to fork and modify for your own use!

---

## 🎉 Project Status

**Status**: ✅ **Production Ready**

The backend is fully functional with:
- Complete authentication system
- All CRUD operations for posts, users, interactions
- Mastodon integration ready
- Data import completed
- Full-screen responsive UI

**You can now deploy this project!** 🚀

---

**Made with ❤️ for the open social web**

*Last Updated: January 5, 2026*
