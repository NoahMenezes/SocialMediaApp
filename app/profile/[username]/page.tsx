import { AppLayout } from "@/components/app-layout";
import { getCurrentUser } from "@/backend/actions/auth";
import { db } from "@/backend/db";
import { users, posts } from "@/backend/db/schema";
import { eq, desc } from "drizzle-orm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays } from "lucide-react";
import { EditProfileDialog } from "@/components/edit-profile-dialog";
import { redirect, notFound } from "next/navigation";
import { PostCard } from "@/components/post-card";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const sessionUser = await getCurrentUser();
  const { username } = await params;
  
  // Fetch profile user
  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (!user) notFound();

  const isOwnProfile = sessionUser?.id === user.id;

  // Fetch user posts
  const userPosts = await db.select().from(posts).where(eq(posts.userId, user.id)).orderBy(desc(posts.createdAt)).all();

  // Map DB posts to PostCard format
  const mappedPosts = userPosts.map(post => ({
    id: post.id,
    author: {
        name: user.name,
        username: user.username || user.name.replace(/\s+/g, ''),
        avatar: user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
        verified: false,
    },
    content: post.content,
    timestamp: post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'recently',
    likes: 0,
    comments: 0,
    reposts: 0,
    image: post.image || undefined,
  }));

  return (
    <AppLayout user={sessionUser}>
      {/* Header / Banner */}
      <div className="h-32 sm:h-48 bg-muted relative">
         <div className="absolute -bottom-16 left-4">
            <Avatar className="w-32 h-32 border-4 border-background text-4xl shadow-md">
                <AvatarImage src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
         </div>
      </div>
      
      {/* Profile Actions */}
      <div className="flex justify-end p-4 h-16 sm:h-auto">
         {isOwnProfile ? (
            <EditProfileDialog user={user} />
         ) : (
            <button className="px-4 py-2 border rounded-full font-bold hover:bg-muted transition-colors">Follow</button>
         )}
      </div>

      {/* Profile Info */}
      <div className="px-4 mt-2 sm:mt-0 pb-4 border-b border-border/40">
          <h1 className="text-2xl font-bold leading-tight">{user.name}</h1>
          <p className="text-muted-foreground">@{user.username || user.name.replace(/\s+/g, '')}</p>
          
          <div className="mt-4 text-base whitespace-pre-wrap">
             {user.bio || "No bio yet."}
          </div>
          
          <div className="flex items-center gap-4 mt-4 text-muted-foreground text-sm">
             <div className="flex items-center gap-1">
                <CalendarDays className="w-4 h-4" />
                <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'recently'}</span>
             </div>
          </div>
          
           <div className="flex items-center gap-4 mt-4 text-sm">
             <div className="flex items-center gap-1 hover:underline cursor-pointer">
                <span className="font-bold text-foreground">0</span>
                <span className="text-muted-foreground">Following</span>
             </div>
             <div className="flex items-center gap-1 hover:underline cursor-pointer">
                <span className="font-bold text-foreground">0</span>
                <span className="text-muted-foreground">Followers</span>
             </div>
          </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-border/40">
          <div className="flex-1 p-4 text-center font-bold hover:bg-muted/50 cursor-pointer border-b-2 border-primary text-primary">Posts</div>
          <div className="flex-1 p-4 text-center text-muted-foreground hover:bg-muted/50 cursor-pointer">Replies</div>
          <div className="flex-1 p-4 text-center text-muted-foreground hover:bg-muted/50 cursor-pointer">Likes</div>
      </div>
      
      {/* Content */}
      <div className="divide-y divide-border/40 pb-20">
          {mappedPosts.length > 0 ? (
              mappedPosts.map((post, index) => (
                  <PostCard key={post.id} post={post} index={index} />
              ))
          ) : (
              <div className="p-12 text-center text-muted-foreground">
                  <p className="text-xl font-bold text-foreground mb-2">No posts yet</p>
                  <p>When {isOwnProfile ? "you post" : "they post"} something, it will show up here.</p>
              </div>
          )}
      </div>

    </AppLayout>
  );
}
