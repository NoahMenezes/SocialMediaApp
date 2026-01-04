# 📋 Social Media App - Complete Project Overview

**Last Updated**: January 4, 2026  
**Project**: Twinkle - A Modern Social Media Platform  
**Framework**: Next.js 15 with App Router  
**Database**: Turso (SQLite)

---

## 🎯 Project Summary

This is a **full-featured social media application** similar to Twitter/X, built with modern web technologies. The app includes authentication, user profiles, posts, interactions (likes, comments, reposts), notifications, direct messaging, and more.

### Recent Updates (Latest Pull)
Your friend just updated the following files:
- ✅ **UI Updates**: Login/Signup pages redesigned with modern black theme
- ✅ **Landing Page**: New hero section with animations
- ✅ **Components**: Post cards, stories component updated
- ✅ **Styling**: Global CSS with pure black dark mode theme
- ✅ **Auth**: Backend authentication actions refined

---

## 📁 Project Structure

```
my-next-app/
├── app/                          # Next.js App Router pages
│   ├── api/auth/[...nextauth]/   # NextAuth API route
│   ├── bookmarks/                # Bookmarks page
│   ├── explore/                  # Explore/Search page
│   ├── login/                    # Login page (NEW UI)
│   ├── messages/                 # Direct messages
│   ├── notifications/            # Notifications page
│   ├── profile/                  # User profiles
│   ├── settings/                 # Settings page
│   ├── signup/                   # Signup page (NEW UI)
│   ├── globals.css               # Global styles (UPDATED)
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home/Landing page
│   └── template.tsx              # Page transition animations
│
├── backend/
│   ├── actions/                  # Server actions
│   │   ├── auth.ts              # Authentication (UPDATED)
│   │   ├── bookmarks.ts         # Bookmark management
│   │   ├── interactions.ts      # Likes, comments, reposts
│   │   ├── messages.ts          # Direct messaging
│   │   ├── notifications.ts     # Notification system
│   │   ├── posts.ts             # Post CRUD operations
│   │   ├── profile.ts           # Profile management
│   │   └── social.ts            # Follow/unfollow logic
│   │
│   ├── db/
│   │   ├── schema.ts            # Complete database schema
│   │   └── index.ts             # Database connection
│   │
│   ├── lib/                     # Backend utilities
│   └── scripts/
│       └── import-data.ts       # CSV data import script
│
├── components/                   # React components
│   ├── ui/                      # Shadcn UI components
│   ├── animated-page.tsx        # Page animations
│   ├── app-layout.tsx           # App shell layout
│   ├── edit-profile-dialog.tsx  # Profile editing
│   ├── header.tsx               # Navigation header
│   ├── landing-page.tsx         # Landing page (UPDATED)
│   ├── login-form.tsx           # Login form
│   ├── logo.tsx                 # App logo
│   ├── message-section.tsx      # Messaging UI
│   ├── post-card.tsx            # Post display (UPDATED)
│   ├── posts-feed.tsx           # Posts feed
│   ├── profile-view.tsx         # Profile display
│   ├── right-sidebar.tsx        # Right sidebar
│   ├── sidebar.tsx              # Left sidebar navigation
│   ├── signup-form.tsx          # Signup form
│   ├── stories.tsx              # Stories component (UPDATED)
│   └── theme-provider.tsx       # Dark mode provider
│
├── lib/
│   ├── animations.ts            # Framer Motion animations
│   └── utils.ts                 # Utility functions
│
├── db/                          # JSON data files (693 files)
├── public/                      # Static assets
├── .env.local                   # Environment variables
├── auth.config.ts               # NextAuth configuration
├── drizzle.config.ts            # Drizzle ORM config
├── middleware.ts                # Route protection
├── next.config.ts               # Next.js config
├── package.json                 # Dependencies
├── tailwind.config.ts           # Tailwind config (UPDATED)
└── tsconfig.json                # TypeScript config
```

---

## 🔑 Key Features

### 1. **Authentication System**
- **Email/Password Login**: Secure credential-based auth with bcrypt
- **Google OAuth**: One-click sign-in with Google
- **Session Management**: JWT-based sessions with NextAuth v5
- **Route Protection**: Middleware guards all protected routes
- **Auto-redirect**: Logged-in users redirected from auth pages

**Files**:
- `backend/actions/auth.ts` - Auth server actions
- `auth.config.ts` - NextAuth configuration
- `app/api/auth/[...nextauth]/route.ts` - API route handler
- `middleware.ts` - Route protection

