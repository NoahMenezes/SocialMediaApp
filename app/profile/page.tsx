import { getCurrentUser } from "@/backend/actions/auth";
import { redirect } from "next/navigation";
import { db } from "@/backend/db";
import { users } from "@/backend/db/schema";
import { eq } from "drizzle-orm";

export default async function ProfileRedirect() {
  const sessionUser = await getCurrentUser();
  
  if (!sessionUser || !sessionUser.email) {
      redirect("/login");
  }

  // Fetch full user to get username
  const user = await db.query.users.findFirst({
    where: eq(users.email, sessionUser.email),
  });

  if (!user || !user.username) {
    // If no username, maybe we should force them to set one or just use a fallback
    redirect("/");
  }

  redirect(`/profile/${user.username}`);
}


