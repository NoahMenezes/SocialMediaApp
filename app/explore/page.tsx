import { AppLayout } from "@/components/app-layout";
import { getCurrentUser } from "@/backend/actions/auth";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { db } from "@/backend/db";
import { users, news } from "@/backend/db/schema";
import { desc, like, or } from "drizzle-orm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PostCard } from "@/components/post-card";

function formatTimestamp(date: Date) {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const q = params.q;

  let foundUsers: any[] = [];
  let newsItems: any[] = [];
  
  if (q) {
      foundUsers = await db.select().from(users).where(
          or(
              like(users.name, `%${q}%`),
              like(users.username, `%${q}%`)
          )
      ).limit(20);
  } else {
      // Fetch news if no search query
      const rawNews = await db.select().from(news).orderBy(desc(news.createdAt)).limit(50);
      
      newsItems = rawNews.map(item => ({
          id: item.id,
          content: `${item.summary}\n\n${item.text}`,
          timestamp: item.createdAt ? formatTimestamp(item.createdAt) : "Just now",
          likes: 0,
          comments: 0,
          reposts: 0,
          image: null,
          author: {
             name: "Global News",
             username: "news",
             avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=news",
             verified: true
          }
      }));
  }

  return (
    <AppLayout user={user}>
       <div className="sticky top-0 bg-black/80 backdrop-blur-md z-30 border-b border-white/5 p-3">
          <form action={async (formData) => {
              "use server";
              const query = formData.get("q");
              redirect(`/explore?q=${query}`);
          }}>
            <div className="relative group">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500 group-focus-within:text-indigo-500 transition-colors" />
                <Input
                name="q"
                defaultValue={q}
                placeholder="Search for people or topics"
                className="pl-12 bg-zinc-900 border-none rounded-full h-12 text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-indigo-500 transition-all"
                />
            </div>
          </form>
       </div>

       <div className="divide-y divide-white/5 pb-20">
          {q ? (
              // Search Results
              <>
                 <h2 className="px-4 py-3 text-lg font-bold text-white">People</h2>
                 {foundUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={u.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} />
                                <AvatarFallback>{u.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <Link href={`/profile/${u.username || u.name.replace(/\s+/g, '')}`} className="font-bold text-white hover:underline">
                                    {u.name}
                                </Link>
                                <p className="text-zinc-500 text-sm">@{u.username || u.name.replace(/\s+/g, '')}</p>

                                {u.bio && <p className="text-zinc-400 text-sm mt-1">{u.bio}</p>}
                            </div>
                        </div>
                        {user?.email !== u.email && (
                            <Button variant="outline" className="rounded-full font-bold hover:bg-indigo-500/10 hover:text-indigo-400 border-white/20 text-white">Follow</Button>
                        )}
                    </div>
                ))}
                {foundUsers.length === 0 && (
                    <div className="p-8 text-center text-zinc-500">
                        No users found matching "{q}".
                    </div>
                )}
              </>
          ) : (
              // News Feed
              <>
                  <h2 className="px-4 py-4 text-xl font-bold text-white">Latest News</h2>
                  {newsItems.map((post, index) => (
                      <PostCard key={post.id} post={post as any} index={index} />
                  ))}
                  {newsItems.length === 0 && (
                      <div className="p-10 text-center text-zinc-500">
                          <p>No news available at the moment.</p>
                      </div>
                  )}
              </>
          )}
       </div>
    </AppLayout>
  )
}
