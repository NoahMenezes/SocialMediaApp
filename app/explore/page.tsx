import { AppLayout } from "@/components/app-layout";
import { getCurrentUser } from "@/backend/actions/auth";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { db } from "@/backend/db";
import { users } from "@/backend/db/schema";
import { desc, like, or } from "drizzle-orm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const q = params.q;

  let foundUsers: any[] = [];
  
  if (q) {
      foundUsers = await db.select().from(users).where(
          or(
              like(users.name, `%${q}%`),
              like(users.username, `%${q}%`)
          )
      ).limit(20);
  }

  return (
    <AppLayout user={user}>
       <div className="sticky top-0 bg-background/80 backdrop-blur-md z-30 border-b border-border/40 p-2">
          <form action={async (formData) => {
              "use server";
              const query = formData.get("q");
              redirect(`/explore?q=${query}`);
          }}>
            <div className="relative group">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                name="q"
                defaultValue={q}
                placeholder="Search people"
                className="pl-10 bg-muted/40 border-transparent focus:border-primary/20 focus:bg-background shadow-sm rounded-full h-11 transition-all"
                />
            </div>
          </form>
       </div>

       <div className="divide-y divide-border/40">
          {foundUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                      <Avatar>
                          <AvatarImage src={u.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} />
                          <AvatarFallback>{u.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                          <Link href={`/profile/${u.username || u.name.replace(/\s+/g, '')}`} className="font-bold hover:underline">
                            {u.name}
                          </Link>
                          <p className="text-muted-foreground text-sm">@{u.username || u.name.replace(/\s+/g, '')}</p>

                          {u.bio && <p className="text-sm mt-1">{u.bio}</p>}
                      </div>
                  </div>
                  {user?.email !== u.email && (
                     <Button variant="outline" className="rounded-full font-bold hover:bg-primary/10 hover:text-primary">Follow</Button>
                  )}
              </div>
          ))}
          {foundUsers.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                  No users found.
              </div>
          )}
       </div>
    </AppLayout>
  )
}
