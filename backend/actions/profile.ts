"use server";

import { db } from "@/backend/db";
import { users } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
    const user = await getCurrentUser();
    if (!user || !user.email) throw new Error("Not authenticated");

    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const username = formData.get("username") as string;

    try {
        await db.update(users)
            .set({
                name,
                bio,
                username: username || null
            })
            .where(eq(users.email, user.email));

        revalidatePath("/profile");
        return { success: true };
    } catch (error) {
        console.error("Failed to update profile", error);
        return { success: false, error: "Failed to update profile" };
    }
}
