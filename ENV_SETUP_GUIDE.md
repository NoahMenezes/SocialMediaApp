# Environment Variables Configuration Guide

This file explains what should be in your `.env.local` file.

---

## 📋 Required Environment Variables

### Database Configuration (Required)

```env
# Database URL - Your Turso or local SQLite database
DATABASE_URL=file:./local.db
# OR for Turso:
# DATABASE_URL=libsql://your-database.turso.io

# Database Auth Token (only needed for Turso)
# DATABASE_AUTH_TOKEN=your_turso_auth_token
```

### NextAuth Configuration (Required)

```env
# NextAuth Secret - Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your_nextauth_secret_here

# NextAuth URL - Your app URL
NEXTAUTH_URL=http://localhost:3000
# In production: https://yourdomain.com
```

### Google OAuth (If using Google login)

```env
# Google OAuth credentials from Google Cloud Console
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## 🦣 Optional: Mastodon Integration

**Note:** These are **per-user** settings, not global. Users will connect their own Mastodon accounts through the app UI. You don't need these in `.env.local` unless you want to set up OAuth for Mastodon login.

If you want to enable Mastodon OAuth login (optional):

```env
# Mastodon OAuth (Optional - for Mastodon login)
MASTODON_CLIENT_ID=your_mastodon_app_client_id
MASTODON_CLIENT_SECRET=your_mastodon_app_client_secret
MASTODON_INSTANCE_URL=https://mastodon.social
```

---

## 📝 Complete `.env.local` Template

Here's a complete template you can copy:

```env
# ==============================================
# DATABASE CONFIGURATION
# ==============================================

# Local SQLite (for development)
DATABASE_URL=file:./local.db

# OR Turso (for production)
# DATABASE_URL=libsql://your-database.turso.io
# DATABASE_AUTH_TOKEN=your_turso_auth_token


# ==============================================
# NEXTAUTH CONFIGURATION
# ==============================================

# Generate secret with: openssl rand -base64 32
NEXTAUTH_SECRET=your_nextauth_secret_here

# Your app URL
NEXTAUTH_URL=http://localhost:3000


# ==============================================
# GOOGLE OAUTH (Optional)
# ==============================================

# Get these from: https://console.cloud.google.com/
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret


# ==============================================
# MASTODON OAUTH (Optional)
# ==============================================

# Only needed if you want Mastodon OAuth login
# Users can still connect their Mastodon accounts without this
# MASTODON_CLIENT_ID=your_mastodon_client_id
# MASTODON_CLIENT_SECRET=your_mastodon_client_secret
# MASTODON_INSTANCE_URL=https://mastodon.social


# ==============================================
# OTHER OPTIONAL SETTINGS
# ==============================================

# Node environment
NODE_ENV=development

# Enable debug logging (optional)
# DEBUG=true
```

---

## 🔧 Setup Instructions

### 1. Generate NextAuth Secret

Run this command in your terminal:

```bash
openssl rand -base64 32
```

Copy the output and use it as your `NEXTAUTH_SECRET`.

### 2. Database Setup

**For Local Development:**
```env
DATABASE_URL=file:./local.db
```

**For Turso (Production):**
1. Sign up at https://turso.tech/
2. Create a database
3. Get your database URL and auth token
4. Add to `.env.local`:
```env
DATABASE_URL=libsql://your-database.turso.io
DATABASE_AUTH_TOKEN=your_turso_auth_token
```

### 3. Google OAuth (Optional)

If you want Google login:

1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

### 4. Mastodon OAuth (Optional)

**Important:** You don't need this for basic Mastodon integration! Users can connect their Mastodon accounts through the app settings.

Only set this up if you want users to **login with Mastodon** (like "Sign in with Mastodon"):

1. Go to your Mastodon instance (e.g., mastodon.social)
2. Settings → Development → New Application
3. Set redirect URI: `http://localhost:3000/api/auth/callback/mastodon`
4. Copy Client ID and Secret

---

## ✅ Minimum Required Configuration

For basic functionality, you only need:

```env
# Database
DATABASE_URL=file:./local.db

# NextAuth
NEXTAUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (if using Google login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## 🔐 Security Notes

1. **Never commit `.env.local`** to git (it's already in `.gitignore`)
2. **Use different secrets** for development and production
3. **Rotate secrets** periodically
4. **Use environment variables** in production (Vercel, Netlify, etc.)

---

## 🚀 Production Deployment

When deploying to Vercel/Netlify:

1. Don't upload `.env.local`
2. Set environment variables in the hosting platform's dashboard
3. Use production database URL (Turso)
4. Update `NEXTAUTH_URL` to your production domain
5. Update OAuth redirect URIs to production URLs

---

## 🧪 Testing Your Configuration

After setting up `.env.local`, test it:

```bash
# Restart your dev server
npm run dev

# Check if environment variables are loaded
# In your code, you can log (remove after testing):
console.log('Database URL:', process.env.DATABASE_URL);
console.log('NextAuth URL:', process.env.NEXTAUTH_URL);
```

---

## ❓ Troubleshooting

### "NEXTAUTH_SECRET is not defined"
- Make sure you generated and added the secret
- Restart your dev server after adding it

### "Database connection failed"
- Check your `DATABASE_URL` is correct
- For Turso, verify `DATABASE_AUTH_TOKEN` is set
- Make sure the database file path is correct for local SQLite

### "Google OAuth not working"
- Verify redirect URI matches exactly
- Check Client ID and Secret are correct
- Make sure Google+ API is enabled

---

## 📚 Related Documentation

- **Database Setup**: See `MIGRATION_GUIDE.md`
- **Mastodon Integration**: See `DATABASE_IMPLEMENTATION_PLAN.md`
- **Deployment**: See `README.md`

---

**Your `.env.local` should now be properly configured!** 🎉
