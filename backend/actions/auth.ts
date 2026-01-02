"use server";

import { db } from "@/backend/db";
import { users } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function signup(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
      return { error: "All fields are required" };
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

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
      })
      .returning();

    // Set session cookie
    (await cookies()).set("userId", newUser.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return {
      success: true,
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
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

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return { error: "Invalid email or password" };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return { error: "Invalid email or password" };
    }

    // Set session cookie
    (await cookies()).set("userId", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return {
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
    };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Failed to login" };
  }
}

export async function logout() {
  (await cookies()).delete("userId");
  return { success: true };
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return null;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, parseInt(userId)),
    });

    if (!user) {
      return null;
    }

    return { id: user.id, name: user.name, email: user.email };
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}
