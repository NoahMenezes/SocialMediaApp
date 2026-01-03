import { db } from "@/backend/db";
import { users } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/backend/actions/auth";
import { getPosts } from "@/backend/actions/posts";
import { notFound } from "next/navigation";
import { ProfileView } from "@/components/profile-view";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const sessionUser = await getCurrentUser();
  const { username } = await params;
  
  // Fetch profile user
  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (!user) notFound();

  // Fetch user posts using the unified getPosts action
  const mappedPosts = await getPosts(user.id);

  return (
    <ProfileView 
      user={user} 
      sessionUser={sessionUser} 
      mappedPosts={mappedPosts} 
    />
  );
}
