# 🚀 Social Media App (Next.js 15)

A modern, full-featured social media application with Mastodon integration, built with the latest web technologies.

---

## ✨ Features

### 🔐 Authentication & Security
- **Hybrid Auth**: Support for both **Google OAuth** and **Email/Password** login.
- **Secure Sessions**: Powered by NextAuth v5 with `jwt` strategy and HTTP-only cookies.
- **Middleware**: Robust route protection redirecting unauthenticated users.
- **Auto-Username**: Automatically generates unique IDs/usernames for new users.

### 👤 User Profiles
- **Dynamic Routing**: View any user profile at `/profile/[username]`.
- **Profile Management**: "Edit Profile" for your own page, "Follow" for others.
- **Avatar System**: Uses **Dicebear API** for consistent, generated user avatars.

### 📱 Core Experience
- **Home Feed**: Database-backed feed displaying real posts.
- **Explore Page**: Search functionality to find users by name or username.
- **Notifications**: Real-time updates for likes, follows, and replies.
- **Direct Messages**: One-on-one conversations.
- **Mastodon Integration**: Bidirectional sync between local database and Mastodon.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Database**: [Turso](https://turso.tech/) (SQLite)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [NextAuth.js v5](https://authjs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animation**: Framer Motion

---

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
   pnpm db:push
   ```

4. **Run Development Server**:
   ```bash
   pnpm dev
   ```

---

## 📁 Project Structure

```
SocialMediaApp/
├── app/                          # Next.js pages
├── backend/
│   ├── actions/                 # Server actions (Posts, Social, Notifications, Messages)
│   ├── db/
│   │   └── schema.ts           # Database schema
│   └── lib/
│       ├── mastodon-client.ts  # Mastodon API
│       └── mastodon-sync.ts    # Sync service
├── components/                  # React components
└── lib/                        # Shared utilities
```

---

## 📄 License

MIT License - Feel free to use this in your projects!

Made with ❤️ for the open social web
