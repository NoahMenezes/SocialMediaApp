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
  
  // Handle "me" route or fetch by username
  let user;
  if (username === 'me') {
      if (sessionUser) {
           user = await db.query.users.findFirst({
            where: eq(users.id, sessionUser.id),
          });
      }
  } else {
      user = await db.query.users.findFirst({
        where: eq(users.username, username),
      });
  }

  // If user not found, create a temporary placeholder with 0 stats as requested
  if (!user) {
      if (username === 'me' && sessionUser) {
           // Fallback for 'me' if DB lookup fails but session exists (rare)
           user = {
               ...sessionUser,
               followersCount: 0,
               followingCount: 0,
               postsCount: 0,
               bio: "Welcome to your profile!",
               website: "",
               location: "",
               createdAt: new Date(),
               verified: false
           }
      } else {
          // Generic fallback for any unknown username
           user = {
               id: "placeholder",
               name: username,
               username: username,
               image: null,
               headerImage: null,
               followersCount: 0,
               followingCount: 0,
               postsCount: 0,
               bio: "This profile is not yet active.",
               website: null,
               location: null,
               createdAt: new Date(),
               verified: false
           }
      }
  }

  // Fetch user posts (handle potential placeholder id)
  const mappedPosts = user?.id !== "placeholder" ? await getPosts(user!.id) : [];

  return (
    <ProfileView 
      user={user} 
      sessionUser={sessionUser} 
      mappedPosts={mappedPosts} 
    />
  );
}
