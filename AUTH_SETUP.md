# 🔐 Windows Setup Instructions

## ✅ Step 1: Install Turso CLI (Windows)

**Option A: Using PowerShell (Recommended)**
```powershell
# Download and install Turso
irm https://get.tur.so/install.ps1 | iex
```

**Option B: Using Scoop**
```powershell
scoop install turso
```

**Option C: Manual Download**
Download from: https://github.com/tursodatabase/turso-cli/releases
Then add to your PATH.

---

## ✅ Step 2: Create Turso Database

After installing Turso CLI, run these commands:

```powershell
# Login to Turso (opens browser)
turso auth login

# Create a new database
turso db create my-next-app

# Get your database URL (COPY THIS!)
turso db show my-next-app --url

# Create an auth token (COPY THIS!)
turso db tokens create my-next-app
```

---

## ✅ Step 3: Create `.env.local` File

1. Create a file named `.env.local` in your project root
2. Add these lines (replace with your actual values):

```env
TURSO_DATABASE_URL=libsql://your-database-url-here.turso.io
TURSO_AUTH_TOKEN=your-token-here
```

---

## ✅ Step 4: Generate and Push Database Schema

```powershell
# Generate migration files
pnpm drizzle-kit generate

# Push schema to database
pnpm drizzle-kit push
```

---

## ✅ Step 5: Restart Dev Server

```powershell
# Stop current dev server (Ctrl+C in the terminal running pnpm dev)
# Then restart:
pnpm dev
```

---

## 🎯 Step 6: Test Your Auth!

1. Open browser: `http://localhost:3000/signup`
2. Create an account
3. You'll be automatically logged in and redirected to home!

---

## 🔍 Verify Database (Optional)

```powershell
# Open Drizzle Studio to view your database
pnpm drizzle-kit studio
```

This opens a web UI at `https://local.drizzle.studio` where you can see your users table!

---

## ❓ Troubleshooting

**If Turso CLI not found after install:**
1. Close and reopen PowerShell
2. Or restart VS Code terminal

**If .env.local not working:**
1. Make sure file is in project root (same folder as package.json)
2. Restart dev server after creating .env.local

**If drizzle-kit errors:**
1. Make sure .env.local has correct values
2. Check that TURSO_DATABASE_URL starts with `libsql://`
