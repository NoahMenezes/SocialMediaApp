"use server";

import { db } from "@/backend/db";
import { users } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth.config";
import { revalidatePath } from "next/cache";

export async function updateProfileImage(base64Image: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        // Check if user exists (already checked via auth but need username for path)
        const currentUser = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
        });

        if (currentUser) {
            await db.update(users)
                .set({ image: base64Image })
                .where(eq(users.id, session.user.id));

            revalidatePath(`/profile/${currentUser.username}`);
            revalidatePath(`/dashboard`);
        }

        return { success: true };
    } catch (error) {
        console.error("Error updating profile image:", error);
        return { error: "Failed to update profile image" };
    }
}
