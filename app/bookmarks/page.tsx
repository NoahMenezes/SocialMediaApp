import { AppLayout } from "@/components/app-layout";
import { getCurrentUser } from "@/backend/actions/auth";
import { getBookmarkedPosts } from "@/backend/actions/bookmarks";
import { PostCard } from "@/components/post-card";
import { Bookmark } from "lucide-react";

export default async function BookmarksPage() {
  const user = await getCurrentUser();
  const bookmarkedPosts = await getBookmarkedPosts();

  return (
    <AppLayout user={user}>
       <div className="sticky top-0 bg-background/80 backdrop-blur-md z-30 border-b border-border/40 p-4">
          <h2 className="text-xl font-bold">Bookmarks</h2>
          <p className="text-sm text-muted-foreground">@{(user?.name || "").replace(/\s+/g, '')}</p>
       </div>
       
       <div className="divide-y divide-border/40 pb-20">
            {bookmarkedPosts.map((post: any, i: number) => (
                <PostCard key={post.id} post={post} index={i} />
            ))}
            {bookmarkedPosts.length === 0 && (
                <div className="p-20 text-center text-muted-foreground flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center">
                        <Bookmark className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-foreground">Save posts for later</h3>
                        <p className="text-sm max-w-[300px] mx-auto">Don't let the good ones fly away! Bookmark posts to easily find them again in the future.</p>
                    </div>
                </div>
            )}
       </div>
    </AppLayout>
  )
}