### 2. **User Interface**
- **Modern Black Theme**: Pure black (#000000) background
- **Responsive Design**: Mobile-first, works on all devices
- **Smooth Animations**: Framer Motion page transitions
- **Glassmorphism**: Subtle backdrop blur effects
- **Cyan Accents**: Cyan (#00FFFF) brand color

**Recent UI Changes**:
- Login/Signup pages: Redesigned with rounded cards, better spacing
- Landing page: Hero section with gradient effects
- Dark mode: Pure black instead of dark gray
- Typography: Better font hierarchy

### 3. **Database Schema**

**Core Tables**:
- `users` - User accounts with profiles
- `posts` - User posts/tweets
- `comments` - Post replies
- `likes` - Post likes
- `reposts` - Retweets/shares
- `follows` - User relationships
- `bookmarks` - Saved posts
- `notifications` - Activity notifications
- `messages` - Direct messages

**Advanced Features**:
- `mediaAttachments` - Images/videos
- `hashtags` - Trending topics
- `mentions` - User mentions
- `polls` - Poll posts
- `blocks` - Blocked users
- `mutes` - Muted users

**Auth Tables** (NextAuth):
- `accounts` - OAuth provider accounts
- `sessions` - User sessions
- `verificationTokens` - Email verification

### 4. **Social Features**

**Interactions**:
- ❤️ Like posts
- 💬 Comment on posts
- 🔁 Repost/Retweet
- 🔖 Bookmark posts
- 👤 Follow/Unfollow users

**Notifications**:
- New followers
- Post likes
- Comments/replies
- Mentions
- Real-time updates

**Messaging**:
- One-on-one conversations
- Message history
- Read receipts

### 5. **Pages & Routes**

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Landing page / Home feed | No/Yes |
| `/login` | Login page | No |
| `/signup` | Signup page | No |
| `/explore` | Search users | Yes |
| `/notifications` | Activity feed | Yes |
| `/messages` | Direct messages | Yes |
| `/bookmarks` | Saved posts | Yes |
| `/profile/[username]` | User profile | Yes |
| `/settings` | Account settings | Yes |

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - Component library
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend
- **Next.js Server Actions** - API endpoints
- **NextAuth v5** - Authentication
- **Drizzle ORM** - Type-safe database queries
- **Turso** - SQLite database (cloud)
- **bcryptjs** - Password hashing

### Development
- **pnpm** - Package manager
- **ESLint** - Code linting
- **Drizzle Kit** - Database migrations

---

## 📦 Dependencies

### Production
```json
{
  "@auth/core": "^0.37.2",
  "@auth/drizzle-adapter": "^1.7.1",
  "@libsql/client": "^0.14.0",
  "bcryptjs": "^2.4.3",
  "drizzle-orm": "^0.36.4",
  "next": "^15.1.0",
  "next-auth": "^5.0.0-beta.25",
  "next-themes": "^0.4.6",
  "react": "^18.3.1",
  "motion": "^12.23.26",
  "lucide-react": "^0.460.0"
}
```

### Development
```json
{
  "drizzle-kit": "^0.28.1",
  "typescript": "^5",
  "tailwindcss": "^3.4.1",
  "eslint": "^8"
}
```

---

## 🔧 Configuration Files

### Environment Variables (.env.local)
```env
# Database
TURSO_DATABASE_URL=your_turso_url
TURSO_AUTH_TOKEN=your_turso_token

# Alternative naming (both supported)
DATABASE_URL=your_turso_url
DATABASE_AUTH_TOKEN=your_turso_token

# Authentication
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### Drizzle Config
- **Schema**: `./backend/db/schema.ts`
- **Migrations**: `./backend/db/migrations`
- **Dialect**: `turso` (SQLite)

### Tailwind Config
- **Dark Mode**: Class-based
- **Custom Colors**: CSS variables
- **Plugins**: tailwindcss-animate

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
- **Primary**: Cyan (#00FFFF) - Links, logo
- **Accent**: White (#FFFFFF) - Buttons, highlights
- **Background**: Black (#000000) - Pure black

### Typography
- **Font**: Inter (Google Fonts)
- **Sizes**: Responsive scale
- **Weight**: 400 (normal), 700 (bold)

### Spacing
- **Radius**: 0.5rem default
- **Padding**: Consistent 4px grid
- **Gaps**: Flexbox/Grid spacing

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Setup Environment
Create `.env.local` with your credentials (see above)

### 3. Database Setup
```bash
# Push schema to database
pnpm db:push

# Open Drizzle Studio (optional)
pnpm db:studio
```

### 4. Run Development Server
```bash
pnpm dev
```

Visit: http://localhost:3000

---

## 📊 Database Details

### User Schema
```typescript
users {
  id: string (UUID)
  name: string
  email: string (unique)
  password: string (hashed)
  username: string (unique)
  bio: string
  image: string
  headerImage: string
  followersCount: number
  followingCount: number
  postsCount: number
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Post Schema
```typescript
posts {
  id: string (UUID)
  userId: string (FK)
  content: string
  image: string
  visibility: 'public' | 'unlisted' | 'private'
  likesCount: number
  reblogsCount: number
  repliesCount: number
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

## 🔐 Authentication Flow

### Signup
1. User fills form (name, email, password, username)
2. Password validation (8+ chars, uppercase, lowercase, number)
3. Check if email/username exists
4. Hash password with bcrypt
5. Create user in database
6. Redirect to login

### Login (Email/Password)
1. User enters email + password
2. Find user by email
3. Verify password with bcrypt
4. Create JWT session with NextAuth
5. Redirect to home feed

### Login (Google OAuth)
1. User clicks "Sign in with Google"
2. Redirect to Google OAuth
3. Google returns user info
4. Check if user exists, create if not
5. Link Google account
6. Create session
7. Redirect to home

---

## 📝 Server Actions

### Authentication (`backend/actions/auth.ts`)
- `signup(formData)` - Create new user
- `login(formData)` - Email/password login
- `signInWithGoogle()` - Google OAuth
- `logout()` - Sign out
- `getCurrentUser()` - Get session user
- `isAuthenticated()` - Check auth status

### Posts (`backend/actions/posts.ts`)
- `createPost(content, image)` - New post
- `deletePost(postId)` - Delete post
- `getPostById(postId)` - Fetch post
- `getUserPosts(userId)` - User's posts

### Interactions (`backend/actions/interactions.ts`)
- `toggleLike(postId)` - Like/unlike
- `addComment(postId, content)` - Comment
- `toggleRepost(postId)` - Repost/unrepost

### Social (`backend/actions/social.ts`)
- `followUser(userId)` - Follow
- `unfollowUser(userId)` - Unfollow
- `getFollowers(userId)` - Get followers
- `getFollowing(userId)` - Get following

### Messages (`backend/actions/messages.ts`)
- `sendMessage(receiverId, content)` - Send DM
- `getConversation(userId)` - Get messages
- `markAsRead(messageId)` - Read receipt

### Notifications (`backend/actions/notifications.ts`)
- `getNotifications()` - Fetch all
- `markAsRead(notificationId)` - Mark read
- `markAllAsRead()` - Clear all

---

## 🎯 Your Local Changes (Stashed)

You had local modifications to:
- `app/api/auth/[...nextauth]/route.ts`
- `app/globals.css`
- `auth.config.ts`

These are saved in git stash. To review:
```bash
git stash show
```

To apply them back:
```bash
git stash pop
```

---

## 🐛 Known Issues / TODO

### Potential Conflicts
- Your stashed changes may conflict with new updates
- Check if auth configuration needs merging

### Missing Features
- Email verification (currently auto-verified)
- Password reset flow
- Profile picture upload
- Post image upload
- Real-time messaging (WebSocket)

### Improvements Needed
- Error handling in forms
- Loading states
- Optimistic UI updates
- Image optimization
- SEO metadata

---

## 📚 Important Files to Review

### Before Making Changes
1. **Database Schema**: `backend/db/schema.ts`
2. **Auth Config**: `auth.config.ts`
3. **Middleware**: `middleware.ts`
4. **Global Styles**: `app/globals.css`

### When Adding Features
1. **Server Actions**: `backend/actions/`
2. **Components**: `components/`
3. **Pages**: `app/`

### When Debugging
1. **API Route**: `app/api/auth/[...nextauth]/route.ts`
2. **Database Connection**: `backend/db/index.ts`
3. **Environment**: `.env.local`

---

## 🎓 Learning Resources

- [Next.js 15 Docs](https://nextjs.org/docs)
- [NextAuth v5 Docs](https://authjs.dev/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Turso Docs](https://docs.turso.tech/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Shadcn UI Docs](https://ui.shadcn.com/)

---

## 📞 Quick Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:push          # Push schema changes
pnpm db:studio        # Open Drizzle Studio

# Code Quality
pnpm lint             # Run ESLint

# Git
git status            # Check status
git stash list        # View stashed changes
git stash pop         # Apply stashed changes
```

---

**Made with ❤️ using Next.js 15**
