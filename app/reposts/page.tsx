import { AppLayout } from "@/components/app-layout";
import { getCurrentUser } from "@/backend/actions/auth";
import { getRepostedPosts } from "@/backend/actions/posts";
import { PostCard } from "@/components/post-card";
import { Repeat2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RepostsPage() {
  const user = await getCurrentUser();
  const repostedPosts = await getRepostedPosts();

  return (
    <AppLayout user={user}>
       <div className="sticky top-0 bg-background/80 backdrop-blur-md z-30 border-b border-border/40 p-4">
          <h2 className="text-xl font-bold">Reposts</h2>
          <p className="text-sm text-muted-foreground">@{(user?.username || "")}</p>
       </div>
       
       <div className="divide-y divide-border/40 pb-20">
            {repostedPosts.map((post: any, i: number) => (
                <PostCard key={`${post.id}-${i}`} post={post} index={i} />
            ))}
            {repostedPosts.length === 0 && (
                <div className="p-20 text-center text-muted-foreground flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center">
                        <Repeat2 className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-foreground">No reposts yet</h3>
                        <p className="text-sm max-w-[300px] mx-auto">When you repost something, it will show up here for you to see later.</p>
                    </div>
                </div>
            )}
       </div>
    </AppLayout>
  )
}
