import { AppLayout } from "@/components/app-layout";
import { getCurrentUser } from "@/backend/actions/auth";
import { PostCard } from "@/components/post-card";

const bookmarkedPosts = [
  {
    id: "b1",
    author: {
      name: "Next.js",
      username: "nextjs",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nextjs",
      verified: true,
    },
    content: "Next.js 15 is now available! 🚀\n\n- React 19 Support\n- Turbopack (stable)\n- Server Actions (stable)\n- Partial Prerendering (preview)",
    timestamp: "Oct 26, 2024",
    likes: 12000,
    comments: 450,
    reposts: 3200,
  },
  {
    id: "b2",
    author: {
      name: "Vercel",
      username: "vercel",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=vercel",
      verified: true,
    },
    content: "Deploy your Next.js app in seconds. #ShipIt",
    timestamp: "Nov 1, 2024",
    likes: 8500,
    comments: 210,
    reposts: 1100,
  }
];

export default async function BookmarksPage() {
  const user = await getCurrentUser();

  return (
    <AppLayout user={user}>
       <div className="sticky top-0 bg-background/80 backdrop-blur-md z-30 border-b border-border/40 p-4">
          <h2 className="text-xl font-bold">Bookmarks</h2>
          <p className="text-sm text-muted-foreground">@{(user?.name || "").replace(/\s+/g, '')}</p>
       </div>
       
       <div className="divide-y divide-border/40 pb-20">
            {bookmarkedPosts.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
            ))}
            {bookmarkedPosts.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                    No bookmarks yet.
                </div>
            )}
       </div>
    </AppLayout>
  )
}
