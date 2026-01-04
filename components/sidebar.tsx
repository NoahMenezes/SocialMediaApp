"use client"

import { Home, Search, Bell, Mail, Bookmark, User, MoreHorizontal, Hash, Twitter, PlusSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Sidebar({ user }: { user?: { name?: string | null; email?: string | null; image?: string | null; username?: string | null } | null }) {
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: Hash, label: "Explore", href: "/explore" },
    { icon: Bell, label: "Notifications", href: "/notifications" },
    { icon: Mail, label: "Messages", href: "/messages" },
    { icon: Bookmark, label: "Bookmarks", href: "/bookmarks" },
    { icon: User, label: "Profile", href: `/profile/${user?.username || 'me'}` },
  ]

  return (
    <aside className="fixed md:sticky top-0 left-0 h-screen w-20 xl:w-72 bg-black border-r border-white/5 flex flex-col py-4 select-none z-50 overflow-y-auto">
      {/* Logo */}
      <div className="px-4 mb-4 flex justify-center xl:justify-start">
        <Link href="/dashboard" className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
          <Twitter className="w-8 h-8 text-white fill-current" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <div key={item.label} className="flex justify-center xl:justify-start">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-full transition-all duration-200 group hover:bg-white/10 w-fit xl:pr-8",
                  isActive ? "font-bold" : "font-normal"
                )}
              >
                <Icon
                  className={cn(
                    "w-7 h-7 transition-transform group-active:scale-95",
                    isActive ? "stroke-[3px]" : "stroke-2"
                  )}
                />
                <span className="hidden xl:block text-xl">{item.label}</span>
              </Link>
            </div>
          )
        })}

        {/* Post Button */}
        <div className="pt-4 px-2">
          <Button className="w-full h-12 rounded-full bg-white text-black hover:bg-white/90 font-bold text-lg hidden xl:block shadow-lg shadow-white/5">
            Post
          </Button>
          <div className="xl:hidden flex justify-center">
            <Button size="icon" className="w-12 h-12 rounded-full bg-white text-black hover:bg-white/90 shadow-lg shadow-white/5">
              <PlusSquare className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </nav>

      {/* User Profile / More */}
      <div className="mt-auto px-2">
        <button className="w-full flex items-center justify-center xl:justify-between p-3 rounded-full transition-all hover:bg-white/10 group">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-white/10">
              <AvatarImage src={user?.image || ""} />
              <AvatarFallback className="bg-zinc-800 text-white">{user?.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="hidden xl:flex flex-col items-start leading-tight">
              <span className="font-bold text-white text-sm truncate max-w-[120px]">{user?.name || "User"}</span>
              <span className="text-muted-foreground text-xs truncate max-w-[120px]">@{user?.username || "username"}</span>
            </div>
          </div>
          <MoreHorizontal className="hidden xl:block w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </aside>
  )
}
