"use server";

import { db } from "@/backend/db";
import { users } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "@/auth.config";
import { auth } from "@/auth.config";
import { AuthError } from "next-auth";

// ============================================
// EMAIL/PASSWORD AUTHENTICATION
// ============================================

export async function signup(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
      return { error: "All fields are required" };
    }

    // Validate name
    if (name.trim().length < 2) {
      return { error: "Name must be at least 2 characters long" };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { error: "Please enter a valid email address" };
    }

    // Validate password strength
    if (password.length < 8) {
      return { error: "Password must be at least 8 characters long" };
    }
    if (!/[A-Z]/.test(password)) {
      return { error: "Password must contain at least one uppercase letter" };
    }
    if (!/[a-z]/.test(password)) {
      return { error: "Password must contain at least one lowercase letter" };
    }
    if (!/[0-9]/.test(password)) {
      return { error: "Password must contain at least one number" };
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return { error: "User already exists with this email" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get custom username or generate one
    const customUsername = formData.get("username") as string;
    const finalUsername = customUsername
      ? customUsername.toLowerCase().replace(/\s+/g, '')
      : name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000);

    // Check if username already exists
    if (customUsername) {
      const existingUsername = await db.query.users.findFirst({
        where: eq(users.username, finalUsername),
      });
      if (existingUsername) {
        return { error: "Username is already taken" };
      }
    }

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        name,
        email,
        password: hashedPassword,
        username: finalUsername,
        emailVerified: new Date(), // Auto-verify for now, or implement email verification
      })
      .returning();

    return {
      success: true,
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
      message: "Account created successfully! Please log in.",
    };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Failed to create account" };
  }
}

export async function login(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { error: "Email and password are required" };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { error: "Please enter a valid email address" };
    }

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return { error: "Invalid email or password" };
    }

    // Check if user has a password (OAuth users might not)
    if (!user.password) {
      return {
        error: "This account uses Google sign-in. Please sign in with Google."
      };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return { error: "Invalid email or password" };
    }

    // Use NextAuth credentials sign-in (if you have it configured)
    // Or create a session manually
    // For now, we'll use NextAuth's credentials provider
    try {
      await nextAuthSignIn("credentials", {
        email,
        password,
        redirect: false,
      });

      return {
        success: true,
        user: { id: user.id, name: user.name, email: user.email },
      };
    } catch (error) {
      if (error instanceof AuthError) {
        return { error: "Authentication failed. Please try again." };
      }
      throw error;
    }
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Failed to login" };
  }
}

// ============================================
// GOOGLE OAUTH AUTHENTICATION
// ============================================

export async function signInWithGoogle(formData?: FormData): Promise<void> {
  await nextAuthSignIn("google", {
    redirectTo: "/dashboard", // Redirect to dashboard after successful login
  });
}

// ============================================
// MASTODON OAUTH AUTHENTICATION
// ============================================

export async function signInWithMastodon(formData?: FormData): Promise<void> {
  await nextAuthSignIn("mastodon", {
    redirectTo: "/", // Redirect to home page after successful login
  });
}

// ============================================
// LOGOUT
// ============================================

export async function logout(formData?: FormData): Promise<void> {
  await nextAuthSignOut({
    redirectTo: "/login",
  });
}

// ============================================
// GET CURRENT USER
// ============================================

export async function getCurrentUser() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return null;
    }

    // Fetch full user details from database
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id!),
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      username: user.username,
      emailVerified: user.emailVerified,
    };
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}

/**
 * Get user session
 */
export async function getSession() {
  return await auth();
}
