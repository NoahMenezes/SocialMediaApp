# Social Media App (Next.js 15)

A modern, full-featured social media application built with the latest web technologies.

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Database**: [Turso](https://turso.tech/) (SQLite)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [NextAuth.js v5](https://authjs.dev/) (Google OAuth + Credentials)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animation**: Framer Motion

## ✨ Features implemented

### 🔐 Authentication & Security
- **Hybrid Auth**: Support for both **Google OAuth** and **Email/Password** login.
- **Secure Sessions**: Powered by NextAuth v5 with `jwt` strategy and HTTP-only cookies.
- **Middleware**: robust route protection redirecting unauthenticated users.
- **Auto-Username**: Automatically generates unique IDs/usernames for new users.

### 👤 User Profiles
- **Dynamic Routing**: View any user profile at `/profile/[username]`.
- **Profile Management**: "Edit Profile" for your own page, "Follow" for others.
- **Data Integration**: Fetches real user info (bio, join date) and posts from the database.
- **Avatar System**: Uses **Dicebear API** for consistent, generated user avatars if no image is uploaded.

### 📱 Core Experience
- **Home Feed**: Database-backed feed displaying real posts.
- **Explore Page**: Search functionality to find users by name or username.
- **Sidebar Navigation**: Fully functional responsive navigation (Home, Explore, Notifications, Messages, Bookmarks, Profile).
- **Post Interaction**:
    - **Creation**: "Post" button (sidebar) and input area (home) are connected.
    - **Links**: Clicking user avatars/names allows easy navigation to profiles.

## 🛠️ Database Schema

The application uses a robust SQLite schema managed by Drizzle (`backend/db/schema.ts`):

- **Users**: Stores profile info, auth credentials, and settings.
- **Posts**: Stores content, timestamps, and relations to users.
- **Likes/Bookmarks/Follows**: Relational tables for social interactions.
- **Notifications**: System to track interactions (likes, follows).
- **Accounts/Sessions**: NextAuth specific tables for OAuth handling.

## ⚡ Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Environment Setup**:
   Create a `.env.local` file with the following:
   ```env
   TURSO_DATABASE_URL=...
   TURSO_AUTH_TOKEN=...
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   NEXTAUTH_SECRET=...
   ```

3. **Database Migration**:
   ```bash
   pnpm drizzle-kit push
   ```

4. **Run Development Server**:
   ```bash
   pnpm dev
   ```

## 🔮 Future Roadmap

- [ ] **Image Uploads**: Allow users to upload real photos for posts/avatars (e.g., Uploadthing/S3).
- [ ] **Real-time Interactions**: Live notifications and chat using WebSockets.
- [ ] **Comments System**: Nested comments structure.
- [ ] **Rich Text**: Enhanced post editor with formatting.

